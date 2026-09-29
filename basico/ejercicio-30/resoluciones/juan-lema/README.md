# Proyecto integrador basico - Taller de motos (Juan Lema)

API REST para gestionar ordenes de trabajo de un taller de motos. Cierra el nivel basico integrando: arquitectura por capas, CRUD, datos en memoria, validacion, errores personalizados con codigos de estado, middleware de logs, manejo central de errores y configuracion por entorno.

## Requisitos

- Node.js 20 o superior.

## Instalacion y ejecucion

```bash
npm install
npm start
```

Con recarga automatica:

```bash
npm run dev
```

## Variables de entorno

| Variable | Obligatoria | Default | Descripcion |
|---|---|---|---|
| `PORT` | No | `3030` | Puerto del servidor. |
| `NODE_ENV` | No | `development` | `development` \| `production` \| `test`. Controla el nivel de log. |

## Endpoints

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/health` | Estado de la API. |
| GET | `/orders` | Lista todas las ordenes. |
| GET | `/orders/:id` | Obtiene una orden por id. |
| POST | `/orders` | Crea una orden (status inicial `pendiente`). |
| PATCH | `/orders/:id/status` | Cambia el status de una orden. |
| DELETE | `/orders/:id` | Elimina una orden. |

### POST /orders

Body:

```json
{ "moto": "Suzuki GN 125", "problema": "cadena floja" }
```

Respuesta `201` (incluye header `Location`):

```json
{ "ok": true, "data": { "id": 3, "moto": "Suzuki GN 125", "problema": "cadena floja", "status": "pendiente" } }
```

### PATCH /orders/:id/status

Body:

```json
{ "status": "en_proceso" }
```

`status` valido: `pendiente`, `en_proceso`, `finalizado`.

## Codigos de estado usados

| Codigo | Cuando |
|---|---|
| 200 | Consulta u operacion exitosa. |
| 201 | Orden creada. |
| 204 | Orden eliminada. |
| 400 | Datos invalidos (id no numerico, campos faltantes, status invalido). |
| 404 | Orden no encontrada. |
| 409 | Se intenta cambiar el status de una orden ya `finalizada`. |
| 500 | Error no controlado (capturado por el middleware central de errores). |

Formato de error, siempre igual:

```json
{ "ok": false, "message": "descripcion del error" }
```

## Como probar

```bash
curl http://localhost:3030/health
curl http://localhost:3030/orders
curl -X POST http://localhost:3030/orders -H "Content-Type: application/json" -d "{\"moto\":\"Suzuki GN 125\",\"problema\":\"cadena floja\"}"
curl -X PATCH http://localhost:3030/orders/1/status -H "Content-Type: application/json" -d "{\"status\":\"en_proceso\"}"
curl -X DELETE http://localhost:3030/orders/2
```

Caso de error (orden finalizada no se puede modificar):

```bash
curl -X PATCH http://localhost:3030/orders/1/status -H "Content-Type: application/json" -d "{\"status\":\"finalizado\"}"
curl -X PATCH http://localhost:3030/orders/1/status -H "Content-Type: application/json" -d "{\"status\":\"pendiente\"}"
```

## Estructura

```text
src/
├── app.js
├── server.js
├── config/
│   └── index.js
├── middlewares/
│   ├── request-logger.js
│   └── error-handler.js
├── routes/
│   ├── index.js
│   └── orders.routes.js
├── controllers/
│   └── orders.controller.js
└── services/
    └── orders.service.js
```

## Notas

- Datos en memoria: se reinician al reiniciar el servidor.
- Con `NODE_ENV=production` se silencian los logs de request.
