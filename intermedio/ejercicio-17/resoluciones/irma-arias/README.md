# Ejercicio 17: Roles y permisos

## Propósito

Aplicar una autorización sencilla en un servicio de viajes: solo el rol `admin` puede consultar todas las reservas. El middleware comprueba el rol y deja continuar únicamente a quien tiene permiso.

## Ejecución y prueba

Requiere Node.js 20 o superior. Ejecuta `npm install` y `npm run dev`. Prueba `GET /api/bookings` con encabezado `X-User-Role: admin`; un rol distinto recibe `403`.

El encabezado representa un rol de prueba, no una identidad confiable para producción.
