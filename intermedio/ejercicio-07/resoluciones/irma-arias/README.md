# Ejercicio 07: Middleware de errores

## Propósito

Centralizar las respuestas de error de un catálogo de autos de lujo. La ruta genera errores con un estado HTTP y el middleware final los convierte en una respuesta JSON uniforme.

## Ejecución y prueba

Con Node.js 20 o superior, ejecuta `npm install` y `npm run dev`. `GET /api/cars/1` devuelve un auto. `GET /api/cars/99` devuelve estado `404` con `{ "error": "Auto no encontrado." }`.
