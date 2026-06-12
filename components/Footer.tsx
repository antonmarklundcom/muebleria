import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';
import { waLink, WHATSAPP_NUMBER } from '@/lib/whatsapp';
import { WhatsAppIcon } from './icons';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-wood-200 bg-iron-900 text-stone-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="text-lg font-bold text-white">Mueblería.com.py</p>
          <p className="mt-2 text-sm leading-relaxed">
            Muebles prácticos de madera, fabricados para aguantar la humedad de Paraguay. Taller
            propio, materiales honestos y precios claros.
          </p>
          <p className="mt-4 text-xs text-stone-400">
            RUC: 80000000-0 · Asunción, Paraguay
            {/* TODO: replace with the real RUC before launch */}
          </p>
        </div>
        <div>
          <p className="font-semibold text-white">Categorías</p>
          <ul className="mt-2 grid grid-cols-2 gap-1 text-sm">
            {CATEGORIES.map((cat) => (
              <li key={cat.slug}>
                <Link href={`/${cat.slug}`} className="transition hover:text-white">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white">Contacto</p>
          <ul className="mt-2 space-y-2 text-sm">
            <li>
              <a
                href={waLink('¡Hola! Quiero hacer una consulta sobre sus muebles.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 transition hover:text-white"
              >
                <WhatsAppIcon className="h-4 w-4 text-whatsapp" />
                +{WHATSAPP_NUMBER.replace(/\D/g, '')}
              </a>
            </li>
            <li>
              <Link href="/nosotros" className="transition hover:text-white">
                Nuestro taller y materiales
              </Link>
            </li>
            <li>
              <Link href="/checkout" className="transition hover:text-white">
                Carrito y checkout
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} Mueblería.com.py — Hecho en Paraguay 🇵🇾
      </div>
    </footer>
  );
}
