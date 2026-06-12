'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart';
import { CartIcon, CheckIcon } from './icons';

export default function AddToCartButton({ slug }: { slug: string }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const router = useRouter();

  function handleAdd() {
    addItem(slug);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <button type="button" onClick={handleAdd} className="btn-primary flex-1">
        {added ? <CheckIcon className="h-5 w-5" /> : <CartIcon className="h-5 w-5" />}
        {added ? 'Agregado al carrito' : 'Agregar al carrito'}
      </button>
      {added && (
        <button
          type="button"
          onClick={() => router.push('/checkout')}
          className="inline-flex items-center justify-center rounded-lg border-2 border-wood-700 px-5 py-3 font-semibold text-wood-800 transition hover:bg-wood-100"
        >
          Ir al checkout
        </button>
      )}
    </div>
  );
}
