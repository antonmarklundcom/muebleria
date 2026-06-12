import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PRODUCTS, getProduct, getProductsByCategory } from '@/lib/catalog';
import { getCategoryName } from '@/lib/categories';
import { formatPYG } from '@/lib/format';
import CuotasBadge from '@/components/CuotasBadge';
import MaterialBadgeTag from '@/components/MaterialBadgeTag';
import MaterialComparator from '@/components/MaterialComparator';
import AddToCartButton from '@/components/AddToCartButton';
import WhatsAppChip from '@/components/WhatsAppChip';
import ProductCard from '@/components/ProductCard';
import { TruckIcon } from '@/components/icons';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://muebleria.com.py';

export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const product = getProduct(params.slug);
  if (!product) return {};
  const title = `${product.name} — ${formatPYG(product.price)}`;
  return {
    title,
    description: product.description.slice(0, 160),
    alternates: { canonical: `/producto/${product.slug}` },
    openGraph: {
      title,
      description: product.description.slice(0, 160),
      url: `/producto/${product.slug}`,
      images: [product.images[0]],
    },
  };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProduct(params.slug);
  if (!product) notFound();

  const productUrl = `${SITE_URL}/producto/${product.slug}`;
  const related = getProductsByCategory(product.category)
    .filter((p) => p.slug !== product.slug)
    .slice(0, 3);

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images.map((img) => `${SITE_URL}${img}`),
    sku: product.slug,
    brand: { '@type': 'Brand', name: 'Mueblería Paraguay' },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'PYG',
      price: product.price,
      availability:
        product.stock === 'disponible'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/MadeToOrder',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <nav aria-label="Ruta" className="text-sm text-stone-500">
        <Link href="/" className="hover:text-wood-700">Inicio</Link> /{' '}
        <Link href={`/${product.category}`} className="hover:text-wood-700">
          {getCategoryName(product.category)}
        </Link>{' '}
        / {product.name}
      </nav>

      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-wood-100">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          {product.images[1] && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-wood-100">
              <Image
                src={product.images[1]}
                alt={`${product.name} — vista alternativa`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          )}
        </div>

        {/* Above-the-fold purchase info */}
        <div>
          <div className="flex items-center gap-2">
            <MaterialBadgeTag badge={product.material.badge} />
            {product.stock === 'a_pedido' && (
              <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                Fabricación a pedido · {product.leadTimeDays ?? 15} días
              </span>
            )}
          </div>
          <h1 className="mt-3 text-2xl font-extrabold leading-tight text-stone-900 sm:text-3xl">
            {product.name}
          </h1>

          <div className="mt-4 space-y-2">
            <p className="text-3xl font-extrabold text-wood-800">{formatPYG(product.price)}</p>
            <CuotasBadge price={product.price} />
          </div>

          {/* Delivery + assembly disclosed upfront */}
          <div className="mt-5 space-y-2 rounded-xl border border-wood-200 bg-white p-4 text-sm">
            <p className="flex items-center gap-2 font-semibold text-stone-800">
              <TruckIcon className="h-5 w-5 text-wood-600" /> Envío y armado, sin sorpresas
            </p>
            <ul className="space-y-1 text-stone-700">
              <li>
                Envío Asunción: <strong>{formatPYG(product.delivery.asuncion)}</strong>
              </li>
              <li>
                Envío Gran Asunción: <strong>{formatPYG(product.delivery.granAsuncion)}</strong>
              </li>
              <li>
                {product.assembly.required ? (
                  <>
                    Armado opcional en Asunción:{' '}
                    <strong>{formatPYG(product.assembly.feeAsuncion)}</strong>
                  </>
                ) : (
                  <strong>Llega armado de fábrica — sin costo de armado.</strong>
                )}
              </li>
              <li className="text-xs text-stone-500">{product.delivery.interiorNote}</li>
            </ul>
          </div>

          <div className="mt-5 space-y-3">
            <AddToCartButton slug={product.slug} />
            <WhatsAppChip productName={product.name} productUrl={productUrl} />
          </div>

          {/* Details */}
          <div className="mt-7 space-y-4 text-sm leading-relaxed text-stone-700">
            <p>{product.description}</p>
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-wood-100/60 p-4">
              <div>
                <p className="text-xs font-semibold uppercase text-stone-500">Estructura</p>
                <p>{product.material.structure}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-stone-500">Superficies</p>
                <p>{product.material.surfaces}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-stone-500">Medidas</p>
                <p>
                  {product.dimensions.width} × {product.dimensions.height} ×{' '}
                  {product.dimensions.depth} cm (ancho × alto × prof.)
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-stone-500">Peso</p>
                <p>{product.weightKg} kg</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <MaterialComparator />
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-wood-900">
            Más en {getCategoryName(product.category)}
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
