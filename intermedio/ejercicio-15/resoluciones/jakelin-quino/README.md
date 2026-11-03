# Ejercicio 15: JWT básico

## Propósito
Iniciar sesión, recibir un token firmado de duración limitada y presentarlo para consultar el menú. Es una demostración educativa.

## Ejecución y prueba
Ejecuta `npm install`, define `$env:JWT_SECRET="clave-local"` en PowerShell y ejecuta `npm start`. Envía `POST /login` con `{"user":"Ana"}`.

## Resultado esperado
El inicio de sesión responde con un token:
```json
{ "token": "<token firmado>" }
```
Envía ese valor en `Authorization: Bearer <token>` al consultar `GET /menu`. La respuesta identifica al usuario:
```json
{ "message": "Menú de comida urbana", "user": "Ana" }
```
