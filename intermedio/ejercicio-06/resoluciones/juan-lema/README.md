# Ejercicio 06 - validacion centralizada (Juan Lema)

## Que hace

Tematica motos y mecanica. `middlewares/validate.js` centraliza toda la validacion de `POST /motorcycles` en un solo lugar, antes de llegar al controller. El controller y el service ya reciben datos validos y no repiten ninguna regla de validacion.

## Como ejecutar

```bash
npm install
npm start
```

## Como probar

```bash
curl http://localhost:4006/motorcycles
curl http://localhost:4006/motorcycles/1
curl -X POST http://localhost:4006/motorcycles -H "Content-Type: application/json" -d "{\"brand\":\"Kawasaki\",\"model\":\"Ninja 400\",\"cc\":399}"
```

## Como probar los casos de error

```bash
curl http://localhost:4006/motorcycles/99
curl http://localhost:4006/motorcycles/abc
curl -X POST http://localhost:4006/motorcycles -H "Content-Type: application/json" -d "{\"brand\":\"Kawasaki\"}"
curl -X POST http://localhost:4006/motorcycles -H "Content-Type: application/json" -d "{\"brand\":\"Kawasaki\",\"model\":\"Ninja\",\"cc\":399,\"status\":\"invalido\"}"
```

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/motorcycles.routes.js
├── controllers/motorcycles.controller.js
├── services/motorcycles.service.js
└── middlewares/validate.js
```
