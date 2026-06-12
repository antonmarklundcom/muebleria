# muebleria.com.py

Tienda online de muebles para el mercado paraguayo. **Next.js 14 (App Router) + TypeScript + Tailwind CSS**, sin base de datos: el catálogo vive en JSON versionado y los pedidos se replican a GoHighLevel y Google Sheets.

> ⚠️ **REGLA DEL BADGE DE CUOTAS — LEER ANTES DE TOCAR `NEXT_PUBLIC_CUOTAS_BADGE`**
>
> **NO actives el badge de cuotas (`NEXT_PUBLIC_CUOTAS_BADGE=12`) hasta que Pagopar confirme POR ESCRITO que las cuotas sin interés están activas para esta cuenta de comercio.** Prometer cuotas que no existen al momento de pagar destruye la confianza del cliente y puede violar normas de protección al consumidor. El valor por defecto es `off` y así debe quedar hasta tener esa confirmación escrita.

---

## Stack y arquitectura

- **Next.js 14 App Router** — SSG para todo el catálogo, API routes para pedidos/pagos/webhooks. Requiere servidor Node vivo (NO usa `output: 'export'`).
- **Catálogo**: `data/products/*.json` (un archivo por categoría) + `lib/categories.ts` (copy SEO por categoría).
- **Carrito**: React context + `localStorage` (`lib/cart.tsx`).
- **Pedidos**: todos los caminos convergen en `lib/orders.ts` → `processOrder()` hace fan-out paralelo (`Promise.allSettled`) a GoHighLevel y Google Sheets. Un logger caído jamás tumba la respuesta al cliente.
- **Precios**: hay UN solo precio por producto (el colchón de financiación ya está incluido). Nunca se calculan recargos ni multiplicadores. El servidor recalcula todos los importes desde el catálogo — los precios enviados por el cliente se ignoran.

```
app/
├── page.tsx                      # Home: hero, categorías, destacados, bloque anti-humedad
├── (catalogo)/[categoria]/       # 8 landings SEO (SSG)
├── (catalogo)/producto/[slug]/   # 24 fichas de producto (SSG, JSON-LD Product)
├── checkout/                     # One-page checkout + /gracias
├── nosotros/                     # Historia de marca y materiales
└── api/
    ├── orders/                   # POST pedidos (transferencia + WhatsApp/sendBeacon)
    ├── checkout/pagopar/         # POST inicia pago online, devuelve redirect
    ├── webhooks/pagopar/         # Confirmación server-to-server de Pagopar
    └── uploads/receipt/          # URL prefirmada (R2) para comprobantes
```

## Setup local

```bash
npm install
cp .env.example .env.local   # completar variables
npm run dev                  # http://localhost:3000
```

Verificación de producción:

```bash
npm run build && npm start
```

## Variables de entorno

Todas documentadas en [`.env.example`](.env.example). Resumen:

| Variable | Lado | Descripción |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | cliente | URL canónica (`https://muebleria.com.py`) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | cliente | Número WhatsApp sin `+` (ej: `595991...`) |
| `NEXT_PUBLIC_CUOTAS_BADGE` | cliente | `off` \| `12` — ver advertencia arriba |
| `NEXT_PUBLIC_BANK_*` | cliente | Datos bancarios mostrados en la Opción B |
| `PAGOPAR_PUBLIC_TOKEN` / `PAGOPAR_PRIVATE_TOKEN` | servidor | Tokens del comercio en Pagopar |
| `PAGOPAR_SANDBOX` | servidor | `true` = modo prueba |
| `GHL_WEBHOOK_URL` | servidor | Inbound webhook de GoHighLevel |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` / `GOOGLE_PRIVATE_KEY` / `GOOGLE_SHEET_ID` | servidor | Backup de pedidos en Sheets |
| `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET` / `R2_PUBLIC_BASE_URL` | servidor | Cloudflare R2 para comprobantes |

**Nunca** pongas un secreto en una variable `NEXT_PUBLIC_*`: esas se incrustan en el bundle del navegador.

## Cómo agregar productos

1. Editá (o creá) el JSON de la categoría en `data/products/<categoria>.json` siguiendo el tipo `Product` de `lib/types.ts`. Campos clave:
   - `slug` único (va en la URL), `price` en guaraníes **sin** decimales,
   - `material.badge` debe ser uno de los badges tipados,
   - `delivery.asuncion` / `granAsuncion` y `assembly.feeAsuncion` se muestran al cliente antes de comprar,
   - `tags` opcionales alimentan los filtros de la categoría (ver `filterTags` en `lib/categories.ts`).
2. Si es una categoría nueva: agregala a `lib/categories.ts` (con su copy SEO) e importá su JSON en `lib/catalog.ts`.
3. Generá las imágenes placeholder: `npm run placeholders` (crea 2 SVG por producto en `public/images/products/`). Reemplazalas por fotos reales con los mismos nombres cuando las tengas.
4. `npm run build` para verificar y commit.

## Pagopar — pruebas en sandbox

1. Dejá `PAGOPAR_SANDBOX=true` y pedile a Pagopar credenciales de comercio de prueba.
2. **Sin tokens**: el flujo completo de checkout se puede probar igual — `/api/checkout/pagopar` simula el redirect hacia `/checkout/gracias?...&sandbox=1` sin cobrar nada.
3. **Con tokens sandbox**: el server llama a la API real (`iniciar-transaccion`) y loguea request/response completos en consola para depurar.
4. Configurá la URL del webhook en el panel de Pagopar: `https://muebleria.com.py/api/webhooks/pagopar`. El handler valida el token (`sha1(privateToken + hash_pedido)`), es idempotente y responde con eco del payload.
5. ⚠️ Quedan `TODO(pagopar)` marcados en `lib/pagopar.ts` y en el webhook: **verificar nombres de campos, ids de ciudad/categoría y el formato exacto del eco contra la documentación viva de Pagopar antes de salir a producción.** Todo lo específico de Pagopar está aislado en `lib/pagopar.ts`.

## GoHighLevel — setup del webhook

1. En GHL: **Automation → Workflows → Create Workflow → Inbound Webhook** como trigger.
2. Copiá la URL del webhook a `GHL_WEBHOOK_URL`.
3. Mandá un pedido de prueba para que GHL capture el shape del payload (campos planos: `name`, `phone`, `email`, `city`, `total`, `paymentMethod`, `pipelineStage`, `itemsSummary`, `receiptUrl`...).
4. Mapeá el contacto y creá la Opportunity usando `pipelineStage` para ubicarla: `pagado_online`, `esperando_comprobante`, `comprobante_pendiente`, `chat_order`, `pendiente_pago`.

## Google Sheets — setup del service account

1. En Google Cloud Console: creá un proyecto, habilitá **Google Sheets API**, creá un **Service Account** y generá una clave JSON.
2. Del JSON: `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`; `private_key` → `GOOGLE_PRIVATE_KEY` (conservar los `\n` escapados si va en una sola línea).
3. Creá la planilla, copiá el id de la URL a `GOOGLE_SHEET_ID` y **compartila con el email del service account como Editor**.
4. Encabezados sugeridos (columnas A–J): `timestamp | orderId | nombre | telefono | ciudad | items | total | metodo | estado | receiptUrl`.

## Comprobantes (Cloudflare R2)

Opcional pero recomendado. Creá un bucket R2, un API token con permiso de escritura al bucket, y completá las variables `R2_*`. Si faltan, el sitio **no se rompe**: el cliente confirma el pedido igual y envía el comprobante por WhatsApp (regla "nunca bloquear una venta").

## Deploy en Hostinger (Node.js Web Apps — plan Cloud Startup)

El target de producción es el hosting administrado de Node.js de Hostinger, que corre Next.js completo (SSR + API routes + webhooks) importando este repo desde hPanel. No hay workflows de rsync/SSH ni PM2/Nginx: **el deploy es el import de Git de Hostinger**.

1. En **hPanel → Websites → Add Website → Node.js Apps**.
2. Elegí **Import Git Repository** y autorizá tu cuenta de GitHub.
3. Seleccioná el repo **`antonmarklundcom/muebleria`** y la rama principal.
4. Revisá la detección automática del framework: Hostinger detecta Next.js por los scripts estándar `build` (`next build`) y `start` (`next start`) del `package.json`. No cambies esos scripts.
5. **Antes del primer deploy**, agregá TODAS las variables de entorno de [`.env.example`](.env.example) en la configuración de la app en Hostinger (sección *Environment variables*). Recordá: las `NEXT_PUBLIC_*` se hornean en el build — si cambiás una, hay que redeployar.
6. Tocá **Deploy** y esperá el build.
7. Adjuntá el dominio **muebleria.com.py** a la app (hPanel → dominio → apuntar al sitio) y activá SSL.
8. **Redeploys**: cada push a la rama conectada puede redeployarse desde hPanel (botón *Redeploy*); si activás el auto-deploy del panel, cada `git push` a esa rama dispara el rebuild automáticamente. El workflow de GitHub Actions (`.github/workflows/ci.yml`) es solo un check de CI (`npm ci && npm run build`) — no deploya nada.

## Checklist pre-lanzamiento

- [ ] RUC real en el footer (`components/Footer.tsx`) y datos bancarios reales en env.
- [ ] Número de WhatsApp real en `NEXT_PUBLIC_WHATSAPP_NUMBER`.
- [ ] Tokens de producción de Pagopar + `PAGOPAR_SANDBOX=false` + TODOs de `lib/pagopar.ts` verificados contra docs vivas.
- [ ] Webhook configurado en el panel de Pagopar.
- [ ] GHL y Google Sheets recibiendo pedidos de prueba.
- [ ] Fotos reales reemplazando los SVG placeholder.
- [ ] `NEXT_PUBLIC_CUOTAS_BADGE=off` salvo confirmación escrita de Pagopar (ver advertencia al inicio).
