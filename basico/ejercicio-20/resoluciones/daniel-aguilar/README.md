# Ejercicio 20 — Middleware y `express.json`

**Temática:** dibujo digital · **Nivel:** Básico inicial

## Objetivo

Entender qué es un **middleware** (una función `(req, res, next)` que corre antes de las rutas), por qué su **orden** importa y cómo `express.json()` convierte el cuerpo de la petición en `req.body`.

## Requisitos

- Node.js 20 o superior

## Instalación y ejecución

```bash
npm install
npm start
npm run dev
npm test
```

Servidor en `http://localhost:3000` (configurable con `PORT`).

## Estructura

```text
ejercicio-20/
├── package.json
├── README.md
├── src/
│   ├── app.js                         # aquí se registra el orden de los middlewares
│   ├── server.js
│   ├── middlewares/
│   │   ├── trace.js                   # registra por qué middlewares pasó la petición
│   │   ├── request-id.js              # agrega X-Request-Id
│   │   └── require-json.js            # exige Content-Type: application/json
│   ├── routes/index.js
│   └── controllers/brushes.controller.js
└── test/app.test.js
```

## Cadena de middlewares (en orden)

| # | Middleware | Qué hace |
| --- | --- | --- |
| 1 | `trace('1. inicio')` | Marca el paso por el inicio |
| 2 | `requestId` | Crea `req.id` y la cabecera `X-Request-Id` |
| 3 | `requireJson` | `415` si un `POST/PUT/PATCH` no es `application/json` |
| 4 | `express.json({ limit: '1kb' })` | Parsea el cuerpo a `req.body`; `413` si supera 1 KB |
| 5 | `trace('2. despues de express.json')` | Marca el paso posterior |
| 6 | Rutas | Controladores |
| 7 | 404 | Ruta no encontrada |
| 8 | Middleware de errores | Convierte errores del parser en `400` / `413` |

Si `requireJson` se registrara **después** de `express.json`, el orden cambiaría y la validación dejaría de proteger al parser. El endpoint `/middleware-order` muestra el recorrido real.

## Endpoints

| Método | Ruta | Descripción | Códigos |
| --- | --- | --- | --- |
| GET | `/health` | Estado del servicio | 200 |
| GET | `/basico/ejercicio-20` | Endpoint principal | 200 |
| GET | `/middleware-order` | Devuelve el orden de ejecución de los middlewares | 200 |
| POST | `/echo` | Devuelve lo que `express.json` dejó en `req.body` | 200, 400, 413, 415 |
| GET | `/brushes` | Lista de pinceles | 200 |
| POST | `/brushes` | Crea un pincel | 201, 400, 413, 415 |

Cuerpo de `POST /brushes`: `name` (2–40 caracteres), `sizePx` (entero 1–500), `opacity` (0–1) y `color` (`#rrggbb`).

## Ejemplos

```bash
curl -i http://localhost:3000/middleware-order

curl -X POST http://localhost:3000/echo \
  -H "Content-Type: application/json" \
  -d '{"nombre":"pincel","valores":[1,2]}'

curl -i -X POST http://localhost:3000/brushes \
  -H "Content-Type: application/json" \
  -d '{"name":"Carboncillo","sizePx":12,"opacity":0.6,"color":"#333333"}'

curl -i -X POST http://localhost:3000/echo -H "Content-Type: text/plain" -d 'hola'   # 415
curl -i -X POST http://localhost:3000/echo -H "Content-Type: application/json" -d '{roto'  # 400
```

## Errores manejados

| Caso | Código |
| --- | --- |
| JSON mal formado (`entity.parse.failed`) | 400 |
| Cuerpo mayor al límite (`entity.too.large`) | 413 |
| `Content-Type` distinto de JSON en `POST/PUT/PATCH` | 415 |
| Datos inválidos en `/brushes` | 400 |

## Pruebas

```bash
npm test
```
