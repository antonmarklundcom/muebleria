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
    <article className="group flex flex-col overflow-hidden rounded-lg border border-line bg-white transition hover:border-clay-300">
      <Link href={`/producto/${product.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          {product.stock === 'a_pedido' && (
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-ink ring-1 ring-line backdrop-blur-sm">
              A pedido · {product.leadTimeDays ?? 15} días
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2.5 p-5">
          <div className="flex items-center gap-2">
            <MaterialBadgeTag badge={product.material.badge} size="sm" />
            <span className="text-[11px] font-medium uppercase tracking-wide text-stone-400">
              {TIER_LABELS[product.tier]}
            </span>
          </div>
          <h3 className="font-medium leading-snug text-ink">{product.name}</h3>
          <div className="mt-auto space-y-1.5">
            <p className="text-lg font-normal text-ink">{formatPYG(product.price)}</p>
            <CuotasBadge price={product.price} size="sm" />
          </div>
        </div>
      </Link>
    </article>
  );
}
