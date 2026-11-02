# Ejercicio 017: Roles y Permisos

- **Camper:** Antonio Canux
- **Nivel:** Intermedio
- **Tema:** Roles y Permisos (viajes y turismo)

## Estructura de Carpetas

```text
intermedio/ejercicio-17/resoluciones/antonio-canux/
├── README.md
├── package.json
├── src/app.js
├── src/controllers/auth.controller.js
├── src/controllers/trips.controller.js
├── src/data/trips.data.js
├── src/data/users.data.js
├── src/middlewares/auth.middleware.js
├── src/routes/auth.routes.js
├── src/routes/trips.routes.js
├── src/server.js
└── src/utils/jwt.js
```

## Cómo funciona

- El JWT incluye el `role` del usuario (`admin` o `user`).
- `authorize("admin")` responde 403 si el rol no está permitido. 401 = no autenticado, 403 = sin permiso.

## Ejecución

```bash
npm install
npm run dev
```

## Pruebas con cURL

```bash
# Endpoint del ejercicio
curl http://localhost:3000/intermedio/ejercicio-17

# Login como user
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"user@demo.com","password":"user123"}'

# Listar (cualquier rol)
curl http://localhost:3000/api/trips -H "Authorization: Bearer <token>"

# Crear siendo user (403)
curl -X POST http://localhost:3000/api/trips -H "Authorization: Bearer <token-user>" -H "Content-Type: application/json" -d '{"destination":"Semuc Champey","days":2,"priceUsd":300}'

# Borrar siendo admin
curl -X DELETE http://localhost:3000/api/trips/1 -H "Authorization: Bearer <token-admin>"
```
