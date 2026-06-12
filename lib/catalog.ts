import type { Product } from './types';
import comedores from '@/data/products/comedores.json';
import roperos from '@/data/products/roperos.json';
import escritorios from '@/data/products/escritorios.json';
import sofaCamas from '@/data/products/sofa-camas.json';
import zapateros from '@/data/products/zapateros.json';
import mueblesDeBano from '@/data/products/muebles-de-bano.json';
import camasMontessori from '@/data/products/camas-montessori.json';
import racksTv from '@/data/products/racks-tv.json';

// Static imports keep the catalog isomorphic (server pages, API routes and
// the client cart all read the same data) and let Next.js statically
// generate every catalog page.
export const PRODUCTS: Product[] = [
  ...comedores,
  ...roperos,
  ...escritorios,
  ...sofaCamas,
  ...zapateros,
  ...mueblesDeBano,
  ...camasMontessori,
  ...racksTv,
] as Product[];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  const tierOrder = { entrada: 0, media: 1, premium: 2 };
  return PRODUCTS.filter((p) => p.category === categorySlug).sort(
    (a, b) => tierOrder[a.tier] - tierOrder[b.tier],
  );
}

export function getFeaturedProducts(): Product[] {
  return PRODUCTS.filter((p) => p.featured);
}
