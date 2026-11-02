# Ejercicio 02: routers modulares

## Propósito
Consultar y registrar jugadores de un shooter usando un router dedicado.

## Ejecución y prueba
Ejecuta `npm install` y `npm start`. `GET http://localhost:3000/players` devuelve:
```json
[{ "name": "Nova", "rank": "Oro" }]
```
Para crear un jugador, envía `POST /players` con `{"name":"Ana"}`.

## Resultado esperado
La creación responde con estado `201` y el jugador registrado:
```json
{ "name": "Ana", "rank": "Sin clasificar" }
```
Si falta el nombre, responde `400` con `{"error":"Falta el nombre"}`.
