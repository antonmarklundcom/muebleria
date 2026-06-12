import { NextResponse } from 'next/server';
import { orderInputSchema } from '@/lib/validation';
import { buildOrder, processOrder } from '@/lib/orders';

export const runtime = 'nodejs';

/**
 * POST /api/orders — single entry point for transfer and WhatsApp orders.
 *
 * NOTE: the WhatsApp flow submits via navigator.sendBeacon, which sends the
 * body with Content-Type text/plain — so we always parse JSON from the raw
 * text body instead of trusting the content type.
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
  if (parsed.data.paymentMethod === 'pagopar') {
    return NextResponse.json(
      { ok: false, error: 'Los pagos online se inician en /api/checkout/pagopar' },
      { status: 400 },
    );
  }

  const order = buildOrder(parsed.data);
  if (!order) {
    return NextResponse.json(
      { ok: false, error: 'Ningún producto del pedido existe en el catálogo' },
      { status: 400 },
    );
  }

  await processOrder(order);

  return NextResponse.json({
    ok: true,
    orderId: order.orderId,
    pipelineStage: order.pipelineStage,
    total: order.totals.total,
  });
}
