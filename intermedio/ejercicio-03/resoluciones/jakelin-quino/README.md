# Ejercicio 03: controladores limpios

## Propósito
Mostrar un ranking de equipos MOBA. El controlador prepara la respuesta y mantiene sencilla la ruta.

## Ejecución y resultado esperado
Ejecuta `npm install` y `npm start`, luego consulta `GET http://localhost:3000/ranking`:
```json
[
  { "team": "Dragons", "points": 12 },
  { "team": "Wolves", "points": 9 }
]
```
Cada elemento representa un equipo y su puntaje.
