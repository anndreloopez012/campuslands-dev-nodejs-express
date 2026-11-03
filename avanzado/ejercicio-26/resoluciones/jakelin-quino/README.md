# Ejercicio 26: fixtures y factories

## Propósito
Crear jugadores de shooter con una fábrica reutilizable y mostrar datos de ejemplo preparados como fixtures.

## Ejecución y resultado
Ejecuta `npm install` y `npm test` para comprobar la fábrica. Con `npm start`, consulta `GET /players`:
```json
[
  { "name": "Nova", "rank": "Gold" },
  { "name": "Rex", "rank": "Silver" }
]
```
Envía `POST /players` con un nombre para crear otro jugador con el rango predeterminado `Bronze`.
