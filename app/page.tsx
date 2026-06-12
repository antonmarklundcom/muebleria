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
      <section className="bg-gradient-to-br from-wood-900 via-wood-800 to-iron-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-wood-300">
            Hecho para el clima de Paraguay
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-extrabold leading-tight sm:text-5xl">
            Muebles de madera que <span className="text-wood-300">aguantan la humedad</span>, no
            muebles descartables
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-wood-100 sm:text-lg">
            Melamina RH, terciado fenólico, pino tratado y madera maciza con hierro. Lo que las
            grandes cadenas no te venden: muebles que siguen firmes después del verano.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/comedores" className="btn-primary bg-wood-500 hover:bg-wood-600">
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
          <ul className="mt-10 grid gap-4 text-sm sm:grid-cols-3">
            <li className="flex items-center gap-2 text-wood-100">
              <DropIcon className="h-5 w-5 text-wood-300" /> Materiales resistentes a la humedad
            </li>
            <li className="flex items-center gap-2 text-wood-100">
              <TruckIcon className="h-5 w-5 text-wood-300" /> Entrega en Asunción y Gran Asunción
            </li>
            <li className="flex items-center gap-2 text-wood-100">
              <ShieldIcon className="h-5 w-5 text-wood-300" /> Precios claros: envío y armado a la
              vista
            </li>
          </ul>
        </div>
      </section>

      {/* Featured categories */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-wood-900">Categorías destacadas</h2>
        <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {featuredCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className="group rounded-2xl border border-wood-200 bg-white p-5 transition hover:border-wood-400 hover:shadow-md"
            >
              <p className="font-bold text-stone-900 group-hover:text-wood-800">{cat.name}</p>
              <p className="mt-1 text-xs text-stone-500">Ver productos →</p>
            </Link>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORIES.filter((c) => !FEATURED_CATEGORY_SLUGS.includes(c.slug)).map((cat) => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-stone-700 ring-1 ring-stone-300 transition hover:bg-wood-100"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <h2 className="text-2xl font-bold text-wood-900">Productos destacados</h2>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      {/* Anti-humidity block */}
      <section className="bg-wood-100/60 py-12">
        <div className="mx-auto max-w-6xl space-y-6 px-4">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-wood-900">
              El problema no es tu casa: es el MDP común
            </h2>
            <p className="mt-3 leading-relaxed text-stone-700">
              En Paraguay la humedad relativa promedio supera el 70% casi todo el año. Los muebles
              de aglomerado común que venden las grandes cadenas absorben esa humedad, se hinchan
              por la base y se desarman en la primera mudanza. Nosotros fabricamos con tableros RH,
              terciado fenólico y maderas tratadas: cuestan un poco más hoy, y duran años más.
            </p>
          </div>
          <MaterialComparator />
          <Link href="/nosotros" className="inline-block font-semibold text-wood-700 underline-offset-4 hover:underline">
            Conocé nuestro taller y materiales →
          </Link>
        </div>
      </section>
    </>
  );
}
