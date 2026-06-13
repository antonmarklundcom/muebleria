import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CATEGORIES, getCategory } from '@/lib/categories';
import { getProductsByCategory } from '@/lib/catalog';
import CategoryProductList from '@/components/CategoryProductList';

export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIES.map((cat) => ({ categoria: cat.slug }));
}

export function generateMetadata({ params }: { params: { categoria: string } }): Metadata {
  const category = getCategory(params.categoria);
  if (!category) return {};
  return {
    title: category.metaTitle,
    description: category.metaDescription,
    alternates: { canonical: `/${category.slug}` },
    openGraph: {
      title: category.metaTitle,
      description: category.metaDescription,
      url: `/${category.slug}`,
    },
  };
}

export default function CategoryPage({ params }: { params: { categoria: string } }) {
  const category = getCategory(params.categoria);
  if (!category) notFound();

  const products = getProductsByCategory(category.slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav aria-label="Ruta" className="text-sm text-stone-500">
        <a href="/" className="hover:text-clay-600">Inicio</a> / {category.name}
      </nav>
      <h1 className="mt-3 font-serif text-4xl font-normal text-ink">{category.name}</h1>
      <p className="mt-4 max-w-3xl leading-relaxed text-muted">{category.intro}</p>

      <div className="mt-10">
        <CategoryProductList products={products} filterTags={category.filterTags} />
      </div>
    </div>
  );
}
