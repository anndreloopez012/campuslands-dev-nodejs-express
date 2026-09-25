# Ejercicio 13 - relaciones simples (Juan Lema)

## Que hace

Tematica ciencia ficcion. Relacion uno a muchos: un capitan comanda muchas naves y cada nave referencia a su capitan con `captainId`. `GET /ships` y `GET /ships/:id` devuelven la nave con su capitan incrustado; `GET /captains/:id` devuelve el capitan con sus naves. `POST /ships` valida que `captainId` exista antes de crear.

## Como ejecutar

```bash
npm install
npm start
```

## Como probar

```bash
curl http://localhost:4013/captains
curl http://localhost:4013/captains/1
curl http://localhost:4013/ships
curl http://localhost:4013/ships/3
curl -X POST http://localhost:4013/ships -H "Content-Type: application/json" -d "{\"name\":\"Nebulosa\",\"type\":\"crucero\",\"captainId\":2}"
curl -X POST http://localhost:4013/captains -H "Content-Type: application/json" -d "{\"name\":\"Zoe Marek\",\"rank\":\"teniente\"}"
```

## Como probar los casos de error

```bash
curl http://localhost:4013/captains/99
curl http://localhost:4013/ships/abc
curl -X POST http://localhost:4013/ships -H "Content-Type: application/json" -d "{\"name\":\"Fantasma\",\"type\":\"caza\",\"captainId\":99}"
curl -X POST http://localhost:4013/ships -H "Content-Type: application/json" -d "{\"name\":\"Fantasma\",\"type\":\"invalido\",\"captainId\":1}"
```

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/captains.routes.js
├── routes/ships.routes.js
├── controllers/captains.controller.js
├── controllers/ships.controller.js
├── services/captains.service.js
└── services/ships.service.js
```
