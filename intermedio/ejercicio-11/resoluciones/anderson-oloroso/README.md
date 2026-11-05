# Intermedio - Ejercicio 11: Búsqueda Textual
> **Autor:** Anderson Oloroso | **Temática:** Música | **Tema:** Búsqueda textual

## Descripción
Implementa un endpoint de búsqueda textual flexible que permite filtrar colecciones coincidentes en múltiples propiedades (título, artista, álbum, género) de manera insensible a mayúsculas y minúsculas mediante `req.query.q`.

## Instalación y ejecución
```bash
cd intermedio/ejercicio-11/resoluciones/anderson-oloroso
npm install
npm start
npm run dev
```

## Endpoints
- `GET /intermedio/ejercicio-11` -> Health check del tema.
- `GET /api/music/tracks?q=queen` -> Búsqueda textual de canciones.

### Ejemplo
```bash
curl "http://localhost:3000/api/music/tracks?q=rock"
```
```json
{
  "ok": true,
  "criterioBusqueda": "rock",
  "total": 2,
  "data": [
    { "id": 1, "titulo": "Bohemian Rhapsody", "artista": "Queen", "genero": "Rock" },
    { "id": 4, "titulo": "Hotel California", "artista": "Eagles", "genero": "Rock Clásico" }
  ]
}
```

## Estructura
```text
intermedio/ejercicio-11/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── controllers/
    │   └── music.controller.js
    ├── routes/
    │   └── music.routes.js
    └── services/
        └── music.service.js
```
