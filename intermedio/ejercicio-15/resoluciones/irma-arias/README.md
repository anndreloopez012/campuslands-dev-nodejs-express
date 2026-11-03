# Ejercicio 15: JWT básico

## Propósito

Crear un JSON Web Token al iniciar sesión en un servicio de comida urbana y verificarlo en una ruta privada. El secreto se obtiene de `JWT_SECRET`; el valor de respaldo solo facilita la práctica local.

## Ejecución y prueba

Requiere Node.js 20 o superior. Ejecuta `npm install` y `JWT_SECRET=clave-local npm run dev` (en PowerShell: `$env:JWT_SECRET='clave-local'; npm run dev`). Envía `POST /api/login` con `{"username":"cocinero","password":"demo"}` y después consulta `GET /api/orders` con `Authorization: Bearer <token>`.

En producción debe definirse un secreto fuerte mediante una variable segura y almacenarse contraseñas con hash.
