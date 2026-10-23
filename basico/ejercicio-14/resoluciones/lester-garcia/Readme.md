# API Libros y Librería — Validación de Entrada

Este proyecto es una API REST desarrollada con Node.js y Express sobre la temática de libros y gestión de biblioteca. El objetivo principal de este ejercicio es implementar middlewares dedicados a la validación y sanitización de entrada, asegurando que los datos recibidos mediante peticiones HTTP cumplan con formatos, tipos, campos obligatorios y rangos permitidos antes de llegar a los servicios y a la capa de datos.

## Tecnologías y Conceptos Aplicados

* **Node.js**: Entorno de ejecución en el servidor.
* **Express.js**: Framework web para la construcción de la API REST.
* **ES Modules (import/export)**: Sintaxis moderna configurada mediante `"type": "module"`.
* **Middleware de Validación Dedicado (validateCreateBook, validateBookId)**:
    * Inspección previa de `req.body` y `req.params`.
    * Comprobación de expresiones regulares para formatos específicos (ISBN-13).
    * Verificación estricta de tipos de datos, enteros positivos y rangos numéricos.
    * Sanitización de espacios en blanco (`trim()`) y normalización de precios.
    * Generación de un array detallado de errores por campo (`details`).
* **Arquitectura Limpia e Inmunizada**:
    * Los controladores y servicios asumen que la información recibida es 100% válida.
    * Separación clara entre errores de validación de entrada (400 Bad Request), conflictos de negocio (409 Conflict) y recursos inexistentes (404 Not Found).
* **Modo Desarrollo (node --watch)**: Recarga automática nativa de Node.js.

## 📂 Estructura del Proyecto

```plaintext
src/
├── app.js                              # Configuración de Express, rutas y middleware 404
├── server.js                           # Punto de entrada y arranque del servidor HTTP
├── routes/
│   └── books.routes.js                 # Rutas de la API con middlewares de validación inyectados
├── controllers/
│   └── books.controller.js             # Controladores de libros simplificados
├── services/
│   └── books.service.js                # Lógica de negocio y persistencia en archivo JSON
├── middlewares/
│   ├── validation.middleware.js        # Validadores y sanitizadores de datos de entrada
│   └── errorHandler.js                 # Middleware global para el formateo de errores
├── utils/
│   ├── asyncHandler.js                 # Envoltorio asíncrono para captura de promesas
│   └── customErrors.js                 # Clases de error personalizadas con soporte para errores de campo
└── data/
    └── books.json                      # Persistencia local de libros en formato JSON
.gitignore                              # Archivos omitidos por Git
package.json                            # Dependencias y scripts de ejecución
```

## ⚙️ Configuración del Proyecto

### 1. Archivo .gitignore

Evita la inclusión de dependencias y archivos generados automáticamente:

```plaintext
node_modules/
package-lock.json
```

### 2. Configuración de package.json

Asegura la configuración de ES Modules (`"type": "module"`):

```json
{
  "name": "books-input-validation",
  "version": "1.0.0",
  "type": "module",
  "main": "src/server.js",
  "scripts": {
    "dev": "node --watch src/server.js",
    "start": "node src/server.js"
  },
  "dependencies": {
    "express": "^4.19.2"
  }
}
```

### 3. Base de Datos Inicial (src/data/books.json)

Crea el archivo `books.json` dentro de `src/data/`:

```json
[
  {
    "id": "1",
    "isbn": "978-0141439518",
    "title": "Pride and Prejudice",
    "author": "Jane Austen",
    "genre": "Classic Literature",
    "pages": 432,
    "price": 12.99,
    "inStock": true
  },
  {
    "id": "2",
    "isbn": "978-0451524935",
    "title": "1984",
    "author": "George Orwell",
    "genre": "Dystopian Fiction",
    "pages": 328,
    "price": 10.50,
    "inStock": true
  },
  {
    "id": "3",
    "isbn": "978-0743273565",
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "genre": "Classic Literature",
    "pages": 180,
    "price": 8.99,
    "inStock": false
  }
]
```

## 🚀 Instrucciones de Instalación y Ejecución

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Iniciar el Servidor en Modo Desarrollo

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`.

## 📡 Documentación de la API (Endpoints)

**Base URL:** `/api/v1`

### 1. Obtener todos los libros

* **Método:** `GET`
* **Ruta:** `/api/v1/books`
* **Descripción:** Devuelve el catálogo completo de libros.

**Respuesta Exitosa (200 OK):**

```json
{
  "status": "success",
  "total": 3,
  "data": [
    {
      "id": "1",
      "isbn": "978-0141439518",
      "title": "Pride and Prejudice",
      "author": "Jane Austen",
      "genre": "Classic Literature",
      "pages": 432,
      "price": 12.99,
      "inStock": true
    }
  ]
}
```

### 2. Obtener un libro por ID

* **Método:** `GET`
* **Ruta:** `/api/v1/books/:id`
* **Middleware de Validación:** `validateBookId`
* **Descripción:** Comprueba que el parámetro `:id sea válido antes de buscarlo.`

**Respuesta Exitosa (200 OK):**

```json
{
  "status": "success",
  "data": {
    "id": "1",
    "isbn": "978-0141439518",
    "title": "Pride and Prejudice",
    "author": "Jane Austen",
    "genre": "Classic Literature",
    "pages": 432,
    "price": 12.99,
    "inStock": true
  }
}
```

### 3. Registrar un nuevo libro

* **Método:** `POST`
* **Ruta:** `/api/v1/books`
* **Headers:** `Content-Type: application/json`
* **Middleware de Validación:** `validateCreateBook`
* **Descripción:** Valida la estructura completa del cuerpo de la petición. Si hay incoherencias, detiene la ejecución y responde con un código 400 Bad Request indicando exactamente qué campos fallaron.

**Cuerpo de Petición Válido (JSON):**

```json
{
  "isbn": "978-0307474728",
  "title": "Cien Años de Soledad",
  "author": "Gabriel García Márquez",
  "genre": "Realismo Mágico",
  "pages": 496,
  "price": 15.99,
  "inStock": true
}
```

**Respuesta Exitosa (201 Created):**

```json
{
  "status": "success",
  "data": {
    "id": "1728163800000",
    "isbn": "978-0307474728",
    "title": "Cien Años de Soledad",
    "author": "Gabriel García Márquez",
    "genre": "Realismo Mágico",
    "pages": 496,
    "price": 15.99,
    "inStock": true
  }
}
```

**Respuesta por Errores Múltiples de Validación (400 Bad Request):**

```json
{
  "status": "fail",
  "message": "Se encontraron errores de validación en la petición.",
  "details": [
    {
      "field": "isbn",
      "message": "El 'isbn' no tiene un formato válido de ISBN-13."
    },
    {
      "field": "title",
      "message": "El campo 'title' debe tener entre 2 y 150 caracteres."
    },
    {
      "field": "author",
      "message": "El campo 'author' es obligatorio."
    },
    {
      "field": "pages",
      "message": "El campo 'pages' debe ser un número entero mayor a 0."
    }
  ]
}
```

**Respuesta por ISBN Duplicado (409 Conflict):**

```json
{
  "status": "fail",
  "message": "El libro con ISBN '978-0307474728' ya existe en la biblioteca."
}
```

## 🧪 Pruebas con cURL

Puedes probar la solidez de las reglas de validación ejecutando estas peticiones desde la terminal:

```bash
# 1. Obtener catálogo completo (200 OK)
curl -X GET http://localhost:3000/api/v1/books

# 2. Consultar libro existente por ID (200 OK)
curl -X GET http://localhost:3000/api/v1/books/1

# 3. Forzar múltiples errores de validación enviando campos corruptos (400 Bad Request)
curl -X POST http://localhost:3000/api/v1/books \
  -H "Content-Type: application/json" \
  -d '{
    "isbn": "123-invalid-isbn",
    "title": "A",
    "author": "",
    "pages": -50,
    "price": "gratis"
  }'

# 4. Registrar un libro de forma correcta (201 Created)
curl -X POST http://localhost:3000/api/v1/books \
  -H "Content-Type: application/json" \
  -d '{
    "isbn": "978-0307474728",
    "title": "Cien Años de Soledad",
    "author": "Gabriel García Márquez",
    "genre": "Realismo Mágico",
    "pages": 496,
    "price": 15.99,
    "inStock": true
  }'

# 5. Intentar registrar el mismo ISBN para verificar control de duplicados (409 Conflict)
curl -X POST http://localhost:3000/api/v1/books \
  -H "Content-Type: application/json" \
  -d '{
    "isbn": "978-0307474728",
    "title": "Cien Años de Soledad"
  }'
```
