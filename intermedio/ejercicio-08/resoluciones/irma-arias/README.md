# Ejercicio 08: Middleware de request ID

## Propósito

Asignar a cada solicitud de hiperdeportivos un identificador único, exponerlo en `X-Request-Id` y devolverlo junto con la respuesta. El identificador facilita relacionar una petición con sus registros.

## Ejecución y prueba

Requiere Node.js 20 o superior. Ejecuta `npm install` y `npm run dev`, y solicita `GET /api/cars`. Comprueba que la respuesta incluye el encabezado `X-Request-Id` y una propiedad `requestId`.
