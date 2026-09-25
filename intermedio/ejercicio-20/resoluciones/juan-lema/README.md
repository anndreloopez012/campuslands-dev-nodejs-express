# Ejercicio 20 - CORS controlado (Juan Lema)

## Que hace

Tematica dibujo digital. CORS es una politica que **aplica el navegador**: el servidor declara que origenes pueden leer sus respuestas. "Controlado" significa una lista explicita de origenes, nunca `*`. `src/middlewares/cors-policy.js` usa el paquete `cors` con:

- **Lista blanca de origenes** por `CORS_ORIGINS` (separados por coma, con espacios recortados). Por defecto `http://localhost:5173` y `http://localhost:3000`. Un origen es esquema + host + puerto: `localhost:5174` o `https://localhost:5173` son otros origenes. Si la lista incluye `*` la app no arranca.
- **Metodos y headers acotados**: solo `GET`, `POST`, `DELETE` y el header `Content-Type`. El navegador bloquea por si mismo `PUT` o `Authorization`.
- **Preflight** (`OPTIONS`) respondido con `204` y cacheado 10 minutos (`maxAge: 600`).
- **Rechazo activo**: un origen no permitido recibe `403`. Solo omitir los headers CORS no basta, porque ciertas peticiones (por ejemplo un `POST` con `text/plain`) el navegador las envia sin preflight y el servidor las ejecutaria aunque el navegador ocultara la respuesta.
- Las peticiones **sin header `Origin`** (curl, otro servidor, mismo origen) pasan: CORS no es autenticacion, un cliente que no sea navegador puede falsear `Origin`. Para proteger datos usa autenticacion (ejercicios 14 a 17).

`GET /cors` muestra la politica vigente. `middlewares/error-handler.js` convierte el rechazo en una respuesta JSON.

## Como ejecutar

```bash
npm install
npm start
```

Con otra lista de origenes:

```bash
CORS_ORIGINS=https://estudio.example.com,http://localhost:5174 npm start
```

## Como probar

Sin `Origin` (curl) y con un origen permitido:

```bash
curl http://localhost:4020/artworks
curl -i http://localhost:4020/artworks -H "Origin: http://localhost:5173"
curl -X POST http://localhost:4020/artworks -H "Content-Type: application/json" -d "{\"title\":\"Aurora\",\"artist\":\"Lia Torres\",\"tool\":\"procreate\",\"layers\":12}"
curl http://localhost:4020/cors
```

Preflight de un `POST` con JSON desde un origen permitido:

```bash
curl -i -X OPTIONS http://localhost:4020/artworks -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: content-type"
```

Desde el navegador (consola de una pagina servida en `http://localhost:5173`):

```js
fetch("http://localhost:4020/artworks").then((r) => r.json()).then(console.log);
```

## Como probar los casos de error

```bash
curl -i http://localhost:4020/artworks -H "Origin: http://evil.example.com"
curl -i http://localhost:4020/artworks -H "Origin: http://localhost:5174"
curl -i -X OPTIONS http://localhost:4020/artworks -H "Origin: http://evil.example.com" -H "Access-Control-Request-Method: POST"
curl http://localhost:4020/artworks/99
curl -X POST http://localhost:4020/artworks -H "Content-Type: application/json" -d "{\"title\":\"Sin autor\"}"
```

Un origen no permitido debe responder `403` sin `Access-Control-Allow-Origin`. Con `CORS_ORIGINS=* npm start` la app no arranca.

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/artworks.routes.js
├── controllers/artworks.controller.js
├── services/artworks.service.js
└── middlewares/
    ├── cors-policy.js
    └── error-handler.js
```
