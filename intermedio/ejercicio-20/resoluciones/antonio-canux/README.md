# Ejercicio 020: CORS Controlado

- **Camper:** Antonio Canux
- **Nivel:** Intermedio
- **Tema:** CORS Controlado (dibujo digital)

## Estructura de Carpetas

```text
intermedio/ejercicio-20/resoluciones/antonio-canux/
├── README.md
├── package.json
├── src/app.js
├── src/controllers/artworks.controller.js
├── src/data/artworks.data.js
├── src/middlewares/cors.middleware.js
├── src/routes/artworks.routes.js
└── src/server.js
```

## Cómo funciona

- Solo los orígenes de `ALLOWED_ORIGINS` reciben los headers `Access-Control-*`.
- Un origen no permitido recibe 403; las peticiones `OPTIONS` (preflight) responden 204. Sin header `Origin` (curl, Postman) la petición pasa normal.

## Ejecución

```bash
npm install
npm run dev
```

## Pruebas con cURL

```bash
# Endpoint del ejercicio
curl http://localhost:3000/intermedio/ejercicio-20

# Origen permitido
curl -i http://localhost:3000/api/artworks -H "Origin: http://localhost:5173"

# Origen bloqueado (403)
curl -i http://localhost:3000/api/artworks -H "Origin: http://malicioso.com"

# Preflight
curl -i -X OPTIONS http://localhost:3000/api/artworks -H "Origin: http://localhost:5173"
```
