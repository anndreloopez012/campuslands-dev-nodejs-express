# API Ropa y Sneakers — Primer Servidor Express

Este proyecto es una API REST desarrollada con Express.js, basada en la temática de ropa urbana y sneakers (Fashion & Streetwear). El objetivo principal de este ejercicio es aprender a construir y organizar un servidor Express profesional, aplicando enrutamiento modular con express.Router(), middleware nativo de parseo JSON (express.json()), manejo asíncrono centralizado de errores y persistencia en archivos JSON.

##  Tecnologías y Conceptos Aplicados

* **Node.js**: Entorno de ejecución para JavaScript en el servidor.
* **Express.js**: Framework web minimalista para la creación de rutas, controladores y middlewares.
* **ES Modules (import/export)**: Sintaxis moderna de módulos activada mediante `"type": "module"`.
* **Middleware Nativo (express.json())**: Procesamiento automático del cuerpo de peticiones con formato JSON.
* **Arquitectura Modular por Capas**:
    * **Rutas**: Definición de endpoints con `express.Router()`.
    * **Controladores**: Gestión de la solicitud, validaciones iniciales y respuestas HTTP.
    * **Servicios**: Lógica de negocio y persistencia no bloqueante mediante `node:fs/promises`.
* **Manejo Centralizado de Errores**: Uso de clases de error personalizadas (`AppError`, `BadRequestError`, etc.), wrapper asíncrono (`asyncHandler`) y middleware global de captura de errores.

## 📂 Estructura del Proyecto

```plaintext
src/
├── server.js                          # Punto de entrada que arranca el servidor HTTP
├── app.js                             # Configuración general de Express y middlewares
├── routes/
│   └── apparel.routes.js              # Enrutador Express para ropa y sneakers
├── controllers/
│   └── apparel.controller.js         # Controladores de peticiones y respuestas
├── services/
│   └── apparel.service.js            # Lógica de negocio y persistencia en JSON
├── middlewares/
│   └── errorHandler.js               # Middleware global para captura de errores
├── utils/
│   ├── asyncHandler.js                # Wrapper para capturar excepciones asíncronas
│   └── customErrors.js                # Clases de errores HTTP personalizados
└── data/
    └── apparel.json                   # Base de datos local en formato JSON
.gitignore                             # Archivos ignorados por Git
package.json                           # Configuración del proyecto y dependencias
```

## ⚙️ Configuración del Proyecto

### 1. Archivo .gitignore

```plaintext
node_modules/
package-lock.json
```

### 2. Configuración de package.json

```json
{
  "name": "apparel-express-server",
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

### 3. Base de Datos Inicial (src/data/apparel.json)

Crea el archivo `apparel.json` dentro del directorio `src/data/`:

```json
[
  {
    "id": "1",
    "name": "Air Jordan 1 Retro High OG",
    "brand": "Nike",
    "category": "Sneakers",
    "size": 10.5,
    "price": 180.00,
    "inStock": true
  },
  {
    "id": "2",
    "name": "Yeezy Boost 350 V2",
    "brand": "Adidas",
    "category": "Sneakers",
    "size": 9.0,
    "price": 230.00,
    "inStock": true
  },
  {
    "id": "3",
    "name": "Oversized Heavyweight Hoodie",
    "brand": "Essentials",
    "category": "Streetwear",
    "size": "L",
    "price": 95.00,
    "inStock": false
  }
]
```

##  Instrucciones de Instalación y Ejecución

### 1. Instalación de Dependencias

Ejecuta el siguiente comando en la raíz del proyecto para instalar Express:

```bash
npm install
```

### 2. Iniciar el Servidor Express en Modo Desarrollo

```bash
npm run dev
```

El servidor estará escuchando solicitudes en `http://localhost:3000`.

##  Documentación de la API (Endpoints)

**Base URL:** `/api/v1`

### 1. Obtener el catálogo completo de prendas y sneakers

* **Método:** `GET`
* **Ruta:** `/api/v1/apparel`
* **Descripción:** Retorna todo el listado de ropa y zapatillas registradas.

**Respuesta Exitosa (200 OK):**

```json
{
  "status": "success",
  "total": 3,
  "data": [
    {
      "id": "1",
      "name": "Air Jordan 1 Retro High OG",
      "brand": "Nike",
      "category": "Sneakers",
      "size": 10.5,
      "price": 180,
      "inStock": true
    }
  ]
}
```

### 2. Obtener un producto por ID

* **Método:** `GET`
* **Ruta:** `/api/v1/apparel/:id`
* **Descripción:** Busca y retorna el detalle de un artículo según su identificador único.

**Respuesta Exitosa (200 OK):**

```json
{
  "status": "success",
  "data": {
    "id": "1",
    "name": "Air Jordan 1 Retro High OG",
    "brand": "Nike",
    "category": "Sneakers",
    "size": 10.5,
    "price": 180,
    "inStock": true
  }
}
```

**Respuesta de Error (404 Not Found):**

```json
{
  "status": "fail",
  "message": "El artículo con ID '999' no existe en el catálogo."
}
```

### 3. Registrar un nuevo producto en el catálogo

* **Método:** `POST`
* **Ruta:** `/api/v1/apparel`
* **Headers:** `Content-Type: application/json`
* **Descripción:** Valida la información recibida y guarda el nuevo artículo en el archivo JSON.

**Cuerpo de la Petición Válido (JSON):**

```json
{
  "name": "Dunk Low Retro",
  "brand": "Nike",
  "category": "Sneakers",
  "size": 11,
  "price": 115.00,
  "inStock": true
}
```

**Respuesta Exitosa (201 Created):**

```json
{
  "status": "success",
  "data": {
    "id": "1728163800000",
    "name": "Dunk Low Retro",
    "brand": "Nike",
    "category": "Sneakers",
    "size": 11,
    "price": 115,
    "inStock": true
  }
}
```

**Respuesta por Datos Inválidos (400 Bad Request):**

```json
{
  "status": "fail",
  "message": "El campo 'price' debe ser un número positivo mayor a 0."
}
```

**Respuesta por Duplicado (409 Conflict):**

```json
{
  "status": "fail",
  "message": "El artículo 'Dunk Low Retro' en talla '11' ya se encuentra en el inventario."
}
```

## 🧪 Pruebas con cURL

Puedes probar cada una de las funcionalidades ejecutando los siguientes comandos en tu terminal:

```bash
# 1. Saludo inicial / comprobación de estado (200 OK)
curl -X GET http://localhost:3000/

# 2. Consultar el catálogo completo (200 OK)
curl -X GET http://localhost:3000/api/v1/apparel

# 3. Consultar producto por ID existente (200 OK)
curl -X GET http://localhost:3000/api/v1/apparel/1

# 4. Intentar consultar producto con ID inexistente (404 Not Found)
curl -X GET http://localhost:3000/api/v1/apparel/999

# 5. Agregar un nuevo sneaker (201 Created)
curl -X POST http://localhost:3000/api/v1/apparel \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dunk Low Retro",
    "brand": "Nike",
    "category": "Sneakers",
    "size": 11,
    "price": 115.00,
    "inStock": true
  }'

# 6. Intentar registrar un producto duplicado (409 Conflict)
curl -X POST http://localhost:3000/api/v1/apparel \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dunk Low Retro",
    "brand": "Nike",
    "category": "Sneakers",
    "size": 11,
    "price": 115.00
  }'

# 7. Intentar enviar petición con campos faltantes o inválidos (400 Bad Request)
curl -X POST http://localhost:3000/api/v1/apparel \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Graphic Tee",
    "brand": "Stussy",
    "category": "Streetwear",
    "size": "M"
  }'

# 8. Consultar ruta inexistente (404 Not Found)
curl -X GET http://localhost:3000/api/v1/non-existing-route
```
