# Intermedio - Ejercicio 19: Dotenv y Config
> **Autor:** Anderson Oloroso | **Temática:** Tatuajes | **Tema:** Dotenv y config

## Descripción
Centraliza el manejo de configuración del sistema a través de un módulo seguro (`src/config/index.js`), con plantilla `.env.example` para desarrolladores, evitando exponer secretos o llaves API sensibles en las respuestas JSON.

## Instalación y ejecución
```bash
cd intermedio/ejercicio-19/resoluciones/anderson-oloroso
npm install
npm start
npm run dev
```

## Endpoints
- `GET /intermedio/ejercicio-19` -> Health check.
- `GET /api/tattoos/studio-info` -> Consulta información de configuración cargada.

## Estructura
```text
intermedio/ejercicio-19/resoluciones/anderson-oloroso/
├── .env.example
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── config/
    │   └── index.js
    ├── controllers/
    │   └── tattoos.controller.js
    └── routes/
        └── tattoos.routes.js
```
