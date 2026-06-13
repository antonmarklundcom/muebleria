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
          className={`h-1.5 w-1.5 rounded-full ${i < value ? 'bg-clay-400' : 'bg-neutral-200'}`}
        />
      ))}
    </span>
  );
}

export default function MaterialComparator() {
  return (
    <section aria-labelledby="comparador-titulo" className="rounded-lg border border-line bg-white p-6 sm:p-8">
      <h2 id="comparador-titulo" className="font-serif text-xl font-normal text-ink sm:text-2xl">
        ¿Por qué nuestros muebles aguantan y los de cadena no?
      </h2>
      <p className="mt-2 text-sm text-stone-500">
        Compará los materiales: la diferencia está adentro del mueble.
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-stone-400">
              <th className="py-3 pr-3 font-medium">Material</th>
              <th className="py-3 pr-3 font-medium">Resistencia a humedad</th>
              <th className="py-3 pr-3 font-medium">Peso</th>
              <th className="py-3 pr-3 font-medium">Durabilidad</th>
              <th className="py-3 pr-3 font-medium">Precio</th>
            </tr>
          </thead>
          <tbody>
            {MATERIALS.map((m) => (
              <tr key={m.name} className="border-b border-line last:border-0">
                <td className="py-4 pr-3">
                  <span className={`font-medium ${m.highlight ? 'text-ink' : 'text-stone-400'}`}>
                    {m.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-stone-500">{m.note}</span>
                </td>
                <td className="py-4 pr-3">
                  <Dots value={m.humidity} />
                </td>
                <td className="py-4 pr-3 text-muted">{m.weight}</td>
                <td className="py-4 pr-3">
                  <Dots value={m.durability} />
                </td>
                <td className="py-4 pr-3 text-muted">{m.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
