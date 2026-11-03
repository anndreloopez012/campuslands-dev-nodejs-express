# Ejercicio 13 — Manejo de errores

**Temática:** ciencia ficción · **Nivel:** Básico inicial

## Objetivo

Diseñar un manejo de errores consistente: errores propios con código HTTP, un único middleware central que da formato a todas las respuestas de error y protección contra errores inesperados sin filtrar información interna.

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
ejercicio-13/
├── package.json
├── README.md
├── src/
│   ├── app.js
│   ├── server.js
│   ├── errors/app-error.js
│   ├── middlewares/error-handler.js
│   ├── utils/async-handler.js
│   ├── routes/index.js
│   ├── controllers/stories.controller.js
│   └── services/stories.service.js
└── test/app.test.js
```

## Formato único de error

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos invalidos",
    "details": ["title es obligatorio", "author es obligatorio", "year debe ser un entero"]
  }
}
```

| Clase | HTTP | `code` | Cuándo |
| --- | --- | --- | --- |
| `ValidationError` | 400 | `VALIDATION_ERROR` | Datos de entrada inválidos |
| (parser de JSON) | 400 | `INVALID_JSON` | Cuerpo con JSON mal formado |
| `NotFoundError` | 404 | `NOT_FOUND` | Recurso o ruta inexistente |
| `ConflictError` | 409 | `CONFLICT` | Título duplicado |
| cualquier otro error | 500 | `INTERNAL_ERROR` | Bug inesperado; mensaje genérico |

## Endpoints

| Método | Ruta | Descripción | Códigos |
| --- | --- | --- | --- |
| GET | `/health` | Estado del servicio | 200 |
| GET | `/basico/ejercicio-13` | Endpoint principal | 200 |
| GET | `/stories` | Lista de historias | 200 |
| GET | `/stories/:id` | Detalle | 200, 400, 404 |
| POST | `/stories` | Crea una historia | 201, 400, 409 |
| GET | `/crash/sync` | Demo: error síncrono inesperado | 500 |
| GET | `/crash/async` | Demo: error asíncrono inesperado | 500 |

## Ejemplos

```bash
curl -i http://localhost:3000/stories/99

curl -X POST http://localhost:3000/stories \
  -H "Content-Type: application/json" \
  -d '{"title":"Mundo Espejo","author":"L. Paz","year":2200}'

curl -i http://localhost:3000/crash/sync    # 500 sin detalles internos (el detalle queda en la consola del servidor)
```

## Conceptos aplicados

- **Errores esperados vs inesperados:** los primeros son `AppError` con su código HTTP; los segundos son bugs y se responden con un 500 genérico.
- **Middleware de errores:** tiene 4 parámetros `(error, req, res, next)` y se registra **después** de las rutas.
- **`notFoundHandler`:** convierte una ruta desconocida en un `NotFoundError`.
- **`asyncHandler`:** Express 4 no captura promesas rechazadas; este envoltorio las envía a `next`.
- **`process.on('unhandledRejection' | 'uncaughtException')`:** red de seguridad en `server.js`; registra el error y cierra el proceso.

## Pruebas

```bash
npm test
```
