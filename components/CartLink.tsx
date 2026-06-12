'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart';
import { CartIcon } from './icons';

export default function CartLink() {
  const { count, hydrated } = useCart();
  return (
    <Link
      href="/checkout"
      aria-label={`Carrito de compras${count > 0 ? `, ${count} productos` : ''}`}
      className="relative flex items-center rounded-lg p-2 text-stone-700 transition hover:bg-wood-100"
    >
      <CartIcon className="h-6 w-6" />
      {hydrated && count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-wood-700 px-1 text-xs font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
