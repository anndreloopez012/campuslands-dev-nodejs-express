# Ejercicio 12 - subrecursos REST (Juan Lema)

## Que hace

Tematica peliculas de miedo. Las resenas son un subrecurso de las peliculas: `/movies/:movieId/reviews`. `reviews.routes.js` usa `Router({ mergeParams: true })` y se monta dentro de `movies.routes.js`. Toda ruta de resenas valida primero que la pelicula exista (400/404) y solo devuelve o crea resenas de esa pelicula.

## Como ejecutar

```bash
npm install
npm start
```

## Como probar

```bash
curl http://localhost:4012/movies
curl http://localhost:4012/movies/1
curl http://localhost:4012/movies/1/reviews
curl http://localhost:4012/movies/1/reviews/2
curl -X POST http://localhost:4012/movies/2/reviews -H "Content-Type: application/json" -d "{\"author\":\"Diego\",\"rating\":5,\"comment\":\"Pesadilla pura\"}"
curl -X POST http://localhost:4012/movies -H "Content-Type: application/json" -d "{\"title\":\"Noche Sin Luna\",\"year\":2024,\"director\":\"Ines Roca\"}"
```

## Como probar los casos de error

```bash
curl http://localhost:4012/movies/99/reviews
curl http://localhost:4012/movies/abc/reviews
curl http://localhost:4012/movies/2/reviews/1
curl -X POST http://localhost:4012/movies/1/reviews -H "Content-Type: application/json" -d "{\"author\":\"Diego\",\"rating\":9}"
```

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/movies.routes.js
├── routes/reviews.routes.js
├── controllers/movies.controller.js
├── controllers/reviews.controller.js
├── services/movies.service.js
└── services/reviews.service.js
```
