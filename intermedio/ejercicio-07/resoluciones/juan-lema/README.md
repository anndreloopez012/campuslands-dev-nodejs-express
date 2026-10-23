# Ejercicio 07 - middleware de errores (Juan Lema)

## Que hace

Tematica autos de lujo. `cars.service.js` lanza errores con `.status` (400/404) en vez de responder HTTP directamente. Los controllers solo hacen `try/catch` y `next(error)`. `middlewares/error-handler.js` es el unico lugar que arma la respuesta JSON de error, montado al final de `app.js`.

## Como ejecutar

```bash
npm install
npm start
```

## Como probar

```bash
curl http://localhost:4007/cars
curl http://localhost:4007/cars/1
curl -X POST http://localhost:4007/cars -H "Content-Type: application/json" -d "{\"brand\":\"Lamborghini\",\"model\":\"Urus\",\"price\":260000}"
```

## Como probar los casos de error

```bash
curl http://localhost:4007/cars/99
curl http://localhost:4007/cars/abc
curl -X POST http://localhost:4007/cars -H "Content-Type: application/json" -d "{\"brand\":\"Lamborghini\"}"
```

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/cars.routes.js
├── controllers/cars.controller.js
├── services/cars.service.js
└── middlewares/error-handler.js
```
