# Ejercicio 04 — Módulos ES Modules

**Temática:** battle royale · **Nivel:** Básico inicial

## Objetivo

Practicar **ES Modules** (`import` / `export`) en Node.js con una API de mapas de battle royale.

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

## Cómo se activa ES Modules

`package.json` se declara `"type": "module"`. Con eso los archivos `.js` se tratan como ES Modules.

| Concepto | Dónde se ve |
| --- | --- |
| Export con nombre | `services/maps.service.js` (`export function listMaps`) |
| Import con nombre | `import { readFile } from 'node:fs/promises'` |
| Import de todo el módulo | `import * as mapsService from '../services/maps.service.js'` |
| Export por defecto | `routes/index.js` y `app.js` (`export default`) |
| Extensión obligatoria | Todos los imports locales terminan en `.js` |
| Sustituto de `__dirname` | `new URL('../data/maps.json', import.meta.url)` |

## Estructura

```text
ejercicio-04/
├── package.json
├── README.md
├── src/
│   ├── app.js
│   ├── server.js
│   ├── data/maps.json
│   ├── routes/index.js
│   ├── controllers/maps.controller.js
│   └── services/maps.service.js
└── test/app.test.js
```

## Endpoints

| Método | Ruta | Descripción | Códigos |
| --- | --- | --- | --- |
| GET | `/health` | Estado del servicio | 200 |
| GET | `/basico/ejercicio-04` | Endpoint principal | 200 |
| GET | `/maps` | Lista de mapas | 200 |
| GET | `/maps/:id` | Detalle de un mapa | 200, 400, 404 |

## Ejemplos

```bash
curl http://localhost:3000/basico/ejercicio-04
curl http://localhost:3000/maps
curl http://localhost:3000/maps/2
curl -i http://localhost:3000/maps/99    # 404
```

## Errores manejados

- `400` si el `id` no es un entero positivo.
- `404` si el mapa o la ruta no existen.
- `500` genérico (sin filtrar detalles) ante errores inesperados.

## Pruebas

```bash
npm test
```
