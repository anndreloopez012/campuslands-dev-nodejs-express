# Ejercicio 17 - rutas GET (Juan Lema)

## Que hace

Tematica viajes y turismo. `GET /destinations` lista destinos, `GET /destinations/:id` devuelve uno (400 si el id no es numerico, 404 si no existe). Separado en routes/controllers/services.

## Como ejecutar

```bash
npm install
npm start
```

## Como probar

```bash
curl http://localhost:3017/destinations
curl http://localhost:3017/destinations/2
curl http://localhost:3017/destinations/99
curl http://localhost:3017/destinations/abc
```

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/
│   └── destinations.routes.js
├── controllers/
│   └── destinations.controller.js
├── services/
│   └── destinations.service.js
└── data/
    └── destinations.json
```
