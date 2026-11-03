# Ejercicio 18: multirol avanzado

## Propósito
Permitir acceso al manifiesto de saltos según el rol indicado: instructor o piloto.

## Ejecución y resultado
Ejecuta `npm install` y `npm start`. Consulta `GET /jumps` con `x-roles: pilot,instructor`:
```json
[{ "student": "Alex", "status": "ready" }]
```
Si falta un rol autorizado, la respuesta será `403`. Esta demostración no reemplaza una autenticación real.
