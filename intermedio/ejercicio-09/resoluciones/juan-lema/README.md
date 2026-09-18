# Ejercicio 09 - paginacion y filtros (Juan Lema)

## Que hace

Tematica kickboxing. `GET /fighters` soporta `page`, `limit` y filtro `weightClass`. `fighters.service.js` filtra primero y despues pagina, devolviendo `data`, `page`, `limit`, `total` y `totalPages`.

## Como ejecutar

```bash
npm install
npm start
```

## Como probar

```bash
curl "http://localhost:4009/fighters"
curl "http://localhost:4009/fighters?page=2&limit=2"
curl "http://localhost:4009/fighters?weightClass=pesado"
curl http://localhost:4009/fighters/1
curl -X POST http://localhost:4009/fighters -H "Content-Type: application/json" -d "{\"name\":\"Leo Bravo\",\"weightClass\":\"medio\",\"wins\":5}"
```

## Como probar los casos de error

```bash
curl "http://localhost:4009/fighters?page=0"
curl "http://localhost:4009/fighters?weightClass=invalido"
curl http://localhost:4009/fighters/99
```

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/fighters.routes.js
├── controllers/fighters.controller.js
└── services/fighters.service.js
```
