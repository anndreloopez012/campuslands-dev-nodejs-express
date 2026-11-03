# Ejercicio 14 - autenticacion simulada (Juan Lema)

## Que hace

Tematica libros. Autenticacion simulada sin librerias: `POST /auth/login` valida contra usuarios en memoria y devuelve un token opaco (`crypto.randomUUID()`) guardado en un `Map` de sesiones. `middlewares/authenticate.js` lee `Authorization: Bearer <token>`, resuelve el usuario y lo deja en `req.user`. `GET /books` es publico; `POST /books`, `GET /auth/me` y `POST /auth/logout` requieren token.

Usuarios de prueba: `lector / demo123` y `editor / demo456`.

## Como ejecutar

```bash
npm install
npm start
```

## Como probar

```bash
curl -X POST http://localhost:4014/auth/login -H "Content-Type: application/json" -d "{\"username\":\"lector\",\"password\":\"demo123\"}"
curl http://localhost:4014/auth/me -H "Authorization: Bearer TOKEN"
curl http://localhost:4014/books
curl -X POST http://localhost:4014/books -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d "{\"title\":\"El Aleph\",\"author\":\"Jorge Luis Borges\",\"year\":1949}"
curl -X POST http://localhost:4014/auth/logout -H "Authorization: Bearer TOKEN"
```

## Como probar los casos de error

```bash
curl -X POST http://localhost:4014/auth/login -H "Content-Type: application/json" -d "{\"username\":\"lector\",\"password\":\"mala\"}"
curl -X POST http://localhost:4014/auth/login -H "Content-Type: application/json" -d "{}"
curl http://localhost:4014/auth/me
curl -X POST http://localhost:4014/books -H "Content-Type: application/json" -d "{\"title\":\"Sin token\"}"
```

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/auth.routes.js
├── routes/books.routes.js
├── controllers/auth.controller.js
├── controllers/books.controller.js
├── services/auth.service.js
├── services/books.service.js
└── middlewares/authenticate.js
```
