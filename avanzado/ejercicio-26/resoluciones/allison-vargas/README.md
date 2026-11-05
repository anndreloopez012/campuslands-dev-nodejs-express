# Fixtures y factories para shooters

API de partidas competitivas con factories configurables y fixtures reproducibles. Cada aplicación recibe una copia independiente de los datos semilla.

## Uso

```bash
npm install
npm start
```

El servidor usa `PORT` o el puerto `3000`.

## Rutas

- `GET /health`
- `GET /api/matches?map=Ascent`
- `POST /api/matches` con `map`, `players` y `winner`
- `GET /api/matches/:id`

```bash
curl http://localhost:3000/api/matches
curl -X POST http://localhost:3000/api/matches -H "Content-Type: application/json" -d '{"map":"Ascent","players":["Ada","Lin"],"winner":"Ada"}'
```

Los identificadores son deterministas durante la inicialización para hacer fixtures estables. Las nuevas partidas reciben identificadores secuenciales.
