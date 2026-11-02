# Ejercicio 05: repositorios en memoria

## Propósito
Consultar y registrar equipos de fútbol en una lista temporal, almacenada en memoria mientras el servidor está activo.

## Ejecución y prueba
Ejecuta `npm install` y `npm start`. `GET /teams` responde:
```json
[{ "id": 1, "name": "Campus FC" }]
```
Envía `POST /teams` con `{"name":"Leones FC"}` para agregar un equipo.

## Resultado esperado
La creación responde con estado `201` y el equipo nuevo, por ejemplo:
```json
{ "id": 2, "name": "Leones FC" }
```
