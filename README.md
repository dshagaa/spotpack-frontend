# SpotPack Frontend

Digitalizá schedules de convenciones furry con IA.

## Setup

```bash
npm install
npm run dev      # → http://localhost:5173
npm run build    # → dist/
npm test         # → vitest run
```

## Configuración

No requiere `.env`. La URL del backend y la API key se configuran desde la app:

1. Abrí `http://localhost:5173`
2. Click en **⚡ Conectar API**
3. Pegá tu API key (general)
4. La URL por defecto es `http://127.0.0.1:54321/functions/v1`

## Backend

Requiere [spotpack-backend](https://github.com/dshagaa/spotpack-backend) corriendo.

```bash
cd ../spotpack-backend
supabase start
supabase functions serve --no-verify-jwt
```

## Stack

- **Vite** — build tool
- **Alpine.js** — reactivity, bundled locally (no runtime CDN)
- **Tailwind CSS** — estilos
- **Vitest** — testing
- **Service Worker + Cache API** — app shell offline
- **localStorage** — API config, attending, bounded API snapshots
- **sessionStorage** — route and filter restoration per session

## Rendimiento y offline

El frontend está diseñado mobile-first para dispositivos modestos:

- System font stack: no descarga fuentes externas.
- Render cached-first para eventos ya visitados; luego revalida con el backend.
- Si una lectura falla, muestra el último snapshot con indicador de datos antiguos.
- El service worker sólo cachea recursos estáticos same-origin; nunca cachea API keys ni respuestas autenticadas.
- En producción se puede instalar como PWA y abrir la shell sin red después de una visita.
- Los valores de almacenamiento están versionados, se parsean defensivamente y tienen límite de tamaño.

## API Docs

La documentación interactiva está en `http://localhost:8000/docs` cuando el backend está corriendo.

También hay una [colección de Postman](../spotpack-backend/postman.json) en el repo del backend.
