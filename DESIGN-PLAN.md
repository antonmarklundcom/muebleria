# muebleria.com.py — Plan de negocio, SEO y diseño (v2, para Claude Design / Fable 5)

Este documento es la **fuente de verdad para el rediseño visual**. El README sigue siendo la
fuente de verdad técnica (stack, env vars, Pagopar, GHL, deploy). Nada de lo que está acá
cambia la arquitectura: cambia cómo se ve y cómo convierte.

---

## 1. El negocio en una frase

Mueblería paraguaya que vende **muebles que no se hinchan con la humedad** — melamina RH,
terciado fenólico, pino tratado y madera maciza con hierro — con **precio final honesto**
(envío y armado a la vista antes de comprar) y cierre por **WhatsApp o checkout online**.

### El ángulo comercial (el único que importa)

El competidor no es "otra mueblería linda". Es la **cadena grande que vende MDP común**:
el ropero que se hincha por la base al año, el vanitory que se descuelga, el escritorio que
se dobla con el monitor. Toda la marca cuelga de una sola promesa verificable:

> **Material correcto para el clima paraguayo, y te lo mostramos.**

Tres pilares de confianza, en este orden:
1. **Material** — badge tipado por producto (`material.badge`), explicado, no decorativo.
2. **Precio total honesto** — envío Asunción / Gran Asunción + armado publicados en la ficha.
3. **Cercanía** — WhatsApp con asesor real, mandás foto del baño y te dicen qué modelo entra.

### Compradores

| Segmento | Entrada típica | Camino |
|---|---|---|
| Primera casa / departamento | zapatero, rack TV, escritorio | ticket bajo → prueba la calidad → vuelve |
| Familia amueblando | comedor, ropero 4–6 puertas | compara materiales, decide en WhatsApp |
| Reemplazo por mala experiencia | muebles de baño, ropero | llega convencido, busca prueba de material |
| Padres / infantil | camas Montessori | busca seguridad y acabados aptos para niños |

### Reglas de negocio que el diseño no puede romper

- **Un solo precio por producto.** El colchón de financiación ya está adentro. Nunca mostrar
  recargos, multiplicadores ni "precio con tarjeta".
- **Badge de cuotas apagado** (`NEXT_PUBLIC_CUOTAS_BADGE=off`) hasta confirmación escrita de
  Pagopar. No inventar "12 cuotas sin interés" en ningún hero, banner o card.
- **Nunca bloquear una venta.** Si falla R2, Sheets o GHL, el pedido se confirma igual y el
  comprobante va por WhatsApp.
- **Verde WhatsApp (`#25D366`) solo dentro del botón de WhatsApp.** Nunca como color de sección,
  botón secundario ni acento de marca.

---

## 2. Estructura de páginas y SEO (estado actual)

Catálogo estático en JSON, todo SSG. **8 categorías × 3 productos = 24 fichas.**

```
/                              Home — hero, categorías, destacados, bloque anti-humedad
/nosotros                      Historia de marca + materiales (página de confianza)
/[categoria]                   8 landings SEO                       prioridad 0.9
  /comedores                   kw: comedores
  /roperos                     kw: ropero            filtros: 2/4/6 puertas, con espejo
  /escritorios                 kw: escritorio        filtros: home office, industrial, gamer
  /sofa-camas                  kw: sofa cama
  /zapateros                   kw: zapatero
  /muebles-de-bano             kw: muebles para baño
  /camas-montessori            kw: cama montessori
  /racks-tv                    kw: rack tv
/producto/[slug]               24 fichas (JSON-LD Product)          prioridad 0.8
/checkout  →  /checkout/gracias
```

Lo que ya está resuelto y **no hay que rehacer**:
- `metaTitle` / `metaDescription` por categoría en `lib/categories.ts`.
- Intro largo (~250–300 palabras) por categoría, escrito en castellano paraguayo real
  (tereré, championes, Gran Asunción) — es el activo SEO principal del sitio.
- JSON-LD `LocalBusiness` en la home y `Product` en cada ficha.
- `sitemap.ts` y `robots.ts` automáticos desde el catálogo.

### Huecos SEO a cerrar (v2)

1. **Intención transaccional sin página propia**: `ropero 6 puertas`, `vanitory suspendido`,
   `escritorio gamer` viven hoy solo como filtro de tag. Candidatos a subpágina indexable
   `/roperos/6-puertas` cuando haya ≥3 productos por tag.
2. **Sin páginas de zona.** `mueblería en Lambaré / San Lorenzo / Luque / Fernando de la Mora`
   no tiene landing. Es el crecimiento local más barato — 1 página por zona con costo de envío
   real de esa zona.
3. **Sin contenido comparativo.** `melamina RH vs MDP`, `terciado fenólico para baño`,
   `cuánto dura un ropero` — tráfico informativo que alimenta directo a categoría.
4. **FAQ sin schema.** Hay preguntas repetidas (medidas, armado, tiempos de fabricación) pero
   ningún bloque `FAQPage`.
5. **Breadcrumbs sin `BreadcrumbList`.**
6. **Imágenes**: hoy 48 SVG placeholder. Sin foto real no hay Google Imágenes ni conversión.

---

## 3. Estado visual actual (el punto de partida del rediseño)

Pase "Scandinavian minimalist" ya aplicado:

| Token | Valor | Uso |
|---|---|---|
| `paper` | `#FAFAF8` | fondo de página |
| `ink` | `#1A1A1A` | títulos |
| `muted` | `#555555` | cuerpo |
| `line` | `#ECECEC` | hairlines |
| `charcoal` | `#1F1F1F` | footer |
| `clay-*` | `#F7F1EB → #6C4F3B` | acento único (arcilla) |

Tipografía: `--font-serif` para títulos, `--font-sans` para cuerpo. Home = hero split
2 columnas + grid de categorías + grid de destacados + banda anti-humedad.

**Diagnóstico honesto:** es correcto y es genérico. Hero simétrico, todas las secciones
`max-w-6xl` centradas, cero jerarquía de profundidad, el bloque de imagen del hero es un
rectángulo gris. Un comprador no distingue esta página de cualquier plantilla de e-commerce.

---

## 4. Brief de rediseño para Claude Design / Fable 5

### Encargo

Rediseñar **3 artboards** en el canvas, en este orden de prioridad:

1. **Home** (desktop 1440 + mobile 390) — es la que vende la promesa de material.
2. **Ficha de producto** — es donde se decide la compra; hoy es la página más floja.
3. **Landing de categoría** — es la que recibe el tráfico de Google.

### Dirección de arte

- **Track**: WARM CRAFT con disciplina editorial. Madera y taller, no showroom sueco.
- **Acento**: mantener la familia arcilla (`clay`) — ya es propia y no colisiona con el rojo/
  amarillo típico de las cadenas paraguayas. Un solo acento, reservado a CTA + un highlight
  por pantalla.
- **Contraste de materia**: la humedad es el enemigo del producto → el sitio debe verse
  **seco, sólido, mate**. Nada de glassmorphism, degradados brillantes ni sombras azules.
- **Asimetría obligatoria en el hero.** El split 50/50 actual es lo que lo hace anónimo:
  ir a 7/5 con la imagen sangrando fuera del contenedor.
- **Ritmo vertical variable.** Hoy todas las secciones respiran igual. Alternar
  ancho-contenido / full-bleed / ancho-contenido.
- Prohibido: verde WhatsApp fuera del botón; una tercera banda de color fuerte; badges de
  cuotas; sellos de descuento falsos.

### Momentos de diseño que faltan (los que realmente convierten)

1. **El badge de material como pieza de diseño.** Hoy es texto. Debe ser el elemento visual
   más reconocible del sitio: chip fijo en la card, ampliado en la ficha con la explicación
   de por qué ese tablero aguanta. Se repite 24 veces — merece diseño real.
2. **Comparador honesto** (`MaterialComparator` ya existe): nuestro tablero vs MDP común.
   Merece un momento full-bleed, no una tarjeta más.
3. **Bloque de precio total en la ficha**: producto + envío a tu zona + armado = total, en
   una sola pieza. Es el diferenciador y hoy es texto suelto.
4. **Prueba social**: fotos de entregas reales / reseñas. Hoy no existe en la página.
5. **Slots de imagen declarados**: hero lifestyle, 1 lifestyle por categoría, 2 por producto
   (3/4 + detalle de canto o herraje). Definirlos en el diseño y llenarlos con Higgsfield.

### Restricciones técnicas que el diseño debe respetar

- Next.js 14 App Router + Tailwind. El resultado se traduce a componentes existentes:
  `ProductCard`, `MaterialBadgeTag`, `CuotasBadge`, `WhatsAppChip`, `AddToCartButton`,
  `MaterialComparator`, `Header`, `Footer`.
- Todo el catálogo es SSG — nada de secciones que exijan datos en runtime.
- Mobile-first de verdad: el tráfico paraguayo es mayoritariamente móvil, y el botón de
  WhatsApp tiene que estar al alcance del pulgar en toda la página.
- Precios en guaraníes sin decimales, formato `Gs. 1.850.000`.

---

## 5. Orden de ejecución sugerido

1. Rediseño de los 3 artboards en Claude Design.
2. Traducción a los componentes Tailwind existentes (sin cambiar lógica de pedidos ni precios).
3. Fotos reales o imágenes generadas en los slots declarados (mismo nombre de archivo que los
   SVG placeholder → reemplazo directo).
4. Huecos SEO: FAQ + `FAQPage`, `BreadcrumbList`, 3–4 páginas de zona, 2 artículos comparativos.
5. Checklist de pre-lanzamiento del README (RUC, WhatsApp real, tokens Pagopar, cuotas off).
