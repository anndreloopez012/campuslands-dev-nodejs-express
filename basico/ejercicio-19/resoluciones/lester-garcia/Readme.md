# API Estudio de Tatuajes — Manejo de req.params y req.query

Este proyecto implementa una API REST modular construida con Node.js y Express sobre la temática de un estudio de tatuajes y catálogo de diseños de artistas. La finalidad del ejercicio es dominar la captura, validación y diferencias entre parámetros de ruta (req.params) y parámetros de consulta en la cadena de texto URL (req.query).

---

## Tecnologías y Conceptos

- **Node.js**: Entorno de ejecución en el servidor.
- **Express.js**: Framework web para la gestión de peticiones y rutas HTTP.
- **Diferencia entre req.params y req.query**:
  - **req.params**: Se utiliza para identificar recursos específicos mediante la URL (ej. `/tattoos/:id` o `/tattoos/artist/:artistName`). Es parte obligatoria de la estructura del path.
  - **req.query**: Se utiliza para aplicar filtros opcionales, ordenamientos o criterios de búsqueda dinámicos (ej. `/tattoos?style=Blackwork&maxPrice=500`).
- **Arquitectura de Software en Capas**:
  - `routes/`: Mapeo de rutas dinámicas.
  - `controllers/`: Lectura de `req.params`/`req.query` y respuestas HTTP.
  - `services/`: Lógica de filtrado dinámico sobre los datos.
- **Validación y Manejo de Errores**:
  - Validación de tipos de datos en la query string.
  - Módulo centralizado con respuestas HTTP estandarizadas (400 Bad Request, 404 Not Found).

---

## Estructura del Proyecto

```text
src/
├── app.js                          # Configuración global de Express y middlewares
├── server.js                       # Inicialización del servidor HTTP
├── routes/
│   └── tattoos.routes.js           # Definición de rutas dinámicas (:id, :artistName)
├── controllers/
│   └── tattoos.controller.js       # Extracción y validación de req.params y req.query
├── services/
│   └── tattoos.service.js          # Filtrado dinámico y lectura JSON
├── middlewares/
│   └── errorHandler.js             # Formateador global de respuestas de error
├── utils/
│   ├── asyncHandler.js             # Manejador de promesas asíncronas
│   └── customErrors.js             # Clases de error (400, 404)
└── data/
    └── tattoos.json                # Persistencia local de datos en JSON
.gitignore                          # Control de archivos ignorados
package.json                        # Definición de dependencias y scripts
```

---

## Configuración e Instalación

1. Clonar o descargar la estructura y ejecutar:
```bash
npm install
```

2. Iniciar en modo desarrollo:
```bash
npm run dev
```

Servidor corriendo en: `http://localhost:3000`.

---

## Documentación de Endpoints

**Base URL:** `/api/v1`

### 1. Obtener diseños con filtros (req.query)

- **Método:** GET
- **Ruta:** `/api/v1/tattoos`
- **Query Parameters Opcionales:**
  - `style` (string): Estilo de tatuaje (Blackwork, Neotradicional, Irezumi, Realismo).
  - `artist` (string): Nombre del artista tatuador.
  - `maxPrice` (number): Precio máximo en USD.
  - `available` (boolean): Disponibilidad del diseño (true / false).

**Ejemplo de Petición:**
```http
GET /api/v1/tattoos?style=Blackwork&maxPrice=500
```

### 2. Obtener tatuaje por ID (req.params)

- **Método:** GET
- **Ruta:** `/api/v1/tattoos/:id`
- **Path Parameters Obligatorios:**
  - `id` (string): Identificador único del diseño.

**Ejemplo de Petición:**
```http
GET /api/v1/tattoos/1
```

### 3. Obtener obras por artista (req.params)

- **Método:** GET
- **Ruta:** `/api/v1/tattoos/artist/:artistName`
- **Path Parameters Obligatorios:**
  - `artistName` (string): Nombre o coincidencia del artista.

**Ejemplo de Petición:**
```http
GET /api/v1/tattoos/artist/Kira
```

---

## Pruebas con cURL

```bash
# 1. Probar req.query combinando filtros
curl -X GET "http://localhost:3000/api/v1/tattoos?style=Blackwork&maxPrice=500"

# 2. Probar req.params buscando por ID
curl -X GET http://localhost:3000/api/v1/tattoos/1

# 3. Probar req.params buscando por artista
curl -X GET http://localhost:3000/api/v1/tattoos/artist/Kira

# 4. Probar error 400 por precio con tipo incorrecto
curl -X GET "http://localhost:3000/api/v1/tattoos?maxPrice=invalido"

# 5. Probar error 404 por ID inexistente
curl -X GET http://localhost:3000/api/v1/tattoos/99
```
