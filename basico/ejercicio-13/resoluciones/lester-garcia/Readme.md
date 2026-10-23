# API Ciencia Ficción — Manejo de Errores

Este proyecto es una API REST desarrollada con Node.js y Express sobre la temática de **ciencia ficción y flota espacial**. El objetivo principal de este ejercicio es implementar una **estrategia profesional y centralizada de manejo de errores**, aplicando clases personalizadas de error, el envoltorio asíncrono (`asyncHandler`) y un middleware global que unifique el formato de las respuestas ante cualquier fallo.

## Tecnologías y Conceptos Aplicados

* **Node.js**: Entorno de ejecución en el servidor.
* **Express.js**: Framework web para la construcción de la API REST.
* **ES Modules (`import`/`export`)**: Sintaxis moderna configurada mediante `"type": "module"`.
* **Clases Personalizadas de Error (`AppError`, `NotFoundError`, `BadRequestError`, `ConflictError`)**:

  * Extensión de la clase nativa `Error` de JavaScript.
  * Asignación explícita de código de estado HTTP (`statusCode`) y estado de respuesta (`fail`/`error`).
  * Flag de diferenciación para errores operacionales (`isOperational`).
* **Envoltorio Asíncrono (`asyncHandler`)**:

  * High-Order Function que captura automáticamente las promesas rechazadas en los controladores.
  * Eliminación de bloques `try / catch` repetitivos en la capa de controladores.
  * Derivación implícita de errores hacia el parámetro `next(error)`.
* **Middleware Global de Errores (`errorHandler`)**:

  * Intercepción centralizada de todas las excepciones del sistema y de negocio.
  * Respuesta en formato JSON estandarizado para mantener la consistencia en el cliente.
* **Modo Desarrollo (`node --watch`)**: Recarga automática nativa de Node.js.

## Estructura del Proyecto

```text
src/
├── app.js                          # Configuración de Express, middlewares y captura de 404
├── server.js                       # Punto de entrada y arranque del servidor HTTP
├── routes/
│   └── spacecraft.routes.js        # Declaración de endpoints para el hangar de naves
├── controllers/
│   └── spacecraft.controller.js    # Controladores asíncronos protegidos con asyncHandler
├── services/
│   └── spacecraft.service.js       # Lógica de negocio y validación que lanza errores custom
├── middlewares/
│   └── errorHandler.js             # Middleware global de procesamiento de errores
├── utils/
│   ├── asyncHandler.js             # Envoltorio asíncrono para captura de promesas
│   └── customErrors.js             # Clases de error personalizadas (400, 404, 409)
└── data/
    └── spacecrafts.json            # Persistencia de datos en formato JSON
.gitignore                          # Archivos omitidos por Git
package.json                        # Scripts de ejecución y dependencias
```

## Configuración del Proyecto

### 1. Archivo `.gitignore`

Previene la subida de dependencias y archivos de estado local:

```text
node_modules/
package-lock.json
```

### 2. Configuración de `package.json`

Verifica la inclusión de `"type": "module"` y los scripts de ejecución:

```json
{
  "name": "scifi-error-handling",
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

### 3. Base de Datos Inicial (`src/data/spacecrafts.json`)

Crea el archivo `spacecrafts.json` dentro de `src/data/`:

```json
[
  {
    "id": "1",
    "name": "U.S.S. Enterprise",
    "class": "Constitution",
    "warpCapable": true,
    "crewCapacity": 430,
    "status": "Operational"
  },
  {
    "id": "2",
    "name": "Millennium Falcon",
    "class": "YT-1300 Light Freighter",
    "warpCapable": true,
    "crewCapacity": 6,
    "status": "In Maintenance"
  },
  {
    "id": "3",
    "name": "Discovery One",
    "class": "Jupiter Deep Space Vehicle",
    "warpCapable": false,
    "crewCapacity": 5,
    "status": "Decommissioned"
  }
]
```

## Instrucciones de Instalación y Ejecución

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Iniciar el Servidor en Modo Desarrollo

```bash
npm run dev
```

El servidor estará escuchando en `http://localhost:3000`.

## Documentación de la API (Endpoints)

### Base URL: `/api/v1`

### 1. Obtener todas las naves espaciales

* **Método:** `GET`
* **Ruta:** `/api/v1/spacecrafts`
* **Descripción:** Obtiene la flota completa registrada en el hangar.

**Respuesta Exitosa (`200 OK`):**

```json
{
  "status": "success",
  "total": 3,
  "data": [
    {
      "id": "1",
      "name": "U.S.S. Enterprise",
      "class": "Constitution",
      "warpCapable": true,
      "crewCapacity": 430,
      "status": "Operational"
    },
    {
      "id": "2",
      "name": "Millennium Falcon",
      "class": "YT-1300 Light Freighter",
      "warpCapable": true,
      "crewCapacity": 6,
      "status": "In Maintenance"
    }
  ]
}
```

### 2. Obtener una nave por ID

* **Método:** `GET`
* **Ruta:** `/api/v1/spacecrafts/:id`
* **Descripción:** Busca una nave por su identificador. Si no existe, lanza un `NotFoundError`.

**Respuesta Exitosa (`200 OK`):**

```json
{
  "status": "success",
  "data": {
    "id": "1",
    "name": "U.S.S. Enterprise",
    "class": "Constitution",
    "warpCapable": true,
    "crewCapacity": 430,
    "status": "Operational"
  }
}
```

**Respuesta de Error (`404 Not Found`):**

```json
{
  "status": "fail",
  "message": "La nave espacial con ID '999' no fue localizada en el radar."
}
```

### 3. Registrar una nueva nave espacial

* **Método:** `POST`
* **Ruta:** `/api/v1/spacecrafts`
* **Headers:** `Content-Type: application/json`
* **Descripción:** Registra una nueva nave validando los parámetros de telemetría. Puede retornar errores de validación (`400 Bad Request`) o duplicados (`409 Conflict`).

**Cuerpo de la Petición Válido (`JSON`):**

```json
{
  "name": "Razor Crest",
  "class": "ST-70 Assault Craft",
  "warpCapable": true,
  "crewCapacity": 3,
  "status": "Operational"
}
```

**Respuesta Exitosa (`201 Created`):**

```json
{
  "status": "success",
  "data": {
    "id": "1728163800000",
    "name": "Razor Crest",
    "class": "ST-70 Assault Craft",
    "warpCapable": true,
    "crewCapacity": 3,
    "status": "Operational"
  }
}
```

**Respuesta por Parámetro Faltante (`400 Bad Request`):**

```json
{
  "status": "fail",
  "message": "El parámetro 'warpCapable' es obligatorio y debe ser booleano (true/false)."
}
```

**Respuesta por Registro Duplicado (`409 Conflict`):**

```json
{
  "status": "fail",
  "message": "La nave espacial 'Razor Crest' ya se encuentra registrada en el hangar."
}
```

## Pruebas con cURL

Ejecuta estas peticiones en la terminal para probar la captura de los distintos errores por el middleware global:

```bash
# 1. Consultar todas las naves (200 OK)
curl -X GET http://localhost:3000/api/v1/spacecrafts

# 2. Consultar nave existente (200 OK)
curl -X GET http://localhost:3000/api/v1/spacecrafts/1

# 3. Consultar nave inexistente para provocar un 404 (NotFoundError)
curl -X GET http://localhost:3000/api/v1/spacecrafts/999

# 4. Enviar datos incompletos para provocar un 400 (BadRequestError)
curl -X POST http://localhost:3000/api/v1/spacecrafts \
  -H "Content-Type: application/json" \
  -d '{"name": "Razor Crest", "class": "ST-70"}'

# 5. Registrar nave correctamente (201 Created)
curl -X POST http://localhost:3000/api/v1/spacecrafts \
  -H "Content-Type: application/json" \
  -d '{"name": "Razor Crest", "class": "ST-70 Assault Craft", "warpCapable": true, "crewCapacity": 3}'

# 6. Reenviar la misma nave para provocar un 409 (ConflictError)
curl -X POST http://localhost:3000/api/v1/spacecrafts \
  -H "Content-Type: application/json" \
  -d '{"name": "Razor Crest", "class": "ST-70 Assault Craft", "warpCapable": true, "crewCapacity": 3}'

# 7. Consultar una ruta no existente para comprobar la intercepción global de 404
curl -X GET http://localhost:3000/api/v1/invalid-route
```
