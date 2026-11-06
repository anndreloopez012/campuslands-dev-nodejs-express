# Ejercicio 26 - codigos de estado (Juan Lema)

## Que hace

Tematica shooters competitivos. `/matches` (lobbies) demuestra un amplio rango de codigos HTTP:

- `200` listar/consultar/unirse con exito.
- `201` crear partida.
- `204` eliminar partida.
- `400` id o body invalidos.
- `401` falta header `x-player-name` al unirse.
- `404` partida no encontrada.
- `409` partida llena (conflicto).
- `422` `maxPlayers` invalido segun regla de negocio.
- `500` error no controlado, capturado por el middleware central de errores (`GET /matches/debug/crash`).

## Como ejecutar

```bash
npm install
npm start
```

## Como probar

```bash
curl -w " [%{http_code}]\n" http://localhost:3026/matches
curl -w " [%{http_code}]\n" -X POST http://localhost:3026/matches -H "Content-Type: application/json" -d "{\"name\":\"Scrim\",\"maxPlayers\":2}"
curl -w " [%{http_code}]\n" -X POST http://localhost:3026/matches/1/join -H "x-player-name: Kilo"
curl -w " [%{http_code}]\n" -X POST http://localhost:3026/matches/1/join
curl -w " [%{http_code}]\n" -X POST http://localhost:3026/matches -H "Content-Type: application/json" -d "{\"name\":\"Duo\",\"maxPlayers\":1}"
curl -w " [%{http_code}]\n" http://localhost:3026/matches/debug/crash
curl -w " [%{http_code}]\n" -X DELETE http://localhost:3026/matches/1
```

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/
│   └── matches.routes.js
├── controllers/
│   └── matches.controller.js
├── services/
│   └── matches.service.js
└── middlewares/
    └── error-handler.js
```
