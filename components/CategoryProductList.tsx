'use client';

import { useState } from 'react';
import type { Product } from '@/lib/types';
import ProductCard from './ProductCard';

/** Product grid with optional sub-filter chips (e.g. "4 puertas", "gamer"). */
export default function CategoryProductList({
  products,
  filterTags,
}: {
  products: Product[];
  filterTags?: string[];
}) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const visible = activeTag
    ? products.filter((p) => p.tags?.includes(activeTag))
    : products;

  return (
    <div>
      {filterTags && filterTags.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filtros">
          <button
            type="button"
            onClick={() => setActiveTag(null)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              activeTag === null
                ? 'bg-clay-600 text-white'
                : 'bg-white text-muted ring-1 ring-line hover:text-clay-600'
            }`}
          >
            Todos
          </button>
          {filterTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                activeTag === tag
                  ? 'bg-clay-600 text-white'
                  : 'bg-white text-muted ring-1 ring-line hover:text-clay-600'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
      {visible.length === 0 ? (
        <p className="rounded-lg border border-line bg-white p-6 text-center text-muted">
          No hay productos con ese filtro por ahora. Consultanos por WhatsApp: fabricamos a medida.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
