import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';
import { getFeaturedProducts } from '@/lib/catalog';
import ProductCard from '@/components/ProductCard';
import MaterialComparator from '@/components/MaterialComparator';
import { waLink, WHATSAPP_NUMBER } from '@/lib/whatsapp';
import { WhatsAppIcon, DropIcon, ShieldIcon, TruckIcon } from '@/components/icons';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://muebleria.com.py';

const FEATURED_CATEGORY_SLUGS = ['comedores', 'roperos', 'muebles-de-bano', 'escritorios'];

export default function HomePage() {
  const featured = getFeaturedProducts().slice(0, 6);
  const featuredCategories = CATEGORIES.filter((c) => FEATURED_CATEGORY_SLUGS.includes(c.slug));

  const localBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FurnitureStore',
    name: 'Mueblería Paraguay',
    url: SITE_URL,
    image: `${SITE_URL}/images/og-default.svg`,
    telephone: `+${WHATSAPP_NUMBER.replace(/\D/g, '')}`,
    currenciesAccepted: 'PYG',
    paymentAccepted: 'Tarjetas, Transferencia bancaria, QR',
    priceRange: 'Gs. 280.000 - Gs. 6.500.000',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Asunción',
      addressCountry: 'PY',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />

      {/* Hero */}
      <section className="bg-paper">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:py-24 lg:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-clay-600">
              Hecho para el clima de Paraguay
            </p>
            <h1 className="mt-5 max-w-2xl font-serif text-4xl font-normal leading-[1.1] tracking-tight text-ink sm:text-6xl">
              Muebles de madera que <span className="text-clay-600">aguantan la humedad</span>, no
              muebles descartables
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              Melamina RH, terciado fenólico, pino tratado y madera maciza con hierro. Lo que las
              grandes cadenas no te venden: muebles que siguen firmes después del verano.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/comedores" className="btn-primary">
                Ver comedores
              </Link>
              <a
                href={waLink('¡Hola! Vi la página y quiero asesoramiento para elegir muebles.')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp justify-center px-5 py-3 text-base"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Hablar con un asesor
              </a>
            </div>
            <ul className="mt-12 grid gap-4 text-sm sm:grid-cols-3">
              <li className="flex items-center gap-2 text-muted">
                <DropIcon className="h-5 w-5 text-clay-500" /> Materiales resistentes a la humedad
              </li>
              <li className="flex items-center gap-2 text-muted">
                <TruckIcon className="h-5 w-5 text-clay-500" /> Entrega en Asunción y Gran Asunción
              </li>
              <li className="flex items-center gap-2 text-muted">
                <ShieldIcon className="h-5 w-5 text-clay-500" /> Precios claros: envío y armado a la
                vista
              </li>
            </ul>
          </div>
          {/* Lifestyle image area — light neutral placeholder for now */}
          <div
            aria-hidden="true"
            className="aspect-[4/3] w-full rounded-lg border border-line bg-neutral-100 lg:aspect-[4/5]"
          />
        </div>
      </section>

      {/* Featured categories */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-serif text-3xl font-normal text-ink">Categorías destacadas</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {featuredCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className="group rounded-lg border border-line bg-white p-6 transition hover:border-clay-300"
            >
              <p className="font-medium text-ink group-hover:text-clay-600">{cat.name}</p>
              <p className="mt-1 text-xs text-stone-500">Ver productos →</p>
            </Link>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {CATEGORIES.filter((c) => !FEATURED_CATEGORY_SLUGS.includes(c.slug)).map((cat) => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-muted ring-1 ring-line transition hover:text-clay-600"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="font-serif text-3xl font-normal text-ink">Productos destacados</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      {/* Anti-humidity block */}
      <section className="border-y border-line bg-white py-16">
        <div className="mx-auto max-w-6xl space-y-8 px-4">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl font-normal text-ink">
              El problema no es tu casa: es el MDP común
            </h2>
            <p className="mt-4 leading-relaxed text-muted">
              En Paraguay la humedad relativa promedio supera el 70% casi todo el año. Los muebles
              de aglomerado común que venden las grandes cadenas absorben esa humedad, se hinchan
              por la base y se desarman en la primera mudanza. Nosotros fabricamos con tableros RH,
              terciado fenólico y maderas tratadas: cuestan un poco más hoy, y duran años más.
            </p>
          </div>
          <MaterialComparator />
          <Link href="/nosotros" className="inline-block font-medium text-clay-600 underline-offset-4 hover:underline">
            Conocé nuestro taller y materiales →
          </Link>
        </div>
      </section>
    </>
  );
}
