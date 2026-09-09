# Side Quests

Generador y catálogo de **quests**: cosas que hacer al menos una vez en la vida (`big`) y cosas que hacer hoy en vez de mirar el móvil (`micro`). Web first como PWA; después app iOS nativa (SwiftUI) con el mismo modelo de datos.

Repo propio: `kikelop/side-quests`. Vive en `~/workspace/personal/side-quests/` pero **no forma parte** de `kikelop/workspace` — commits y pushes van aquí.

## Cómo funciona el producto

- **Today** (`/`): una quest al azar en una card a sangre del color de su escala (ámbar hoy / cacao lifetime). **Gestos tipo Tinder** (`SwipeCard`): izquierda = *Skip* (descarta 14 días), derecha = *I'm in* (acepta → pasa a *Next up* y abre el detalle), arriba = *Someday*. Los tres botones hacen lo mismo con la misma animación. La card está **pinneada al día**: recargar no la cambia; cambia al día siguiente o al hacer Skip. Toggle de escala Any / Today / Lifetime.
- **Detalle** (`/quest/[id]`, prerender estático de las 240): card + acciones según estado — sin tocar: *Someday* / *I'm in* / *Already done it*; en Next up: *Drop it* / *Mark as done*; hecha: fecha + *Undo*. **Done ya no está en Today**: completar pasa por el detalle o por las filas de Explore / My list.
- **Explore** (`/explore`): catálogo con búsqueda, chips de categoría, sheet de filtros (escala, duración, coste, dónde, con quién) y pestañas All / To do / Done. Acepta `?status=done`.
- **My quests** (`/list`): **Next up** (`state.active`, aceptadas) · **Someday** (`state.saved`, bucket list) · **Done** (por fecha desc). Vocabulario: la distinción entre los dos "síes" es *cuándo*, no cuánto gusta; no hay "like" sobre quests (el like pertenece a la futura capa social, sobre completados de otros). Listas personalizadas dentro de Someday: después, si hace falta.
- Todo el estado del usuario es **local** (`localStorage`, clave `side-quests:v1`). Sin cuentas, sin backend, sin IA.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind 4 · Vitest + jsdom. Fuentes: Onest (texto) + Unbounded (display) vía `next/font`. Sin librerías de estado ni animación: Context + `useReducer`, transiciones CSS.

## Estructura

```
src/
├── app/            layout (fonts, provider, TabBar, SW) · page (Today) · explore/ · list/ · globals.css (tokens)
├── components/     TodayView · SwipeCard (drag + fly-out) · QuestDetail · ExploreView · MyListView
│                   QuestCard · QuestRow · FilterBar · FilterSheet · ScaleToggle · QuestMeta · TabBar · Toasts · EmptyState
├── lib/
│   ├── types.ts          contrato de datos (Quest, UserState, enums). Portable 1:1 a Swift Codable
│   ├── quests.ts         QUESTS / QUEST_BY_ID + labels de UI
│   ├── theme.ts          color por escala (card) y por categoría (swatches)
│   ├── draw.ts           sorteo: pool elegible + moneda entre escalas + fallback
│   ├── reducer.ts        acciones sobre UserState (pin diario, skip, save, accept/unaccept, done…)
│   ├── QuestsProvider.tsx  Context: hidrata desde localStorage, persiste tras hidratar
│   ├── persistence.ts    load/save + sanitize (ids muertos, fechas malas, TTL de dismissed)
│   ├── filters.ts        applyFilters puro para Explore
│   ├── dates.ts          ISO local, daysBetween, computeStreak
│   ├── validate.ts       reglas de contenido (usadas por el test del catálogo)
│   └── feedback.ts       toast() + buzz()
└── data/
    ├── quests.micro.json   ~140 quests hacibles hoy (≥70 % gratis)
    ├── quests.big.json     ~100 quests once-in-a-lifetime (≤30 % caras)
    └── quests.test.ts      validación del catálogo
public/               manifest.json · sw.js · icon-192/512 · apple-touch-icon
```

## Reglas del contenido (`src/data/*.json`)

- `id` = `${scale}-${slug}` en kebab-case. **Inmutable**: el estado del usuario lo referencia. Para quitar una quest → `"retired": true`, nunca borrar.
- `title` imperativo, ≤48 caracteres, sin punto final ni emoji. `description` 1–2 frases, 40–180 caracteres, con el porqué o un cómo concreto.
- Prohibido: vocabulario de anuncio de bienestar (`journey`, `manifest`, `unleash`, `vibes`…), marcas, nada peligroso o ilegal, nada que implique pantalla.
- `micro` = hacible hoy en ≤2 h sin planificar (nunca `multi-day`). `big` = requiere planificar, viajar o meses.
- Mínimo 3 quests vivas por celda categoría × escala. `npx vitest run` lo comprueba todo y lista `id: motivo`.

## Decisiones

1. Contenido curado en JSON, sin backend ni IA — el producto es la lista.
2. Tres tabs (Today · Explore · My quests). "Tu listado" es el artefacto central; en iOS un tab es lo natural.
3. Pin diario en vez de PRNG con seed: sobrevive a los skips y a los cambios de escala.
4. Dismissed caduca a 14 días; en Today, si el pool se vacía, se ofrece "Bring them back".
5. El provider **ignora acciones antes de hidratar** para que el estado vacío inicial nunca pise localStorage.
6. Branding elegido por Kike (2026-09-08, `design/branding-lab-2.html`, cruce T11 × C15 A): Unbounded + Onest, paleta cálida — crema `#fff7ec`, tinta cacao `#3a2a1a`, ámbar `#ffb347`. La card de Today va por **escala** (ámbar = hoy, cacao = una vez en la vida), no por categoría; las categorías son swatches cálidos en Explore. Botón primario = tinta (se descartó el naranja `#ff7a1a`). Los labs de branding viven en `design/`.
7. Estado **Next up** (`state.active`, 2026-09-08): el swipe a la derecha necesitaba un "sí" que no fuera "ya lo hice". Aceptar saca la quest del sorteo y la deja en My list hasta completarla. Es el gancho para la siguiente pieza: foto + texto al completar (IndexedDB) y share card; red social solo con backend, después de iOS.

## Trabajar aquí

- `npm run dev` · `npx vitest run` · `npx next build` (siempre antes de commit) · `npx eslint`.
- Móvil por LAN: `npx next dev -H 0.0.0.0` y abrir `http://<ip>:3000`. SW e instalación a home screen exigen HTTPS → probar en la URL de Vercel.
- Código, commits y UI en inglés; docs en español.
- **Deploy** (2026-09-09): Vercel, team **`lazyyuppie`** (la CLI local ya está logueada ahí; el team personal sigue en soft-block). Prod: **https://side-quests.vercel.app** (alias fijo; cada deploy genera además una URL `side-quests-xxxx-lazyyuppie.vercel.app`). Comando: `npx vercel deploy --prod --yes --scope lazyyuppie` desde la raíz. **Deployment Protection**: el team la trae activada por defecto (`ssoProtection: all_except_custom_domains`, redirige a login de Vercel); se desactivó por API (`PATCH /v9/projects/<id>?teamId=… {"ssoProtection": null}`). Si un deploy nuevo vuelve a pedir login, repetir ese PATCH. El push a GitHub NO despliega: no hay Git Integration.
- **iOS** (después): congelar la web como feature-complete antes de empezar; portar `types.ts` → `Quest.swift`, `reducer.ts` → `QuestStore` (`@Observable`, JSON en Application Support), los dos JSON al bundle tal cual.
