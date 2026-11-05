# Intermedio - Ejercicio 14: Autenticación Simulada
> **Autor:** Anderson Oloroso | **Temática:** Libros | **Tema:** Autenticación simulada

## Descripción
Demuestra la protección de rutas mediante un middleware de autenticación por Bearer Token (`mockAuthMiddleware`). Separa rutas públicas de lectura (`GET /api/books/catalog`) de rutas restringidas de escritura (`POST /api/books/catalog`), validando cabeceras `Authorization` y respondiendo con `401 Unauthorized` o `403 Forbidden`.

Tokens válidos para prueba:
- `token-bibliotecario-secreto`
- `token-admin-2026`

## Instalación y ejecución
```bash
cd intermedio/ejercicio-14/resoluciones/anderson-oloroso
npm install
npm start
npm run dev
```

## Endpoints
- `GET /intermedio/ejercicio-14` -> Health check.
- `GET /api/books/catalog` -> Catálogo público de libros.
- `POST /api/books/catalog` -> Agregar libro (requiere cabecera Authorization).

### Ejemplo con autenticación
```bash
curl -X POST http://localhost:3000/api/books/catalog \
  -H "Authorization: Bearer token-bibliotecario-secreto" \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Ficciones","autor":"Jorge Luis Borges","paginas":210}'
```

## Estructura
```text
intermedio/ejercicio-14/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── controllers/
    │   └── books.controller.js
    ├── middlewares/
    │   └── auth.middleware.js
    ├── routes/
    │   └── books.routes.js
    └── services/
        └── books.service.js
```
