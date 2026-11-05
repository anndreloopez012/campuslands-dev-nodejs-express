# Intermedio - Ejercicio 21: Rate Limit Conceptual
> **Autor:** Anderson Oloroso | **Temática:** Animación 3D | **Tema:** Rate limit conceptual

## Descripción
Implementa una política de **Limitación de Tasa (Rate Limiting)** en memoria que protege recursos de cómputo intensivo (granjas de renderizado 3D) admitiendo como máximo 5 peticiones por minuto por cliente IP y respondiendo con código HTTP `429 Too Many Requests` una vez rebasado dicho límite.

## Instalación y ejecución
```bash
cd intermedio/ejercicio-21/resoluciones/anderson-oloroso
npm install
npm start
npm run dev
```

## Endpoints
- `GET /intermedio/ejercicio-21` -> Health check.
- `POST /api/render-farm/render-jobs` -> Encolar render (máx 5 peticiones por minuto).

## Estructura
```text
intermedio/ejercicio-21/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── controllers/
    │   └── render.controller.js
    ├── middlewares/
    │   └── rateLimit.middleware.js
    └── routes/
        └── render.routes.js
```
