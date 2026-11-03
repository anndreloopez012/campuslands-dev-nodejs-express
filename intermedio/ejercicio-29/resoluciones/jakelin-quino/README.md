# Ejercicio 29: refactor de API

## Propósito
Consultar y registrar equipos de fútbol con el código organizado en rutas, controlador, servicio y repositorio.

## Ejecución y resultados esperados
Ejecuta `npm install` y `npm start`. `GET /teams` devuelve:
```json
[{ "id": 1, "name": "Campus FC" }]
```
Envía `POST /teams` con `{"name":"Leones FC"}`. La API responde `201` con:
```json
{ "id": 2, "name": "Leones FC" }
```
