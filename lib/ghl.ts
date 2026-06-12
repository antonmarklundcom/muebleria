import type { Order } from './types';
import { withRetry } from './retry';

/**
 * GoHighLevel fan-out: POSTs the full order payload to a GHL inbound
 * webhook (env GHL_WEBHOOK_URL). The webhook's workflow maps fields to a
 * contact + opportunity; `pipelineStage` drives the pipeline placement.
 */
export async function sendOrderToGHL(order: Order): Promise<void> {
  const url = process.env.GHL_WEBHOOK_URL;
  if (!url) {
    console.warn(`[ghl] GHL_WEBHOOK_URL not configured — skipping for order ${order.orderId}`);
    return;
  }

  const payload = {
    orderId: order.orderId,
    createdAt: order.createdAt,
    // Contact fields at the top level so GHL inbound-webhook mapping is trivial.
    name: order.customer.nombre,
    phone: order.customer.telefono,
    email: order.customer.email ?? '',
    city: order.customer.ciudad,
    address: order.customer.direccion,
    notes: order.customer.notas ?? '',
    items: order.items.map((i) => ({ slug: i.slug, name: i.name, qty: i.qty, price: i.price })),
    itemsSummary: order.items.map((i) => `${i.name} x${i.qty}`).join(' | '),
    deliveryZone: order.deliveryZone,
    assemblyRequested: order.assemblyRequested,
    subtotal: order.totals.subtotal,
    deliveryCost: order.totals.delivery,
    assemblyCost: order.totals.assembly,
    total: order.totals.total,
    paymentMethod: order.paymentMethod,
    pipelineStage: order.pipelineStage,
    receiptUrl: order.receiptUrl ?? '',
    source: 'muebleria.com.py',
  };

  await withRetry(`GHL webhook (order ${order.orderId})`, async () => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      throw new Error(`GHL webhook responded ${res.status}`);
    }
  });
}
