# Básico - Ejercicio 27: Logs Simples
> **Autor:** Anderson Oloroso | **Temática:** MOBA esports | **Tema:** Logs simples

## Descripción
Implementa un middleware personalizado de logging para Express (`simpleLogger`) que captura en consola la marca de tiempo ISO, el verbo HTTP, la URL solicitada, el código de estado de respuesta y el tiempo total de procesamiento en milisegundos.

## Instalación y ejecución
```bash
cd basico/ejercicio-27/resoluciones/anderson-oloroso
npm install
npm start
npm run dev
```

Al recibir peticiones, el servidor mostrará en su consola líneas como:
```text
[HTTP LOG] 2026-10-28T22:15:00.000Z | GET /api/moba/tournaments | Status: 200 | 4ms
```

## Endpoints
- `GET /basico/ejercicio-27` - Health check.
- `GET /api/moba/tournaments` - Listar torneos.
- `POST /api/moba/tournaments` - Registrar torneo.

## Estructura
```text
basico/ejercicio-27/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── controllers/
    │   └── moba.controller.js
    ├── middlewares/
    │   └── logger.middleware.js
    ├── routes/
    │   └── moba.routes.js
    └── services/
        └── moba.service.js
```
