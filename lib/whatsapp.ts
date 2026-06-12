import type { DeliveryZone, OrderCustomer, OrderTotals } from './types';
import { formatPYG } from './format';

export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '595991000000';

const ZONE_LABELS: Record<DeliveryZone, string> = {
  asuncion: 'Asunción',
  gran_asuncion: 'Gran Asunción',
  interior: 'Interior del país',
};

export function waLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}

/** Pre-filled product inquiry: "Consultar por WhatsApp" chip on product pages. */
export function productInquiryLink(productName: string, productUrl: string): string {
  return waLink(
    `¡Hola! Quiero consultar por este producto:\n\n*${productName}*\n${productUrl}\n\n¿Me pasás más info?`,
  );
}

/** Full order summary for the "Finalizar pedido por WhatsApp" checkout option. */
export function orderMessage(params: {
  orderId: string;
  customer: OrderCustomer;
  items: { name: string; qty: number; price: number }[];
  deliveryZone: DeliveryZone;
  totals: OrderTotals;
}): string {
  const { orderId, customer, items, deliveryZone, totals } = params;
  const lines = [
    `¡Hola! Quiero confirmar mi pedido *${orderId}* 🛋️`,
    '',
    ...items.map((i) => `• ${i.name} x${i.qty} — ${formatPYG(i.price * i.qty)}`),
    '',
    `Entrega: ${ZONE_LABELS[deliveryZone]}${totals.delivery > 0 ? ` (${formatPYG(totals.delivery)})` : ''}`,
  ];
  if (totals.assembly > 0) lines.push(`Armado: ${formatPYG(totals.assembly)}`);
  lines.push(`*Total: ${formatPYG(totals.total)}*`, '', `Nombre: ${customer.nombre}`, `Ciudad: ${customer.ciudad}`);
  return lines.join('\n');
}

/** Message for sending a pending transfer receipt when the upload failed. */
export function receiptFallbackMessage(orderId: string): string {
  return `Hola, hice el pedido *${orderId}* por transferencia y les envío el comprobante por acá 📎`;
}
