# Intermedio - Ejercicio 20: CORS Controlado
> **Autor:** Anderson Oloroso | **Temática:** Dibujo digital | **Tema:** CORS controlado

## Descripción
Implementa una política estricta y segura de intercambio de recursos de origen cruzado (**CORS**) utilizando un middleware dedicado que valida el origen contra una lista blanca (`https://campuslands.com`, `https://artstation-draw.dev`), gestiona cabeceras de respuesta y responde adecuadamente a las solicitudes preflight `OPTIONS`.

## Instalación y ejecución
```bash
cd intermedio/ejercicio-20/resoluciones/anderson-oloroso
npm install
npm start
npm run dev
```

## Endpoints
- `GET /intermedio/ejercicio-20` -> Health check.
- `GET /api/digital-art/galleries` -> Galería protegida por política CORS.

## Estructura
```text
intermedio/ejercicio-20/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── controllers/
    │   └── art.controller.js
    ├── middlewares/
    │   └── cors.middleware.js
    └── routes/
        └── art.routes.js
```
