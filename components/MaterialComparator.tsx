/**
 * Visual comparison table: MDP común vs the materials we actually use.
 * Used on the home page and on every product page — it carries the core
 * "anti-humedad" selling story.
 */

type Rating = 1 | 2 | 3 | 4 | 5;

const MATERIALS: {
  name: string;
  humidity: Rating;
  weight: string;
  durability: Rating;
  price: string;
  note: string;
  highlight: boolean;
}[] = [
  {
    name: 'MDP común (cadenas)',
    humidity: 1,
    weight: 'Pesado',
    durability: 1,
    price: '$',
    note: 'Se hincha con la primera humedad. No sobrevive una mudanza.',
    highlight: false,
  },
  {
    name: 'Melamina RH',
    humidity: 4,
    weight: 'Medio',
    durability: 4,
    price: '$$',
    note: 'Tratamiento anti-humedad y cantos sellados. Nuestra línea de entrada.',
    highlight: true,
  },
  {
    name: 'Terciado Fenólico',
    humidity: 5,
    weight: 'Liviano',
    durability: 5,
    price: '$$$',
    note: 'El tablero de obra: resiste lluvia y vapor. Ideal para baños.',
    highlight: true,
  },
  {
    name: 'Madera Maciza',
    humidity: 4,
    weight: 'Pesado',
    durability: 5,
    price: '$$$$',
    note: 'Dura décadas, se repara y se vuelve a lustrar. Para toda la vida.',
    highlight: true,
  },
];

function Dots({ value, max = 5 }: { value: Rating; max?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} de ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`h-2 w-2 rounded-full ${i < value ? 'bg-emerald-500' : 'bg-stone-300'}`}
        />
      ))}
    </span>
  );
}

export default function MaterialComparator() {
  return (
    <section aria-labelledby="comparador-titulo" className="rounded-2xl border border-wood-200 bg-white p-4 sm:p-6">
      <h2 id="comparador-titulo" className="text-lg font-bold text-wood-900 sm:text-xl">
        ¿Por qué nuestros muebles aguantan y los de cadena no?
      </h2>
      <p className="mt-1 text-sm text-stone-600">
        Compará los materiales: la diferencia está adentro del mueble.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-500">
              <th className="py-2 pr-3">Material</th>
              <th className="py-2 pr-3">Resistencia a humedad</th>
              <th className="py-2 pr-3">Peso</th>
              <th className="py-2 pr-3">Durabilidad</th>
              <th className="py-2 pr-3">Precio</th>
            </tr>
          </thead>
          <tbody>
            {MATERIALS.map((m) => (
              <tr
                key={m.name}
                className={`border-b border-stone-100 ${m.highlight ? '' : 'bg-red-50/60'}`}
              >
                <td className="py-3 pr-3">
                  <span className="font-semibold text-stone-900">{m.name}</span>
                  <span className="mt-0.5 block text-xs text-stone-500">{m.note}</span>
                </td>
                <td className="py-3 pr-3">
                  <Dots value={m.humidity} />
                </td>
                <td className="py-3 pr-3 text-stone-700">{m.weight}</td>
                <td className="py-3 pr-3">
                  <Dots value={m.durability} />
                </td>
                <td className="py-3 pr-3 font-medium text-stone-700">{m.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
