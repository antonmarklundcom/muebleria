/**
 * Currency formatting for Guaraníes: "Gs. 1.250.000".
 *
 * We use Intl.NumberFormat('es-PY') for the digit grouping but pin the
 * "Gs." prefix ourselves: ICU data for the PYG symbol varies between
 * Node and browsers (₲ vs Gs.), which would cause hydration mismatches.
 */
const pygNumber = new Intl.NumberFormat('es-PY', {
  style: 'currency',
  currency: 'PYG',
  maximumFractionDigits: 0,
});

export function formatPYG(amount: number): string {
  const digits = pygNumber
    .formatToParts(Math.round(amount))
    .filter((p) => p.type === 'integer' || p.type === 'group')
    .map((p) => (p.type === 'group' ? '.' : p.value))
    .join('');
  return `Gs. ${digits}`;
}

/** Monthly installment for the 0%-interest cuotas badge, rounded to the nearest Gs. 1.000. */
export function cuotaMensual(price: number, cuotas = 12): number {
  return Math.round(price / cuotas / 1000) * 1000;
}

/** Number of cuotas to advertise, or null when the badge is disabled. */
export function cuotasBadgeConfig(): number | null {
  const value = process.env.NEXT_PUBLIC_CUOTAS_BADGE;
  if (value === '12') return 12;
  return null;
}
