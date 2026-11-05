# Básico - Ejercicio 21: Estructura src/routes/controllers
> **Autor:** Anderson Oloroso | **Temática:** Animación 3D | **Tema:** Estructura src routes controllers

## Descripción
API Express con estructura modular completa `src/routes/controllers/services` para gestión de escenas de animación 3D.

## Instalación y ejecución
```bash
cd basico/ejercicio-21/resoluciones/anderson-oloroso
npm install
npm start      # producción
npm run dev    # desarrollo con --watch
```

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/basico/ejercicio-21` | Health check del tema |
| GET | `/api/animation/scenes` | Listar todas las escenas |
| GET | `/api/animation/scenes/:id` | Obtener escena por ID |

### Ejemplo GET /basico/ejercicio-21
```json
{ "ok": true, "message": "Ejercicio ejecutado correctamente", "topic": "estructura src routes controllers" }
```

### Ejemplo GET /api/animation/scenes
```bash
curl http://localhost:3000/api/animation/scenes
```
```json
{ "ok": true, "total": 3, "data": [{ "id": 1, "nombre": "Apertura Forestal", "fps": 24 }] }
```

### Error 404 (ID inexistente)
```bash
curl http://localhost:3000/api/animation/scenes/99
```
```json
{ "ok": false, "message": "Escena con ID 99 no encontrada en el proyecto." }
```

## Estructura
```text
basico/ejercicio-21/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── controllers/
    │   └── scenes.controller.js
    ├── routes/
    │   └── scenes.routes.js
    └── services/
        └── scenes.service.js
```
