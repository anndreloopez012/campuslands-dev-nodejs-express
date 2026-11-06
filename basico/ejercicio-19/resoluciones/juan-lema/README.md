# Ejercicio 19 - req.params y req.query (Juan Lema)

## Que hace

Tematica tatuajes. `GET /artists/:artistId/designs` usa `req.params.artistId` para filtrar por artista y `req.query` (`style`, `minPrice`, `maxPrice`) para filtrar diseños.

## Como ejecutar

```bash
npm install
npm start
```

## Como probar

```bash
curl "http://localhost:3019/artists/1/designs"
curl "http://localhost:3019/artists/1/designs?style=realismo"
curl "http://localhost:3019/artists/1/designs?minPrice=150&maxPrice=300"
```

## Como probar el caso de error

```bash
curl "http://localhost:3019/artists/abc/designs"
curl "http://localhost:3019/artists/1/designs?minPrice=xyz"
```

Ambos deben responder 400.

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/
│   └── designs.routes.js
├── controllers/
│   └── designs.controller.js
├── services/
│   └── designs.service.js
└── data/
    └── designs.json
```
