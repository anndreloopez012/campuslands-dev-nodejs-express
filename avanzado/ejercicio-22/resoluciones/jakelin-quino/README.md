# Ejercicio 22: webhooks simulados

## Propósito
Recibir avisos de cambios en planos de arquitectura y guardarlos como eventos de ejemplo.

## Ejecución y resultado
Ejecuta `npm install` y `npm start`. Envía `POST /webhooks` con `{"event":"plan.ready","project":"Casa 1"}`:
```json
{ "received": true, "event": "plan.ready", "project": "Casa 1" }
```
Consulta `GET /webhooks` para ver los eventos recibidos. No se realizan llamadas a servicios externos.
