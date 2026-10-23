# Ejercicio 30 - proyecto integrador intermedio (Juan Lema)

## Que hace

Tematica motos y mecanica. API de un taller: registro de motos de clientes y ordenes de trabajo con un ciclo de vida controlado (`recibida -> en_diagnostico -> en_reparacion -> lista -> entregada`). Es el cierre del nivel intermedio: integra en un solo proyecto coherente las tecnicas practicadas por separado en los ejercicios 11 a 29.

| Tecnica | De donde viene | Donde vive aqui |
| --- | --- | --- |
| Arquitectura por capas y routers modulares | 01, 02 | `routes/` + `controllers/` + `services/`, un router por recurso |
| Servicios reutilizables e inyeccion de dependencias | 04, 25-29 | `createApp({ auth, motorcycles, workOrders })`, cada capa recibe sus dependencias |
| Validacion centralizada y manejo de errores | 06, 07 | `errors.js` (`AppError`) + un unico `middlewares/error-handler.js` |
| JWT basico y rutas protegidas | 15, 16 | `services/auth.service.js`, `middlewares/authenticate.js` |
| Roles y permisos | 17 | `ROLE_PERMISSIONS` + `middlewares/authorize.js`, por permiso y no por nombre de rol |
| dotenv y config que falla rapido | 19 | `src/config/index.js`: variables invalidas impiden arrancar |
| Testing con node:test, de servicios, de rutas y mock de dependencias | 23-26 | `test/` completo, servicios probados sin HTTP, rutas probadas con `fetch` contra un servidor real, un servicio roto inyectado para forzar el `500` |

## Roles y permisos

| Rol | Permisos |
| --- | --- |
| recepcionista | `motorcycles:read`, `motorcycles:create`, `workorders:read`, `workorders:create` |
| mecanico | `motorcycles:read`, `workorders:read`, `workorders:update` |
| admin | todos los anteriores + `workorders:delete` |

Usuarios de prueba: `recepcion/demo123`, `mecanico/demo456`, `jefe/demo789` (admin). Sin token o con token invalido/expirado: `401` (con `WWW-Authenticate`). Token valido sin el permiso: `403`.

## Como se prueba

- `test/config.test.js`: `loadConfig()` en un subproceso, para probar de verdad que una variable de entorno invalida hace fallar el arranque (exit code distinto de 0) sin afectar al resto de la suite.
- `test/auth.service.test.js`, `test/motorcycles.service.test.js`, `test/work-orders.service.test.js`: cada servicio se prueba aislado, sin Express. Incluye un token realmente expirado (`jwtExpiresIn: "1ms"` + esperar) para probar `TOKEN_EXPIRED` sin mockear el reloj.
- `test/api.routes.test.js`: peticiones HTTP reales contra un servidor en un puerto libre. Incluye la matriz completa de permisos por rol y endpoint, el flujo de una orden de principio a fin con dos usuarios distintos, y un `500` forzado inyectando un servicio de motos roto (`createApp({ motorcycles: { list: () => { throw ... } } })`).

Cobertura: **100 %** de lineas, ramas y funciones en todo `src/`. Se rompio la aplicacion a proposito de 12 formas (dar de mas un permiso, hacer que `authorize` nunca bloquee, permitir saltarse un estado de la orden, aceptar una placa repetida, dejar de exigir `JWT_SECRET` en produccion, filtrar el mensaje de un `500`...): **12 de 12** hicieron fallar al menos una prueba.

## Como ejecutar

```bash
npm install
cp .env.example .env
npm start
```

Sin `.env` tambien arranca, con una clave de desarrollo y el puerto 4030 por defecto.

## Como ejecutar las pruebas

```bash
npm test
npm run test:coverage
```

Verificado con Node 24; requiere Node 20 o superior.

## Como probar la API

```bash
curl -X POST http://localhost:4030/auth/login -H "Content-Type: application/json" -d "{\"username\":\"recepcion\",\"password\":\"demo123\"}"
curl http://localhost:4030/motorcycles -H "Authorization: Bearer TOKEN_RECEPCION"
curl -X POST http://localhost:4030/work-orders -H "Authorization: Bearer TOKEN_RECEPCION" -H "Content-Type: application/json" -d "{\"motorcycleId\":1,\"description\":\"Cambio de aceite y revision de frenos\"}"
curl -X PATCH http://localhost:4030/work-orders/1/status -H "Authorization: Bearer TOKEN_MECANICO" -H "Content-Type: application/json" -d "{\"status\":\"en_diagnostico\"}"
curl -X DELETE http://localhost:4030/work-orders/1 -H "Authorization: Bearer TOKEN_ADMIN"
```

## Como probar los casos de error

```bash
curl http://localhost:4030/motorcycles
curl -X POST http://localhost:4030/work-orders -H "Authorization: Bearer TOKEN_MECANICO" -H "Content-Type: application/json" -d "{\"motorcycleId\":1,\"description\":\"x\"}"
curl -X PATCH http://localhost:4030/work-orders/1/status -H "Authorization: Bearer TOKEN_RECEPCION" -H "Content-Type: application/json" -d "{\"status\":\"en_diagnostico\"}"
curl -X PATCH http://localhost:4030/work-orders/1/status -H "Authorization: Bearer TOKEN_MECANICO" -H "Content-Type: application/json" -d "{\"status\":\"lista\"}"
```

## Estructura

```text
src/
├── app.js
├── server.js
├── errors.js
├── config/index.js
├── routes/
│   ├── auth.routes.js
│   ├── motorcycles.routes.js
│   └── work-orders.routes.js
├── controllers/
│   ├── auth.controller.js
│   ├── motorcycles.controller.js
│   └── work-orders.controller.js
├── services/
│   ├── auth.service.js
│   ├── motorcycles.service.js
│   └── work-orders.service.js
└── middlewares/
    ├── authenticate.js
    ├── authorize.js
    └── error-handler.js
test-support/
└── client.js
test/
├── config.test.js
├── auth.service.test.js
├── motorcycles.service.test.js
├── work-orders.service.test.js
└── api.routes.test.js
```
