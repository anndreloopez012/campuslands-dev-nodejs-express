# Ejercicio 15 — Mini API HTTP nativa

**Temática:** comida urbana · **Nivel:** Básico inicial

## Objetivo

Construir una API **sin Express**, usando solo el módulo `http` de Node.js. Sirve para entender qué hace Express por debajo: enrutar, leer parámetros y el cuerpo, enviar JSON y manejar errores.

## Requisitos

- Node.js 20 o superior
- No tiene dependencias externas: no hace falta `npm install` (pero es inofensivo ejecutarlo)

## Instalación y ejecución

```bash
npm start
npm run dev
npm test
```

Servidor en `http://localhost:3000` (configurable con `PORT`).

## Estructura

```text
ejercicio-15/
├── package.json
├── README.md
├── src/
│   ├── app.js                       # http.createServer + manejo de errores
│   ├── server.js
│   ├── utils/http.js                # sendJson y readJsonBody
│   ├── routes/index.js              # tabla de rutas y matching de parámetros
│   ├── controllers/dishes.controller.js
│   └── services/dishes.service.js
└── test/app.test.js
```

## Endpoints

| Método | Ruta | Descripción | Códigos |
| --- | --- | --- | --- |
| GET | `/health` | Estado del servicio | 200 |
| GET | `/basico/ejercicio-15` | Endpoint principal | 200 |
| GET | `/dishes?type=taco` | Lista de platillos, filtro opcional | 200, 400 |
| GET | `/dishes/:id` | Detalle | 200, 400, 404 |
| POST | `/dishes` | Crea un platillo | 201, 400, 413, 415 |

Tipos válidos: `taco`, `hotdog`, `snack`, `bebida`, `postre`.

## Ejemplos

```bash
curl http://localhost:3000/dishes
curl "http://localhost:3000/dishes?type=taco"
curl http://localhost:3000/dishes/2

curl -i -X POST http://localhost:3000/dishes \
  -H "Content-Type: application/json" \
  -d '{"name":"Churros","type":"postre","price":1.8}'

curl -i -X DELETE http://localhost:3000/dishes/1     # 405 con cabecera Allow: GET
curl -i -X POST http://localhost:3000/dishes -d 'hola'   # 415
```

## Qué reemplaza a Express aquí

| Express | En este ejercicio |
| --- | --- |
| `app.get('/dishes/:id', fn)` | Tabla `routes` + `compile()` + `match()` en `routes/index.js` |
| `req.params` | Se extraen con una expresión regular generada desde la ruta |
| `req.query` | `new URL(req.url, base).searchParams` |
| `express.json()` | `readJsonBody(req)`: junta los *chunks*, limita el tamaño (100 KB) y parsea |
| `res.status(201).json(obj)` | `sendJson(res, 201, obj)` con `Content-Type` y `Content-Length` |
| Middleware de errores | `try/catch` único en `app.js` |

## Errores manejados

| Caso | Código |
| --- | --- |
| JSON mal formado o datos inválidos | 400 |
| Ruta desconocida | 404 |
| Método no permitido para una ruta existente (incluye cabecera `Allow`) | 405 |
| Cuerpo mayor a 100 KB | 413 |
| `Content-Type` distinto de `application/json` | 415 |
| Error inesperado | 500 |

## Pruebas

```bash
npm test
```
