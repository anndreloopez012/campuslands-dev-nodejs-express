# Intermedio 07 - middleware de errores (Allison Vargas)

## Que hace este ejercicio

API de un concesionario de autos de lujo con manejo de errores centralizado. Ninguna ruta responde errores por su cuenta: services, validators y middlewares lanzan errores tipados y un unico middleware los convierte en una respuesta JSON uniforme.

- `utils/errors.js`: `AppError` y subclases (`ValidationError` 400, `UnauthorizedError` 401, `ForbiddenError` 403, `NotFoundError` 404, `ConflictError` 409), cada una con su `codigo`.
- `middlewares/notFound.js`: convierte las rutas inexistentes en un `NotFoundError`.
- `middlewares/errorHandler.js`: normaliza cualquier error (incluidos JSON invalido y body muy grande), registra con el logger y responde. Los errores inesperados devuelven un mensaje generico y solo muestran el stack fuera de produccion.
- `middlewares/requestId.js`: asigna un id a cada peticion para rastrear el error en los logs.
- `server.js`: captura `unhandledRejection` y `uncaughtException` y cierra el servidor de forma controlada.

## Estructura

```text
.
|-- package.json
|-- README.md
`-- src
    |-- app.js
    |-- server.js
    |-- routes/
    |-- controllers/
    |-- services/
    |-- validators/
    |-- middlewares/
    |-- utils/
    `-- data/
```

- routes: autos y una ruta de demostracion de errores.
- controllers: validan, llaman al service y responden. Usan `catchAsync` para que los errores lleguen al middleware.
- services: reglas de negocio (auto duplicado, reserva solo si esta disponible).
- validators: validan la entrada y lanzan `ValidationError`.
- middlewares: requestId, apiKey, notFound y errorHandler.
- utils: errores tipados, catchAsync, logger y lector de JSON.
- data: autos iniciales en JSON.

## Como ejecutar

```bash
cd intermedio/ejercicio-07/resoluciones/allison-vargas
npm install
npm run dev
```

El servidor queda en http://localhost:3000

Con `NODE_ENV=production` las respuestas 500 no incluyen el stack.

## Respuesta esperada

```bash
curl http://localhost:3000/intermedio/ejercicio-07
```

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "middleware de errores"
}
```

## Endpoints

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | /autos | Lista autos, filtro opcional `?estado=disponible` |
| GET | /autos/:id | Detalle de un auto |
| POST | /autos | Crea un auto (requiere header `x-api-key: clave-concesionario`) |
| POST | /autos/:id/reservar | Reserva un auto disponible (`cliente`) |
| GET | /errores/:tipo | Dispara un error para ver la respuesta |

Tipos de `/errores/:tipo`: `validacion`, `no-autenticado`, `sin-permiso`, `no-encontrado`, `conflicto`, `inesperado`, `asincrono`.

```bash
curl http://localhost:3000/intermedio/ejercicio-07/autos/99
curl http://localhost:3000/intermedio/ejercicio-07/errores/inesperado
curl -X POST http://localhost:3000/intermedio/ejercicio-07/autos -H "x-api-key: clave-concesionario" -H "Content-Type: application/json" -d "{\"marca\":\"Lamborghini\",\"modelo\":\"Revuelto\",\"anio\":2024,\"precio\":600000}"
curl -X POST http://localhost:3000/intermedio/ejercicio-07/autos/2/reservar -H "Content-Type: application/json" -d "{\"cliente\":\"Carlos Mendez\"}"
```

## Formato de error

```json
{
  "ok": false,
  "message": "El auto esta reservado y no se puede reservar",
  "codigo": "AUTO_NO_DISPONIBLE",
  "solicitudId": "d0a8c5f4-1b6e-4f3a-9a52-0c7d9e1b2a34"
}
```

Los errores de validacion agregan `errores` con `campo` y `mensaje`.

Status usados: 400 validacion o JSON invalido, 401 sin api key, 403 api key incorrecta, 404 recurso o ruta inexistente, 409 auto duplicado o no disponible, 413 body muy grande, 500 error inesperado.
