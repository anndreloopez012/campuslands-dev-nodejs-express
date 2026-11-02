# Ejercicio 012: Subrecursos REST

- **Camper:** Antonio Canux
- **Nivel:** Intermedio
- **Tema:** Subrecursos REST (peliculas de miedo)

## Estructura de Carpetas

```text
intermedio/ejercicio-12/resoluciones/antonio-canux/
├── README.md
├── package.json
├── src/app.js
├── src/controllers/movies.controller.js
├── src/controllers/reviews.controller.js
├── src/data/movies.data.js
├── src/routes/movies.routes.js
├── src/routes/reviews.routes.js
└── src/server.js
```

## Cómo funciona

- Las reseñas viven bajo la película: `/api/movies/:movieId/reviews`.
- El router hijo usa `mergeParams: true` para leer `movieId`; si la película no existe responde 404.

## Ejecución

```bash
npm install
npm run dev
```

## Pruebas con cURL

```bash
# Endpoint del ejercicio
curl http://localhost:3000/intermedio/ejercicio-12

# Reseñas de una película
curl http://localhost:3000/api/movies/1/reviews

# Crear reseña
curl -X POST http://localhost:3000/api/movies/2/reviews -H "Content-Type: application/json" -d '{"author":"Sofía","rating":5,"comment":"Genial"}'

# Película inexistente (404)
curl http://localhost:3000/api/movies/99/reviews
```
