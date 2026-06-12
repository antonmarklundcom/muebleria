import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { formatPYG } from '@/lib/format';
import CuotasBadge from './CuotasBadge';
import MaterialBadgeTag from './MaterialBadgeTag';

const TIER_LABELS: Record<Product['tier'], string> = {
  entrada: 'Línea Práctica',
  media: 'Línea Familiar',
  premium: 'Línea Premium',
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-wood-200 bg-white transition hover:shadow-lg">
      <Link href={`/producto/${product.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-wood-100">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition group-hover:scale-[1.03]"
          />
          {product.stock === 'a_pedido' && (
            <span className="absolute left-2 top-2 rounded-md bg-iron-900/85 px-2 py-1 text-[11px] font-semibold text-white">
              A pedido · {product.leadTimeDays ?? 15} días
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-center gap-2">
            <MaterialBadgeTag badge={product.material.badge} size="sm" />
            <span className="text-[11px] font-medium uppercase tracking-wide text-stone-400">
              {TIER_LABELS[product.tier]}
            </span>
          </div>
          <h3 className="font-semibold leading-snug text-stone-900">{product.name}</h3>
          <div className="mt-auto space-y-1.5">
            <p className="text-lg font-bold text-wood-800">{formatPYG(product.price)}</p>
            <CuotasBadge price={product.price} size="sm" />
          </div>
        </div>
      </Link>
    </article>
  );
}
