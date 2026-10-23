# Ejercicio 04 - servicios reutilizables (Juan Lema)

## Que hace

Tematica battle royale. `services/players.service.js` es el unico dueno de los datos y se reutiliza desde dos controladores distintos: `players.controller.js` (CRUD basico) y `squads.controller.js`, que llama a `listPlayers()` para agrupar y calcular estadisticas por escuadra sin duplicar acceso a datos.

## Como ejecutar

```bash
npm install
npm start
```

## Como probar

```bash
curl http://localhost:4004/players
curl http://localhost:4004/players/1
curl -X POST http://localhost:4004/players -H "Content-Type: application/json" -d "{\"nickname\":\"Wren\",\"squad\":\"Coyotes\",\"kills\":3}"
curl http://localhost:4004/squads
```

## Como probar los casos de error

```bash
curl http://localhost:4004/players/99
curl http://localhost:4004/players/abc
curl -X POST http://localhost:4004/players -H "Content-Type: application/json" -d "{\"nickname\":\"\"}"
```

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/players.routes.js
├── routes/squads.routes.js
├── controllers/players.controller.js
├── controllers/squads.controller.js
└── services/players.service.js
```
