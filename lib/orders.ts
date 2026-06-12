import { customAlphabet } from 'nanoid';
import type { Order, PaymentMethod, PipelineStage } from './types';
import type { OrderInput } from './validation';
import { computeTotals, resolveItems } from './pricing';
import { sendOrderToGHL } from './ghl';
import { appendOrderToSheet } from './sheets';

const nanoid = customAlphabet('0123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 8);

export function newOrderId(): string {
  return `MUE-${nanoid()}`;
}

export function derivePipelineStage(
  method: PaymentMethod,
  opts: { receiptUrl?: string; paid?: boolean } = {},
): PipelineStage {
  switch (method) {
    case 'pagopar':
      return opts.paid ? 'pagado_online' : 'pendiente_pago';
    case 'transferencia':
      return opts.receiptUrl ? 'esperando_comprobante' : 'comprobante_pendiente';
    case 'whatsapp':
      return 'chat_order';
  }
}

/**
 * Builds a full Order from validated input. Item prices and totals are
 * recomputed from the catalog server-side — client-sent amounts are ignored.
 */
export function buildOrder(input: OrderInput, opts: { paid?: boolean } = {}): Order | null {
  const items = resolveItems(input.items);
  if (items.length === 0) return null;

  const totals = computeTotals(items, input.deliveryZone, input.assemblyRequested);
  return {
    orderId: input.clientOrderId ?? newOrderId(),
    createdAt: new Date().toISOString(),
    customer: input.customer,
    items: items.map(({ product, qty }) => ({
      slug: product.slug,
      name: product.name,
      qty,
      price: product.price,
    })),
    deliveryZone: input.deliveryZone,
    assemblyRequested: input.assemblyRequested,
    totals,
    paymentMethod: input.paymentMethod,
    pipelineStage: derivePipelineStage(input.paymentMethod, {
      receiptUrl: input.receiptUrl,
      paid: opts.paid,
    }),
    receiptUrl: input.receiptUrl,
  };
}

/**
 * Single fan-out point for ALL order paths (online payment, transfer,
 * WhatsApp, Pagopar webhook re-fire). Destinations run in parallel and a
 * failing logger NEVER fails the customer-facing response — failures are
 * logged loudly for manual follow-up instead.
 */
export async function processOrder(order: Order): Promise<void> {
  const results = await Promise.allSettled([sendOrderToGHL(order), appendOrderToSheet(order)]);

  const destinations = ['GoHighLevel', 'Google Sheets'];
  results.forEach((result, i) => {
    if (result.status === 'rejected') {
      console.error(
        `[orders] FAN-OUT FAILURE order=${order.orderId} destination=${destinations[i]} — follow up manually:`,
        result.reason,
      );
    }
  });
}
