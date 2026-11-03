# Ejercicio 04: errores de dominio

## Propósito
Aplicar reglas de negocio a una partida battle royale: solo se puede registrar un puntaje positivo.

## Ejecución y resultado
Ejecuta `npm install` y `npm start`. Envía `POST /matches/1/score` con `{"points":20}`:
```json
{ "matchId": 1, "points": 20, "status": "saved" }
```
Un puntaje cero o negativo responde `400` con un error explicado para el usuario.
