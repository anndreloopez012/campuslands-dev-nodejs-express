# Ejercicio 013: Relaciones Simples

- **Camper:** Antonio Canux
- **Nivel:** Intermedio
- **Tema:** Relaciones Simples (ciencia ficcion)

## Estructura de Carpetas

```text
intermedio/ejercicio-13/resoluciones/antonio-canux/
├── README.md
├── package.json
├── src/app.js
├── src/controllers/scifi.controller.js
├── src/data/scifi.data.js
├── src/routes/scifi.routes.js
└── src/server.js
```

## Cómo funciona

- Un autor tiene muchos libros; cada libro guarda `authorId`.
- `/authors/:id` incluye sus libros y `/books/:id` incluye su autor.

## Ejecución

```bash
npm install
npm run dev
```

## Pruebas con cURL

```bash
# Endpoint del ejercicio
curl http://localhost:3000/intermedio/ejercicio-13

# Autor con libros
curl http://localhost:3000/api/authors/1

# Libro con autor
curl http://localhost:3000/api/books/3

# Inexistente (404)
curl http://localhost:3000/api/books/99
```
