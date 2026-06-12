import { NextResponse } from 'next/server';
import { orderInputSchema } from '@/lib/validation';
import { buildOrder, processOrder } from '@/lib/orders';
import { createPagoparOrder } from '@/lib/pagopar';
import { savePendingOrder } from '@/lib/order-store';

export const runtime = 'nodejs';

/**
 * POST /api/checkout/pagopar — creates the order in Pagopar, persists the
 * local order as 'pendiente_pago' (fan-out to GHL/Sheets + in-memory store
 * for the webhook), and returns the hosted-checkout redirect URL.
 */
export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = JSON.parse(await req.text());
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = orderInputSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Datos inválidos', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  if (parsed.data.paymentMethod !== 'pagopar') {
    return NextResponse.json({ ok: false, error: 'Método de pago incorrecto' }, { status: 400 });
  }

  const order = buildOrder(parsed.data);
  if (!order) {
    return NextResponse.json(
      { ok: false, error: 'Ningún producto del pedido existe en el catálogo' },
      { status: 400 },
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://muebleria.com.py';

  try {
    const redirect = await createPagoparOrder(order, siteUrl);

    // Persist as pendiente_pago BEFORE redirecting: the lead reaches GHL and
    // the Sheets backup even if the customer abandons the hosted checkout.
    savePendingOrder(order);
    await processOrder(order);

    return NextResponse.json({
      ok: true,
      orderId: order.orderId,
      redirectUrl: redirect.redirectUrl,
      sandbox: redirect.sandboxSimulated,
    });
  } catch (error) {
    console.error(`[pagopar] order creation failed for ${order.orderId}:`, error);
    return NextResponse.json(
      {
        ok: false,
        error:
          'No pudimos iniciar el pago online. Probá de nuevo o finalizá tu pedido por WhatsApp.',
      },
      { status: 502 },
    );
  }
}
