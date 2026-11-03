# Ejercicio 02: Routers modulares

## Propósito

Separar los endpoints de equipos y mapas de un shooter competitivo en routers independientes. Cada router administra un recurso y el servidor los monta bajo `/api`.

## Ejecución

Requiere Node.js 20 o superior. Ejecuta `npm install` y después `npm run dev`. El servidor escucha en `http://localhost:3000`.

## Pruebas

- `GET /api/teams` lista equipos.
- `GET /api/maps` lista mapas.

La respuesta contiene la colección del recurso solicitado. Los datos de ejemplo están en memoria.
