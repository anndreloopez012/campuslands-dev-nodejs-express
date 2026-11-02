# Ejercicio 021: Rate Limit Conceptual

- **Camper:** Antonio Canux
- **Nivel:** Intermedio
- **Tema:** Rate Limit Conceptual (animacion 3D)

## Estructura de Carpetas

```text
intermedio/ejercicio-21/resoluciones/antonio-canux/
├── README.md
├── package.json
├── src/app.js
├── src/controllers/animations.controller.js
├── src/data/animations.data.js
├── src/middlewares/rate-limit.middleware.js
├── src/routes/animations.routes.js
└── src/server.js
```

## Cómo funciona

- El middleware cuenta peticiones por IP en un `Map` y reinicia el contador al terminar la ventana.
- Al superar el límite responde 429 con `Retry-After`. Es conceptual: en producción se usaría Redis o `express-rate-limit`.

## Ejecución

```bash
npm install
npm run dev
```

## Pruebas con cURL

```bash
# Endpoint del ejercicio
curl http://localhost:3000/intermedio/ejercicio-21

# Repetir 6 veces para provocar el 429
for i in 1 2 3 4 5 6; do curl -i http://localhost:3000/api/animations; done
```
