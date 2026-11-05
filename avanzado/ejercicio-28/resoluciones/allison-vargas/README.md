# Separación app y server

API de encuentros de battle royale. `app.js` configura Express y exporta una fábrica para pruebas; `server.js` es el único módulo que abre un puerto.

## Ejecución

```bash
npm install
npm test
npm start
```

El puerto se configura con `PORT` y por defecto es `3000`.

## Endpoints

- `GET /health`
- `GET /api/matches`
- `POST /api/matches` con `arena`, `teams` (dos equipos) y `winner`

```bash
curl -X POST http://localhost:3000/api/matches -H "Content-Type: application/json" -d '{"arena":"Isla Boreal","teams":["Squad A","Squad B"],"winner":"Squad A"}'
```

La aplicación no depende de un puerto y puede montarse dentro de un servidor HTTP administrado por otra herramienta.
