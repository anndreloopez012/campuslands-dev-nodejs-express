# INTERMEDIO 12 - Subrecursos REST

## Objetivo

Crear una API Node.js con Express que modele relaciones jerarquicas con subrecursos: resenas (`/reviews`) que siempre pertenecen a una pelicula (`/movies/:peliculaId`). El cuerpo de la ruta define la "existencia base": si la pelicula no existe, la operacion de resena falla.

## Concepto principal

```
GET    /movies/:peliculaId/reviews      -> lista las resenas de esa pelicula
GET    /movies/:peliculaId/reviews/:id  -> una resena concreta de esa pelicula
POST   /movies/:peliculaId/reviews      -> crea la resena de esa pelicula
DELETE /movies/:peliculaId/reviews/:id  -> la elimina, si pertenece a esa pelicula
```

Reglas de negocio para los subrecursos:

1. La existencia del **padre** es la primera verificación: si `/movies/999/reviews` no hay que listar nada; responde 404 sobre la pelicula.
2. Una resena requiere **padre e hijo CORRECTO juntos** (`peliculaId` + resena): pedir `/movies/2/reviews/1` falla incluso si `id 1` es una resena existente en otra pelicula.
3. El id de la resena no se incluye al crear: viene en la ruta (`peliculaId`) y el id se genera en el servicio.

Esto evita resenas huerfanas: no puede existir una resena sin pelicula.

## Estructura del proyecto

```text
resoluciones/carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── errors/
    │   └── app.error.js
    ├── middlewares/
    │   └── error.handler.js
    ├── routes/
    │   └── movies.routes.js
    ├── controllers/
    │   ├── movies.controller.js
    │   └── reviews.controller.js
    └── services/
        └── movies.service.js
```

## Como ejecutar

```bash
npm install
npm run start   # produccion
npm run dev     # desarrollo con recarga automatica
```

## Endpoints

| Metodo | Ruta | Descripcion | Codigo |
| ------ | ---- | ----------- | ------ |
| GET | /health | Verifica el estado del servidor | 200 |
| GET/POST | /movies | Lista / crea peliculas | 200 / 201 |
| GET | /movies/:id | Detalle de una pelicula | 200 / 404 |
| GET/POST | /movies/:peliculaId/reviews | Lista / crea resenas | 200 / 201 |
| GET/DELETE | /movies/:peliculaId/reviews/:id | Detalle / borra una resena | 200 / 404 |

## Ejemplos de peticiones

```bash
# Lista resenas de la pelicula 1
curl http://localhost:3000/movies/1/reviews

# Detalle de una resena concreta
curl http://localhost:3000/movies/1/reviews/2

# Caso de error: la resena existe pero pertenece a otra pelicula -> 404
curl http://localhost:3000/movies/2/reviews/1

# Caso de error: pelicula inexistente (padre invalido) -> 404
curl http://localhost:3000/movies/999/reviews

# Crear resena
curl -X POST http://localhost:3000/movies/2/reviews \
  -H "Content-Type: application/json" \
  -d '{"autor": "mediodia_frio", "puntaje": 7, "comentario": "Sustos efectivos para ver con amigos"}'

# Caso de error: comentario muy corto -> 400
curl -X POST http://localhost:3000/movies/2/reviews \
  -H "Content-Type: application/json" \
  -d '{"autor": "algo", "puntaje": 5, "comentario": "malo"}'

# Eliminar resena
curl -X DELETE http://localhost:3000/movies/1/reviews/2
```

## Punto clave

La referencia padre se toma de la **ruta**, nunca del cuerpo del POST: `peliculaId` no es un campo que el cliente declare, es el contexto de la URL.
