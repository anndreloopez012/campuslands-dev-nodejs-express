# API Taller de Motocicletas de Alto Cilindraje — Proyecto Integrador Intermedio

Este repositorio constituye el **Proyecto Integrador del Nivel Intermedio**, unificando en una sola arquitectura **Node.js** y **Express** los patrones trabajados a lo largo del módulo sobre la temática de **motos de alto cilindraje, órdenes de servicio mecánico, banco dinamométrico y facturación de mano de obra + repuestos**.

---

## Patrones Integrados en la Solución

1. **Configuración Centralizada e Inmutable (`src/config/env.config.js`)**:
   Lectura y tipado de variables de entorno (`PORT`, `LABOR_HOUR_RATE_USD`, `CHIEF_MECHANIC_API_KEY`) congeladas con `Object.freeze()`.
2. **Trazabilidad y Observabilidad (`requestId` + `logger`)**:
   Cada solicitud recibe un `UUID v4` (`X-Request-Id`) correlacionado en los logs de consola y en las respuestas JSON.
3. **Seguridad y Autorización en Mutaciones (`requireGarageApiKey`)**:
   Las rutas de escritura (`POST` y `DELETE`) exigen la credencial administrativa `X-Garage-Key` del jefe de taller (`401 Unauthorized`).
4. **Validación Declarativa Desacoplada (`validate(createWorkOrderValidator)`)**:
   Valida placas, modelos, cilindrajes (`100 cc` a `2,500 cc`), tipos de servicio y horas de mano de obra antes de tocar la capa de negocio.
5. **Testing Automatizado con Mocks (`node:test`)**:
   Incluye suite de pruebas unitarias con inyección de dependencias (`tests/workOrders.test.js`).

---

## Estructura de Directorios

```text
src/
├── app.js                                       # Configuración global de Express y montaje en /api/v1
├── server.js                                    # Arranque del servidor HTTP leyendo desde config
├── config/
│   └── env.config.js                            # Configuración centralizada e inmutable
├── routes/
│   ├── index.routes.js                          # Montaje centralizado
│   └── workOrders.routes.js                     # Rutas públicas (GET) y protegidas (POST, DELETE)
├── controllers/
│   └── workOrders.controller.js                 # Controladores HTTP limpios con asyncHandler
├── services/
│   └── workOrders.service.js                    # Filtros, cálculo de facturación e inyección de repo
├── repositories/
│   └── workOrders.inMemory.repository.js        # Persistencia en memoria de órdenes mecánicas
├── middlewares/
│   ├── requestId.middleware.js                  # Trazabilidad con UUID v4
│   ├── logger.middleware.js                     # Logger transversal
│   ├── garageAuth.middleware.js                 # Protección mediante cabecera X-Garage-Key
│   ├── errorHandler.middleware.js               # Manejador centralizado de errores
│   └── validators/
│       ├── validate.middleware.js               # Envoltorio de validación
│       └── workOrder.validator.js               # Validación de cilindraje, servicio y costos
└── utils/
    ├── asyncHandler.js                          # Envoltorio asíncrono
    └── customErrors.js                          # Jerarquía de errores operacionales
tests/
└── workOrders.test.js                           # Suite de pruebas con node:test y mock.fn()
.env                                             # Variables de entorno locales (excluido en Git)
.env.example                                     # Plantilla de variables de entorno
.gitignore                                       # Control de exclusiones
package.json                                     # Scripts (dev, start, test) y dependencias
```

---

## Configuración, Ejecución y Pruebas

### 1. Variables de entorno e instalación
```bash
cp .env.example .env
npm install
```

### 2. Ejecutar suite de pruebas automatizadas
```bash
npm test
```

### 3. Modo desarrollo
```bash
npm run dev
```

---

## Referencia de Endpoints

**Base URL:** `/api/v1`

| Recurso | Método | Endpoint | Protegido | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| **Órdenes** | **GET** | `/work-orders` | No | Lista órdenes mecánicas (filtros: `serviceType`, `minCc`) |
| **Órdenes** | **GET** | `/work-orders/:id` | No | Consulta el desglose técnico y factura de una orden por ID |
| **Órdenes** | **POST** | `/work-orders` | Sí (`X-Garage-Key`) | Registra una nueva orden calculando mano de obra y total |
| **Órdenes** | **DELETE** | `/work-orders/:id` | Sí (`X-Garage-Key`) | Da de baja o archiva una orden de trabajo |

---

## Pruebas con cURL

```bash
# 1. Listar todas las órdenes de trabajo del taller
curl -X GET "http://localhost:3000/api/v1/work-orders?minCc=800"

# 2. Registrar una nueva orden de mantenimiento (Con X-Garage-Key válida)
curl -X POST http://localhost:3000/api/v1/work-orders \
  -H "Content-Type: application/json" \
  -H "X-Garage-Key: moto_garage_master_key_2026" \
  -d '{
    "plateNumber": "BMW-S1000",
    "bikeModel": "BMW S1000RR M Package",
    "engineCc": 999,
    "serviceType": "Sincronizacion_Inyeccion",
    "laborHours": 3.5,
    "partsCostUsd": 180
  }'

# 3. Probar rechazo 401 Unauthorized al omitir X-Garage-Key
curl -X POST http://localhost:3000/api/v1/work-orders \
  -H "Content-Type: application/json" \
  -d '{
    "plateNumber": "KTM-1290",
    "bikeModel": "KTM 1290 Super Duke R",
    "engineCc": 1301,
    "serviceType": "Mantenimiento_General",
    "laborHours": 2,
    "partsCostUsd": 95
  }'
```
