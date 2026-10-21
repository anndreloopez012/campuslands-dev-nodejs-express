# API Películas de Terror — Subrecursos REST (Nested Resources Pattern)

Este repositorio implementa el estándar de **Subrecursos REST Anidados (Nested Routes)** utilizando **Node.js** y **Express** sobre la temática de **películas de terror, directores y reseñas críticas de espectadores**.

---

## ¿Qué es un Subrecurso REST?

Cuando una entidad depende ontológicamente de otra (relación de composición 1 a N), su URI se modela jerárquicamente:

```text
/movies                             -> Colección de películas (Recurso Padre)
/movies/:id                         -> Detalle de una película
/movies/:movieId/reviews            -> Colección de reseñas de ESA película (Subrecurso Hijo)
/movies/:movieId/reviews/:reviewId  -> Reseña puntual de ESA película
```

### Rol de mergeParams: true
Por defecto en Express, un sub-router no tiene acceso a los parámetros de ruta definidos antes de su punto de montaje. La opción `{ mergeParams: true }` en `Router()` instruye al enrutador hijo para que herede `:movieId` desde el enrutador padre (`movies.routes.js`).

---

## Estructura de Directorios

```text
src/
├── app.js                                       # Configuración global y montaje de /movies
├── server.js                                    # Arranque del servidor HTTP
├── routes/
│   ├── movies.routes.js                         # Router padre: /movies y montaje de reviewsRouter
│   └── reviews.routes.js                        # Sub-router con mergeParams: true
├── controllers/
│   ├── movies.controller.js                     # Controladores de películas
│   └── reviews.controller.js                    # Controladores de reseñas anidadas
├── services/
│   ├── movies.service.js                        # Lógica de películas
│   └── reviews.service.js                       # Reglas de reseñas y validación de existencia del padre
├── repositories/
│   ├── movies.inMemory.repository.js            # Persistencia en memoria de películas
│   └── reviews.inMemory.repository.js           # Persistencia en memoria de reseñas
├── middlewares/
│   ├── requestId.middleware.js                  # Trazabilidad con UUID v4
│   ├── logger.middleware.js                     # Logger con request ID
│   ├── errorHandler.middleware.js               # Captura centralizada de errores
│   └── validators/
│       ├── validate.middleware.js               # Validador genérico
│       └── review.validator.js                  # Validación de ratings y comentarios
├── utils/
│   ├── asyncHandler.js                          # Envoltorio asíncrono
│   └── customErrors.js                          # Clases de error personalizadas
.env                                             # Variables de entorno
.env.example                                     # Plantilla de entorno
.gitignore                                       # Control de exclusiones
package.json                                     # Scripts y dependencias
```

---

## Configuración e Instalación

1. **Variables de entorno:**
   ```bash
   cp .env.example .env
   ```

2. **Dependencias:**
   ```bash
   npm install
   ```

3. **Modo desarrollo:**
   ```bash
   npm run dev
   ```

---

## Referencia de Endpoints

* **Base URL:** `/api/v1`

| Recurso | Método | Endpoint | Descripción | Header Requerido |
| :--- | :--- | :--- | :--- | :--- |
| **Películas** | **GET** | `/movies` | Listar catálogo de películas de terror | Ninguno |
| **Películas** | **GET** | `/movies/:id` | Consultar película por ID | Ninguno |
| **Reseñas** | **GET** | `/movies/:movieId/reviews` | Listar reseñas con promedio de calificación | Ninguno |
| **Reseñas** | **GET** | `/movies/:movieId/reviews/:reviewId` | Consultar reseña específica de una película | Ninguno |
| **Reseñas** | **POST** | `/movies/:movieId/reviews` | Publicar nueva reseña crítica para la película | `x-critic-key` |
| **Reseñas** | **DELETE** | `/movies/:movieId/reviews/:reviewId` | Eliminar una reseña específica | Ninguno |
