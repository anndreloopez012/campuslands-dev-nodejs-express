# Ejercicio 23: jobs programados

## Propósito
Simular una revisión automática de trabajos de soldadura cada cinco segundos.

## Ejecución y resultado
Ejecuta `npm install` y `npm start`. Consulta `GET /jobs` para ver el resultado más reciente:
```json
{ "name": "Revisar trabajos pendientes", "runs": 1, "lastRun": "<fecha y hora>" }
```
El contador aumenta en cada ejecución programada mientras el servidor sigue activo.
