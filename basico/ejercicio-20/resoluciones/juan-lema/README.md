# Ejercicio 20 - middleware express.json (Juan Lema)

## Que hace

Tematica dibujo digital. `express.json()` parsea el body de `POST /brushes`. `middlewares/json-error-handler.js` es un middleware de error (4 args) que atrapa un JSON malformado y responde 400 en lugar del error HTML por defecto de Express.

## Como ejecutar

```bash
npm install
npm start
```

## Como probar

```bash
curl -X POST http://localhost:3020/brushes -H "Content-Type: application/json" -d "{\"name\":\"Pincel suave\",\"size\":12}"
```

## Como probar los casos de error

Body invalido segun reglas:

```bash
curl -X POST http://localhost:3020/brushes -H "Content-Type: application/json" -d "{\"name\":\"Pincel\"}"
```

JSON malformado (atrapado por `jsonErrorHandler`):

```bash
curl -X POST http://localhost:3020/brushes -H "Content-Type: application/json" -d "{name: pincel,}"
```

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/
│   └── brushes.routes.js
├── controllers/
│   └── brushes.controller.js
├── services/
│   └── brushes.service.js
└── middlewares/
    └── json-error-handler.js
```
