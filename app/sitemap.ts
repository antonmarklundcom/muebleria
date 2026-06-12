import type { MetadataRoute } from 'next';
import { CATEGORIES } from '@/lib/categories';
import { PRODUCTS } from '@/lib/catalog';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://muebleria.com.py';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/nosotros`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    ...CATEGORIES.map((cat) => ({
      url: `${SITE_URL}/${cat.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
    ...PRODUCTS.map((product) => ({
      url: `${SITE_URL}/producto/${product.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
