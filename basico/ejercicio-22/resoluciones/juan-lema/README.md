# Ejercicio 22 - servicios simples (Juan Lema)

## Que hace

Tematica arquitectura 3D. `render-budget.service.js` es un servicio simple: una funcion pura sin `req`/`res` que calcula el presupuesto de un render 3D. Se reutiliza en dos contextos distintos: el controlador HTTP (`POST /renders/budget`) y un script standalone (`quick-budget`), demostrando que el servicio no depende de Express.

## Como ejecutar

```bash
npm install
npm start
```

## Como probar

```bash
curl -X POST http://localhost:3022/renders/budget -H "Content-Type: application/json" -d "{\"width\":1920,\"height\":1080,\"complexity\":\"alta\"}"
```

Uso directo del servicio (sin servidor):

```bash
npm run quick-budget
```

## Como probar el caso de error

```bash
curl -X POST http://localhost:3022/renders/budget -H "Content-Type: application/json" -d "{\"width\":1920,\"height\":1080,\"complexity\":\"extrema\"}"
```

Debe responder 400 con `complexity debe ser 'baja', 'media' o 'alta'`.

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/
│   └── render.routes.js
├── controllers/
│   └── render.controller.js
├── services/
│   └── render-budget.service.js
└── scripts/
    └── quick-budget.js
```
