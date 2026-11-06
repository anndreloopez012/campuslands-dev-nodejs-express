# Ejercicio 18 - rutas POST (Juan Lema)

## Que hace

Tematica paracaidismo. `POST /jumps` registra un salto (`diverName`, `altitude`) validando el body con `express.json()`; `GET /jumps` lista los registrados en memoria.

## Como ejecutar

```bash
npm install
npm start
```

## Como probar

```bash
curl -X POST http://localhost:3018/jumps -H "Content-Type: application/json" -d "{\"diverName\":\"Nico\",\"altitude\":4000}"
curl http://localhost:3018/jumps
```

## Como probar el caso de error

```bash
curl -X POST http://localhost:3018/jumps -H "Content-Type: application/json" -d "{\"diverName\":\"Nico\"}"
```

Debe responder 400 con `altitude debe ser un numero mayor a 0`.

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/
│   └── jumps.routes.js
├── controllers/
│   └── jumps.controller.js
└── services/
    └── jumps.service.js
```
