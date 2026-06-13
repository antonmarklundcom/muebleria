import type { Metadata } from 'next';
import Link from 'next/link';
import MaterialComparator from '@/components/MaterialComparator';
import { waLink } from '@/lib/whatsapp';
import { WhatsAppIcon } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Nosotros — Taller local y materiales honestos',
  description:
    'Somos un taller paraguayo que fabrica muebles con melamina RH, terciado fenólico, pino tratado y madera maciza. Conocé por qué nuestros muebles aguantan la humedad.',
  alternates: { canonical: '/nosotros' },
};

export default function NosotrosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-serif text-4xl font-normal leading-tight text-ink">
        Un taller paraguayo contra el mueble descartable
      </h1>

      <div className="mt-8 space-y-5 leading-relaxed text-muted">
        <p>
          Mueblería.com.py nace de una frustración que conoce cualquier familia paraguaya: comprás
          un ropero o un comedor en una gran cadena, lo pagás en cuotas durante un año, y antes de
          terminar de pagarlo ya tiene las puertas caídas y la base hinchada por la humedad.
        </p>
        <p>
          El problema no es el uso que le das, ni tu casa. Es el material: el MDP común — aglomerado
          de partículas sin tratamiento — absorbe la humedad del aire como una esponja. Y en
          Paraguay, con humedad relativa por encima del 70% la mayor parte del año, ese mueble está
          condenado desde la fábrica.
        </p>
        <p>
          Nosotros elegimos el camino contrario: <strong>fabricar localmente con materiales que
          aguantan el clima real de Paraguay</strong>. Melamina RH (resistente a la humedad) con
          cantos sellados para la línea práctica. Terciado fenólico — el mismo tablero que se usa en
          obra, a la intemperie — para baños y estructuras exigidas. Pino macizo tratado para las
          camitas de los chicos. Y madera maciza con hierro pintado al horno para las piezas que van
          a pasar de generación en generación.
        </p>
        <p>
          Como fabricamos en taller propio, también te hablamos claro: cada producto publica el
          costo de envío a Asunción y Gran Asunción y el costo de armado antes de que pongas un
          guaraní. Sin letra chica, sin &laquo;consultar precio&raquo;, sin sorpresas en la puerta
          de tu casa.
        </p>
        <p>
          Si un mueble nuestro tiene un problema de fabricación, lo arreglamos. Eso también es la
          ventaja de comprarle a un taller local: sabés dónde estamos y respondemos por WhatsApp,
          no con un ticket de mesa de ayuda.
        </p>
      </div>

      <div className="mt-10">
        <MaterialComparator />
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link href="/comedores" className="btn-primary">
          Ver nuestros muebles
        </Link>
        <a
          href={waLink('¡Hola! Leí sobre el taller y quiero hacer una consulta.')}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp justify-center px-5 py-3 text-base"
        >
          <WhatsAppIcon className="h-5 w-5" />
          Escribinos por WhatsApp
        </a>
      </div>
    </div>
  );
}
