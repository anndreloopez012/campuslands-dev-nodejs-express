# Ejercicio 15 - JWT basico (Juan Lema)

## Que hace

Tematica comida urbana. `POST /auth/login` valida credenciales y firma un JWT (HS256, con `sub`, `username` y expiracion) usando `jsonwebtoken`. El servidor no guarda sesiones: `middlewares/authenticate.js` verifica firma y expiracion en cada peticion y deja los claims en `req.user`. `GET /dishes` es publico; `POST /dishes` y `GET /auth/me` requieren token.

Configuracion opcional por variables de entorno: `JWT_SECRET` (por defecto un valor de desarrollo) y `JWT_EXPIRES_IN` (por defecto `15m`). No se sube ningun `.env`.

Usuarios de prueba: `chef / demo123` y `cliente / demo456`.

## Como ejecutar

```bash
npm install
npm start
```

## Como probar

```bash
curl -X POST http://localhost:4015/auth/login -H "Content-Type: application/json" -d "{\"username\":\"chef\",\"password\":\"demo123\"}"
curl http://localhost:4015/auth/me -H "Authorization: Bearer TOKEN"
curl http://localhost:4015/dishes
curl -X POST http://localhost:4015/dishes -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d "{\"name\":\"Hot dog callejero\",\"price\":2.75,\"stall\":\"Esquina 5\"}"
```

## Como probar los casos de error

```bash
curl -X POST http://localhost:4015/auth/login -H "Content-Type: application/json" -d "{\"username\":\"chef\",\"password\":\"mala\"}"
curl http://localhost:4015/auth/me
curl http://localhost:4015/auth/me -H "Authorization: Bearer token.falso.aqui"
curl -X POST http://localhost:4015/dishes -H "Content-Type: application/json" -d "{\"name\":\"Sin token\"}"
```

Para probar la expiracion, arranca con una vida corta y espera unos segundos antes de usar el token:

```bash
JWT_EXPIRES_IN=2s npm start
```

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/auth.routes.js
├── routes/dishes.routes.js
├── controllers/auth.controller.js
├── controllers/dishes.controller.js
├── services/auth.service.js
├── services/dishes.service.js
└── middlewares/authenticate.js
```
