# Ejercicio 13: relaciones simples

## Propósito
Representar la relación entre pilotos de ciencia ficción y sus naves.

## Ejecución y resultado esperado
Ejecuta `npm install` y `npm start`. Consulta `GET http://localhost:3000/pilots`:
```json
[
  { "name": "Ada", "ship": { "name": "Orion", "model": "Scout-1" } },
  { "name": "Sol", "ship": { "name": "Vega", "model": "Falcon" } }
]
```
Cada piloto aparece junto con los datos de su nave.
