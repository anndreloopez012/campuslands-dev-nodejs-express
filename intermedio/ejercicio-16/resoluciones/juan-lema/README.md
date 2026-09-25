# Ejercicio 16 - rutas protegidas (Juan Lema)

## Que hace

Tematica ropa y sneakers. El catalogo (`/sneakers`) es publico. Todo el router de pedidos (`/orders`) queda protegido con un unico `router.use(authenticate)`, asi cualquier ruta futura que se agregue ahi hereda la proteccion. El middleware valida un JWT y deja `req.user`. Cada usuario solo ve y crea sus propios pedidos:

- Sin token o token invalido/expirado: `401`.
- Token valido pero pedido de otro usuario: `403`.

Usuarios de prueba: `ana / demo123` y `luis / demo456`. Configurable con `JWT_SECRET` y `JWT_EXPIRES_IN`.

## Como ejecutar

```bash
npm install
npm start
```

## Como probar

```bash
curl http://localhost:4016/sneakers
curl -X POST http://localhost:4016/auth/login -H "Content-Type: application/json" -d "{\"username\":\"ana\",\"password\":\"demo123\"}"
curl http://localhost:4016/orders -H "Authorization: Bearer TOKEN"
curl http://localhost:4016/orders/1 -H "Authorization: Bearer TOKEN"
curl -X POST http://localhost:4016/orders -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d "{\"sneakerId\":3,\"size\":41,\"quantity\":2}"
```

## Como probar los casos de error

```bash
curl http://localhost:4016/orders
curl http://localhost:4016/orders -H "Authorization: Bearer token.falso.aqui"
curl http://localhost:4016/orders/2 -H "Authorization: Bearer TOKEN_DE_ANA"
curl -X POST http://localhost:4016/orders -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d "{\"sneakerId\":99,\"size\":41,\"quantity\":1}"
```

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/auth.routes.js
├── routes/sneakers.routes.js
├── routes/orders.routes.js
├── controllers/auth.controller.js
├── controllers/sneakers.controller.js
├── controllers/orders.controller.js
├── services/auth.service.js
├── services/sneakers.service.js
├── services/orders.service.js
└── middlewares/authenticate.js
```
