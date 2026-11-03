# Ejercicio 21: concurrencia controlada

## Propósito
Procesar solicitudes de renderizado de una en una, aunque varias lleguen al mismo tiempo.

## Ejecución y resultado
Ejecuta `npm install` y `npm start`. Envía `POST /renders` con `{"scene":"Sala"}`:
```json
{ "scene": "Sala", "turn": 1, "status": "completed" }
```
Solicitudes simultáneas reciben turnos consecutivos y se procesan en orden.
