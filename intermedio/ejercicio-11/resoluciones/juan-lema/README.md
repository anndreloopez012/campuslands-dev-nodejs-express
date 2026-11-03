# Ejercicio 11 - busqueda textual (Juan Lema)

## Que hace

Tematica musica. `GET /songs?q=texto` busca en `title`, `artist` y `genre` ignorando mayusculas y acentos. Si `q` tiene varias palabras, todas deben aparecer (AND). Sin `q` devuelve todo el catalogo.

## Como ejecutar

```bash
npm install
npm start
```

## Como probar

```bash
curl "http://localhost:4011/songs"
curl "http://localhost:4011/songs?q=rock"
curl "http://localhost:4011/songs?q=corazon%20salsa"
curl http://localhost:4011/songs/1
curl -X POST http://localhost:4011/songs -H "Content-Type: application/json" -d "{\"title\":\"Luz de Luna\",\"artist\":\"Andrea Mora\",\"genre\":\"Pop\"}"
```

## Como probar los casos de error

```bash
curl "http://localhost:4011/songs?q=a"
curl http://localhost:4011/songs/99
curl http://localhost:4011/songs/abc
```

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/songs.routes.js
├── controllers/songs.controller.js
└── services/songs.service.js
```
