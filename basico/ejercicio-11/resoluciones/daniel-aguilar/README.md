# Ejercicio 11 — Promesas básicas

**Temática:** música · **Nivel:** Básico inicial

## Objetivo

Crear y consumir promesas con `new Promise`, `.then`, `.catch`, `.finally`, `Promise.all` y `Promise.allSettled`, **sin** usar `async/await` (eso se practica en el ejercicio 12).

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
ejercicio-11/
├── package.json
├── README.md
├── src/
│   ├── app.js
│   ├── server.js
│   ├── routes/index.js
│   ├── controllers/music.controller.js
│   └── services/music.service.js
└── test/app.test.js
```

## Endpoints

| Método | Ruta | Descripción | Promesa usada | Códigos |
| --- | --- | --- | --- | --- |
| GET | `/health` | Estado del servicio | — | 200 |
| GET | `/basico/ejercicio-11` | Endpoint principal | — | 200 |
| GET | `/albums/:id` | Álbum con su artista | `.then` encadenado | 200, 400, 404 |
| GET | `/summary` | Totales del catálogo | `Promise.all` | 200 |
| GET | `/albums/batch?ids=1,2,99` | Varios álbumes, cada uno con su resultado | `Promise.allSettled` | 200, 400 |
| GET | `/stats` | Cantidad de consultas realizadas | `.finally` | 200 |

## Ejemplos

```bash
curl http://localhost:3000/albums/1
curl -i http://localhost:3000/albums/99
curl http://localhost:3000/summary
curl "http://localhost:3000/albums/batch?ids=1,99,3"
```

Respuesta de `/albums/batch?ids=1,99,3`:

```json
{
  "ok": true,
  "results": [
    { "id": 1, "status": "ok", "album": { "id": 1, "title": "Noches de Neon", "artistId": 2, "year": 2022 } },
    { "id": 99, "status": "error", "message": "Album con id 99 no existe" },
    { "id": 3, "status": "ok", "album": { "id": 3, "title": "Raices", "artistId": 3, "year": 2021 } }
  ]
}
```

## Cuándo usar cada una

| Herramienta | Comportamiento |
| --- | --- |
| `.then()` | Se ejecuta si la promesa se cumple; su valor de retorno alimenta al siguiente `.then` |
| `.catch()` | Se ejecuta si alguna promesa anterior de la cadena se rechaza |
| `.finally()` | Se ejecuta siempre, útil para limpieza o contadores |
| `Promise.all` | Paralelo; falla en cuanto una falla |
| `Promise.allSettled` | Paralelo; nunca falla, informa el resultado de cada una |

## Errores manejados

- `400` si el id o la lista de ids es inválida.
- `404` cuando una promesa se rechaza porque el álbum o artista no existe.

## Pruebas

```bash
npm test
```
