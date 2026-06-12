import type { DeliveryZone, OrderTotals, Product } from './types';
import { getProduct } from './catalog';

export const DELIVERY_ZONES: { id: DeliveryZone; label: string; note: string }[] = [
  {
    id: 'asuncion',
    label: 'Asunción',
    note: 'Entrega a domicilio en 24–72 hs hábiles.',
  },
  {
    id: 'gran_asuncion',
    label: 'Gran Asunción',
    note: 'Lambaré, Fdo. de la Mora, San Lorenzo, Luque, M.R. Alonso, Capiatá y alrededores.',
  },
  {
    id: 'interior',
    label: 'Interior del país',
    note: 'Coordinamos el envío por encomienda vía WhatsApp; el flete corre por cuenta del cliente.',
  },
];

export type PricedItem = { product: Product; qty: number };

export function resolveItems(items: { slug: string; qty: number }[]): PricedItem[] {
  const resolved: PricedItem[] = [];
  for (const item of items) {
    const product = getProduct(item.slug);
    if (product && item.qty > 0) {
      resolved.push({ product, qty: Math.min(item.qty, 99) });
    }
  }
  return resolved;
}

function deliveryFor(product: Product, zone: DeliveryZone): number {
  if (zone === 'asuncion') return product.delivery.asuncion;
  if (zone === 'gran_asuncion') return product.delivery.granAsuncion;
  return 0; // interior: quoted separately via WhatsApp
}

/**
 * Order totals. Delivery is charged once per order as the highest item fee
 * (everything ships in a single trip). Assembly is optional and only offered
 * in Asunción / Gran Asunción; the fee is per unit that requires assembly.
 * Prices come from the catalog — client-provided prices are never trusted.
 */
export function computeTotals(
  items: PricedItem[],
  zone: DeliveryZone,
  assemblyRequested: boolean,
): OrderTotals {
  const subtotal = items.reduce((sum, { product, qty }) => sum + product.price * qty, 0);
  const delivery = items.reduce((max, { product }) => Math.max(max, deliveryFor(product, zone)), 0);
  const assembly =
    assemblyRequested && zone !== 'interior'
      ? items.reduce(
          (sum, { product, qty }) =>
            sum + (product.assembly.required ? product.assembly.feeAsuncion * qty : 0),
          0,
        )
      : 0;
  return { subtotal, delivery, assembly, total: subtotal + delivery + assembly };
}

export function assemblyFeeFor(items: PricedItem[]): number {
  return items.reduce(
    (sum, { product, qty }) =>
      sum + (product.assembly.required ? product.assembly.feeAsuncion * qty : 0),
    0,
  );
}
