# Ejercicio 29: Refactor de API

## Propósito

Organizar una API de fútbol y fútbol sala en rutas, controlador y servicio, manteniendo una respuesta uniforme. El refactor evita mezclar acceso HTTP y operaciones sobre los equipos.

## Ejecución

Requiere Node.js 20 o superior. Ejecuta `npm install` y `npm run dev`.

## Endpoints

- `GET /api/teams`: lista equipos.
- `POST /api/teams`: crea equipo con JSON `{"name":"Estrella"}`.
- Nombre vacío: respuesta `400`.

Los datos se almacenan en memoria durante la ejecución.
