# Ejercicio 007: Middleware de Errores

- **Camper:** Antonio Canux
- **Nivel:** Intermedio
- **Tema:** Middleware global de errores (autos de lujo)

## Estructura de Carpetas

```text
intermedio/ejercicio-07/resoluciones/antonio-canux/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   └── car.routes.js
    ├── controllers/
    │   └── car.controller.js
    ├── middlewares/
    │   └── error.middleware.js   # 404 + manejador global de errores
    ├── utils/
    │   └── app-error.js          # Error con statusCode
    └── data/
        └── car.data.js
```

## Cómo funciona

- Los controladores no responden los errores: crean un `AppError(mensaje, status)` y lo envían con `next(err)`.
- `notFoundHandler` convierte las rutas inexistentes en un error 404.
- `errorHandler` (4 argumentos, registrado al final) responde siempre con el formato `{ ok: false, message }`. Los errores inesperados devuelven 500 sin exponer detalles.

## Ejecución

```bash
npm install
npm run dev
```

## Pruebas con cURL

```bash
# Endpoint del ejercicio
curl http://localhost:3000/intermedio/ejercicio-07

# Caso feliz
curl http://localhost:3000/api/cars/1

# 400 - id inválido
curl http://localhost:3000/api/cars/abc

# 404 - auto inexistente
curl http://localhost:3000/api/cars/99

# 404 - ruta inexistente
curl http://localhost:3000/api/nada

# 400 - datos faltantes
curl -X POST http://localhost:3000/api/cars -H "Content-Type: application/json" -d '{"brand":"Ferrari"}'

# 409 - duplicado
curl -X POST http://localhost:3000/api/cars -H "Content-Type: application/json" \
  -d '{"brand":"Bentley","model":"Continental GT","year":2022,"priceUsd":250000}'

# 400 - JSON mal formado
curl -X POST http://localhost:3000/api/cars -H "Content-Type: application/json" -d '{bad'

# 500 - error inesperado
curl http://localhost:3000/api/cars/crash
```

**Ejemplo de respuesta de error (404):**

```json
{
  "ok": false,
  "message": "Auto con id 99 no encontrado"
}
```
