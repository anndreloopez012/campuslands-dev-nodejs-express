# Básico - Ejercicio 25: Respuestas HTTP Correctas
> **Autor:** Anderson Oloroso | **Temática:** Videojuegos RPG | **Tema:** Respuestas HTTP correctas

## Descripción
Demuestra el uso de respuestas HTTP estructuradas y consistentes con códigos de estado semánticos (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`) para la gestión de inventario en un juego RPG.

## Instalación y ejecución
```bash
cd basico/ejercicio-25/resoluciones/anderson-oloroso
npm install
npm start
npm run dev
```

## Endpoints
- `GET /basico/ejercicio-25` - Verificación del tema.
- `GET /api/rpg/inventory` - 200 OK con total y data.
- `GET /api/rpg/inventory/:id` - 200 OK si existe, 404 Not Found si no.
- `POST /api/rpg/inventory` - 201 Created con body válido, 400 Bad Request si faltan campos.

## Estructura
```text
basico/ejercicio-25/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── controllers/
    │   └── rpg.controller.js
    ├── routes/
    │   └── rpg.routes.js
    └── services/
        └── rpg.service.js
```
