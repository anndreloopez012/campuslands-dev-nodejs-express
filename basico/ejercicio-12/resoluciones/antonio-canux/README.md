# Ejercicio 12 - async / await (Películas de Miedo)

**Camper:** Antonio Canux  
**Tema:** `async / await` en Node.js y Express  
**Temática:** Películas de Miedo (Horror Movies)  
**Ruta base:** `/basico/ejercicio-12`

---

## 📌 Descripción

Esta entrega implementa una API REST modular construida con Node.js y Express aplicando el paradigma asíncrono moderno con `async / await` y manejo estructurado de errores con bloques `try / catch`.

El sistema gestiona un catálogo de películas clásicas y modernas de terror con filtros por subgénero (Slasher, Terror Psicológico, Sobrenatural, etc.), calificación mínima, búsqueda por texto, selección de película aleatoria y registro con validación estricta de datos.

---

## Estructura del Proyecto

```text
basico/ejercicio-12/resoluciones/antonio-canux/
├── .gitignore
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── controllers/
    │   └── movies.controller.js
    ├── routes/
    │   └── movies.routes.js
    └── services/
        └── movies.service.js
```

- **`src/app.js`**: Inicialización de Express, configuración de middlewares (`express.json`), enrutamiento en `/basico/ejercicio-12` y middleware para rutas 404 y errores 500.
- **`src/routes/movies.routes.js`**: Definición declarativa de rutas y endpoints.
- **`src/controllers/movies.controller.js`**: Manejo de peticiones HTTP, extracción de datos (`req.params`, `req.query`, `req.body`), validaciones y respuestas HTTP estandarizadas.
- **`src/services/movies.service.js`**: Lógica de negocio y persistencia en memoria, simulando operaciones asíncronas de base de datos con `Promises` y retardos controlados.

---

## Instalación y Ejecución

1. Navegar hasta la carpeta del ejercicio:
   ```bash
   cd basico/ejercicio-12/resoluciones/antonio-canux
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar en modo desarrollo (con recarga automática):
   ```bash
   npm run dev
   ```

4. O iniciar en modo normal:
   ```bash
   npm start
   ```

El servidor quedará disponible en: `http://localhost:3000/basico/ejercicio-12`

---

## 📡 Endpoints de la API

### 1. Estado del Ejercicio (Requerido por el Trainer)
- **Método:** `GET`
- **Ruta:** `/basico/ejercicio-12`
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "message": "Ejercicio ejecutado correctamente",
    "topic": "async await"
  }
  ```

---

### 2. Listar Películas de Miedo
- **Método:** `GET`
- **Ruta:** `/basico/ejercicio-12/movies`
- **Parámetros Opcionales (Query Params):**
  - `subgenre`: Filtrar por subgénero (ej. `slasher`, `psicológico`).
  - `minRating`: Calificación mínima (ej. `7.5`).
- **Ejemplo:** `GET /basico/ejercicio-12/movies?subgenre=slasher&minRating=7`
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "message": "Películas de terror obtenidas con éxito mediante async/await",
    "total": 3,
    "data": [
      {
        "id": 2,
        "title": "Halloween",
        "director": "John Carpenter",
        "year": 1978,
        "subgenre": "Slasher",
        "rating": 7.7,
        "synopsis": "Quince años después de asesinar a su hermana, Michael Myers escapa de un hospital psiquiátrico..."
      }
    ]
  }
  ```

---

### 3. Obtener Película por ID
- **Método:** `GET`
- **Ruta:** `/basico/ejercicio-12/movies/:id`
- **Ejemplo:** `GET /basico/ejercicio-12/movies/1`
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "message": "Película encontrada exitosamente",
    "data": {
      "id": 1,
      "title": "The Shining",
      "director": "Stanley Kubrick",
      "year": 1980,
      "subgenre": "Terror Psicológico",
      "rating": 8.4,
      "synopsis": "Una familia se traslada a un hotel aislado para el invierno..."
    }
  }
  ```
- **Respuesta de Error (404 Not Found):**
  ```json
  {
    "ok": false,
    "message": "No se encontró ninguna película de miedo con el ID 999"
  }
  ```

---

### 4. Búsqueda por Título
- **Método:** `GET`
- **Ruta:** `/basico/ejercicio-12/movies/search?title=shining`
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "message": "Búsqueda completada satisfactoriamente",
    "total": 1,
    "data": [...]
  }
  ```

---

### 5. Recomendación de Susto Aleatoria
- **Método:** `GET`
- **Ruta:** `/basico/ejercicio-12/movies/random`
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "message": "¡Prepárate para el susto! Película aleatoria seleccionada",
    "data": {
      "id": 3,
      "title": "Hereditary",
      "director": "Ari Aster",
      "year": 2018,
      "subgenre": "Terror Sobrenatural",
      "rating": 7.3,
      "synopsis": "..."
    }
  }
  ```

---

### 6. Registrar Nueva Película
- **Método:** `POST`
- **Ruta:** `/basico/ejercicio-12/movies`
- **Headers:** `Content-Type: application/json`
- **Cuerpo de la Petición:**
  ```json
  {
    "title": "It Follows",
    "director": "David Robert Mitchell",
    "year": 2014,
    "subgenre": "Terror Sobrenatural",
    "rating": 6.8,
    "synopsis": "Una joven es perseguida por una entidad sobrenatural tras un encuentro íntimo."
  }
  ```
- **Respuesta de Éxito (201 Created):**
  ```json
  {
    "ok": true,
    "message": "Película de terror agregada correctamente",
    "data": {
      "id": 8,
      "title": "It Follows",
      "director": "David Robert Mitchell",
      "year": 2014,
      "subgenre": "Terror Sobrenatural",
      "rating": 6.8,
      "synopsis": "Una joven es perseguida por una entidad sobrenatural tras un encuentro íntimo."
    }
  }
  ```
- **Respuesta de Error de Validación (400 Bad Request):**
  ```json
  {
    "ok": false,
    "message": "El campo 'title' es obligatorio y debe ser un texto válido"
  }
  ```

---

## 🧪 Pruebas Rápidas con cURL

```bash
# 1. Comprobar estado del ejercicio
curl http://localhost:3000/basico/ejercicio-12

# 2. Listar todas las películas
curl http://localhost:3000/basico/ejercicio-12/movies

# 3. Filtrar por subgénero y calificación
curl "http://localhost:3000/basico/ejercicio-12/movies?subgenre=slasher&minRating=7.5"

# 4. Obtener por ID
curl http://localhost:3000/basico/ejercicio-12/movies/1

# 5. Buscar película
curl "http://localhost:3000/basico/ejercicio-12/movies/search?title=nightmare"

# 6. Susto aleatorio
curl http://localhost:3000/basico/ejercicio-12/movies/random

# 7. Crear nueva película
curl -X POST http://localhost:3000/basico/ejercicio-12/movies \
  -H "Content-Type: application/json" \
  -d '{"title":"The Babadook","director":"Jennifer Kent","year":2014,"subgenre":"Terror Psicológico","rating":6.8,"synopsis":"Una madre soltera y su hijo son atormentados por un monstruo salido de un libro infantil."}'
```
