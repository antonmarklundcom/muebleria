import { createHash } from 'crypto';
import type { Order } from './types';

/**
 * Pagopar (upay) integration — ALL Pagopar-specific request/response shapes
 * live in this file only, so field-name corrections against the live API
 * docs touch a single module.
 *
 * Flow per Pagopar's documented API:
 *  1. POST /api/comercios/2.0/iniciar-transaccion with the order payload,
 *     signed with token = sha1(privateToken + orderId + amount).
 *  2. Pagopar returns a payment hash; the customer is redirected to the
 *     hosted checkout at https://www.pagopar.com/pagos/<hash>.
 *  3. Pagopar confirms payment server-to-server (see app/api/webhooks/pagopar).
 *
 * PAGOPAR_SANDBOX=true enables a local simulation mode: when tokens are
 * missing it short-circuits to the thank-you page so the full checkout flow
 * can be tested without credentials; with sandbox tokens present it calls
 * the real API and logs request/response verbosely.
 */

const PAGOPAR_API_BASE = 'https://api.pagopar.com/api';
// TODO(pagopar): verify the hosted-checkout URL pattern against live docs.
const PAGOPAR_CHECKOUT_BASE = 'https://www.pagopar.com/pagos';

export function isSandbox(): boolean {
  return process.env.PAGOPAR_SANDBOX === 'true';
}

/** sha1(privateToken + orderId + amount) — Pagopar's documented signing pattern. */
export function signOrderToken(privateToken: string, orderId: string, amount: number): string {
  return createHash('sha1').update(`${privateToken}${orderId}${amount}`).digest('hex');
}

/** sha1(privateToken + payment hash) — used to validate webhook callbacks. */
export function signWebhookToken(privateToken: string, paymentHash: string): string {
  return createHash('sha1').update(`${privateToken}${paymentHash}`).digest('hex');
}

// TODO(pagopar): verify every field name below against the live API docs
// (https://soporte.pagopar.com / developers docs) before going to production.
type PagoparItem = {
  ciudad: string;
  nombre: string;
  cantidad: number;
  categoria: string;
  public_key: string;
  url_imagen: string;
  descripcion: string;
  id_producto: string;
  precio_total: number;
  vendedor_telefono: string;
  vendedor_direccion: string;
  vendedor_direccion_referencia: string;
  vendedor_direccion_coordenadas: string;
};

type PagoparCreateOrderRequest = {
  token: string;
  comprador: {
    ruc: string;
    email: string;
    ciudad: string;
    nombre: string;
    telefono: string;
    direccion: string;
    documento: string;
    coordenadas: string;
    razon_social: string;
    tipo_documento: string;
    direccion_referencia: string;
  };
  public_key: string;
  monto_total: number;
  tipo_pedido: string;
  compras_items: PagoparItem[];
  fecha_maxima_pago: string;
  id_pedido_comercio: string;
  descripcion_resumen: string;
};

type PagoparCreateOrderResponse = {
  respuesta: boolean;
  resultado: { data: string }[] | string;
};

export type PagoparRedirect = {
  redirectUrl: string;
  paymentHash?: string;
  sandboxSimulated: boolean;
};

export async function createPagoparOrder(order: Order, siteUrl: string): Promise<PagoparRedirect> {
  const publicToken = process.env.PAGOPAR_PUBLIC_TOKEN;
  const privateToken = process.env.PAGOPAR_PRIVATE_TOKEN;

  if (!publicToken || !privateToken) {
    if (isSandbox()) {
      console.warn(
        `[pagopar] SANDBOX without tokens — simulating redirect for order ${order.orderId}`,
      );
      return {
        redirectUrl: `${siteUrl}/checkout/gracias?metodo=pagopar&pedido=${order.orderId}&sandbox=1`,
        sandboxSimulated: true,
      };
    }
    throw new Error('PAGOPAR_PUBLIC_TOKEN / PAGOPAR_PRIVATE_TOKEN are not configured');
  }

  // fecha_maxima_pago: 2 days from now, "YYYY-MM-DD HH:mm:ss" per docs.
  const maxDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ');

  const request: PagoparCreateOrderRequest = {
    token: signOrderToken(privateToken, order.orderId, order.totals.total),
    comprador: {
      ruc: '',
      email: order.customer.email ?? 'sin-email@muebleria.com.py',
      ciudad: '1', // TODO(pagopar): verify city id codes against live docs (1 = Asunción).
      nombre: order.customer.nombre,
      telefono: order.customer.telefono,
      direccion: order.customer.direccion,
      documento: '', // TODO(pagopar): confirm whether documento (CI) is mandatory; add field to checkout form if so.
      coordenadas: '',
      razon_social: order.customer.nombre,
      tipo_documento: 'CI',
      direccion_referencia: order.customer.notas ?? '',
    },
    public_key: publicToken,
    monto_total: order.totals.total,
    tipo_pedido: 'VENTA-COMERCIO',
    compras_items: order.items.map((item) => ({
      ciudad: '1',
      nombre: item.name,
      cantidad: item.qty,
      categoria: '909', // TODO(pagopar): verify category id for "Hogar y Muebles" against live docs.
      public_key: publicToken,
      url_imagen: `${siteUrl}/images/og-default.svg`,
      descripcion: item.name,
      id_producto: item.slug,
      precio_total: item.price * item.qty,
      vendedor_telefono: '',
      vendedor_direccion: '',
      vendedor_direccion_referencia: '',
      vendedor_direccion_coordenadas: '',
    })),
    fecha_maxima_pago: maxDate,
    id_pedido_comercio: order.orderId,
    descripcion_resumen: `Pedido ${order.orderId} - muebleria.com.py`,
  };

  if (isSandbox()) {
    console.log('[pagopar][sandbox] request payload:', JSON.stringify(request, null, 2));
  }

  const res = await fetch(`${PAGOPAR_API_BASE}/comercios/2.0/iniciar-transaccion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(`Pagopar API responded ${res.status}`);
  }

  const data = (await res.json()) as PagoparCreateOrderResponse;
  if (isSandbox()) {
    console.log('[pagopar][sandbox] response:', JSON.stringify(data, null, 2));
  }

  if (!data.respuesta || !Array.isArray(data.resultado) || !data.resultado[0]?.data) {
    throw new Error(`Pagopar rejected the order: ${JSON.stringify(data.resultado)}`);
  }

  const paymentHash = data.resultado[0].data;
  return {
    redirectUrl: `${PAGOPAR_CHECKOUT_BASE}/${paymentHash}`,
    paymentHash,
    sandboxSimulated: false,
  };
}

// TODO(pagopar): verify the webhook payload shape against live docs.
export type PagoparWebhookResult = {
  pagado: boolean;
  forma_pago: string;
  hash_pedido: string;
  monto: string;
  fecha_pago: string | null;
  numero_pedido: string; // our id_pedido_comercio (MUE-XXXXXXXX)
  token: string;
};

export type PagoparWebhookPayload = {
  resultado: PagoparWebhookResult[];
};

/** Validates the webhook token: sha1(privateToken + hash_pedido). */
export function isValidWebhookResult(result: PagoparWebhookResult): boolean {
  const privateToken = process.env.PAGOPAR_PRIVATE_TOKEN;
  if (!privateToken) {
    // Sandbox without credentials: accept but log loudly. Never in production.
    if (isSandbox()) {
      console.warn('[pagopar] SANDBOX webhook accepted WITHOUT token validation');
      return true;
    }
    return false;
  }
  return result.token === signWebhookToken(privateToken, result.hash_pedido);
}
