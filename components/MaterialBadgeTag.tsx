import type { MaterialBadge } from '@/lib/types';

const EXPLANATIONS: Record<MaterialBadge, string> = {
  MDP: 'Aglomerado de partículas común: el material de los muebles de cadena. Se hincha con la humedad.',
  'Melamina RH':
    'Tablero con tratamiento Resistente a la Humedad y cantos sellados. No se hincha como el MDP común de las grandes cadenas.',
  'MDF RH':
    'Fibra de densidad media con tratamiento anti-humedad: superficie lisa ideal para lacar, mucho más estable que el MDP común.',
  'Terciado Fenólico':
    'Tablero de láminas de madera con cola fenólica, el mismo que se usa en obra a la intemperie. Resistencia a la humedad de nivel profesional.',
  'Pino Tratado':
    'Madera maciza de pino con tratamiento contra humedad e insectos. Sólida, reparable y de larga vida — nada que ver con aglomerados.',
  'Madera Maciza + Hierro':
    'Madera maciza estacionada con estructura de hierro pintado al horno. La máxima durabilidad: un mueble para décadas.',
};

/** Material badge with a tooltip explaining the material vs. cheap MDP. */
export default function MaterialBadgeTag({
  badge,
  size = 'md',
}: {
  badge: MaterialBadge;
  size?: 'sm' | 'md';
}) {
  return (
    <span className="group relative inline-block">
      <span
        tabIndex={0}
        className={`inline-flex cursor-help items-center rounded-full border border-line font-medium text-muted ${
          size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
        }`}
      >
        {badge}
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-0 z-20 mb-2 w-64 rounded-lg bg-ink p-3 text-xs leading-relaxed text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {EXPLANATIONS[badge]}
      </span>
    </span>
  );
}
