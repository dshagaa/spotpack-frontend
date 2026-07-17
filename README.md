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
- **Alpine.js** — reactivity
- **Tailwind CSS** — estilos
- **Vitest** — testing

## API Docs

La documentación interactiva está en `http://localhost:8000/docs` cuando el backend está corriendo.

También hay una [colección de Postman](../spotpack-backend/postman.json) en el repo del backend.
