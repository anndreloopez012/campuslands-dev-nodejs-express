# Ejercicio 24 - CRUD basico (Juan Lema)

## Que hace

Tematica formulas quimicas. CRUD completo sobre `/compounds` (en memoria): `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`.

## Como ejecutar

```bash
npm install
npm start
```

## Como probar

```bash
curl http://localhost:3024/compounds
curl http://localhost:3024/compounds/1
curl -X POST http://localhost:3024/compounds -H "Content-Type: application/json" -d "{\"name\":\"Sal comun\",\"formula\":\"NaCl\"}"
curl -X PUT http://localhost:3024/compounds/1 -H "Content-Type: application/json" -d "{\"name\":\"Agua destilada\",\"formula\":\"H2O\"}"
curl -X DELETE http://localhost:3024/compounds/2
```

## Como probar los casos de error

```bash
curl http://localhost:3024/compounds/99
curl -X PUT http://localhost:3024/compounds/99 -H "Content-Type: application/json" -d "{\"name\":\"X\",\"formula\":\"Y\"}"
curl -X POST http://localhost:3024/compounds -H "Content-Type: application/json" -d "{\"name\":\"Sal\"}"
```

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/
│   └── compounds.routes.js
├── controllers/
│   └── compounds.controller.js
└── services/
    └── compounds.service.js
```
