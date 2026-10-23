# Ejercicio 14 — Validación de entrada

**Temática:** libros · **Nivel:** Básico inicial

## Objetivo

Nunca confiar en lo que envía el cliente: validar el cuerpo (`req.body`), los parámetros de ruta (`req.params`) y la query (`req.query`) antes de usarlos, y responder `400` con mensajes claros por cada campo.

## Requisitos

- Node.js 20 o superior

## Instalación y ejecución

```bash
npm install
npm start
npm run dev
npm test
```

Servidor en `http://localhost:3000` (configurable con `PORT`).

## Estructura

```text
ejercicio-14/
├── package.json
├── README.md
├── src/
│   ├── app.js
│   ├── server.js
│   ├── validators/book.validator.js   # funciones puras, fáciles de probar
│   ├── routes/index.js
│   ├── controllers/books.controller.js
│   └── services/books.service.js
└── test/app.test.js
```

## Reglas de validación

| Campo | Regla |
| --- | --- |
| `title` | Obligatorio, texto de 1 a 120 caracteres (se recortan espacios) |
| `author` | Obligatorio, texto de 2 a 80 caracteres |
| `year` | Obligatorio, entero entre 1000 y el año actual |
| `pages` | Obligatorio, entero entre 1 y 5000 |
| `isbn` | Opcional, 10 o 13 dígitos (se aceptan guiones y se normalizan) |
| `tags` | Opcional, hasta 5 textos de 1 a 30 caracteres (se pasan a minúsculas) |

Query de `GET /books`: `page` (entero ≥ 1, por defecto 1), `limit` (1 a 50, por defecto 10) y `q` (texto de hasta 50 caracteres).

Los campos desconocidos (por ejemplo `"admin": true`) se **descartan**: solo se guarda lo que está en la lista blanca.

## Endpoints

| Método | Ruta | Descripción | Códigos |
| --- | --- | --- | --- |
| GET | `/health` | Estado del servicio | 200 |
| GET | `/basico/ejercicio-14` | Endpoint principal | 200 |
| GET | `/books?page=1&limit=10&q=asimov` | Lista con paginación y búsqueda | 200, 400 |
| GET | `/books/:id` | Detalle | 200, 400, 404 |
| POST | `/books` | Crea un libro validado | 201, 400 |

## Ejemplos

```bash
curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -d '{"title":"Dune","author":"Frank Herbert","year":1965,"pages":412}'

curl -i -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -d '{"title":"","year":"1965"}'

curl "http://localhost:3000/books?limit=2&page=2"
curl -i "http://localhost:3000/books?page=-1"
```

Respuesta de error (`400`), con todos los problemas a la vez:

```json
{
  "ok": false,
  "message": "Datos invalidos",
  "errors": [
    { "field": "title", "message": "Obligatorio, texto de 1 a 120 caracteres" },
    { "field": "author", "message": "Obligatorio, texto de 2 a 80 caracteres" },
    { "field": "year", "message": "Obligatorio, entero entre 1000 y 2026" },
    { "field": "pages", "message": "Obligatorio, entero entre 1 y 5000" }
  ]
}
```

## Conceptos aplicados

- Validar **tipo, rango y formato**, no solo que el campo exista (`"1965"` es texto, no entero).
- Los `req.query` y `req.params` siempre llegan como texto: se convierten con `Number()` y se comprueba el resultado.
- Se rechazan cuerpos que no son objetos (`null`, arreglos, texto).
- El validador está separado del controlador: son funciones puras que se prueban sin levantar el servidor.

## Pruebas

```bash
npm test
```
