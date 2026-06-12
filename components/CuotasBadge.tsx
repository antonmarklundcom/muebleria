import { cuotaMensual, cuotasBadgeConfig, formatPYG } from '@/lib/format';

/**
 * Promotional installments badge, controlled by NEXT_PUBLIC_CUOTAS_BADGE
 * (off | 12). Renders nothing when off. NEVER enable without written
 * confirmation from Pagopar that cuotas sin interés are active — see README.
 */
export default function CuotasBadge({
  price,
  size = 'md',
}: {
  price: number;
  size?: 'sm' | 'md';
}) {
  const cuotas = cuotasBadgeConfig();
  if (!cuotas) return null;

  const monto = cuotaMensual(price, cuotas);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md bg-emerald-100 font-semibold text-emerald-800 ${
        size === 'sm' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-1 text-sm'
      }`}
    >
      Hasta {cuotas} cuotas sin interés de {formatPYG(monto)} con tarjetas
    </span>
  );
}
