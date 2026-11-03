# Ejercicio 08 - middleware de request id (Juan Lema)

## Que hace

Tematica hiperdeportivos. `middlewares/request-id.js` genera un `req.id` unico (`crypto.randomUUID()`) por cada peticion, lo expone en el header `X-Request-Id` y esta disponible para toda la cadena de middlewares/controllers. Las respuestas incluyen ese `requestId` para poder rastrear cada peticion.

## Como ejecutar

```bash
npm install
npm start
```

## Como probar

```bash
curl -i http://localhost:4008/hypercars
curl http://localhost:4008/hypercars/1
curl -X POST http://localhost:4008/hypercars -H "Content-Type: application/json" -d "{\"brand\":\"Rimac\",\"model\":\"Nevera\",\"topSpeed\":412}"
```

## Como probar los casos de error

```bash
curl http://localhost:4008/hypercars/99
curl http://localhost:4008/hypercars/abc
```

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/hypercars.routes.js
├── controllers/hypercars.controller.js
├── services/hypercars.service.js
└── middlewares/request-id.js
```
