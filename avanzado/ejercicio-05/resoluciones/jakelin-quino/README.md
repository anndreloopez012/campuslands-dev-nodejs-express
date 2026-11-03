# Ejercicio 05: transacciones simuladas

## Propósito
Simular la inscripción de un equipo de fútbol a un torneo, reservando un cupo disponible.

## Ejecución y resultado
Ejecuta `npm install` y `npm start`. Envía `POST /enrollments` con `{"team":"Campus FC"}`:
```json
{ "team": "Campus FC", "place": 1, "status": "confirmed" }
```
Hay dos cupos iniciales. Cuando se agotan, la API responde `409` y no realiza la inscripción.
