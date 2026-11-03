# Ejercicio 12: Subrecursos REST

## Propósito

Representar las reseñas como subrecurso de una película de terror. Las operaciones se realizan bajo `/api/movies/:movieId/reviews`, manteniendo visible la relación entre la película y sus reseñas.

## Ejecución y prueba

Requiere Node.js 20 o superior. Ejecuta `npm install` y `npm run dev`. `GET /api/movies/1/reviews` lista las reseñas de la película; una película inexistente devuelve `404`.
