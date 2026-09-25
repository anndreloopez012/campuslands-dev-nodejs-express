# Ejercicio 19 - dotenv y config (Juan Lema)

## Que hace

Tematica tatuajes. Toda la configuracion entra por variables de entorno y se lee en un unico lugar, `src/config/index.js`:

- `dotenv` carga `.env` (sin pisar variables que ya vengan del sistema, asi produccion manda sobre el archivo).
- Cada variable se **convierte de tipo** (`PORT`, `HOURLY_RATE`... llegan como texto) y se **valida** (rangos, valores permitidos). Si algo es invalido la app **falla al arrancar** con un mensaje claro, no en medio de una peticion.
- Hay valores por defecto para desarrollo, asi funciona sin `.env`. `ADMIN_API_KEY` solo es obligatoria con `NODE_ENV=production` (sin clave no se arranca en produccion).
- El objeto `config` es inmutable y el resto del codigo lo importa; nadie lee `process.env` directamente.
- `GET /config` expone solo `publicConfig`: la clave secreta nunca sale.

La configuracion tiene efecto real: `HOURLY_RATE`, `DEPOSIT_PERCENT` y `MAX_SESSION_HOURS` determinan el precio, el deposito y el limite de horas de cada cita. `GET /bookings` requiere el header `x-api-key` con el valor de `ADMIN_API_KEY`.

`.env` esta en `.gitignore`; se versiona solo `.env.example` con valores de ejemplo.

## Como ejecutar

```bash
npm install
cp .env.example .env
npm start
```

Sin `.env` tambien arranca con los valores por defecto (clave de desarrollo `dev-admin-key`).

## Como probar

```bash
curl http://localhost:4019/config
curl -X POST http://localhost:4019/bookings -H "Content-Type: application/json" -d "{\"client\":\"Marco Diaz\",\"design\":\"Ancla minimalista\",\"sizeCm\":8,\"sessionHours\":2.5}"
curl http://localhost:4019/bookings -H "x-api-key: dev-admin-key"
curl http://localhost:4019/bookings/1 -H "x-api-key: dev-admin-key"
```

## Como probar los casos de error

```bash
curl http://localhost:4019/bookings
curl http://localhost:4019/bookings -H "x-api-key: incorrecta"
curl -X POST http://localhost:4019/bookings -H "Content-Type: application/json" -d "{\"client\":\"Marco Diaz\",\"design\":\"Sesion maraton\",\"sizeCm\":40,\"sessionHours\":20}"
curl http://localhost:4019/bookings/99 -H "x-api-key: dev-admin-key"
```

Configuracion invalida (la app no debe arrancar):

```bash
HOURLY_RATE=abc npm start
NODE_ENV=production npm start
```

## Estructura

```text
.env.example
src/
├── app.js
├── server.js
├── config/index.js
├── routes/bookings.routes.js
├── controllers/bookings.controller.js
├── services/bookings.service.js
└── middlewares/require-api-key.js
```
