# Básico - Ejercicio 26: Códigos de Estado
> **Autor:** Anderson Oloroso | **Temática:** Shooters competitivos | **Tema:** Códigos de estado

## Descripción
Demuestra la implementación y manejo estricto de códigos de estado HTTP en Express:
- `200 OK`: Consulta exitosa o acción completada con contenido.
- `201 Created`: Recurso creado exitosamente (Lobby nuevo).
- `204 No Content`: Eliminación exitosa sin cuerpo de retorno.
- `400 Bad Request`: Petición incompleta o parámetros faltantes.
- `404 Not Found`: Recurso no encontrado (Lobby inexistente).
- `409 Conflict`: Conflicto de estado (Jugador ya en el lobby o lobby lleno).

## Instalación y ejecución
```bash
cd basico/ejercicio-26/resoluciones/anderson-oloroso
npm install
npm start
npm run dev
```

## Endpoints
- `GET /basico/ejercicio-26` -> Health check.
- `GET /api/shooters/lobbies` -> (200 OK) Listar lobbies.
- `POST /api/shooters/lobbies` -> (201 Created) Crear lobby.
- `POST /api/shooters/lobbies/:id/join` -> (200 OK / 409 Conflict) Unir jugador.
- `DELETE /api/shooters/lobbies/:id` -> (204 No Content) Eliminar lobby.

## Estructura
```text
basico/ejercicio-26/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── controllers/
    │   └── lobby.controller.js
    ├── routes/
    │   └── lobby.routes.js
    └── services/
        └── lobby.service.js
```
