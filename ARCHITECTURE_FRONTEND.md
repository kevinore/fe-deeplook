# fe-deeplook — Documentación Técnica Completa

> **DeepLook** — "Tus Chats Bajo La Lupa"
> SaaS de analítica para WhatsApp Business dirigido a micro y pequeñas empresas hispanohablantes en Latinoamérica (foco: Colombia).

---

## Tabla de Contenidos

1. [Visión General del Proyecto](#1-visión-general-del-proyecto)
2. [Archivos de Configuración Raíz](#2-archivos-de-configuración-raíz)
3. [Puntos de Entrada](#3-puntos-de-entrada)
4. [Arquitectura de Rutas](#4-arquitectura-de-rutas)
5. [Integración con Backend (API)](#5-integración-con-backend-api)
6. [Flujo de Autenticación (Clerk)](#6-flujo-de-autenticación-clerk)
7. [Gestión de Estado](#7-gestión-de-estado)
8. [Catálogo de Componentes](#8-catálogo-de-componentes)
9. [Sistema de Estilos](#9-sistema-de-estilos)
10. [Hooks Personalizados](#10-hooks-personalizados)
11. [Modelos de Datos](#11-modelos-de-datos)
12. [Variables de Entorno](#12-variables-de-entorno)
13. [Assets Públicos](#13-assets-públicos)
14. [Decisiones Arquitectónicas Clave](#14-decisiones-arquitectónicas-clave)
15. [Estado de Implementación vs. Demo](#15-estado-de-implementación-vs-demo)

---

## 1. Visión General del Proyecto

| Campo | Valor |
|---|---|
| **Nombre** | `fe-deeplook` |
| **Tipo de app** | SPA (Single Page Application) |
| **Framework** | React 19 + Vite 8 |
| **Lenguaje** | JavaScript puro (`.jsx`), sin TypeScript |
| **Auth** | Clerk (`@clerk/react`) |
| **Routing** | React Router DOM v7 (uso no estándar — sin `<Route>`) |
| **Estado** | `useState` / `useEffect` local, sin librería global |
| **Estilos** | Inline styles + clases utilitarias en `index.css` |
| **Gráficos** | SVG custom (sin librería de charts) |
| **API calls** | `fetch` nativo, centralizado en `src/lib/api.js` |
| **Backend URL** | `http://localhost:8000` (dev) vía `VITE_API_URL` |
| **Idioma UI** | Español (Clerk localizado con `esES`) |

---

## 2. Archivos de Configuración Raíz

### `package.json`

```json
{
  "name": "fe-deeplook",
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev":     "vite",
    "build":   "vite build",
    "lint":    "eslint .",
    "preview": "vite preview"
  }
}
```

**Dependencias de producción:**

| Paquete | Versión | Rol |
|---|---|---|
| `react` | `^19.2.5` | Framework UI |
| `react-dom` | `^19.2.5` | Renderizado en DOM |
| `react-router-dom` | `^7.14.2` | Routing y hooks de navegación |
| `@clerk/react` | `^6.4.2` | Autenticación completa |
| `@clerk/localizations` | `^4.5.2` | UI de Clerk en español (`esES`) |

**Dependencias de desarrollo:**

| Paquete | Rol |
|---|---|
| `vite ^8.0.9` | Bundler y dev server |
| `@vitejs/plugin-react ^6.0.1` | Soporte JSX + HMR |
| `eslint ^9.39.4` | Linting |
| `eslint-plugin-react-hooks` | Reglas de hooks |
| `eslint-plugin-react-refresh` | Seguridad HMR |
| `@types/react ^19.2.14` | Tipado para IDE (sin compilador TS) |

---

### `vite.config.js`

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { historyApiFallback: true },
})
```

- `historyApiFallback: true` — el dev server retorna `index.html` para cualquier ruta, permitiendo el routing client-side sin 404s.

---

### `.env.local`

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_aW5maW5pdGUtY293YmlyZC05OS5jbGVyay5hY2NvdW50cy5kZXYk
VITE_API_URL=http://localhost:8000
```

- `VITE_CLERK_PUBLISHABLE_KEY` — clave pública del entorno de desarrollo de Clerk (instancia: `infinite-cowbird-99.clerk.accounts.dev`).
- `VITE_API_URL` — URL base del backend. Fallback hardcodeado a `http://localhost:8000` en `api.js`.

---

### `eslint.config.js`

Formato flat (ESLint v9). Reglas aplicadas a `**/*.{js,jsx}`:

- `js.configs.recommended`
- `reactHooks.configs.flat.recommended` — reglas de hooks
- `reactRefresh.configs.vite` — seguridad HMR
- `'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }]` — variables sin usar son error, excepto las que empiezan con mayúscula/underscore (permite nombres de componentes y constantes).

---

### `index.html`

- `lang="es"` — idioma español
- `<title>`: "DeepLook — Tus Chats bajo la Lupa"
- Carga dos Google Fonts:
  - **DM Sans** (pesos 300, 400, 500, 600, 700 + itálica 400) — fuente del cuerpo
  - **JetBrains Mono** (pesos 400, 500, 600, 700) — displays numéricos/mono
- Entry point: `<script type="module" src="/src/main.jsx">`

---

## 3. Puntos de Entrada

### `src/main.jsx`

```jsx
<StrictMode>
  <BrowserRouter>
    <ClerkProvider
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
      localization={esES}
      afterSignOutUrl="/"
    >
      <App />
    </ClerkProvider>
  </BrowserRouter>
</StrictMode>
```

Orden del árbol de providers:
1. `StrictMode` — detecta efectos secundarios no intencionados
2. `BrowserRouter` — habilita routing basado en `window.history`
3. `ClerkProvider` — contexto de autenticación para toda la app

---

## 4. Arquitectura de Rutas

### `src/App.jsx`

> **Nota arquitectónica**: No se usan componentes `<Route>`. El routing es rendering condicional manual basado en `useLocation().pathname`.

#### Mapa URL → Clave de página

| URL | Clave (`page`) |
|---|---|
| `/` | `landing` |
| `/login` | `login` |
| `/signup` | `signup` |
| `/app/inicio` | `dashboard` |
| `/app/upload` | `upload` |
| `/app/reports` | `reports` |
| `/app/trends` | `trends` |
| `/app/settings` | `settings` |
| `/app/help` | `help` |
| `/privacy` | `privacy` |
| `/terms` | `terms` |

#### Protección de rutas

```
DASH_PAGES  = ['dashboard', 'upload', 'reports', 'trends', 'settings', 'help']
AUTH_PAGES  = ['login', 'signup']
```

Lógica en `useEffect` (se ejecuta cuando cambia `isLoaded`, `isSignedIn`, o `page`):

```
if (!isLoaded) return;  // espera inicialización de Clerk

if (isSignedIn && (AUTH_PAGES.includes(page) || page === 'landing'))
  → navigate('/app/inicio', { replace: true })

if (!isSignedIn && DASH_PAGES.includes(page))
  → navigate('/login', { replace: true })
```

#### Renderizado por clave

| Condición | Componente renderizado |
|---|---|
| `!isLoaded` | `null` (previene flash) |
| `page === 'landing'` | `<LandingPage onNavigate={navigate} />` |
| `AUTH_PAGES.includes(page)` | `<AuthPage mode={page} onNavigate={navigate} />` |
| `DASH_PAGES.includes(page)` | `<Dashboard page={page} onNavigate={navigate} onLanding={...} />` |
| `page === 'privacy' \| 'terms'` | `<LegalPage page={page} onNavigate={navigate} />` |
| fallback | `<LandingPage onNavigate={navigate} />` |

#### Helper `navigate`

```js
const navigate = (target) => routerNavigate(PAGE_TO_URL[target] ?? '/')
```

Traduce claves de página a URLs antes de llamar al `navigate` de React Router.

---

## 5. Integración con Backend (API)

### `src/lib/api.js` — Hook `useApiClient()`

**URL base:**
```js
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
```

**Obtención del token:**
```js
const { getToken } = useAuth()  // hook de Clerk
```
En cada request se llama `await getToken()` — Clerk gestiona expiración y rotación automáticamente. No hay lógica de refresh manual.

**Función interna `request(method, path, { body, headers, raw })`:**

```
1. token = await getToken()
2. headers = { Authorization: `Bearer ${token}` }
3. Si body instanceof FormData → pasa raw (browser setea Content-Type: multipart/form-data con boundary)
4. Si body !== undefined (no FormData) → JSON.stringify(body) + Content-Type: application/json
5. fetch(`${BASE_URL}${path}`, options)
6. Si response no es OK → parsea JSON, extrae payload.detail || payload.message || payload.error || `HTTP ${res.status}`, lanza Error con .status y .data
7. Si raw: true → retorna Response crudo (para descarga de PDF blobs)
8. Si content-type includes application/json → return res.json()
9. Caso contrario → return Response
```

**Métodos expuestos:**

```js
{
  get:    (path, opts) => request('GET',    path, opts),
  post:   (path, opts) => request('POST',   path, opts),
  patch:  (path, opts) => request('PATCH',  path, opts),
  delete: (path, opts) => request('DELETE', path, opts),
}
```

---

### Endpoints del Backend — Estado Actual

| Método | Endpoint | Componente | Propósito | Estado |
|---|---|---|---|---|
| `GET` | `/api/v1/clients` | `Dashboard.jsx` | Obtener perfil del usuario logueado | ✅ Conectado |
| `POST` | `/api/v1/clients` | `OnboardingModal.jsx` | Crear perfil en primer login | ✅ Conectado |
| `PATCH` | `/api/v1/clients/{id}` | `DashSettings.jsx` (`handleProfileSave`) | Actualizar `name` y `phone` | ✅ Conectado |
| `PATCH` | `/api/v1/clients/{id}` | `DashSettings.jsx` (`handleBizSave`) | Actualizar `business_name`, `business_type`, `average_transaction_value` | ✅ Conectado |
| `POST` | `/api/v1/upload` | `DashUpload.jsx` | Subir archivo `.txt` de WhatsApp | ❌ No conectado (simulado) |
| `GET` | `/api/v1/jobs/{jobId}` | `DashUpload.jsx` | Polling del estado del job | ❌ No conectado (simulado) |
| `GET` | `/api/v1/reports/{jobId}/download` | `DashUpload.jsx` | Descarga del PDF generado | ❌ No conectado (simulado) |

---

### Detalle de cada llamada conectada

#### `GET /api/v1/clients` — `Dashboard.jsx`

```js
useEffect(() => {
  api.get('/api/v1/clients')
    .then(clients => setClient(clients[0] ?? false))
    .catch(() => setClient(false))
}, [])
```

- Si el array retorna vacío → `client = false` → se muestra `<OnboardingModal>`
- Si retorna con datos → `client = clients[0]` (toma el primer cliente)
- Si falla → `client = false` (también dispara onboarding)

---

#### `POST /api/v1/clients` — `OnboardingModal.jsx`

**Body enviado:**
```json
{
  "name": "string",
  "email": "string (de Clerk user.primaryEmailAddress.emailAddress)",
  "business_name": "string",
  "business_type": "string",
  "phone": "+57XXXXXXXXXX",
  "business_identifiers": ["id1", "id2"]
}
```

- `phone` se forma concatenando `form.countryCode + form.phoneNumber`
- `business_identifiers` viene de `form.identifiers` (string separado por comas), se hace `.split(',').map(s => s.trim()).filter(Boolean)`
- On success → llama `onComplete(client)` con el objeto de respuesta del backend
- `email` viene de `user.primaryEmailAddress.emailAddress` (Clerk)

---

#### `PATCH /api/v1/clients/{id}` — Perfil — `DashSettings.jsx`

**Trigger:** botón "Guardar cambios" en tab "Perfil"

**Secuencia:**
1. Primero actualiza Clerk: `user.update({ firstName, lastName })` donde `firstName` es la primera palabra del `name` y `lastName` el resto
2. Luego llama: `api.patch('/api/v1/clients/${client.id}', { body: { name, phone } })`
   - `phone` se forma con `profileForm.countryCode + profileForm.number`
3. On success: `onClientUpdate({ ...client, name, phone })`

---

#### `PATCH /api/v1/clients/{id}` — Negocio — `DashSettings.jsx`

**Trigger:** botón "Guardar cambios" en tab "Negocio"

**Body enviado:**
```json
{
  "business_name": "string",
  "business_type": "string",
  "average_transaction_value": number
}
```

- `average_transaction_value` se parsea con `parseFloat()` antes de enviarse
- On success: `onClientUpdate({ ...client, business_name, business_type, average_transaction_value })`

---

### Autenticación en requests

Cada request lleva el header:
```
Authorization: Bearer <clerk_jwt>
```

El JWT es obtenido via `useAuth().getToken()`. Clerk lo gestiona automáticamente: si expira, lo rota y devuelve uno nuevo. El backend es responsable de verificar este JWT contra las claves públicas de Clerk.

---

## 6. Flujo de Autenticación (Clerk)

### Setup del Provider

```jsx
<ClerkProvider
  publishableKey={VITE_CLERK_PUBLISHABLE_KEY}
  localization={esES}
  afterSignOutUrl="/"
>
```

### Sign In / Sign Up

`/login` y `/signup` renderizan `<AuthPage>` con los componentes prebuilt de Clerk:

```jsx
<SignIn routing="virtual" appearance={clerkAppearance} />
<SignUp routing="virtual" appearance={clerkAppearance} />
```

- `routing="virtual"` — Clerk maneja su routing multi-paso internamente sin cambiar la URL del browser.
- `clerkAppearance` sobreescribe todos los estilos default de Clerk para coincidir con el design system de DeepLook.

### Overrides de apariencia de Clerk (`clerkAppearance`)

```js
{
  variables: {
    colorPrimary: '#4f46e5',
    colorBackground: '#ffffff',
    colorInputBackground: '#f4f4f6',
    colorText: '#0e0749',
    fontFamily: '"DM Sans", sans-serif',
    borderRadius: '8px',
  }
  // + overrides de elementos específicos: form fields, buttons, social auth, OTP inputs, footer (oculto)
}
```

### Post-Auth Redirect

| Situación | Resultado |
|---|---|
| Usuario firma salida | `afterSignOutUrl="/"` → página de landing |
| Usuario logueado accede a `/login` o `/signup` | Redirige a `/app/inicio` (replace) |
| Usuario no logueado accede a `/app/*` | Redirige a `/login` (replace) |
| Sign out manual (sidebar) | `signOut({ redirectUrl: '/' }).then(() => onLanding())` |

### Almacenamiento del Token

Gestionado 100% por Clerk (browser storage, rotación automática). La app nunca toca `localStorage`/`sessionStorage` directamente para tokens.

### Gate de Onboarding

```
GET /api/v1/clients
├── array con datos → setClient(clients[0]) → app normal
└── array vacío / error → setClient(false) → <OnboardingModal> (overlay fijo, bloquea dashboard)

OnboardingModal → POST /api/v1/clients → onComplete(client) → setClient(client)
```

### Datos del Usuario (Clerk)

| Propiedad | Fuente | Dónde se usa |
|---|---|---|
| `user.firstName` | Clerk | Saludo en DashHome, settings |
| `user.lastName` | Clerk | Settings |
| `user.username` | Clerk | Fallback de displayName |
| `user.primaryEmailAddress.emailAddress` | Clerk | Body del POST /clients, settings display |
| `user.imageUrl` | Clerk | UserButton |
| `user.twoFactorEnabled` | Clerk | Toggle en security tab (read-only) |
| `user.unsafeMetadata.businessName` | Clerk | Mostrado bajo nombre en sidebar |
| `user.update({ firstName, lastName })` | Clerk SDK | handleProfileSave en settings |
| `user.updatePassword({ currentPassword, newPassword })` | Clerk SDK | handlePasswordSave en settings (sin backend call) |

---

## 7. Gestión de Estado

**No existe librería de estado global.** Todo el estado es local con `useState`/`useEffect`.

### Estado por componente

#### `App.jsx`
- Sin estado local. `page` se deriva de `useLocation().pathname`.

#### `Dashboard.jsx`
```
sidebarOpen: boolean          // toggle del sidebar en mobile
client: null | false | object // null=cargando, false=sin perfil (onboarding), object=perfil del backend
```

#### `DashSettings.jsx`
```
tab: 'Perfil' | 'Negocio' | 'Plan y facturación' | 'Notificaciones' | 'Seguridad'
profileForm: { name: string, countryCode: string, number: string }
profileSaving: boolean
profileMsg: { ok: boolean, text: string } | null
bizForm: { business_name: string, business_type: string, average_transaction_value: string }
bizSaving: boolean
bizMsg: { ok: boolean, text: string } | null
pwForm: { current: string, next: string, confirm: string }
pwSaving: boolean
pwMsg: { ok: boolean, text: string } | null
notifs: { ready: boolean, reminder: boolean, tips: boolean, news: boolean }
```

#### `OnboardingModal.jsx`
```
form: {
  businessName: string,
  businessType: string,
  countryCode: string,
  phoneNumber: string,
  identifiers: string   // comma-separated
}
loading: boolean
error: string
```

#### `DashUpload.jsx`
```
step: 1 | 2 | 3
dragging: boolean
fileName: string | null
progress: number   // 0-100, simulado
done: boolean
checks: string[]   // pasos de procesamiento completados
```

#### `DashReports.jsx`
```
filter: string   // 'Todos' | 'Últimos 30 días' | etc.
search: string
```

#### `DashTrends.jsx`
```
range: '3m' | '6m' | 'year'
activeMetric: 'health' | 'response' | 'sentiment' | 'conversion'
```

#### `DashHelp.jsx`
```
search: string
openFaq: number | null   // índice del FAQ abierto
```

#### `Landing.jsx` → `NavHeader`
```
scrolled: boolean     // sombra en navbar al hacer scroll > 10px
mobileOpen: boolean   // hamburger menu
```

#### `Landing.jsx` → `ReportMockup`
```
phase: 0 | 1 | 2      // 0=loading, 1=scanning, 2=complete
scenarioIdx: number   // cicla entre 3 scenarios de demo cada 11s
```

---

## 8. Catálogo de Componentes

### `src/components/Landing.jsx`

Página de marketing pública. Compuesta de sub-componentes de sección:

| Sub-componente | Propósito | Estado propio |
|---|---|---|
| `NavHeader({ onNavigate })` | Navbar sticky con logo, 4 links, login, CTA | `scrolled`, `mobileOpen` |
| `ReportMockup()` | Mockup animado del dashboard (cicla 3 demos) | `phase`, `scenarioIdx` |
| `HeroSection({ onNavigate })` | Hero con headline, CTA a `signup`, `ReportMockup` | — |
| `ProblemSection()` | 3 `StatCard`s con estadísticas (65%, 56%, 78%) | — |
| `HowItWorksSection()` | 3 pasos (Exportar → Subir → Reporte) | — |
| `FeaturesSection()` | Grid de features con íconos | — |
| `ReportPreviewSection()` | Demo mockup del reporte | — |
| `PricingSection()` | Cards de pricing con CTA a signup | — |
| `FAQSection()` | Accordion de preguntas frecuentes | — |
| `TrustSection()` | Social proof / confianza | — |
| `FooterSection({ onNavigate })` | Footer con links a `privacy` y `terms` | — |
| `LandingPage({ onNavigate })` | Ensambla todas las secciones | — |

**`SCENARIOS`** (datos hardcodeados para el mockup):
```
[
  { label: 'Centro estético', score: X, metrics: [...], messages: [...] },
  { label: 'Skincare', ... },
  { label: 'Servicios del hogar', ... }
]
```

---

### `src/components/Auth.jsx`

**Props:** `{ mode: 'login' | 'signup', onNavigate }`

| Sub-componente | Propósito |
|---|---|
| `MiniDashVisual()` | Decoración animada (tarjetas flotantes, barra chart) — sin props ni estado |
| `AuthLeft({ mode })` | Panel izquierdo oscuro (`#0e0749`) con logo, `MiniDashVisual`, bullets de propuesta de valor, notas legales |
| `AuthRight({ mode, onNavigate })` | Panel derecho con `<SignIn>` o `<SignUp>` de Clerk, card de "cambiar modo" |
| `AuthPage({ mode, onNavigate })` | Wrapper grid `.auth-grid` (2 columnas, panel izquierdo oculto en mobile) |

**`switchPerks`** (varía por modo):
- En login: 3 beneficios mostrados para motivar registro
- En signup: 3 beneficios mostrados para motivar login

---

### `src/components/Dashboard.jsx`

**Props:** `{ page, onNavigate, onLanding }`

| Sub-componente | Propósito |
|---|---|
| `SidebarUser({ onLanding })` | `UserButton` de Clerk + nombre + business name + botón sign-out |
| `Sidebar({ page, onNavigate, onLanding, open, onClose })` | Sidebar fijo 260px ancho, `#0e0749`, nav items con highlight activo |
| `TopBar({ page, onMenuOpen })` | Header fijo 68px, título de página, hamburger (mobile), campana, badge "Plan Básico" |
| `LoadingMain()` | Spinner mientras `client === null` |

**`NAV_ITEMS`:**
```js
[
  { id: 'dashboard', label: 'Inicio',     icon: 'home'    },
  { id: 'upload',    label: 'Analizar',   icon: 'upload'  },
  { id: 'reports',   label: 'Reportes',   icon: 'file'    },
  { id: 'trends',    label: 'Tendencias', icon: 'chart'   },  // badge "PRO"
  { id: 'settings',  label: 'Ajustes',    icon: 'settings'},
  { id: 'help',      label: 'Ayuda',      icon: 'help'    },
]
```

**`renderPage()` — qué renderiza según `page`:**
```
'dashboard' → <DashHome onNavigate={onNavigate} />
'upload'    → <DashUpload clientId={client ? client.id : null} />
'reports'   → <DashReports onNavigate={onNavigate} />
'trends'    → <DashTrends />
'settings'  → <DashSettings client={client || null} onClientUpdate={setClient} />
'help'      → <DashHelp />
```

**Helpers:**
- `getDisplayName(user)` → `firstName + lastName` || `username` || primer email
- `toTitleCase(str)` → capitaliza cada palabra
- `userButtonAppearance` → overrides de estilos para el `UserButton` de Clerk

---

### `src/components/DashHome.jsx`

**Props:** `{ onNavigate }`

**Hook interno `useCounter(target, duration = 1200)`:**
Anima un entero de 0 a `target` en `duration` ms usando `setInterval` a 16ms.

**Datos hardcodeados:**
- `score = useCounter(72)` — health score animado
- `reports` = array de 3 reportes ficticios `{ name, date, count, score }`

| Sub-componente | Propósito |
|---|---|
| `StatCard({ icon, title, value, trend, trendLabel, sub, mono })` | Tarjeta con ícono, valor grande, tendencia verde, sub-label. Hover: lift + sombra violeta |
| `ReportRow({ name, date, count, score, isLast })` | Fila de reporte con score, "Ver PDF", botón descarga. Hover: borde + sombra índigo |

**Renderiza:** Saludo con nombre del usuario, 4 `StatCard`s, banner CTA de upload, lista de reportes recientes, tarjeta de tip semanal.

---

### `src/components/DashUpload.jsx`

**Props:** `{ clientId }` — recibido pero **no usado** actualmente

**Wizard de 3 pasos:**

| Paso | UI | Lógica |
|---|---|---|
| 1 | Zona drag & drop | Al soltar/seleccionar archivo → `setFileName`, avanza a paso 2 tras 500ms |
| 2 | Configurar análisis | 2 inputs (nombre, valor promedio), select de tipo de negocio, botón "Iniciar análisis" → paso 3 |
| 3 | Procesando | Barra de progreso simulada (`setInterval` 200ms, incremento aleatorio). 4 pasos mostrados. On done: pantalla de éxito |

**⚠️ No hay llamada real al backend.** El procesamiento es 100% simulado con `setTimeout`/`setInterval`.

---

### `src/components/DashReports.jsx`

**Props:** `{ onNavigate }`

**Datos hardcodeados:** 6 reportes `{ id, name, date, convs, msgs, score }`

**Filtrado real implementado:** Solo por `search` (filtra `r.name.toLowerCase().includes(search.toLowerCase())`). Los botones de filtro (`filter` state) se setean pero no aplican lógica de filtrado.

| Sub-componente | Propósito |
|---|---|
| `ScoreBadge({ score })` | Score coloreado por umbral: ≥70 → `#4f46e5`, ≥50 → `#a78bfa`, <50 → `#0e0749` |
| `ScoreBar({ score })` | Barra de progreso delgada con la misma lógica de color |
| `ReportCard({ report })` | Card con score badge, bar, nombre, fecha, convs/mensajes, "Ver reporte", ícono descarga |

---

### `src/components/DashTrends.jsx`

**Props:** ninguna

**Datos:** 100% hardcodeados en `dataByRange` para los 3 rangos (`3m`, `6m`, `year`).

**Charts custom (SVG puro):**

| Componente | Tipo | Características |
|---|---|---|
| `LineChart({ series, labels, height, yMax, unit })` | Línea | Gradiente bajo la línea, tooltip en hover, círculos en puntos |
| `BarChart({ data, labels, color, max, unit, horizontal })` | Barras | Vertical o horizontal, gradiente |
| `DonutChart({ segments, size })` | Donut | Interactivo (hover infla stroke), centro muestra % |
| `Heatmap({ data })` | Mapa de calor | Grid 6×6 (días × horas), 5 niveles de color violeta, tooltip |
| `HealthGauge({ score, label })` | Gauge | Arco SVG, color por umbral, stroke animado |
| `DimBar({ label, value, max, color, benchmark })` | Barra dimensión | Con marcador de benchmark opcional |
| `Funnel({ steps })` | Embudo | Ancho tapering -14% por paso, muestra drop-off % |

**Datos hardcodeados incluidos:**
- `heatmapData` — matriz 6×6 de conteos de mensajes
- `topics` — 4 items `{ label, pct }`
- `funnelSteps` — 4 pasos: 156 → 134 → 118 → 65 conversaciones
- `dimensions` — 6 dimensiones de score
- `aiInsights` — 4 tarjetas de insights de IA

---

### `src/components/DashSettings.jsx`

**Props:** `{ client: object | null, onClientUpdate: function }`

**Tabs:** `['Perfil', 'Negocio', 'Plan y facturación', 'Notificaciones', 'Seguridad']`

**Helpers:**
- `parsePhone(phone)` — parsea `"+573001234567"` en `{ countryCode: '+57', number: '3001234567' }`. Prueba cada código de país ordenados de mayor a menor longitud.
- `PLAN_LABELS` — `{ free: 'Gratuito', basic: 'Básico', pro: 'Pro', enterprise: 'Enterprise' }`
- `BUSINESS_TYPES` — 10 tipos de negocio
- `COUNTRY_CODES` — 9 países con emojis de banderas

| Sub-componente | Propósito |
|---|---|
| `Toggle({ on, onChange, label, disabled })` | Toggle switch custom con CSS transition |
| `SI({ label, value, onChange, type, readOnly, hint })` | Input estilizado con borde en focus |
| `SaveBtn({ onClick, saving })` | Botón "Guardar cambios" / "Guardando…" |
| `FeedbackMsg({ msg })` | Texto verde/rojo de feedback |
| `PhoneInput({ countryCode, number, onCountryChange, onNumberChange })` | Input compuesto con select de código de país |

**Tab "Plan y facturación":** Banner del plan actual, tarjeta Visa placeholder, barra de uso (22/500 conversaciones), tabla de facturas hardcodeada (3 filas).

**Tab "Seguridad":** Formulario de cambio de contraseña (via Clerk SDK, sin backend), toggle 2FA (read-only, controlado por Clerk), botón "Eliminar mi cuenta" (sin acción implementada).

---

### `src/components/OnboardingModal.jsx`

**Props:** `{ onComplete: (client: object) => void }`

Overlay fixed que bloquea el dashboard hasta que el usuario crea su perfil.

**Validaciones antes de submit:**
- `businessName` requerido
- `businessType` requerido
- `phoneNumber` requerido

**Body del POST:**
```json
{
  "name": "string (businessName)",
  "email": "string (de Clerk user.primaryEmailAddress.emailAddress)",
  "business_name": "string",
  "business_type": "string",
  "phone": "+{countryCode}{phoneNumber}",
  "business_identifiers": ["id1", "id2"]
}
```

**Sub-componentes:**
- `Field({ label, hint, optional, children })` — wrapper de campo con label y hint
- `FocusInput` — input con estado de borde en focus
- `FocusSelect` — select con estado de borde en focus

---

### `src/components/DashHelp.jsx`

**Props:** ninguna — todos los datos son estáticos

**Datos hardcodeados:**
- `helpCategories` — 6 categorías: Empezar, Exportar chats, Entender mi reporte, Planes y pagos, Cuenta y perfil, Resolución de problemas
- `faqs` — 5 preguntas frecuentes

**Renderiza:** Banner de búsqueda, grid de categorías, accordion de FAQ, CTA de soporte, lista de recursos populares.

---

### `src/components/LegalPage.jsx`

**Props:** `{ page: 'privacy' | 'terms', onNavigate }`

**Contenido estático** en objeto `CONTENT`:
- `privacy` — Política de Privacidad (7 secciones, última actualización: 1 de abril 2026). Ampara Ley colombiana 1581 de 2012 (Habeas Data), cifrado AES-256, servidores SOC 2, contacto `privacidad@deeplook.co`
- `terms` — Términos de Servicio (8 secciones, última actualización: 1 de abril 2026). Precios en COP, límites de responsabilidad, contacto `legal@deeplook.co`

---

### `src/components/Icons.jsx`

**`Icon({ name, size, color, style })`** — SVG inline. Retorna `null` para nombres desconocidos.

**Íconos soportados:**
`search`, `home`, `upload`, `file`, `chart`, `settings`, `help`, `bell`, `check`, `plus`, `x`, `arrow_right`, `arrow_left`, `download`, `clock`, `smile`, `star`, `funnel`, `list`, `zap`, `eye`, `eye_off`, `logout`, `menu`, `lightbulb`, `trending_up`, `shield`, `user`, `credit_card`, `chat`, `lock`, `mail`, `globe`

**`DeepLookLogo({ dark, size, style })`** — `<img src="/logo-horizontal-landing.png">`.

| `size` | Ancho |
|---|---|
| `sm` | 36px |
| `md` | 48px |
| `lg` | 60px |

Cuando `dark=false` → `filter: brightness(0) invert(1)` (logo blanco sobre fondos oscuros).

---

## 9. Sistema de Estilos

### Filosofía

- **Sin Tailwind, sin CSS Modules, sin styled-components.**
- Estilos de componentes: inline styles directamente en JSX.
- `index.css`: clases utilitarias globales + reset + variables CSS + layouts de grids responsivos.
- `App.css`: archivo vestigial del template de Vite. Ningún selector aplica a componentes actuales.

### Variables CSS (`:root`)

```css
--primary: #4f46e5    /* índigo */
--accent:  #a78bfa    /* violeta */
--bg:      #ededed
--dark:    #0e0749    /* navy profundo */
--white:   #ffffff
--font:    'DM Sans', sans-serif
--mono:    'JetBrains Mono', monospace
```

### Paleta de marca

| Color | Hex | Uso |
|---|---|---|
| Navy profundo | `#0e0749` | Sidebar, backgrounds oscuros, texto principal |
| Índigo | `#4f46e5` | Primary, botones, highlights activos |
| Violeta | `#a78bfa` | Accent, íconos, elementos secundarios |
| Verde | `#22c55e` | Métricas positivas, tendencias |
| Ámbar | `#f59e0b` | Advertencias, métricas de atención |

### Clases utilitarias en `index.css`

| Clase | Uso |
|---|---|
| `.btn-primary` | Botón índigo relleno, hover accent + escala + sombra |
| `.btn-ghost` | Borde índigo, hover relleno |
| `.skeleton` | Animación shimmer de carga |
| `.page-fade` | Fade + slide-up 300ms al montar |
| `.float-anim` | Loop flotante arriba-abajo (Auth visual) |
| `@keyframes spin` | Rotación de spinner |

### Layout del Dashboard

| Clase | Descripción |
|---|---|
| `.dash-sidebar` | 260px ancho, transiciones |
| `.dash-main` | `margin-left: 260px` |
| `.dash-topbar` | `left: 260px; right: 0` (fixed) |
| `.dash-page` | `padding: 32px 40px` |
| `.dash-g4` | Grid 4 columnas |
| `.dash-g3` | Grid 3 columnas |
| `.dash-g2` | Grid 2 columnas |
| `.dash-hamburger` | Oculto por defecto (mostrado ≤960px) |
| `.dash-overlay` | Backdrop para sidebar mobile |

### Breakpoints responsivos

| Breakpoint | Cambios |
|---|---|
| ≤1200px | `.dash-g4` → 2 columnas |
| ≤960px | Sidebar va off-canvas (slide-in), main llena ancho completo, hamburger visible, padding reducido |
| ≤768px | Panel izquierdo de Auth oculto |
| ≤640px | Todos los grids colapsan a 1 columna, padding mínimo |

---

## 10. Hooks Personalizados

### `useApiClient()` — `src/lib/api.js`

Retorna `{ get, post, patch, delete }`. Ver sección 5 para detalle completo.

**Dependencias internas:** `useAuth()` de Clerk para `getToken()`.

### `useCounter(target, duration)` — inline en `DashHome.jsx`

```js
function useCounter(target, duration = 1200) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const step = target / (duration / 16)
    const id = setInterval(() => {
      setValue(v => {
        if (v + step >= target) { clearInterval(id); return target }
        return v + step
      })
    }, 16)
    return () => clearInterval(id)
  }, [target, duration])
  return Math.round(value)
}
```

**Nota:** No es exportado. Solo se usa en `DashHome` para el score animado.

---

## 11. Modelos de Datos

Sin TypeScript. Las siguientes son las shapes inferidas del código:

### Client Profile (respuesta de `/api/v1/clients`)

```js
{
  id: string | number,
  name: string,
  email: string,
  business_name: string,
  business_type: string,
  phone: string,                      // ej: "+57 3001234567"
  business_identifiers: string[],
  average_transaction_value: number | null,
  plan: 'free' | 'basic' | 'pro' | 'enterprise'
}
```

### Report (hardcodeado en DashReports/DashHome)

```js
{
  id: number,
  name: string,
  date: string,
  convs: number,
  msgs: number,
  score: number   // 0-100
}
```

### Clerk User (via `useUser()`)

```js
{
  firstName: string | null,
  lastName: string | null,
  username: string | null,
  emailAddresses: [{ emailAddress: string }],
  primaryEmailAddress: { emailAddress: string },
  imageUrl: string,
  twoFactorEnabled: boolean,
  unsafeMetadata: { businessName?: string },
  fullName: string | null,
  update({ firstName, lastName }): Promise,
  updatePassword({ currentPassword, newPassword }): Promise
}
```

### Metric (DashTrends)

```js
{
  id: 'health' | 'response' | 'sentiment' | 'conversion',
  label: string,
  data: number[],
  unit: '' | 'h' | '%',
  color: string,
  current: number,
  change: number,
  up: boolean,
  format: (v: number) => string
}
```

### NavItem (Dashboard sidebar)

```js
{
  id: string,
  label: string,
  icon: string   // nombre de ícono en Icons.jsx
}
```

### Scenario (Landing mockup animado)

```js
{
  label: string,
  avatar: string,           // 2 letras
  contact: string,
  convs: string,
  score: number,
  scoreLabel: string,
  metrics: [{ label: string, val: string, icon: string, color: string }],
  action: string,
  messages: [{ from: 'client' | 'biz', text: string, time: string }]
}
```

---

## 12. Variables de Entorno

| Variable | Archivo | Valor por defecto | Uso |
|---|---|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | `.env.local` | `pk_test_aW5maW5pd...` | `<ClerkProvider publishableKey>` en `main.jsx` |
| `VITE_API_URL` | `.env.local` | `http://localhost:8000` | `BASE_URL` en `src/lib/api.js` |

---

## 13. Assets Públicos

| Asset | Ruta | Uso |
|---|---|---|
| Logo horizontal | `/public/logo-horizontal-landing.png` | `DeepLookLogo` component |
| Favicon | `/public/favicon.svg` | `<link rel="icon">` en `index.html` |
| SVG sprite | `/public/icons.svg` | Referenciado en HTML pero no usado (íconos son inline en `Icons.jsx`) |

---

## 14. Decisiones Arquitectónicas Clave

### 1. Sin TypeScript
El proyecto es JavaScript puro (`.jsx`). `@types/react` está como devDependency solo para soporte de IDE. No hay `tsconfig.json`.

### 2. Routing no estándar
React Router se usa solo para `useNavigate` y `useLocation`. No hay `<Route>`. Todo el routing es rendering condicional manual via un mapa `URL → clave`. Esto funciona pero hace más difícil escalar rutas anidadas o dinámicas.

### 3. Sin librería de componentes
Todo el UI es construido desde cero con inline styles. Sin shadcn/ui, MUI, Ant Design, Radix, etc.

### 4. Sin librería de charts
Todos los gráficos (`LineChart`, `BarChart`, `DonutChart`, `Heatmap`, `Funnel`, `HealthGauge`, `DimBar`) son implementaciones SVG custom dentro de `DashTrends.jsx`.

### 5. Clerk absorbe toda la complejidad de auth
Token refresh, session management, OAuth, OTP, 2FA — todo delegado a Clerk. La app solo llama `getToken()` antes de cada request.

### 6. Un solo archivo de API
Toda la lógica HTTP está en `src/lib/api.js` como un hook `useApiClient()`. No hay archivos de servicio por recurso. Cada componente que necesita la API llama `useApiClient()` directamente.

### 7. `App.css` es vestigial
Existe desde el template de Vite, tiene `.counter`, `.hero`, etc. — ninguno es usado por ningún componente. Puede eliminarse.

### 8. Onboarding como gate bloqueante
Si `GET /api/v1/clients` retorna array vacío, el `<OnboardingModal>` se muestra como overlay fixed que bloquea toda la UI del dashboard hasta completar el perfil.

---

## 15. Estado de Implementación vs. Demo

| Funcionalidad | Estado | Notas |
|---|---|---|
| Autenticación (login/signup/logout) | ✅ Funcional | Via Clerk |
| Onboarding (crear perfil) | ✅ Funcional | `POST /api/v1/clients` |
| Editar perfil personal | ✅ Funcional | `PATCH /api/v1/clients/{id}` + Clerk |
| Editar perfil de negocio | ✅ Funcional | `PATCH /api/v1/clients/{id}` |
| Cambiar contraseña | ✅ Funcional | Via Clerk SDK (sin backend) |
| Landing page | ✅ Funcional | 100% estática, mockup animado |
| Dashboard home | ⚠️ Demo | Datos hardcodeados, score animado ficticio |
| Upload de chats | ❌ No conectado | Wizard UI completo, procesamiento simulado, sin API real |
| Reportes | ⚠️ Demo | Lista hardcodeada, filtro de texto funciona, filtros por fecha no |
| Tendencias | ⚠️ Demo | Todos los datos hardcodeados, charts visuales funcionan |
| Ayuda | ⚠️ Demo | Todo estático |
| Plan y facturación | ⚠️ Demo | Datos hardcodeados, sin integración de pagos |
| Notificaciones | ⚠️ Demo | Toggles sin persistencia |
| 2FA | ⚠️ Read-only | Muestra estado de Clerk pero no puede activarse desde aquí |
| Eliminar cuenta | ❌ Sin implementar | Botón existe pero no tiene acción |

---

*Documentación generada el 23 de abril de 2026. Refleja el estado actual del código en `fe-deeplook`.*
