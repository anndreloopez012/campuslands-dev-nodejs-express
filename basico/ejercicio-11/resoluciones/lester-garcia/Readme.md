# API Música — Promesas Básicas

Este proyecto es una API REST desarrollada con Node.js y Express sobre la temática de música. El objetivo principal de este ejercicio es dominar la creación, encadenamiento y consumo de Promesas nativas (`Promise`), comprendiendo el ciclo de vida completo de una operación asíncrona mediante sus estados (`Pending`, `Fulfilled` con `resolve`, `Rejected` con `reject`) y su gestión en controladores con `.then()` y `.catch()`.

## Tecnologías y Conceptos Aplicados

* **Node.js**: Entorno de ejecución en el servidor.
* **Express.js**: Framework web para la construcción de la API REST.
* **ES Modules (`import`/`export`)**: Sintaxis moderna de JavaScript configurada con `"type": "module"`.
* **Promesas Básicas (`new Promise((resolve, reject) => { ... })`)**: Construcción explícita de instancias de Promise.
* Manejo de flujo exitoso invocando `resolve(data)`.
* Manejo explícito de rechazos y errores de negocio invocando `reject(new Error(...))`.
* Encadenamiento explícito `.then()` para procesar resultados y `.catch()` para gestionar fallos en los controladores HTTP.
* Uso de `fs/promises` para lectura y escritura en archivos JSON.
* **Arquitectura en Capas**:

  * **Routes**: Declaración y ordenamiento de endpoints HTTP (`GET`, `POST`).
  * **Controllers**: Recepción de peticiones, consumo de Promesas y mapeo de respuestas/códigos HTTP (`200`, `201`, `400`, `500`).
  * **Services**: Lógica de negocio encapsulada dentro de Promesas explícitas con validaciones de catálogo.
* **Modo Desarrollo (`node --watch`)**: Recarga automática nativa de Node.js.

## Estructura del Proyecto

```text
src/
├── app.js                         # Configuración de Express, middlewares y manejo de 404
├── server.js                      # Punto de entrada de la aplicación y arranque del servidor
├── routes/
│   └── music.routes.js            # Rutas para el catálogo de canciones y verificación
├── controllers/
│   └── music.controller.js        # Controladores que consumen las Promesas con .then() y .catch()
├── services/
│   └── music.service.js           # Construcción de Promesas nativas (resolve / reject)
└── data/
    └── songs.json                 # Persistencia local en formato JSON
.gitignore                         # Archivos omitidos del control de versiones
package.json                       # Scripts de ejecución y dependencias del proyecto
```

## Configuración del Proyecto

### 1. Archivo `.gitignore`

Previene la subida de dependencias y archivos de bloqueo al repositorio:

```text
node_modules/
package-lock.json
```

### 2. Configuración de `package.json`

Asegúrate de contar con `"type": "module"` y los scripts para ejecutar el servidor:

```json
{
  "name": "music-basic-promises",
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

### 3. Base de Datos Inicial (`src/data/songs.json`)

Crea el archivo `songs.json` dentro de `src/data/`:

```json
[
  {
    "id": "1",
    "title": "Bohemian Rhapsody",
    "artist": "Queen",
    "genre": "Rock",
    "durationSeconds": 354
  },
  {
    "id": "2",
    "title": "Blinding Lights",
    "artist": "The Weeknd",
    "genre": "Synthwave",
    "durationSeconds": 200
  },
  {
    "id": "3",
    "title": "Hotel California",
    "artist": "Eagles",
    "genre": "Classic Rock",
    "durationSeconds": 390
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

El servidor estará disponible en:

```text
http://localhost:3000
```

## Documentación de la API

### Base URL

```text
/api/v1
```

### 1. Obtener todas las canciones

* **Método:** `GET`
* **Ruta:** `/api/v1/songs`
* **Descripción:** Consume una Promesa que resuelve la lista completa de canciones del catálogo.

#### Respuesta Exitosa (`200 OK`)

```json
{
  "status": "success",
  "total": 3,
  "data": [
    {
      "id": "1",
      "title": "Bohemian Rhapsody",
      "artist": "Queen",
      "genre": "Rock",
      "durationSeconds": 354
    },
    {
      "id": "2",
      "title": "Blinding Lights",
      "artist": "The Weeknd",
      "genre": "Synthwave",
      "durationSeconds": 200
    }
  ]
}
```

### 2. Verificar la calidad de audio según duración

* **Método:** `GET`
* **Ruta:** `/api/v1/songs/verify-quality?duration=SECONDS`
* **Descripción:** Evalúa mediante una Promesa si la duración en segundos es válida para procesamiento de audio. Si la duración es `< 30` o `> 600`, la Promesa es rechazada (`reject`).

#### Petición Válida (`duration=210`)

**Respuesta (`200 OK`):**

```json
{
  "status": "success",
  "data": {
    "quality": "24-bit / 96kHz Lossless",
    "status": "Audio calificado para procesamiento Master"
  }
}
```

#### Petición Rechazada (`duration=15`)

**Respuesta (`400 Bad Request`):**

```json
{
  "status": "error",
  "message": "La canción es demasiado corta. Debe durar al menos 30 segundos."
}
```

### 3. Registrar una nueva canción

* **Método:** `POST`
* **Ruta:** `/api/v1/songs`
* **Headers:** `Content-Type: application/json`
* **Descripción:** Valida la entrada y procesa el registro. Si la canción ya existe por título y artista, la Promesa se rechaza (`reject`) enviando un error de duplicado.

#### Cuerpo de la Petición (`JSON`)

```json
{
  "title": "Starboy",
  "artist": "The Weeknd",
  "genre": "R&B",
  "durationSeconds": 230
}
```

#### Respuesta Exitosa (`201 Created`)

```json
{
  "status": "success",
  "data": {
    "id": "1728163800000",
    "title": "Starboy",
    "artist": "The Weeknd",
    "genre": "R&B",
    "durationSeconds": 230
  }
}
```

#### Respuesta por Duplicado (`400 Bad Request`)

```json
{
  "status": "error",
  "message": "La canción 'Starboy' de 'The Weeknd' ya existe en el catálogo."
}
```

## Pruebas con cURL

Ejecuta estas pruebas en la terminal para observar el comportamiento de `resolve` y `reject`:

### 1. Consultar el catálogo completo

Promesa resuelta:

```bash
curl -X GET http://localhost:3000/api/v1/songs
```

### 2. Probar verificación de calidad exitosa

Promesa resuelta:

```bash
curl -X GET "http://localhost:3000/api/v1/songs/verify-quality?duration=210"
```

### 3. Probar regla de negocio que rechaza la Promesa

Canción muy corta:

```bash
curl -X GET "http://localhost:3000/api/v1/songs/verify-quality?duration=15"
```

### 4. Registrar una nueva canción

POST exitoso:

```bash
curl -X POST http://localhost:3000/api/v1/songs \
  -H "Content-Type: application/json" \
  -d '{"title": "Starboy", "artist": "The Weeknd", "genre": "R&B", "durationSeconds": 230}'
```

### 5. Intentar registrar la misma canción

Forzar el `reject()` por duplicado:

```bash
curl -X POST http://localhost:3000/api/v1/songs \
  -H "Content-Type: application/json" \
  -d '{"title": "Starboy", "artist": "The Weeknd", "genre": "R&B", "durationSeconds": 230}'
```
