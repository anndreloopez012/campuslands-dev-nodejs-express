# Ejercicio 10: lectura de CSV

## Propósito
Leer resultados de pingpong desde un archivo CSV y convertir sus filas en datos JSON.

## Ejecución y resultado
Ejecuta `npm install` y `npm start`, luego consulta `GET /players`:
```json
[
  { "name": "Mia", "wins": 7 },
  { "name": "Kai", "wins": 4 }
]
```
Los valores de `wins` se convierten a números al leer el archivo `data/players.csv`.
