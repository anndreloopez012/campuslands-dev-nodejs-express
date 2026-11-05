# Ejercicio 030: Proyecto Integrador Intermedio

- **Camper:** Antonio Canux
- **Nivel:** Intermedio
- **Tema:** Proyecto Integrador Intermedio (motos y mecanica)

## Estructura de Carpetas

```text
intermedio/ejercicio-30/resoluciones/antonio-canux/
├── README.md
├── package.json
├── src/app.js
├── src/controllers/auth.controller.js
├── src/controllers/workorders.controller.js
├── src/data/users.data.js
├── src/data/workorders.data.js
├── src/middlewares/auth.middleware.js
├── src/middlewares/request-id.middleware.js
├── src/routes/auth.routes.js
├── src/routes/workorders.routes.js
├── src/server.js
├── src/utils/app-error.js
├── src/utils/jwt.js
└── test/workorders.routes.test.js
```

## Cómo funciona

- Integra lo visto en el nivel: request id, paginación y filtros, JWT con roles, manejador de errores global y pruebas.
- Lectura pública; crear órdenes solo para `admin`. Pruebas de rutas con `node:test` (`npm test`).

## Ejecución

```bash
npm install
npm run dev
```

```bash
npm test
```

## Pruebas con cURL

```bash
# Endpoint del ejercicio
curl http://localhost:3000/intermedio/ejercicio-30

# Listar con paginación y filtro
curl "http://localhost:3000/api/workorders?status=Pendiente&limit=2"

# Login admin
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@demo.com","password":"admin123"}'

# Crear orden (admin)
curl -X POST http://localhost:3000/api/workorders -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"motorcycle":"Ducati Monster","service":"Revisión","costUsd":80}'
```
