# API Películas de Miedo — Async / Await

Este proyecto es una API REST desarrollada con Node.js y Express sobre la temática de **películas de miedo (Horror Movies)**. El objetivo principal de este ejercicio es dominar la sintaxis moderna de **`async / await`** para consumir promesas de forma limpia, secuencial y legible, administrando operaciones de lectura/escritura en archivos JSON (`fs/promises`) y la gestión de excepciones mediante bloques **`try / catch`**.

## Tecnologías y Conceptos Aplicados

* **Node.js**: Entorno de ejecución en el servidor.
* **Express.js**: Framework web para la construcción de la API REST.
* **ES Modules (`import`/`export`)**: Sintaxis moderna configurada mediante `"type": "module"`.
* **Sintaxis `async / await`**:

  * Declaración de funciones asíncronas implícitas (`async`).
  * Pausa limpia y legibilidad en la resolución de promesas (`await`).
  * Captura centralizada de errores síncronos y asíncronos mediante bloques `try / catch`.
  * Manejo de persistencia no bloqueante con `fs/promises` (`readFile` y `writeFile`).
* **Arquitectura en Capas**:

  * **Routes**: Mapeo y organización de endpoints HTTP (`GET`, `POST`).
  * **Controllers**: Recepción de solicitudes, resolución asíncrona de lógica con `await` y respuesta con códigos de estado adecuados (`200`, `201`, `400`, `404`, `409`, `500`).
  * **Services**: Lógica de negocio, análisis de nivel de susto y persistencia asíncrona.
* **Modo Desarrollo (`node --watch`)**: Recarga automática sin dependencias externas.

## Estructura del Proyecto

```text id="7p8v2m"
src/
├── app.js                          # Configuración de Express, middlewares y manejador de 404
├── server.js                       # Punto de entrada de la aplicación y arranque del servidor
├── routes/
│   └── movies.routes.js            # Definición de endpoints para el catálogo de terror
├── controllers/
│   └── movies.controller.js        # Controladores asíncronos estructurados con try/catch
├── services/
│   └── movies.service.js           # Lógica de negocio, análisis y persistencia con async/await
└── data/
    └── movies.json                 # Persistencia local en formato JSON
.gitignore                          # Archivos ignorados por Git
package.json                        # Configuración de dependencias y scripts de ejecución
```

## Configuración del Proyecto

### 1. Archivo `.gitignore`

Previene el seguimiento de dependencias instaladas:

```text id="x5t9wr"
node_modules/
package-lock.json
```

### 2. Configuración de `package.json`

Verifica la propiedad `"type": "module"` para soporte de ES Modules:

```json id="m4n2qs"
{
  "name": "horror-movies-async-await",
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

### 3. Base de Datos Inicial (`src/data/movies.json`)

Crea el archivo `movies.json` dentro de `src/data/`:

```json id="k6v3za"
[
  {
    "id": "1",
    "title": "The Exorcist",
    "director": "William Friedkin",
    "subgenre": "Supernatural Horror",
    "scareLevel": 9,
    "releaseYear": 1973
  },
  {
    "id": "2",
    "title": "Hereditary",
    "director": "Ari Aster",
    "subgenre": "Psychological Horror",
    "scareLevel": 8,
    "releaseYear": 2018
  },
  {
    "id": "3",
    "title": "A Nightmare on Elm Street",
    "director": "Wes Craven",
    "subgenre": "Slasher",
    "scareLevel": 7,
    "releaseYear": 1984
  }
]
```

## Instrucciones de Instalación y Ejecución

### 1. Instalar Dependencias

```bash id="j8q5va"
npm install
```

### 2. Iniciar el Servidor en Modo Desarrollo

```bash id="r3x7nd"
npm run dev
```

El servidor estará escuchando en:

```text id="p2f6yc"
http://localhost:3000
```

## Documentación de la API

### Base URL

```text id="n9w4ks"
/api/v1
```

### 1. Obtener todas las películas de miedo

* **Método:** `GET`
* **Ruta:** `/api/v1/movies`
* **Descripción:** Obtiene de forma asíncrona la lista completa de películas registradas.

#### Respuesta Exitosa (`200 OK`)

```json id="v7q1mc"
{
  "status": "success",
  "total": 3,
  "data": [
    {
      "id": "1",
      "title": "The Exorcist",
      "director": "William Friedkin",
      "subgenre": "Supernatural Horror",
      "scareLevel": 9,
      "releaseYear": 1973
    },
    {
      "id": "2",
      "title": "Hereditary",
      "director": "Ari Aster",
      "subgenre": "Psychological Horror",
      "scareLevel": 8,
      "releaseYear": 2018
    }
  ]
}
```

### 2. Obtener una película por ID

* **Método:** `GET`
* **Ruta:** `/api/v1/movies/:id`
* **Descripción:** Busca una película específica dentro del catálogo JSON mediante `await`.

#### Respuesta Exitosa (`200 OK`)

```json id="c4m8zp"
{
  "status": "success",
  "data": {
    "id": "1",
    "title": "The Exorcist",
    "director": "William Friedkin",
    "subgenre": "Supernatural Horror",
    "scareLevel": 9,
    "releaseYear": 1973
  }
}
```

### 3. Analizar medidor de sustos de una película

* **Método:** `GET`
* **Ruta:** `/api/v1/movies/:id/scare-analysis`
* **Descripción:** Procesa asíncronamente el nivel de susto y devuelve una advertencia según su calificación.

#### Respuesta Exitosa (`200 OK`)

```json id="w2k7hd"
{
  "status": "success",
  "data": {
    "id": "2",
    "title": "Hereditary",
    "scareLevel": 8,
    "subgenre": "Psychological Horror",
    "warning": "¡Precaución! Nivel extremo de sustos y tensión psicológica."
  }
}
```

### 4. Registrar una nueva película de miedo

* **Método:** `POST`
* **Ruta:** `/api/v1/movies`
* **Headers:** `Content-Type: application/json`
* **Descripción:** Valida los campos de entrada y persiste el nuevo título. Si la película ya existe, lanza un error capturado en el bloque `catch` mandando un código `409 Conflict`.

#### Cuerpo de la Petición (`JSON`)

```json id="e5t2qx"
{
  "title": "The Conjuring",
  "director": "James Wan",
  "subgenre": "Supernatural Horror",
  "scareLevel": 8,
  "releaseYear": 2013
}
```

#### Respuesta Exitosa (`201 Created`)

```json id="f9c6rb"
{
  "status": "success",
  "data": {
    "id": "1728163800000",
    "title": "The Conjuring",
    "director": "James Wan",
    "subgenre": "Supernatural Horror",
    "scareLevel": 8,
    "releaseYear": 2013
  }
}
```

#### Respuesta de Error por Duplicado (`409 Conflict`)

```json id="q3h8mv"
{
  "status": "error",
  "message": "La película 'The Conjuring' ya está registrada en el catálogo de terror."
}
```

## Pruebas con cURL

Ejecuta las siguientes peticiones en tu consola para verificar la ejecución de las funciones asíncronas:

### 1. Obtener la lista completa de películas

```bash id="a5r9nk"
curl -X GET http://localhost:3000/api/v1/movies
```

### 2. Buscar película por ID

```bash id="k7x2pd"
curl -X GET http://localhost:3000/api/v1/movies/1
```

### 3. Analizar el medidor de sustos

```bash id="n4v8sc"
curl -X GET http://localhost:3000/api/v1/movies/2/scare-analysis
```

### 4. Crear una nueva película de terror

POST:

```bash id="u6q1wf"
curl -X POST http://localhost:3000/api/v1/movies \
  -H "Content-Type: application/json" \
  -d '{"title": "The Conjuring", "director": "James Wan", "subgenre": "Supernatural Horror", "scareLevel": 8, "releaseYear": 2013}'
```

### 5. Intentar crear un duplicado

Verificar la captura en el `try/catch`:

```bash id="p8m3zx"
curl -X POST http://localhost:3000/api/v1/movies \
  -H "Content-Type: application/json" \
  -d '{"title": "The Conjuring", "director": "James Wan", "subgenre": "Supernatural Horror", "scareLevel": 8, "releaseYear": 2013}'
```
