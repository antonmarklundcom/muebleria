import type { Metadata } from 'next';
import CheckoutClient from '@/components/checkout/CheckoutClient';

export const metadata: Metadata = {
  title: 'Checkout — Finalizá tu pedido',
  description: 'Finalizá tu pedido: pago online, transferencia SIPAP o WhatsApp.',
  robots: { index: false },
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
