# API Comida Urbana — Mini API HTTP Nativa

Este proyecto es una API REST desarrollada únicamente con el módulo nativo node:http de Node.js, basada en la temática de comida urbana (Street Food). El objetivo principal de este ejercicio es comprender los fundamentos internos del backend en Node.js sin depender de frameworks como Express: cómo manipular solicitudes mediante streams/buffers, parsing manual del cuerpo de peticiones JSON, enrutamiento mediante expresiones regulares y construcciones de respuesta HTTP con res.writeHead() y res.end().

##  Tecnologías y Conceptos Aplicados

* **Node.js (Sin dependencias externas)**: Desarrollo con módulos nativos.
* **Módulo Nativo node:http**:
    * Creación del servidor web con `http.createServer()`.
    * Inspección manual de `req.method` y `req.url`.
    * Envío explícito de encabezados e indicación del código de estado HTTP (`res.writeHead`).
* **Manejador de Streams y Buffers (req.on('data') y req.on('end'))**:
    * Lectura asíncrona por fragmentos (chunks) del cuerpo de la petición.
    * Conversión e interpretación manual de payloads en formato JSON.
* **ES Modules (import/export)**: Uso nativo de la sintaxis moderna mediante `"type": "module"`.
* **Enrutamiento Manual y Expresiones Regulares**:
    * Extracción de parámetros dinámicos (ej. `/api/v1/street-food/:id`) mediante RegExp.
    * Objeto global URL para aislar parámetros de consulta y rutas.
* **Persistencia No Bloqueante**: Lectura y escritura en archivos JSON con `node:fs/promises`.

## 📂 Estructura del Proyecto

```plaintext
src/
├── server.js                          # Punto de entrada y servidor creado con http.createServer
├── routes/
│   └── streetFood.routes.js           # Enrutador manual basado en metodos HTTP y expresiones regulares
├── controllers/
│   └── streetFood.controller.js      # Lógica de atención a solicitudes y validación básica
├── services/
│   └── streetFood.service.js         # Lógica de negocio y persistencia en archivo JSON
├── utils/
│   └── bodyParser.js                  # Utilidades para lectura de streams (JSON parser) y respuestas HTTP
└── data/
    └── streetFood.json                # Base de datos local en formato JSON
.gitignore                             # Archivos ignorados por Git
package.json                           # Configuración nativa sin dependencias externas
```

## ⚙️ Configuración del Proyecto

### 1. Archivo .gitignore

```plaintext
node_modules/
package-lock.json
```

### 2. Configuración de package.json

Observa que no existen dependencias externas (express u otros paquetes):

```json
{
  "name": "street-food-native-http-api",
  "version": "1.0.0",
  "type": "module",
  "main": "src/server.js",
  "scripts": {
    "dev": "node --watch src/server.js",
    "start": "node src/server.js"
  }
}
```

### 3. Base de Datos Inicial (src/data/streetFood.json)

Crea el archivo `streetFood.json` dentro del directorio `src/data/`:

```json
[
  {
    "id": "1",
    "name": "Tacos al Pastor",
    "category": "Tacos",
    "price": 4.5,
    "spicyLevel": 2,
    "available": true
  },
  {
    "id": "2",
    "name": "Hot Dog Gigante",
    "category": "Fast Food",
    "price": 6,
    "spicyLevel": 1,
    "available": true
  },
  {
    "id": "3",
    "name": "Arepa Reina Pepiada",
    "category": "Arepas",
    "price": 7.5,
    "spicyLevel": 0,
    "available": false
  }
]
```

## 🚀 Instrucciones de Instalación y Ejecución

### 1. Preparación del Proyecto

Dado que no se usan paquetes de terceros, basta con tener Node.js instalado (versión 18+ recomendada):

```bash
npm install
```

### 2. Iniciar el Servidor Nativo en Modo Desarrollo

```bash
npm run dev
```

El servidor nativo estará escuchando en `http://localhost:3000`.

## 📡 Documentación de la API (Endpoints)

**Base URL:** `/api/v1`

### 1. Obtener todo el menú de comida urbana

* **Método:** `GET`
* **Ruta:** `/api/v1/street-food`
* **Descripción:** Lee y retorna el listado completo de platillos.

**Respuesta Exitosa (200 OK):**

```json
{
  "status": "success",
  "total": 3,
  "data": [
    {
      "id": "1",
      "name": "Tacos al Pastor",
      "category": "Tacos",
      "price": 4.5,
      "spicyLevel": 2,
      "available": true
    }
  ]
}
```

### 2. Obtener un platillo por ID

* **Método:** `GET`
* **Ruta:** `/api/v1/street-food/:id`
* **Descripción:** Extrae el ID mediante expresiones regulares sobre la URL de la petición.

**Respuesta Exitosa (200 OK):**

```json
{
  "status": "success",
  "data": {
    "id": "1",
    "name": "Tacos al Pastor",
    "category": "Tacos",
    "price": 4.5,
    "spicyLevel": 2,
    "available": true
  }
}
```

**Respuesta de Error (404 Not Found):**

```json
{
  "status": "fail",
  "message": "El platillo con ID '999' no existe en el puesto."
}
```

### 3. Registrar un nuevo platillo de comida urbana

* **Método:** `POST`
* **Ruta:** `/api/v1/street-food`
* **Headers:** `Content-Type: application/json`
* **Descripción:** Lee los chunks del stream de entrada, parsea el objeto JSON y valida sus atributos antes de almacenarlo.

**Cuerpo de la Petición Válido (JSON):**

```json
{
  "name": "Hamburguesa Callejera con Huevo",
  "category": "Hamburguesas",
  "price": 8.50,
  "spicyLevel": 1,
  "available": true
}
```

**Respuesta Exitosa (201 Created):**

```json
{
  "status": "success",
  "data": {
    "id": "1728163800000",
    "name": "Hamburguesa Callejera con Huevo",
    "category": "Hamburguesas",
    "price": 8.5,
    "spicyLevel": 1,
    "available": true
  }
}
```

**Respuesta por Datos Inválidos (400 Bad Request):**

```json
{
  "status": "fail",
  "message": "El campo 'spicyLevel' debe ser un entero entre 0 y 5."
}
```

**Respuesta por Duplicado (409 Conflict):**

```json
{
  "status": "fail",
  "message": "El platillo de comida urbana 'Hamburguesa Callejera con Huevo' ya existe en el menú."
}
```

## 🧪 Pruebas con cURL

Puedes ejecutar las siguientes peticiones HTTP directamente desde la terminal para verificar el funcionamiento del servidor nativo:

```bash
# 1. Consultar todo el menú (200 OK)
curl -X GET http://localhost:3000/api/v1/street-food

# 2. Consultar platillo por ID (200 OK)
curl -X GET http://localhost:3000/api/v1/street-food/1

# 3. Intentar consultar ID inexistente (404 Not Found)
curl -X GET http://localhost:3000/api/v1/street-food/999

# 4. Enviar petición POST para registrar platillo (201 Created)
curl -X POST http://localhost:3000/api/v1/street-food \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hamburguesa Callejera con Huevo",
    "category": "Hamburguesas",
    "price": 8.50,
    "spicyLevel": 1,
    "available": true
  }'

# 5. Forzar error 409 enviando un platillo duplicado
curl -X POST http://localhost:3000/api/v1/street-food \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hamburguesa Callejera con Huevo",
    "category": "Hamburguesas",
    "price": 8.50,
    "spicyLevel": 1
  }'

# 6. Probar ruta inexistente (404 Not Found)
curl -X GET http://localhost:3000/api/v1/invalid-route
```
