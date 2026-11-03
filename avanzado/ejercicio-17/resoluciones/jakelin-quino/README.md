# Ejercicio 17: refresh tokens conceptual

## Propósito
Renovar credenciales para una sesión de turismo usando un refresh token de un solo uso. Es una demostración en memoria, no un sistema listo para producción.

## Ejecución y resultado
Ejecuta `npm install` y `npm start`. Envía `POST /login` con `{"user":"Ana"}`:
```json
{ "accessToken": "<token>", "refreshToken": "<token>" }
```
Envía el refresh token a `POST /refresh`. La API devuelve credenciales nuevas y deja de aceptar el token anterior.
