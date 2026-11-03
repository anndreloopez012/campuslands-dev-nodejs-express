# Ejercicio 16: Rutas protegidas

## Propósito

Proteger el catálogo de ropa y sneakers con un middleware que comprueba un token de demostración. La verificación se ejecuta antes del controlador de la ruta privada.

## Ejecución y prueba

Requiere Node.js 20 o superior. Ejecuta `npm install` y `npm run dev`. `GET /api/products` requiere `Authorization: Bearer tienda-demo`; sin el encabezado válido responde `401`.

El token fijo solo sirve para practicar el middleware y no es adecuado para producción.
