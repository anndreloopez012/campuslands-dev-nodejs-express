# Ejercicio 03: validación con schemas

## Propósito
Validar los datos de un equipo MOBA antes de aceptarlo: nombre obligatorio y hasta cinco jugadores.

## Ejecución y resultado
Ejecuta `npm install` y `npm start`. Envía `POST /teams` con `{"name":"Dragons","players":5}`:
```json
{ "name": "Dragons", "players": 5 }
```
Si los datos no cumplen las reglas, la API responde `400` con un mensaje de validación.
