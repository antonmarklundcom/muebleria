import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/lib/cart';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-sans' });
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-serif',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://muebleria.com.py';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Mueblería Paraguay — Muebles que aguantan la humedad | muebleria.com.py',
    template: '%s | Mueblería Paraguay',
  },
  description:
    'Muebles modernos de madera para Paraguay: comedores, roperos, escritorios y más. Materiales resistentes a la humedad, precios claros y entrega en Asunción y Gran Asunción.',
  openGraph: {
    type: 'website',
    locale: 'es_PY',
    siteName: 'Mueblería Paraguay',
    images: ['/images/og-default.svg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-PY" className={`${inter.variable} ${cormorant.variable}`}>
      <body>
        <CartProvider>
          <Header />
          <main className="min-h-[60vh]">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
