# Ejercicio 02 — API de productos con Node.js y Express

## Descripción

Este ejercicio implementa una API REST básica utilizando **Node.js** y **Express**, con una arquitectura modular para consultar información de productos almacenada en un archivo JSON.

El objetivo principal es practicar:

* Inicialización de un proyecto Node.js.
* Uso de **ES Modules**.
* Configuración de Express.
* Separación de responsabilidades.
* Uso de `routes`, `controllers` y `services`.
* Lectura de archivos JSON mediante `fs/promises`.
* Búsqueda de registros por identificador.
* Manejo básico de errores HTTP.
* Pruebas de endpoints utilizando `curl`.

---

## Tecnologías utilizadas

* **Node.js**
* **Express**
* **JavaScript**
* **JSON**
* **Node.js File System Promises (`fs/promises`)**
* **ES Modules**
* **Git / GitHub**

---

## Estructura del proyecto

```text
carlos-velasco/
├── src/
│   ├── controllers/
│   │   └── products.controller.js
│   │
│   ├── data/
│   │   └── products.json
│   │
│   ├── routes/
│   │   └── products.routes.js
│   │
│   ├── services/
│   │   └── products.service.js
│   │
│   ├── index.js
│   └── server.js
│
├── package.json
└── package-lock.json
```

---

## Arquitectura

La aplicación separa las responsabilidades en diferentes capas:

```text
Cliente HTTP
     │
     ▼
   Routes
     │
     ▼
 Controllers
     │
     ▼
  Services
     │
     ▼
 products.json
```

### `data/`

Contiene los datos utilizados por la aplicación.

```text
src/data/products.json
```

El archivo almacena los productos en formato JSON.

Cada producto contiene información como:

```json
{
  "id": 1,
  "nombre": "Teclado mecánico",
  "categoria": "Periféricos",
  "precio": 285.5,
  "stock": 15,
  "marca": "Redragon",
  "activo": true
}
```

---

### `services/`

Contiene la lógica relacionada con la obtención y búsqueda de productos.

Archivo:

```text
src/services/products.service.js
```

El service se encarga de:

* Leer `products.json`.
* Convertir el contenido JSON a objetos JavaScript.
* Obtener todos los productos.
* Buscar un producto mediante su `id`.
* Retornar `null` cuando un producto no existe.
* Propagar errores relacionados con la lectura o procesamiento de los datos.

Una de las funciones principales es:

```text
getAllProducts()
```

que obtiene todos los productos.

También se implementó:

```text
getProductById(id)
```

para buscar un producto específico.

---

### `controllers/`

Contiene la lógica relacionada con las peticiones y respuestas HTTP.

Archivo:

```text
src/controllers/products.controller.js
```

Actualmente contiene:

```text
getProducts()
getProduct()
```

El controller funciona como intermediario entre Express y el service.

Por ejemplo:

```text
Request HTTP
     ↓
Controller
     ↓
Service
     ↓
Datos
     ↓
Controller
     ↓
Response HTTP
```

El service no necesita conocer objetos de Express como `req` o `res`.

El controller es el encargado de transformar los resultados del service en respuestas HTTP.

---

### `routes/`

Define las URLs y métodos HTTP disponibles.

Archivo:

```text
src/routes/products.routes.js
```

Las rutas implementadas son:

```text
GET /api/products
GET /api/products/:id
```

Las rutas delegan el procesamiento al controller correspondiente.

---

### `server.js`

Archivo responsable de iniciar el servidor Express.

```text
src/server.js
```

También configura:

```text
express.json()
```

y monta las rutas de productos bajo:

```text
/api/products
```

El servidor utiliza el puerto:

```text
3000
```

---

### `index.js`

Este archivo se utilizó como una prueba directa de la lógica del service, sin necesidad de iniciar Express.

Permite comprobar:

* Obtención de todos los productos.
* Búsqueda de un producto por ID.

Esto ayuda a comprobar primero la lógica interna antes de utilizarla mediante HTTP.

---

## Configuración de Node.js

El proyecto utiliza **ES Modules**, por lo que `package.json` contiene:

```json
"type": "module"
```

Esto permite utilizar la sintaxis:

```js
import ...
export ...
```

en lugar del sistema CommonJS.

Los scripts utilizados son:

```json
"scripts": {
  "dev": "node --watch src/server.js",
  "start": "node src/server.js"
}
```

### Modo desarrollo

```bash
npm run dev
```

Utiliza `node --watch` para reiniciar automáticamente el servidor cuando se detectan cambios.

### Modo normal

```bash
npm start
```

Ejecuta directamente:

```text
src/server.js
```

---

# Instalación

Clonar el repositorio:

```bash
git clone https://github.com/Velasco-c/campuslands-dev-nodejs-express.git
```

Entrar al proyecto:

```bash
cd campuslands-dev-nodejs-express/basico/ejercicio-02/resoluciones/carlos-velasco
```

Instalar las dependencias:

```bash
npm install
```

---

# Ejecución

Iniciar el servidor en modo desarrollo:

```bash
npm run dev
```

El servidor queda disponible en:

```text
http://localhost:3000
```

---

# Endpoints

## Obtener todos los productos

### Request

```http
GET /api/products
```

Con `curl`:

```bash
curl http://localhost:3000/api/products
```

### Response

La API devuelve un arreglo con los productos disponibles:

```json
[
  {
    "id": 1,
    "nombre": "Teclado mecánico",
    "categoria": "Periféricos",
    "precio": 285.5,
    "stock": 15,
    "marca": "Redragon",
    "activo": true
  },
  {
    "id": 2,
    "nombre": "Mouse inalámbrico",
    "categoria": "Periféricos",
    "precio": 149.99,
    "stock": 24,
    "marca": "Logitech",
    "activo": true
  }
]
```

La respuesta real contiene los productos almacenados en `products.json`.

---

## Obtener un producto por ID

### Request

```http
GET /api/products/:id
```

Ejemplo:

```bash
curl http://localhost:3000/api/products/1
```

### Response exitosa

```json
{
  "id": 1,
  "nombre": "Teclado mecánico",
  "categoria": "Periféricos",
  "precio": 285.5,
  "stock": 15,
  "marca": "Redragon",
  "activo": true
}
```

---

## Producto no encontrado

Si se solicita un ID que no existe:

```bash
curl http://localhost:3000/api/products/999
```

La API responde con:

```json
{
  "message": "Producto no encontrado"
}
```

HTTP Status:

```text
404 Not Found
```

---

# Manejo de errores

El controller implementa manejo básico de errores mediante `try/catch`.

Si ocurre un error interno al obtener los productos:

```text
500 Internal Server Error
```

La respuesta tiene la estructura:

```json
{
  "message": "..."
}
```

Cuando un producto no existe, se utiliza:

```text
404 Not Found
```

Esto permite diferenciar entre:

* Error interno del servidor.
* Recurso inexistente.

---

# Pruebas realizadas

## Servidor

```bash
npm run dev
```

Resultado esperado:

```text
Servidor listo en el puerto 3000
```

---

## GET todos los productos

```bash
curl http://localhost:3000/api/products
```

Resultado:

```text
HTTP 200
```

Se verificó correctamente la devolución de los 10 productos almacenados en `products.json`.

---

## GET producto por ID

```bash
curl http://localhost:3000/api/products/1
```

Resultado:

```text
HTTP 200
```

Se obtuvo correctamente el producto con ID `1`.

---

## GET producto inexistente

```bash
curl http://localhost:3000/api/products/999
```

Resultado esperado:

```text
HTTP 404
```

Respuesta:

```json
{
  "message": "Producto no encontrado"
}
```

---

# Flujo de una petición

Para:

```text
GET /api/products/1
```

el flujo interno de la aplicación es:

```text
Cliente
   │
   ▼
Express
   │
   ▼
products.routes.js
   │
   ▼
getProduct()
   │
   ▼
getProductById(1)
   │
   ▼
readProductsFile()
   │
   ▼
products.json
   │
   ▼
find()
   │
   ▼
Producto encontrado
   │
   ▼
HTTP 200
```

Si el producto no existe:

```text
find()
   │
   ▼
null
   │
   ▼
Controller
   │
   ▼
HTTP 404
```

---

# Conceptos aprendidos

Durante el ejercicio se practicaron los siguientes conceptos:

### Node.js

* Inicialización de proyectos con `npm`.
* `package.json`.
* Scripts de npm.
* Dependencias.
* ES Modules.
* `import` y `export`.

### Express

* Creación de una aplicación Express.
* Middleware `express.json()`.
* Rutas HTTP.
* Parámetros de ruta.
* Objetos `req` y `res`.
* Códigos de estado HTTP.
* Respuestas JSON.

### Arquitectura

* Separación entre rutas, controllers y services.
* Responsabilidad de cada capa.
* Evitar colocar lógica de negocio directamente en las rutas.
* Mantener el service independiente de Express.

### Node File System

* Uso de `node:fs/promises`.
* `readFile()`.
* Lectura asíncrona de archivos.
* Conversión de JSON mediante `JSON.parse()`.
* Uso de `import.meta.url` para construir una ruta relativa al módulo.

### JavaScript

* `async/await`.
* `try/catch`.
* `find()`.
* Conversión mediante `Number()`.
* Retorno de `null` para representar un recurso no encontrado.

---

# Checklist

* [x] Proyecto Node.js inicializado.
* [x] Express instalado.
* [x] ES Modules configurado.
* [x] Scripts `dev` y `start`.
* [x] Servidor Express funcionando.
* [x] Middleware `express.json()`.
* [x] Datos de productos en JSON.
* [x] Service para obtener productos.
* [x] Service para buscar producto por ID.
* [x] Controller para obtener productos.
* [x] Controller para obtener producto por ID.
* [x] Routes configuradas.
* [x] Endpoint `GET /api/products`.
* [x] Endpoint `GET /api/products/:id`.
* [x] Manejo de error `404`.
* [x] Manejo básico de error `500`.
* [x] Pruebas realizadas con `curl`.
* [x] Arquitectura modular implementada.
* [x] Pull Request hacia `dev`.

---

# Alcance del ejercicio

Este ejercicio se concentra en la **consulta de productos mediante endpoints GET** y en la separación de responsabilidades utilizando una arquitectura modular.

La creación de nuevos productos mediante `POST` no forma parte de este ejercicio y se trabajará posteriormente en el ejercicio correspondiente.

---

# Autor

**Carlos Velasco**
