# Ejercicio 17 — Rutas GET

**Temática:** viajes y turismo · **Nivel:** Básico inicial

## Objetivo

Definir rutas `GET` con Express: colección, recurso por id, rutas anidadas y el **orden** en que se declaran. Se usa `Router` para agrupar las rutas de un mismo recurso.

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
ejercicio-17/
├── package.json
├── README.md
├── src/
│   ├── app.js
│   ├── server.js
│   ├── data/destinations.js
│   ├── routes/
│   │   ├── index.js                   # rutas generales y montaje de routers
│   │   └── destinations.routes.js     # Router de /destinations
│   └── controllers/destinations.controller.js
└── test/app.test.js
```

## Endpoints

| Método | Ruta | Descripción | Códigos |
| --- | --- | --- | --- |
| GET | `/health` | Estado del servicio | 200 |
| GET | `/basico/ejercicio-17` | Endpoint principal | 200 |
| GET | `/destinations` | Todos los destinos | 200 |
| GET | `/destinations/featured` | Solo destinos destacados | 200 |
| GET | `/destinations/:id` | Un destino por id | 200, 400, 404 |
| GET | `/countries/:country/destinations` | Destinos de un país | 200, 404 |

## Ejemplos

```bash
curl http://localhost:3000/destinations
curl http://localhost:3000/destinations/featured
curl http://localhost:3000/destinations/3
curl http://localhost:3000/countries/guatemala/destinations
curl -i http://localhost:3000/destinations/99            # 404
curl -i http://localhost:3000/destinations/abc           # 400
```

## Conceptos aplicados

- **Orden de las rutas:** Express evalúa en el orden declarado. `/destinations/featured` debe ir antes de `/destinations/:id`; de lo contrario `featured` se interpretaría como un id (y devolvería 400).
- **`Router` + `app.use('/prefijo', router)`:** agrupa rutas de un recurso; dentro del router las rutas son relativas al prefijo.
- **Parámetros de ruta:** `/:id` y `/countries/:country/...`; llegan como texto y se validan antes de usarlos.
- **Códigos coherentes:** `200` encontrado, `400` parámetro mal formado, `404` no existe.

## Pruebas

```bash
npm test
```
