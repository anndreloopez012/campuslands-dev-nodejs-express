# API Torneo Fútbol y Fútbol Sala — Lectura de Archivos con `fs`

Este proyecto es una API REST desarrollada con Node.js y Express para consultar equipos de un torneo de fútbol y fútbol sala. El objetivo principal de este ejercicio es aprender a leer e interpretar datos guardados en archivos físicos de disco utilizando el módulo nativo `fs/promises` de Node.js en un entorno configurado con **ES Modules**.

## Tecnologías y Conceptos Aplicados

* **Node.js**: Entorno de ejecución para JavaScript.
* **Express.js**: Framework para la construcción de la API REST.
* **Módulo Nativo `fs/promises`**: Manipulación asíncrona del sistema de archivos mediante promesas.
* **Gestión de Rutas Absolutas (`path`, `import.meta.url`)**: Construcción segura de rutas relativas al módulo en ES Modules mediante `fileURLToPath` y `path.dirname`.
* **Modo Desarrollo (`node --watch`)**: Recarga automática del servidor sin dependencias externas.
* **Arquitectura N-Capas**:

  * `data/`: Archivo persistente JSON (`teams.json`).
  * `services/`: Lectura asíncrona del archivo y procesamiento/filtrado de datos.
  * `controllers/`: Manejo de peticiones HTTP, respuestas en formato JSON y captura de errores de lectura (`try/catch`).
  * `routes/`: Mapeo de rutas del recurso `/teams`.

## Estructura del Proyecto

```text
src/
├── app.js                         # Configuración de Express y middlewares
├── server.js                      # Punto de entrada y arranque del servidor
├── routes/
│   └── tournament.routes.js       # Definición de rutas del recurso /teams
├── controllers/
│   └── tournament.controller.js   # Manejo de req/res y errores 500
├── services/
│   └── tournament.service.js      # Lectura del archivo JSON con fs/promises
└── data/
    └── teams.json                 # Fuente de datos en archivo plano
.gitignore                         # Archivos omitidos por git
package.json                       # Scripts y dependencias del proyecto
```

## Configuración del Proyecto

### 1. Archivo `.gitignore`

Asegúrate de incluir las siguientes reglas para omitir las dependencias del control de versiones:

```text
node_modules/
package-lock.json
```

### 2. Configuración del `package.json`

Asegúrate de tener la propiedad `"type": "module"` y los scripts de ejecución configurados:

```json
{
  "name": "futsal-fs-reader",
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

## Instrucciones de Instalación y Ejecución

### 1. Clonar e Instalar Dependencias

```bash
# Entrar a la carpeta del proyecto
cd futsal-fs-reader

# Instalar dependencias
npm install
```

### 2. Iniciar el Servidor en Modo Desarrollo

```bash
npm run dev
```

El servidor se ejecutará en `http://localhost:3000` y se reiniciará automáticamente ante cualquier cambio en el código fuente.

## Documentación de la API

### Base URL

```text
/api/v1
```

### 1. Obtener todos los equipos o filtrar por categoría

* **Método:** `GET`
* **Ruta:** `/api/v1/teams`
* **Parámetros Query (Opcionales):** `category` (`futsal` | `futbol-11`)

**Ejemplo de Petición:**

```text
GET /api/v1/teams?category=futsal
```

#### Respuesta Exitosa (`200 OK`)

```json
{
  "status": "success",
  "total": 2,
  "data": [
    {
      "id": "1",
      "name": "Inter Movistar",
      "category": "futsal",
      "points": 18,
      "goalsFor": 25
    },
    {
      "id": "2",
      "name": "ElPozo Murcia",
      "category": "futsal",
      "points": 15,
      "goalsFor": 20
    }
  ]
}
```

#### Respuesta de Error del Servidor (`500 Internal Server Error`)

Retornada si el archivo JSON no existe, está corrupto o se interrumpe la lectura en disco:

```json
{
  "status": "error",
  "message": "Error al leer el archivo de datos del torneo."
}
```

## Pruebas con cURL

Puedes verificar la correcta lectura e interpretación del archivo JSON ejecutando los siguientes comandos en tu terminal:

### 1. Obtener todos los equipos desde el archivo JSON

```bash
curl -X GET http://localhost:3000/api/v1/teams
```

### 2. Filtrar solo equipos de la categoría futsal

```bash
curl -X GET "http://localhost:3000/api/v1/teams?category=futsal"
```

### 3. Filtrar equipos de la categoría futbol-11

```bash
curl -X GET "http://localhost:3000/api/v1/teams?category=futbol-11"
```
