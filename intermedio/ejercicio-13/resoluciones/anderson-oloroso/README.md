# Intermedio - Ejercicio 13: Relaciones Simples
> **Autor:** Anderson Oloroso | **Temática:** Ciencia ficción | **Tema:** Relaciones simples

## Descripción
Modela una relación 1 a N (Una nave espacial contiene muchos tripulantes) vinculando entidades mediante una clave foránea conceptual (`shipId`).

## Instalación y ejecución
```bash
cd intermedio/ejercicio-13/resoluciones/anderson-oloroso
npm install
npm start
npm run dev
```

## Endpoints
- `GET /intermedio/ejercicio-13` -> Health check.
- `GET /api/scifi/ships` -> Listar todas las naves con conteo de tripulación.
- `GET /api/scifi/ships/:id/crew` -> Obtener la nave con su lista completa de tripulantes asociados.
- `POST /api/scifi/ships/:id/crew` -> Asignar un nuevo tripulante a la nave indicada.

## Estructura
```text
intermedio/ejercicio-13/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── controllers/
    │   └── scifi.controller.js
    ├── routes/
    │   └── scifi.routes.js
    └── services/
        └── scifi.service.js
```
