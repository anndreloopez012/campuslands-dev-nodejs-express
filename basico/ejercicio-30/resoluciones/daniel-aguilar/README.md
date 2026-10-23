# Ejercicio 30 — Proyecto integrador básico

**Temática:** motos y mecánica · **Nivel:** Básico final

## Objetivo

Integrar lo practicado en los ejercicios anteriores en una sola API: **taller mecánico de motos** con motocicletas y órdenes de servicio. Combina arquitectura en capas, validación, manejo central de errores, códigos HTTP correctos, configuración por entorno y logs.

## Requisitos

- Node.js 20 o superior

## Instalación y ejecución

```bash
npm install
cp .env.example .env      # opcional (Windows: copy .env.example .env)
npm start                 # o: npm run dev (usa .env si existe y recarga al guardar)
npm test
```

Servidor en `http://localhost:3000`.

## Variables de entorno

| Variable | Por defecto | Descripción |
| --- | --- | --- |
| `PORT` | `3000` | Puerto del servidor (0–65535) |
| `NODE_ENV` | `development` | Entorno de ejecución |
| `LOG_LEVEL` | `info` | `debug`, `info`, `warn` o `error` |

Si alguna es inválida, el servidor no arranca y muestra el motivo.

## Estructura

```text
ejercicio-30/
├── .env.example
├── package.json
├── README.md
├── src/
│   ├── server.js                       # carga config, crea logger y escucha
│   ├── app.js                          # createApp({ logger }): arma servicios, middlewares y rutas
│   ├── config.js                       # variables de entorno validadas
│   ├── routes/index.js
│   ├── controllers/workshop.controller.js
│   ├── services/
│   │   ├── motorcycles.service.js      # reglas de motocicletas
│   │   └── orders.service.js           # reglas y flujo de órdenes
│   ├── middlewares/
│   │   ├── request-logger.js
│   │   └── error-handler.js
│   └── utils/
│       ├── app-error.js                # AppError, badRequest, notFound, conflict
│       ├── logger.js
│       └── parse.js
└── test/app.test.js
```

Flujo: `ruta → controlador → servicio`. Los servicios lanzan `AppError`; el middleware central los convierte en JSON. `createApp` crea servicios nuevos en cada instancia, por eso cada prueba tiene datos aislados.

## Modelo

**Motocicleta**

| Campo | Regla |
| --- | --- |
| `brand` | Texto, mínimo 2 caracteres |
| `model` | Texto obligatorio |
| `year` | Entero desde 1950 hasta el año siguiente al actual |
| `displacementCc` | Entero entre 50 y 3000 |
| `plate` | 5 a 8 caracteres (letras, números, guion); se guarda en mayúsculas; **única** |

**Orden de servicio**

| Campo | Regla |
| --- | --- |
| `motorcycleId` | Debe corresponder a una moto existente |
| `description` | Texto, mínimo 5 caracteres |
| `estimatedCostUsd` | Número ≥ 0 |
| `status` | `pendiente` → `en_proceso` → `finalizada` (solo avanza en ese orden) |
| `finalCostUsd` | Obligatorio al pasar a `finalizada` |

## Endpoints

| Método | Ruta | Descripción | Códigos |
| --- | --- | --- | --- |
| GET | `/health` | Estado del servicio | 200 |
| GET | `/basico/ejercicio-30` | Endpoint principal | 200 |
| GET | `/motorcycles?brand=Honda` | Lista, filtro opcional por marca | 200 |
| POST | `/motorcycles` | Registra una moto | 201, 400, 409 |
| GET | `/motorcycles/:id` | Detalle | 200, 400, 404 |
| PUT | `/motorcycles/:id` | Reemplaza todos los datos | 200, 400, 404, 409 |
| DELETE | `/motorcycles/:id` | Elimina (si no tiene órdenes abiertas) | 204, 400, 404, 409 |
| GET | `/motorcycles/:id/orders` | Órdenes de una moto | 200, 400, 404 |
| GET | `/orders?status=pendiente` | Lista, filtro opcional por estado | 200, 400 |
| POST | `/orders` | Abre una orden | 201, 400, 422 |
| GET | `/orders/:id` | Detalle | 200, 400, 404 |
| PATCH | `/orders/:id/status` | Avanza el estado | 200, 400, 404, 409 |
| GET | `/stats` | Totales por estado e ingresos | 200 |

## Ejemplos (flujo completo)

```bash
# 1. Registrar una moto
curl -i -X POST http://localhost:3000/motorcycles \
  -H "Content-Type: application/json" \
  -d '{"brand":"Suzuki","model":"GN125","year":2020,"displacementCc":125,"plate":"m789ghi"}'

# 2. Abrir una orden
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{"motorcycleId":1,"description":"Cambio de aceite y filtro","estimatedCostUsd":35}'

# 3. Avanzar el estado
curl -X PATCH http://localhost:3000/orders/1/status \
  -H "Content-Type: application/json" -d '{"status":"en_proceso"}'

curl -X PATCH http://localhost:3000/orders/1/status \
  -H "Content-Type: application/json" -d '{"status":"finalizada","finalCostUsd":42.5}'

# 4. Consultar
curl http://localhost:3000/stats
```

```json
{ "ok": true, "stats": { "totalOrders": 1, "byStatus": { "pendiente": 0, "en_proceso": 0, "finalizada": 1 }, "revenueUsd": 42.5 } }
```

## Errores

Todos tienen el mismo formato:

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos invalidos",
    "details": ["year debe ser un entero valido (1950 en adelante)"]
  }
}
```

| Código HTTP | `code` | Cuándo |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` / `INVALID_JSON` | Datos inválidos, `id` mal formado o JSON roto |
| 404 | `NOT_FOUND` | Recurso o ruta inexistente |
| 409 | `CONFLICT` | Placa repetida, salto de estado inválido, moto con órdenes abiertas |
| 422 | `INVALID_REFERENCE` | La orden apunta a una moto que no existe |
| 500 | `INTERNAL_ERROR` | Error inesperado (detalle solo en el log) |

## Logs

Una línea por petición: `INFO` para 2xx, `WARN` para 4xx y `ERROR` para 5xx.

```text
2026-10-03T16:20:00.000Z INFO  POST /orders 201 2.3ms
2026-10-03T16:20:04.800Z WARN  GET /motorcycles/99 404 0.7ms
```

## Limitaciones

- Datos **en memoria**: se pierden al reiniciar.
- Sin autenticación ni paginación.

## Pruebas

```bash
npm test
```

Cubren configuración, CRUD de motos, validaciones, flujo de estados de las órdenes, reglas entre recursos, estadísticas, formato de errores y logs.
