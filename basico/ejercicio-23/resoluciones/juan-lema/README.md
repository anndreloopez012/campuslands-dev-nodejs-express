# Ejercicio 23 - datos en memoria (Juan Lema)

## Que hace

Tematica soldadura. `welds.service.js` guarda los registros en un arreglo de modulo (no en disco ni base de datos): `GET /welds` lista, `POST /welds` agrega, `DELETE /welds/:id` elimina. Los datos se pierden al reiniciar el servidor.

## Como ejecutar

```bash
npm install
npm start
```

## Como probar

```bash
curl http://localhost:3023/welds
curl -X POST http://localhost:3023/welds -H "Content-Type: application/json" -d "{\"material\":\"acero inoxidable\",\"technique\":\"arco electrico\"}"
curl -X DELETE http://localhost:3023/welds/1
```

## Como probar los casos de error

```bash
curl -X DELETE http://localhost:3023/welds/99
curl -X POST http://localhost:3023/welds -H "Content-Type: application/json" -d "{\"material\":\"acero\"}"
```

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/
│   └── welds.routes.js
├── controllers/
│   └── welds.controller.js
└── services/
    └── welds.service.js
```
