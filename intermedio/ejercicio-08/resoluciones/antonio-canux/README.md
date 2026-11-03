# Ejercicio 008: Middleware de Request ID

- **Camper:** Antonio Canux
- **Nivel:** Intermedio
- **Tema:** Middleware de Request ID (hiperdeportivos)

## Estructura de Carpetas

```text
intermedio/ejercicio-08/resoluciones/antonio-canux/
├── README.md
├── package.json
├── src/app.js
├── src/controllers/hypercars.controller.js
├── src/data/hypercars.data.js
├── src/middlewares/request-id.middleware.js
├── src/routes/hypercars.routes.js
└── src/server.js
```

## Cómo funciona

- `requestId` genera un UUID por petición (o reutiliza el header `X-Request-Id` del cliente).
- El id se guarda en `req.id`, se devuelve en el header `X-Request-Id` y en el body, y se imprime en el log.

## Ejecución

```bash
npm install
npm run dev
```

## Pruebas con cURL

```bash
# Endpoint del ejercicio
curl http://localhost:3000/intermedio/ejercicio-08

# Petición normal (revisa el header X-Request-Id)
curl -i http://localhost:3000/api/hypercars

# Reutilizar un id propio
curl -i http://localhost:3000/api/hypercars/1 -H "X-Request-Id: mi-id-123"

# 404 con requestId
curl http://localhost:3000/api/hypercars/99
```
