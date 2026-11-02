# Ejercicio 015: JWT Básico

- **Camper:** Antonio Canux
- **Nivel:** Intermedio
- **Tema:** JWT Básico (comida urbana)

## Estructura de Carpetas

```text
intermedio/ejercicio-15/resoluciones/antonio-canux/
├── README.md
├── package.json
├── src/app.js
├── src/controllers/auth.controller.js
├── src/data/users.data.js
├── src/middlewares/auth.middleware.js
├── src/routes/auth.routes.js
├── src/server.js
└── src/utils/jwt.js
```

## Cómo funciona

- `signToken` crea un JWT HS256 (header.payload.firma) usando solo `node:crypto`.
- `verifyToken` valida formato, firma y expiración. El secreto sale de `JWT_SECRET`.

## Ejecución

```bash
npm install
npm run dev
```

## Pruebas con cURL

```bash
# Endpoint del ejercicio
curl http://localhost:3000/intermedio/ejercicio-15

# Login (admin)
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@demo.com","password":"admin123"}'

# Ver datos del token
curl http://localhost:3000/api/auth/me -H "Authorization: Bearer <token>"

# Token alterado (401)
curl http://localhost:3000/api/auth/me -H "Authorization: Bearer a.b.c"
```
