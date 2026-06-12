import type { Metadata } from 'next';
import Link from 'next/link';
import { receiptFallbackMessage, waLink } from '@/lib/whatsapp';
import { WhatsAppIcon, CheckIcon } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Pedido recibido — ¡Gracias!',
  robots: { index: false },
};

type SearchParams = {
  metodo?: string;
  pedido?: string;
  comprobante?: string;
  sandbox?: string;
};

/** Confirmation page; content varies by payment method via query params. */
export default function GraciasPage({ searchParams }: { searchParams: SearchParams }) {
  const metodo = searchParams.metodo ?? 'whatsapp';
  const pedido = searchParams.pedido;
  const comprobantePendiente = searchParams.comprobante === 'pendiente';

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
        <CheckIcon className="h-8 w-8 text-emerald-600" />
      </div>
      <h1 className="mt-5 text-2xl font-extrabold text-wood-900 sm:text-3xl">
        ¡Recibimos tu pedido!
      </h1>
      {pedido && (
        <p className="mt-2 text-stone-600">
          Tu número de pedido es <strong className="text-stone-900">{pedido}</strong>. Guardalo
          para cualquier consulta.
        </p>
      )}

      {metodo === 'pagopar' && (
        <div className="mt-6 space-y-3 rounded-2xl border border-wood-200 bg-white p-5 text-left text-sm leading-relaxed text-stone-700">
          {searchParams.sandbox === '1' ? (
            <p>
              <strong>Modo sandbox:</strong> el pago online está en modo de prueba — no se procesó
              ningún cobro real.
            </p>
          ) : (
            <p>
              Cuando Pagopar confirme tu pago vas a recibir la confirmación por WhatsApp. Si
              cerraste la ventana de pago sin completar, podés escribirnos y te reenviamos el link.
            </p>
          )}
          <p>Coordinamos la entrega por WhatsApp dentro de las próximas horas hábiles.</p>
        </div>
      )}

      {metodo === 'transferencia' && (
        <div className="mt-6 space-y-4 rounded-2xl border border-wood-200 bg-white p-5 text-left text-sm leading-relaxed text-stone-700">
          {comprobantePendiente ? (
            <>
              <p>
                <strong>Falta un paso:</strong> aún no recibimos tu comprobante de transferencia.
                Envianoslo por WhatsApp para confirmar tu pedido — es un minuto.
              </p>
              <a
                href={waLink(receiptFallbackMessage(pedido ?? 'mi pedido'))}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp w-full justify-center px-5 py-3 text-base"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Enviar comprobante por WhatsApp
              </a>
            </>
          ) : (
            <p>
              Recibimos tu comprobante 🙌. Apenas verifiquemos la transferencia te confirmamos por
              WhatsApp y coordinamos la entrega.
            </p>
          )}
        </div>
      )}

      {metodo === 'whatsapp' && (
        <div className="mt-6 rounded-2xl border border-wood-200 bg-white p-5 text-left text-sm leading-relaxed text-stone-700">
          <p>
            Tu pedido nos llegó por WhatsApp. Te respondemos en horario comercial para confirmar
            stock, entrega y forma de pago.
          </p>
        </div>
      )}

      <Link href="/" className="btn-primary mt-8">
        Volver a la tienda
      </Link>
    </div>
  );
}
