# Ejercicio 19 – req.params y req.query

**Autor:** Anderson Oloroso  
**Tema:** Tatuajes

## Descripción

API Express que combina `req.params` y `req.query` para consultar diseños de tatuajes por artista, con filtros de estilo y precio.

## Ejecución

```bash
npm install
npm start
```

## Endpoints

```bash
# Diseños del artista 1
curl http://localhost:3019/artists/1/designs

# Filtrar por estilo
curl "http://localhost:3019/artists/1/designs?style=japanese"

# Filtrar por rango de precio
curl "http://localhost:3019/artists/1/designs?minPrice=200&maxPrice=300"

# artistId no numérico → 400
curl http://localhost:3019/artists/abc/designs

# Artista sin diseños → 404
curl http://localhost:3019/artists/99/designs
```

## Estructura

```
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── server.js
    ├── data/
    │   └── designs.json
    ├── controllers/
    │   └── designs.controller.js
    ├── routes/
    │   └── designs.routes.js
    └── services/
        └── designs.service.js
```
