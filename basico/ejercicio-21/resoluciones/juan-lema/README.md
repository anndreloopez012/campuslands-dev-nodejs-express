# Ejercicio 21 - estructura src routes controllers (Juan Lema)

## Que hace

Tematica animacion 3D. Estructura consolidada: `routes/index.js` centraliza y agrupa `scenes.routes.js`, que delega en `controllers/scenes.controller.js`, que a su vez usa `services/scenes.service.js`. `app.js` solo monta el router central.

## Como ejecutar

```bash
npm install
npm start
```

## Como probar

```bash
curl http://localhost:3021/scenes
curl http://localhost:3021/scenes/1
curl -X POST http://localhost:3021/scenes -H "Content-Type: application/json" -d "{\"name\":\"Explosion final\",\"frames\":360}"
```

## Como probar los casos de error

```bash
curl http://localhost:3021/scenes/99
curl http://localhost:3021/scenes/abc
```

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/
│   ├── index.js
│   └── scenes.routes.js
├── controllers/
│   └── scenes.controller.js
└── services/
    └── scenes.service.js
```
