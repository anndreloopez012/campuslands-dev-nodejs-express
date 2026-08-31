# Ejercicio 16 - primer servidor Express (Juan Lema)

## Que hace

Tematica ropa y sneakers. Primer servidor con Express: `app.js` define la app y las rutas (`GET /`, `GET /health` via router, 404 handler); `server.js` la levanta.

## Como ejecutar

```bash
npm install
npm start
```

## Como probar

```bash
curl http://localhost:3016/
curl http://localhost:3016/health
curl http://localhost:3016/no-existe
```

## Estructura

```text
src/
├── app.js
├── server.js
└── routes/
    └── health.routes.js
```
