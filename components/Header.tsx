import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';
import CartLink from './CartLink';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
        <Link href="/" className="flex items-baseline gap-1 text-xl font-semibold tracking-tight text-ink">
          Mueblería
          <span className="text-sm font-normal text-clay-600">.com.py</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/nosotros"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:text-ink sm:block"
          >
            Nosotros
          </Link>
          <CartLink />
        </div>
      </div>
      <nav aria-label="Categorías" className="border-t border-line bg-paper/90">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 [-webkit-overflow-scrolling:touch]">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-muted transition hover:text-clay-600"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
