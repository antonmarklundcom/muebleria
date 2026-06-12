import { NextResponse } from 'next/server';
import { isValidWebhookResult, type PagoparWebhookPayload } from '@/lib/pagopar';
import { getPendingOrder, isHashProcessed, markHashProcessed } from '@/lib/order-store';
import { orderExistsInSheet } from '@/lib/sheets';
import { sendOrderToGHL } from '@/lib/ghl';
import { appendOrderToSheet } from '@/lib/sheets';
import type { Order } from '@/lib/types';

export const runtime = 'nodejs';

/**
 * POST /api/webhooks/pagopar — Pagopar's server-to-server payment
 * confirmation. Requirements implemented here:
 *  - token validation: sha1(privateToken + hash_pedido) per Pagopar spec
 *  - idempotency: in-memory LRU of processed hashes + Sheets row check
 *  - response: Pagopar's docs require echoing the received payload back.
 *    TODO(pagopar): verify the exact echo format against live docs — some
 *    versions expect only the `resultado` array echoed, others the full body.
 *  - on confirmed payment, re-fires GHL with stage 'pagado_online'.
 */
export async function POST(req: Request) {
  let payload: PagoparWebhookPayload;
  try {
    payload = JSON.parse(await req.text()) as PagoparWebhookPayload;
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const results = Array.isArray(payload?.resultado) ? payload.resultado : [];

  for (const result of results) {
    if (!result?.hash_pedido) continue;

    if (!isValidWebhookResult(result)) {
      console.error(`[pagopar-webhook] INVALID TOKEN for hash ${result.hash_pedido} — ignoring`);
      continue;
    }

    if (!result.pagado) continue; // only act on confirmed payments

    const idempotencyKey = `${result.hash_pedido}:pagado`;
    if (isHashProcessed(idempotencyKey)) {
      console.log(`[pagopar-webhook] duplicate webhook for ${result.hash_pedido} — skipping`);
      continue;
    }

    const orderId = result.numero_pedido;
    const paidRowId = `${orderId}-PAGADO`;
    if (await orderExistsInSheet(paidRowId)) {
      markHashProcessed(idempotencyKey);
      continue;
    }

    const pending = getPendingOrder(orderId);
    const paidOrder: Order = pending
      ? { ...pending, pipelineStage: 'pagado_online' }
      : // Server restarted since checkout: minimal payload, orderId links it
        // to the original 'pendiente_pago' row/contact in GHL and Sheets.
        {
          orderId,
          createdAt: new Date().toISOString(),
          customer: {
            nombre: `(ver pedido ${orderId})`,
            telefono: '',
            ciudad: '',
            direccion: '',
          },
          items: [],
          deliveryZone: 'asuncion',
          assemblyRequested: false,
          totals: {
            subtotal: Number(result.monto) || 0,
            delivery: 0,
            assembly: 0,
            total: Number(result.monto) || 0,
          },
          paymentMethod: 'pagopar',
          pipelineStage: 'pagado_online',
        };

    const settled = await Promise.allSettled([
      sendOrderToGHL(paidOrder),
      appendOrderToSheet({ ...paidOrder, orderId: paidRowId }),
    ]);
    settled.forEach((r) => {
      if (r.status === 'rejected') {
        console.error(`[pagopar-webhook] fan-out failure for ${orderId}:`, r.reason);
      }
    });

    markHashProcessed(idempotencyKey);
    console.log(`[pagopar-webhook] order ${orderId} confirmed as pagado_online`);
  }

  // Echo the payload back as Pagopar requires to acknowledge receipt.
  // TODO(pagopar): confirm exact echo format (full body vs `resultado` only).
  return NextResponse.json(payload);
}
