# Ejercicio 27 - logs simples (Juan Lema)

## Que hace

Tematica MOBA esports. `request-logger.js` es un middleware global que registra en consola cada request: metodo, ruta, status y duracion, usando `res.on("finish")` para capturar el status final.

## Como ejecutar

```bash
npm install
npm start
```

Al hacer peticiones veras logs como:

```text
[2026-08-26T04:40:00.000Z] GET /heroes -> 200 (2ms)
```

## Como probar

```bash
curl http://localhost:3027/heroes
curl -X POST http://localhost:3027/heroes -H "Content-Type: application/json" -d "{\"name\":\"Zeus\",\"role\":\"Mago\"}"
curl http://localhost:3027/no-existe
```

Revisa la consola del servidor: cada peticion, incluida la 404, queda registrada.

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/
│   └── heroes.routes.js
├── controllers/
│   └── heroes.controller.js
├── services/
│   └── heroes.service.js
└── middlewares/
    └── request-logger.js
```
