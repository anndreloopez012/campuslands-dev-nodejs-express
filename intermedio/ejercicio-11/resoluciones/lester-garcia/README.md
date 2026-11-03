# API Catálogo Musical — Búsqueda Textual Multi-Campo (Full-Text / Partial Search Pattern)

Este repositorio implementa el estándar de Búsqueda Textual Normalizada, Tokenizada y Multi-Campo construido con Node.js y Express sobre la temática de música, canciones y catálogo discográfico.

---

## Características del Motor de Búsqueda

1. **Normalización Unicode (NFD):**
   Remueve diacríticos y acentos antes de comparar. `"canción"`, `"Cancion"` y `"CANCiÓN"` coinciden de manera idéntica.

2. **Búsqueda Multi-Campo:**
   Evalúa simultáneamente el título de la canción (`title`), artista (`artist`), álbum (`album`) y género musical (`genre`).

3. **Tokenización de Palabras Clave:**
   Divide la consulta `q` en palabras independientes, exigiendo que todos los términos existan en el registro (AND semántico).

4. **Respuesta Estructurada con Metadatos:**
   ```json
   {
     "status": "success",
     "requestId": "f4b0051e-62e9-4e58-8547-0744e8ec50fa",
     "search": {
       "query": "cancion",
       "tokensUsed": ["cancion"],
       "filtersApplied": { "genre": null, "minBpm": null, "maxBpm": null }
     },
     "pagination": {
       "currentPage": 1,
       "perPage": 5,
       "totalItems": 1,
       "totalPages": 1,
       "hasNextPage": false,
       "hasPrevPage": false
     },
     "data": [ ... ]
   }
   ```

---

## Estructura de Directorios

```text
src/
├── app.js                                       # Configuración global de Express y middlewares
├── server.js                                    # Arranque del servidor HTTP
├── routes/
│   └── tracks.routes.js                         # Rutas con validación de búsqueda
├── controllers/
│   └── tracks.controller.js                     # Controladores delgados
├── services/
│   └── tracks.service.js                        # Algoritmo de normalización, tokenización y filtrado
├── repositories/
│   └── tracks.inMemory.repository.js            # Catálogo musical en memoria
├── middlewares/
│   ├── requestId.middleware.js                  # Trazabilidad con UUID v4
│   ├── logger.middleware.js                     # Logger con request ID
│   ├── errorHandler.middleware.js               # Captura centralizada de errores
│   └── validators/
│       ├── validate.middleware.js               # Envoltorio de validación
│       └── search.validator.js                  # Validación de longitud mínima para query 'q'
├── utils/
│   ├── asyncHandler.js                          # Envoltorio asíncrono
│   └── customErrors.js                          # Clases de error (ValidationError, etc.)
.env                                             # Variables de entorno
.env.example                                     # Plantilla de variables
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

* **Base URL:** `/api/v1/music`

| Método | Endpoint | Query Params Soportados | Descripción |
| :--- | :--- | :--- | :--- |
| **GET** | `/tracks` | `q`, `genre`, `minBpm`, `maxBpm`, `page`, `limit` | Búsqueda textual multi-campo y catálogo paginado |
| **GET** | `/tracks/:id` | Ninguno | Obtener detalles de una pista por ID |
