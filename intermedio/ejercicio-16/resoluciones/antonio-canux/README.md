# Ejercicio 016: Rutas Protegidas

- **Camper:** Antonio Canux
- **Nivel:** Intermedio
- **Tema:** Rutas Protegidas (ropa y sneakers)

## Estructura de Carpetas

```text
intermedio/ejercicio-16/resoluciones/antonio-canux/
├── README.md
├── package.json
├── src/app.js
├── src/controllers/auth.controller.js
├── src/controllers/sneakers.controller.js
├── src/data/sneakers.data.js
├── src/data/users.data.js
├── src/middlewares/auth.middleware.js
├── src/routes/auth.routes.js
├── src/routes/sneakers.routes.js
├── src/server.js
└── src/utils/jwt.js
```

## Cómo funciona

- `GET /api/sneakers` es público; `POST /api/sneakers` exige un JWT válido (`authenticate`).
- `POST /api/auth/login` entrega el token.

## Ejecución

```bash
npm install
npm run dev
```

## Pruebas con cURL

```bash
# Endpoint del ejercicio
curl http://localhost:3000/intermedio/ejercicio-16

# Listar (público)
curl http://localhost:3000/api/sneakers

# Login
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"user@demo.com","password":"user123"}'

# Crear sin token (401)
curl -X POST http://localhost:3000/api/sneakers -H "Content-Type: application/json" -d '{"brand":"Puma","model":"Suede","sizeUs":9,"priceUsd":90}'

# Crear con token
curl -X POST http://localhost:3000/api/sneakers -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"brand":"Puma","model":"Suede","sizeUs":9,"priceUsd":90}'
```
