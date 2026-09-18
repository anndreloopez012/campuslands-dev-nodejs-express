# Ejercicio 17 - roles y permisos (Juan Lema)

## Que hace

Tematica viajes y turismo. El JWT lleva el `role` del usuario y `services/auth.service.js` mapea cada rol a un conjunto de permisos (`ROLE_PERMISSIONS`). `middlewares/authorize.js` es una fabrica `authorize("permiso", ...)` que se encadena despues de `authenticate` y decide por permiso, no por nombre de rol, asi agregar un rol nuevo solo toca el mapa.

| Rol | Permisos |
| --- | --- |
| viajero | `tours:read` |
| guia | `tours:read`, `tours:create` |
| admin | `tours:read`, `tours:create`, `tours:delete` |

Sin token o token invalido: `401`. Token valido sin el permiso requerido: `403`. El rol viaja dentro del token, por lo que un cambio de rol se aplica cuando el token expira.

Usuarios de prueba: `mia / demo123` (viajero), `gabo / demo456` (guia), `ada / demo789` (admin). Configurable con `JWT_SECRET` y `JWT_EXPIRES_IN`.

## Como ejecutar

```bash
npm install
npm start
```

## Como probar

```bash
curl -X POST http://localhost:4017/auth/login -H "Content-Type: application/json" -d "{\"username\":\"gabo\",\"password\":\"demo456\"}"
curl http://localhost:4017/auth/me -H "Authorization: Bearer TOKEN"
curl http://localhost:4017/tours -H "Authorization: Bearer TOKEN"
curl -X POST http://localhost:4017/tours -H "Authorization: Bearer TOKEN_GUIA" -H "Content-Type: application/json" -d "{\"name\":\"Cenotes secretos\",\"destination\":\"Tulum\",\"price\":540,\"days\":4}"
curl -X DELETE http://localhost:4017/tours/1 -H "Authorization: Bearer TOKEN_ADMIN"
```

## Como probar los casos de error

```bash
curl http://localhost:4017/tours
curl -X POST http://localhost:4017/tours -H "Authorization: Bearer TOKEN_VIAJERO" -H "Content-Type: application/json" -d "{}"
curl -X DELETE http://localhost:4017/tours/1 -H "Authorization: Bearer TOKEN_GUIA"
curl http://localhost:4017/tours/99 -H "Authorization: Bearer TOKEN"
```

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/auth.routes.js
├── routes/tours.routes.js
├── controllers/auth.controller.js
├── controllers/tours.controller.js
├── services/auth.service.js
├── services/tours.service.js
└── middlewares/
    ├── authenticate.js
    └── authorize.js
```
