# Ejercicio 21: rate limit conceptual

## Propósito
Limitar las consultas a los modelos de animación 3D para evitar solicitudes repetidas en poco tiempo.

## Ejecución y resultado esperado
Ejecuta `npm install` y `npm start`. Las primeras tres consultas a `GET /models` responden:
```json
["Atlas", "Nova"]
```
Una cuarta consulta dentro de diez segundos responde `429` con `{"error":"Intenta de nuevo en unos segundos"}`.
