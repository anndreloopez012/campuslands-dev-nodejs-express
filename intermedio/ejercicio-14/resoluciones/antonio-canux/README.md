# Ejercicio 014: Autenticación Simulada

- **Camper:** Antonio Canux
- **Nivel:** Intermedio
- **Tema:** Autenticación Simulada (libros)

## Estructura de Carpetas

```text
intermedio/ejercicio-14/resoluciones/antonio-canux/
├── README.md
├── package.json
├── src/app.js
├── src/controllers/auth.controller.js
├── src/data/users.data.js
├── src/middlewares/auth.middleware.js
├── src/routes/auth.routes.js
└── src/server.js
```

## Cómo funciona

- `login` valida credenciales y crea un token simulado (UUID) guardado en un `Map`.
- `requireSession` protege `/me` y `/logout` leyendo `Authorization: Bearer <token>`.

## Ejecución

```bash
npm install
npm run dev
```

## Pruebas con cURL

```bash
# Endpoint del ejercicio
curl http://localhost:3000/intermedio/ejercicio-14

# Login
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"lector@demo.com","password":"1234"}'

# Perfil con el token recibido
curl http://localhost:3000/api/auth/me -H "Authorization: Bearer <token>"

# Sin token (401)
curl http://localhost:3000/api/auth/me
```
