'use client';

import { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { customAlphabet } from 'nanoid';
import { useCart } from '@/lib/cart';
import { resolveItems, computeTotals, assemblyFeeFor, DELIVERY_ZONES } from '@/lib/pricing';
import { formatPYG } from '@/lib/format';
import { customerSchema } from '@/lib/validation';
import { orderMessage, waLink } from '@/lib/whatsapp';
import type { DeliveryZone, OrderCustomer, PaymentMethod } from '@/lib/types';
import CuotasBadge from '@/components/CuotasBadge';
import CopyButton from '@/components/CopyButton';
import { WhatsAppIcon } from '@/components/icons';

const newClientOrderId = () => `MUE-${customAlphabet('0123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 8)()}`;

const BANK = {
  name: process.env.NEXT_PUBLIC_BANK_NAME ?? 'Banco (configurar)',
  account: process.env.NEXT_PUBLIC_BANK_ACCOUNT ?? '000-000000-00',
  ruc: process.env.NEXT_PUBLIC_BANK_RUC ?? '80000000-0',
  holder: process.env.NEXT_PUBLIC_BANK_HOLDER ?? 'Titular (configurar)',
};

const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;
const ACCEPTED_RECEIPT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'];

type FormState = {
  nombre: string;
  telefono: string;
  email: string;
  ciudad: string;
  direccion: string;
  notas: string;
};

const EMPTY_FORM: FormState = { nombre: '', telefono: '', email: '', ciudad: '', direccion: '', notas: '' };

/**
 * Uploads the transfer receipt via presigned URL. NEVER-BLOCK rule: any
 * failure (presign, PUT after one retry, timeout, R2 not configured)
 * resolves to null and the order proceeds without a receipt.
 */
async function tryUploadReceipt(file: File): Promise<string | null> {
  try {
    const presignRes = await fetch('/api/uploads/receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
      signal: AbortSignal.timeout(10000),
    });
    if (!presignRes.ok) return null;
    const presign = (await presignRes.json()) as { uploadUrl?: string; publicUrl?: string };
    if (!presign.uploadUrl || !presign.publicUrl) return null;

    const put = () =>
      fetch(presign.uploadUrl as string, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
        signal: AbortSignal.timeout(30000),
      });

    let res = await put().catch(() => null);
    if (!res || !res.ok) {
      res = await put().catch(() => null); // single retry
    }
    return res && res.ok ? presign.publicUrl : null;
  } catch {
    return null;
  }
}

export default function CheckoutClient() {
  const router = useRouter();
  const cart = useCart();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [zone, setZone] = useState<DeliveryZone>('asuncion');
  const [assembly, setAssembly] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>('whatsapp');
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const items = useMemo(() => resolveItems(cart.items), [cart.items]);
  const totals = useMemo(() => computeTotals(items, zone, assembly), [items, zone, assembly]);
  const assemblyFee = useMemo(() => assemblyFeeFor(items), [items]);
  const hasAssemblyItems = assemblyFee > 0 && zone !== 'interior';

  function setField(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  /** Validates the customer form; returns the normalized customer or null. */
  function validateCustomer(): OrderCustomer | null {
    const parsed = customerSchema.safeParse({
      nombre: form.nombre,
      telefono: form.telefono,
      email: form.email || undefined,
      ciudad: form.ciudad,
      direccion: form.direccion,
      notas: form.notas || undefined,
    });
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof FormState, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormState;
        if (!fieldErrors[key]) {
          fieldErrors[key] =
            key === 'telefono'
              ? 'Ingresá un celular paraguayo válido (+595 9xx xxx xxx o 09xx xxx xxx)'
              : key === 'email'
                ? 'Ingresá un email válido o dejá el campo vacío'
                : 'Completá este campo';
        }
      }
      setErrors(fieldErrors);
      setSubmitError('Revisá los campos marcados en rojo.');
      return null;
    }
    setSubmitError(null);
    return parsed.data;
  }

  function orderPayload(customer: OrderCustomer, paymentMethod: PaymentMethod, extra: object = {}) {
    return {
      customer,
      items: items.map(({ product, qty }) => ({ slug: product.slug, qty })),
      deliveryZone: zone,
      assemblyRequested: assembly && hasAssemblyItems,
      paymentMethod,
      ...extra,
    };
  }

  async function submitPagopar() {
    const customer = validateCustomer();
    if (!customer) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/checkout/pagopar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload(customer, 'pagopar')),
      });
      const data = (await res.json()) as { ok: boolean; redirectUrl?: string; error?: string };
      if (data.ok && data.redirectUrl) {
        cart.clear();
        window.location.href = data.redirectUrl;
        return;
      }
      setSubmitError(data.error ?? 'No pudimos iniciar el pago online. Probá por WhatsApp.');
    } catch {
      setSubmitError('Error de conexión. Probá de nuevo o finalizá por WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  }

  async function submitTransferencia() {
    const customer = validateCustomer();
    if (!customer) return;
    setSubmitting(true);
    setSubmitError(null);

    // NEVER-BLOCK: a failed/missing upload downgrades to comprobante_pendiente.
    let receiptUrl: string | null = null;
    const file = fileRef.current?.files?.[0];
    if (file) {
      receiptUrl = await tryUploadReceipt(file);
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          orderPayload(customer, 'transferencia', receiptUrl ? { receiptUrl } : {}),
        ),
      });
      const data = (await res.json()) as { ok: boolean; orderId?: string; error?: string };
      if (data.ok && data.orderId) {
        cart.clear();
        const comprobante = receiptUrl ? 'ok' : 'pendiente';
        router.push(`/checkout/gracias?metodo=transferencia&pedido=${data.orderId}&comprobante=${comprobante}`);
        return;
      }
      setSubmitError(data.error ?? 'No pudimos registrar el pedido. Probá por WhatsApp.');
    } catch {
      setSubmitError('Error de conexión. Probá de nuevo o finalizá por WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  }

  /**
   * CRITICAL pattern: fire-and-forget beacon + synchronous navigation in the
   * SAME click handler. Never await a fetch and then window.open — popup
   * blockers kill it and a slow network kills the sale.
   */
  function submitWhatsApp() {
    const customer = validateCustomer();
    if (!customer) return;

    const orderId = newClientOrderId();
    const payload = orderPayload(customer, 'whatsapp', { clientOrderId: orderId });
    // sendBeacon posts as text/plain; the API parses JSON from the raw body.
    const blob = new Blob([JSON.stringify(payload)], { type: 'text/plain' });
    const sent = navigator.sendBeacon('/api/orders', blob);
    if (!sent) {
      // Beacon queue full — extremely rare; still proceed to WhatsApp (the
      // message itself contains the full order for manual processing).
      console.warn('sendBeacon returned false for order', orderId);
    }

    const message = orderMessage({
      orderId,
      customer,
      items: items.map(({ product, qty }) => ({ name: product.name, qty, price: product.price })),
      deliveryZone: zone,
      totals,
    });
    cart.clear();
    window.location.href = waLink(message);
  }

  function onFileChange() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setFileError(null);
      return;
    }
    if (file.size > MAX_RECEIPT_BYTES) {
      setFileError('El archivo supera 5MB. Podés enviarlo por WhatsApp después de confirmar.');
      if (fileRef.current) fileRef.current.value = '';
      return;
    }
    if (!ACCEPTED_RECEIPT_TYPES.includes(file.type)) {
      setFileError('Formato no soportado: subí una imagen (JPG/PNG) o un PDF.');
      if (fileRef.current) fileRef.current.value = '';
      return;
    }
    setFileError(null);
  }

  if (cart.hydrated && items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-wood-900">Tu carrito está vacío</h1>
        <p className="mt-3 text-stone-600">
          Explorá nuestras categorías y encontrá el mueble que aguanta de verdad.
        </p>
        <Link href="/" className="btn-primary mt-6">
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-extrabold text-wood-900 sm:text-3xl">Finalizá tu pedido</h1>

      {/* 1. Cart summary */}
      <section aria-labelledby="resumen" className="mt-6">
        <h2 id="resumen" className="text-lg font-bold text-stone-900">1. Tu pedido</h2>
        <ul className="mt-3 divide-y divide-stone-100 rounded-2xl border border-wood-200 bg-white">
          {items.map(({ product, qty }) => (
            <li key={product.slug} className="flex items-center gap-3 p-3">
              <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-wood-100">
                <Image src={product.images[0]} alt={product.name} fill sizes="80px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-stone-900">{product.name}</p>
                <p className="text-sm font-bold text-wood-800">{formatPYG(product.price * qty)}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label={`Quitar uno de ${product.name}`}
                  onClick={() => cart.setQty(product.slug, qty - 1)}
                  className="h-8 w-8 rounded-lg bg-stone-100 font-bold text-stone-700 hover:bg-stone-200"
                >
                  −
                </button>
                <span className="w-7 text-center text-sm font-semibold">{qty}</span>
                <button
                  type="button"
                  aria-label={`Agregar uno de ${product.name}`}
                  onClick={() => cart.setQty(product.slug, qty + 1)}
                  className="h-8 w-8 rounded-lg bg-stone-100 font-bold text-stone-700 hover:bg-stone-200"
                >
                  +
                </button>
                <button
                  type="button"
                  aria-label={`Eliminar ${product.name}`}
                  onClick={() => cart.removeItem(product.slug)}
                  className="ml-1 h-8 w-8 rounded-lg text-stone-400 hover:bg-red-50 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* 2. Customer form */}
      <section aria-labelledby="datos" className="mt-8">
        <h2 id="datos" className="text-lg font-bold text-stone-900">2. Tus datos</h2>
        <div className="mt-3 grid gap-4 rounded-2xl border border-wood-200 bg-white p-4 sm:grid-cols-2">
          <div>
            <label htmlFor="nombre" className="label">Nombre y apellido *</label>
            <input id="nombre" className="input" autoComplete="name" value={form.nombre}
              onChange={(e) => setField('nombre', e.target.value)} />
            {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre}</p>}
          </div>
          <div>
            <label htmlFor="telefono" className="label">Celular (WhatsApp) *</label>
            <input id="telefono" className="input" type="tel" inputMode="tel" placeholder="09xx xxx xxx"
              autoComplete="tel" value={form.telefono} onChange={(e) => setField('telefono', e.target.value)} />
            {errors.telefono && <p className="mt-1 text-xs text-red-600">{errors.telefono}</p>}
          </div>
          <div>
            <label htmlFor="email" className="label">Email (opcional)</label>
            <input id="email" className="input" type="email" autoComplete="email" value={form.email}
              onChange={(e) => setField('email', e.target.value)} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="ciudad" className="label">Ciudad / Barrio *</label>
            <input id="ciudad" className="input" autoComplete="address-level2" value={form.ciudad}
              onChange={(e) => setField('ciudad', e.target.value)} />
            {errors.ciudad && <p className="mt-1 text-xs text-red-600">{errors.ciudad}</p>}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="direccion" className="label">Dirección de entrega *</label>
            <input id="direccion" className="input" autoComplete="street-address" value={form.direccion}
              onChange={(e) => setField('direccion', e.target.value)} />
            {errors.direccion && <p className="mt-1 text-xs text-red-600">{errors.direccion}</p>}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="notas" className="label">Notas (opcional)</label>
            <textarea id="notas" className="input" rows={2} value={form.notas}
              onChange={(e) => setField('notas', e.target.value)} />
          </div>
        </div>
      </section>

      {/* 3. Delivery zone */}
      <section aria-labelledby="entrega" className="mt-8">
        <h2 id="entrega" className="text-lg font-bold text-stone-900">3. Zona de entrega</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {DELIVERY_ZONES.map((z) => (
            <button
              key={z.id}
              type="button"
              onClick={() => setZone(z.id)}
              aria-pressed={zone === z.id}
              className={`rounded-2xl border-2 p-4 text-left transition ${
                zone === z.id ? 'border-wood-600 bg-wood-100/70' : 'border-stone-200 bg-white hover:border-wood-300'
              }`}
            >
              <p className="font-bold text-stone-900">{z.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-stone-600">{z.note}</p>
            </button>
          ))}
        </div>
        {hasAssemblyItems && (
          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-wood-200 bg-white p-4">
            <input
              type="checkbox"
              checked={assembly}
              onChange={(e) => setAssembly(e.target.checked)}
              className="mt-1 h-4 w-4 accent-wood-700"
            />
            <span className="text-sm">
              <span className="font-semibold text-stone-900">
                Quiero el servicio de armado ({formatPYG(assemblyFee)})
              </span>
              <span className="mt-0.5 block text-stone-600">
                Nuestro equipo arma el mueble en tu casa el día de la entrega.
              </span>
            </span>
          </label>
        )}
      </section>

      {/* Totals */}
      <section className="mt-8 rounded-2xl border border-wood-200 bg-white p-4">
        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-stone-600">Subtotal</dt>
            <dd className="font-semibold">{formatPYG(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-stone-600">Envío</dt>
            <dd className="font-semibold">
              {zone === 'interior' ? 'A coordinar' : formatPYG(totals.delivery)}
            </dd>
          </div>
          {totals.assembly > 0 && (
            <div className="flex justify-between">
              <dt className="text-stone-600">Armado</dt>
              <dd className="font-semibold">{formatPYG(totals.assembly)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-stone-200 pt-2 text-base">
            <dt className="font-bold text-stone-900">Total</dt>
            <dd className="font-extrabold text-wood-800">{formatPYG(totals.total)}</dd>
          </div>
        </dl>
      </section>

      {/* 4. Payment methods */}
      <section aria-labelledby="pago" className="mt-8">
        <h2 id="pago" className="text-lg font-bold text-stone-900">4. ¿Cómo querés pagar?</h2>
        {submitError && (
          <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
            {submitError}
          </p>
        )}
        <div className="mt-3 space-y-3">
          {/* Option A: Pagopar */}
          <div
            className={`rounded-2xl border-2 transition ${
              method === 'pagopar' ? 'border-wood-600 bg-white' : 'border-stone-200 bg-white'
            }`}
          >
            <button type="button" onClick={() => setMethod('pagopar')} className="w-full p-4 text-left">
              <p className="font-bold text-stone-900">💳 Pagar online (tarjetas, QR, billeteras)</p>
              <p className="mt-1 text-sm text-stone-600">
                Pago seguro vía Pagopar: tarjetas de crédito y débito, QR, Tigo Money, Billetera
                Personal y más.
              </p>
              <div className="mt-2">
                <CuotasBadge price={totals.total} size="sm" />
              </div>
            </button>
            {method === 'pagopar' && (
              <div className="border-t border-stone-100 p-4">
                <button type="button" onClick={submitPagopar} disabled={submitting} className="btn-primary w-full">
                  {submitting ? 'Conectando con Pagopar…' : `Pagar ${formatPYG(totals.total)} online`}
                </button>
              </div>
            )}
          </div>

          {/* Option B: Transferencia */}
          <div
            className={`rounded-2xl border-2 transition ${
              method === 'transferencia' ? 'border-wood-600 bg-white' : 'border-stone-200 bg-white'
            }`}
          >
            <button type="button" onClick={() => setMethod('transferencia')} className="w-full p-4 text-left">
              <p className="font-bold text-stone-900">🏦 Transferencia bancaria (SIPAP)</p>
              <p className="mt-1 text-sm text-stone-600">
                Transferí desde tu banco y subí el comprobante (o envialo por WhatsApp).
              </p>
            </button>
            {method === 'transferencia' && (
              <div className="space-y-4 border-t border-stone-100 p-4">
                <div className="space-y-2 rounded-xl bg-stone-50 p-3 text-sm">
                  {[
                    { label: 'Banco', value: BANK.name },
                    { label: 'Cuenta', value: BANK.account },
                    { label: 'Titular', value: BANK.holder },
                    { label: 'RUC', value: BANK.ruc },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-2">
                      <span className="text-stone-500">{row.label}</span>
                      <span className="flex items-center gap-2 font-semibold text-stone-900">
                        {row.value}
                        <CopyButton value={row.value} label={row.label} />
                      </span>
                    </div>
                  ))}
                </div>
                <div>
                  <label htmlFor="comprobante" className="label">
                    Comprobante de transferencia (imagen o PDF, máx. 5MB)
                  </label>
                  <input
                    id="comprobante"
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
                    onChange={onFileChange}
                    className="block w-full text-sm text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-wood-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-wood-800"
                  />
                  {fileError && <p className="mt-1 text-xs text-red-600">{fileError}</p>}
                  <p className="mt-1 text-xs text-stone-500">
                    ¿No tenés el comprobante a mano? Confirmá igual y envialo después por WhatsApp.
                  </p>
                </div>
                <button type="button" onClick={submitTransferencia} disabled={submitting} className="btn-primary w-full">
                  {submitting ? 'Registrando pedido…' : 'Confirmar pedido por transferencia'}
                </button>
              </div>
            )}
          </div>

          {/* Option C: WhatsApp — prominent, always visible */}
          <div className="rounded-2xl border-2 border-whatsapp/60 bg-green-50/60">
            <div className="p-4">
              <p className="font-bold text-stone-900">💬 Finalizar pedido por WhatsApp</p>
              <p className="mt-1 text-sm text-stone-600">
                Te atendemos en persona: confirmás el pedido, coordinamos entrega y elegís cómo
                pagar, todo por chat.
              </p>
              <button
                type="button"
                onClick={submitWhatsApp}
                className="btn-whatsapp mt-3 w-full px-5 py-3.5 text-base"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Enviar pedido por WhatsApp
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
