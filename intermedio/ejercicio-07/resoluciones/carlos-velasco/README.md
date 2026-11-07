# INTERMEDIO 07 - Middleware de errores

## Objetivo

Crear una API Node.js con Express donde el manejo de errores sea un unico middleware centralizado con errores de dominio tipados y propagacion automatica de errores asincronos.

## Concepto principal

Registro al final del pipeline: `app.use(errorHandler)`. Toda ruta lanze errores con `next(error)` (directo o por promesas!) y el middleware decide la respuesta:

1. Si `res.headersSent` ya respondio, no duplica la respuesta.
2. Si el error es de dominio (`AppError`: 400/404/409) responde con su codigo y cuerpo uniforme `{ ok, error, message, detalles }`.
3. Si el error es desconocido, loguea el completo en servidor y responde 500 limpio al cliente.
4. `asyncHandler(fn)` envuelve controladores asincronos: si la promesa rechaza, el reject viaja automaticamente a `next(error)` sin try/catch.

Errores de dominio definidos: `ValidationError` (400), `NotFoundError` (404), `ConflictError` (409).

## Estructura del proyecto

```text
resoluciones/carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── errors/
    │   └── app.error.js
    ├── middlewares/
    │   ├── async.handler.js
    │   └── error.handler.js
    ├── routes/
    │   └── showroom.routes.js
    ├── controllers/
    │   └── showroom.controller.js
    └── services/
        └── showroom.service.js
```

## Como ejecutar

```bash
npm install
npm run start   # produccion
npm run dev     # desarrollo con recarga automatica
```

## Endpoints

| Metodo | Ruta | Descripcion | Codigo |
| ------ | ---- | ----------- | ------ |
| GET | /health | Verifica el estado del servidor | 200 |
| GET | /autos | Lista autos del showroom | 200 |
| POST | /autos/:id/reservar | Reserva un auto | 200 |
| POST | /autos/:id/liberar | Libera una reserva | 200 |

## Ejemplos de peticiones

```bash
# Lista autos
curl http://localhost:3000/autos

# Reservar el auto 1 (disponible)
curl -X POST http://localhost:3000/autos/1/reservar \
  -H "Content-Type: application/json" \
  -d '{"cliente": "Club Anon"}'

# Intentar de nuevo -> ConflictError 409
curl -X POST http://localhost:3000/autos/1/reservar \
  -H "Content-Type: application/json" \
  -d '{"cliente": "Otro"}'

# Auto inexistente -> NotFoundError 404
curl -X POST http://localhost:3000/autos/99/reservar \
  -H "Content-Type: application/json" \
  -d '{"cliente": "X"}'

# Cuerpo vacio -> ValidationError 400
curl -X POST http://localhost:3000/autos/3/reservar \
  -H "Content-Type: application/json" -d '{}'

# Liberar el auto 2
curl -X POST http://localhost:3000/autos/2/liberar
```

## Nota

Con `NODE_ENV=production` el cuerpo de error 500 no expone stack; en desarrollo incluye `stack` de errores de dominio para la depuracion.
