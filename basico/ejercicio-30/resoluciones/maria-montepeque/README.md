# Taller Moto API

Proyecto integrador del nivel basico. API REST para un taller de motos:
registro de motos, catalogo de servicios con precios y ordenes de trabajo con
maquina de estados y factura. Construida solo con Node.js nativo
(`node:http`, `node:fs`, `node:crypto`, `node:test`), sin dependencias.

## Que integra

| Ejercicio | Concepto                    | Donde se aplica aqui                                              |
| --------- | --------------------------- | ----------------------------------------------------------------- |
| 05, 09    | fs y persistencia JSON      | `core/store.js`: carga `data/seed.json`, guarda en `data/db.json` |
| 12, 13    | async/await y errores       | `core/errors.js` (`HttpError`) y manejo central en `app.js`       |
| 14        | validacion de entrada       | `core/validate.js` con esquemas por modulo                        |
| 15-19     | servidor, rutas, params     | `core/router.js` con routers montables y `:params`                |
| 20        | middleware json             | `middlewares/json-body.js` con limite (413) y 415                 |
| 21, 22    | capas y servicios           | `modules/*/` (routes + service), servicios sin `req`/`res`        |
| 23, 24    | datos en memoria y CRUD     | colecciones del store; CRUD de motos                              |
| 25, 26    | respuestas y codigos HTTP   | `core/reply.js`: problem+json, ETag/304, 201+Location, 405+Allow  |
| 27        | logs                        | `core/logger.js` + `middlewares/request-context.js`               |
| 28        | configuracion por entorno   | `config/index.js` con esquema y defaults por entorno              |
| 29        | README tecnico              | este documento y `docs/api.http`                                  |

## Requisitos

Node.js 20 o superior (probado con 24). Sin base de datos externa.

## Instalacion y ejecucion

```bash
npm install
npm start
```

| Script               | Descripcion                                                     |
| -------------------- | --------------------------------------------------------------- |
| `npm start`          | Servidor en `http://localhost:3030` (entorno development)       |
| `npm run dev`        | Igual, con recarga automatica                                   |
| `npm run start:prod` | Entorno production: logs JSON nivel info, sin rutas de debug    |
| `npm test`           | Pruebas unitarias del servicio de ordenes (`node:test`)         |
| `npm run db:reset`   | Restaura `data/db.json` desde `data/seed.json`                  |

Al arrancar por primera vez se crea `data/db.json` a partir de la semilla.
Ese archivo esta ignorado por git; cada cambio en la API se guarda en el.

## Configuracion

Variables de entorno (opcionalmente en un `.env`, cargado con
`--env-file-if-exists`):

| Variable               | Default dev  | Default prod | Descripcion                          |
| ---------------------- | ------------ | ------------ | ------------------------------------ |
| `PORT`                 | 3030         | 3030         | Puerto                               |
| `DATA_FILE`            | data/db.json | data/db.json | Archivo de persistencia              |
| `LOG_LEVEL`            | debug        | info         | debug, info, warn, error             |
| `LOG_FORMAT`           | pretty       | json         | Formato de los logs                  |
| `LABOR_RATE_PER_HOUR`  | 45000        | 45000        | Tarifa de mano de obra por hora      |
| `BODY_LIMIT_KB`        | 16           | 16           | Tamano maximo del body JSON          |
| `FEATURE_DEBUG_ROUTES` | true         | false        | Expone `GET /debug/config`           |

El entorno se elige con `--env=production` o `NODE_ENV`.

## Arquitectura

```text
src/
├── server.js                 carga config, logger y store; arranca http
├── app.js                    contexto de peticion -> router -> body JSON -> handler -> errores
├── config/index.js           esquema de configuracion por entorno
├── core/
│   ├── router.js             routers montables (use), :params, HEAD, Allow
│   ├── reply.js              ok, created, noContent, cached (ETag), problem
│   ├── errors.js             HttpError y atajos (notFound, conflict, ...)
│   ├── validate.js           validacion declarativa -> 422 con details
│   ├── store.js              colecciones en memoria persistidas en JSON
│   └── logger.js             niveles, formatos, child loggers
├── middlewares/
│   ├── request-context.js    X-Request-Id, logger por peticion, tiempo de respuesta
│   └── json-body.js          415, 413, 400
└── modules/
    ├── motorcycles/          CRUD de motos (placa unica)
    ├── work-orders/          ordenes con maquina de estados y factura
    └── catalog/              servicios con precio calculado
data/seed.json                datos iniciales (versionado)
docs/api.http                 peticiones para REST Client
```

## Modelo de dominio

**Motorcycle**: `plate` (unica, formato `AAA123`/`AAA12B`), `brand`, `model`,
`year`, `mileageKm`, `ownerName`.

**Service** (catalogo): `code`, `name`, `hours`, `partsCost`. El precio se
calcula como `hours * LABOR_RATE_PER_HOUR + partsCost`.

**WorkOrder**: `motorcycleId`, `serviceCodes[]`, `complaint`, `status`,
`history[]`. Estados y transiciones:

```text
received -> diagnosing -> in_repair -> ready -> delivered
    \            \
     -> cancelled -> cancelled
```

Reglas: una moto solo puede tener una orden abierta; la factura solo existe
en `ready` o `delivered`; no se elimina una moto con ordenes abiertas.

## Referencia de la API

| Metodo | Ruta                              | Descripcion                       | Codigos                     |
| ------ | --------------------------------- | --------------------------------- | --------------------------- |
| GET    | `/health`                         | Estado                            | 200                         |
| GET    | `/`                               | Mapa de rutas de `/api`           | 200, 304                    |
| GET    | `/api/catalog/services`           | Catalogo con precios              | 200, 304                    |
| GET    | `/api/catalog/services/:code`     | Un servicio                       | 200, 304, 404               |
| GET    | `/api/motorcycles`                | Lista (`?brand=Honda`)            | 200, 304                    |
| POST   | `/api/motorcycles`                | Registra una moto                 | 201, 400, 409, 413, 415, 422 |
| GET    | `/api/motorcycles/:id`            | Detalle                           | 200, 304, 404               |
| PATCH  | `/api/motorcycles/:id`            | Actualizacion parcial             | 200, 400, 404, 409, 422     |
| DELETE | `/api/motorcycles/:id`            | Elimina                           | 204, 404, 409               |
| GET    | `/api/work-orders`                | Lista (`?status=received`)        | 200                         |
| GET    | `/api/work-orders/transitions`    | Tabla de transiciones             | 200, 304                    |
| POST   | `/api/work-orders`                | Crea una orden                    | 201, 404, 409, 422          |
| GET    | `/api/work-orders/:id`            | Detalle con historial             | 200, 404                    |
| PATCH  | `/api/work-orders/:id/status`     | Cambia el estado                  | 200, 404, 409, 422          |
| GET    | `/api/work-orders/:id/invoice`    | Factura                           | 200, 404, 409               |
| GET    | `/debug/config`                   | Config efectiva (solo dev)        | 200                         |

Cualquier ruta con metodo no soportado responde 405 con `Allow`.

### POST /api/work-orders

```json
{ "motorcycleId": 1, "serviceCodes": ["OIL", "BRK"], "complaint": "frena mal y suena" }
```

Respuesta 201 (`Location: /api/work-orders/2`):

```json
{ "ok": true, "data": { "id": 2, "motorcycleId": 1, "serviceCodes": ["OIL", "BRK"], "complaint": "frena mal y suena", "status": "received", "history": [{ "status": "received", "at": "..." }], "createdAt": "..." } }
```

### GET /api/work-orders/:id/invoice

```json
{ "ok": true, "data": { "orderId": 2, "motorcycle": "ABC123", "laborRate": 45000, "lines": [ { "code": "OIL", "name": "Cambio de aceite y filtro", "labor": 22500, "parts": 65000, "total": 87500 } ], "subtotal": 222500, "tax": 42275, "total": 264775 } }
```

## Errores

Formato `application/problem+json`:

```json
{ "ok": false, "status": 422, "title": "Unprocessable Content", "detail": "Datos invalidos", "instance": "/api/motorcycles", "details": [ { "field": "plate", "message": "formato de placa AAA123 o AAA12B" } ] }
```

| Codigo | Cuando                                                          |
| ------ | --------------------------------------------------------------- |
| 400    | JSON malformado, body vacio, PATCH sin campos                   |
| 404    | Ruta, moto, orden o servicio inexistente                        |
| 405    | Metodo no permitido (cabecera `Allow`)                          |
| 409    | Placa duplicada, orden abierta duplicada, transicion invalida, factura antes de tiempo, borrar moto con ordenes |
| 413    | Body mayor a `BODY_LIMIT_KB`                                    |
| 415    | POST/PATCH sin `Content-Type: application/json`                 |
| 422    | Campos invalidos o servicios desconocidos (`details` por campo) |
| 500    | Error no controlado (se registra con `reqId`)                   |

## Pruebas

```bash
npm test
```

Cinco pruebas sobre el servicio de ordenes usando un store temporal. Las
pruebas manuales estan en `docs/api.http` y en la seccion de comandos del
PR.

## Decisiones tecnicas

- **Sin Express**: el enrutador y los middlewares propios suman menos de 150
  lineas y hacen visible lo que un framework esconde.
- **Persistencia en JSON con escritura diferida** (50 ms): suficiente para un
  taller pequeno; evita escribir en disco por cada cambio consecutivo.
- **Maquina de estados explicita** (`TRANSITIONS`): las reglas de negocio se
  leen en una tabla y se exponen en `/api/work-orders/transitions`.
- **Precio calculado, no almacenado**: cambiar `LABOR_RATE_PER_HOUR` actualiza
  el catalogo y las facturas nuevas sin migrar datos.
- **problem+json**: un solo formato de error para toda la API.

## Limitaciones y siguientes pasos

- Un solo proceso: el archivo JSON no soporta escrituras concurrentes.
- Sin autenticacion ni roles (mecanico / recepcion).
- Sin paginacion; suficiente para decenas de registros.
- Siguiente nivel: base de datos real, autenticacion y pruebas de integracion HTTP.
