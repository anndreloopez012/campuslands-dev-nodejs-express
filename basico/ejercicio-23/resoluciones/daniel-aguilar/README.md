# Ejercicio 23 — Datos en memoria

**Temática:** soldadura · **Nivel:** Básico guiado

## Objetivo

Guardar datos en memoria con un **store** propio (sin base de datos): generar ids, consultar, insertar y calcular estadísticas, entendiendo que esos datos viven mientras el proceso esté activo.

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

> Los datos se pierden al reiniciar el servidor (con `npm run dev` también al guardar un archivo). Es lo esperado en este ejercicio; la persistencia en archivo se vio en el ejercicio 09.

## Estructura

```text
ejercicio-23/
├── package.json
├── README.md
├── src/
│   ├── app.js
│   ├── server.js
│   ├── routes/index.js
│   ├── controllers/welds.controller.js
│   ├── services/welds.service.js      # validaciones y estadísticas
│   └── store/welds.store.js           # los datos en memoria
└── test/app.test.js
```

## El store

| Función | Descripción |
| --- | --- |
| `all()` | Todas las soldaduras (copias) |
| `find(id)` | Una soldadura o `null` |
| `insert(data)` | Guarda y asigna el siguiente `id` |
| `reset()` | Vuelve a los datos iniciales |

- Una sola instancia (`store`) la comparten todas las peticiones: por eso lo creado con `POST` aparece en el siguiente `GET`.
- `structuredClone` evita que quien consulta modifique el almacén sin pasar por él.
- `createStore(seed)` es una fábrica: permite crear stores aislados, por ejemplo para pruebas.

## Endpoints

| Método | Ruta | Descripción | Códigos |
| --- | --- | --- | --- |
| GET | `/health` | Estado del servicio | 200 |
| GET | `/basico/ejercicio-23` | Endpoint principal | 200 |
| GET | `/welds?process=MIG&status=aprobada` | Lista con filtros opcionales | 200, 400 |
| GET | `/welds/stats` | Totales, conteo por proceso/estado y amperaje promedio | 200 |
| GET | `/welds/:id` | Detalle | 200, 400, 404 |
| POST | `/welds` | Registra una soldadura | 201, 400 |
| POST | `/admin/reset` | Restaura los datos iniciales (solo para practicar) | 200 |

Cuerpo de `POST /welds`: `process` (`MIG`, `TIG`, `MMA`, `FCAW`), `material`, `thicknessMm` (0–100), `amperage` (20–600) y `status` opcional (`pendiente` por defecto).

## Ejemplos

```bash
curl http://localhost:3000/welds
curl "http://localhost:3000/welds?process=MIG"
curl http://localhost:3000/welds/stats

curl -i -X POST http://localhost:3000/welds \
  -H "Content-Type: application/json" \
  -d '{"process":"FCAW","material":"acero","thicknessMm":8,"amperage":250}'

curl -X POST http://localhost:3000/admin/reset
```

## Pruebas

```bash
npm test
```
