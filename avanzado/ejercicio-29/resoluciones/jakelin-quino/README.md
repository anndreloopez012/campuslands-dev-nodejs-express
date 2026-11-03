# Ejercicio 29: preparación para despliegue

## Propósito
Comprobar que la API de fútbol está activa y lista para recibir peticiones.

## Ejecución y resultado
Ejecuta `npm install` y `npm start`. Consulta `GET /health`:
```json
{ "status": "ok", "service": "football-api" }
```
Una respuesta `200` indica que el servidor está funcionando y puede atender solicitudes.
