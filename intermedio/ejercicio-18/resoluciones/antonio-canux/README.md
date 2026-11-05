# Ejercicio 018: Hash de Passwords

- **Camper:** Antonio Canux
- **Nivel:** Intermedio
- **Tema:** Hash de Passwords (paracaidismo)

## Estructura de Carpetas

```text
intermedio/ejercicio-18/resoluciones/antonio-canux/
├── README.md
├── package.json
├── src/app.js
├── src/controllers/jumpers.controller.js
├── src/data/jumpers.data.js
├── src/routes/jumpers.routes.js
├── src/server.js
└── src/utils/password.js
```

## Cómo funciona

- `hashPassword` usa `scrypt` con un salt aleatorio por usuario (`crypto` nativo).
- `verifyPassword` recalcula el hash y compara con `timingSafeEqual`. La respuesta nunca incluye el hash.

## Ejecución

```bash
npm install
npm run dev
```

## Pruebas con cURL

```bash
# Endpoint del ejercicio
curl http://localhost:3000/intermedio/ejercicio-18

# Registrar
curl -X POST http://localhost:3000/api/jumpers/register -H "Content-Type: application/json" -d '{"name":"Carlos","password":"clave12345"}'

# Login correcto
curl -X POST http://localhost:3000/api/jumpers/login -H "Content-Type: application/json" -d '{"name":"Carlos","password":"clave12345"}'

# Password incorrecto (401)
curl -X POST http://localhost:3000/api/jumpers/login -H "Content-Type: application/json" -d '{"name":"Carlos","password":"otra"}'
```
