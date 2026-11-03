# API Kickboxing — JSON y Persistencia Simple

Este proyecto es una API REST desarrollada con Node.js y Express sobre el dominio del kickboxing. El objetivo principal de este ejercicio es implementar persistencia de datos simple en un archivo plano (JSON) utilizando las utilidades asíncronas del módulo nativo de Node.js fs/promises (fs.readFile y fs.writeFile), garantizando que la información almacenada prevalezca tras reiniciar el servidor.

## Tecnologías y Conceptos Aplicados

* **Node.js:** Entorno de ejecución de JavaScript en el servidor.
* **Express.js:** Framework para la construcción de la API REST.
* **ES Modules (import/export):** Sintaxis de módulos moderna habilitada con `"type": "module"`.
* **Persistencia en JSON (fs/promises):**
  * Lectura y escritura asíncrona de archivos locales mediante `fs.readFile` y `fs.writeFile`.
  * Serialización y deserialización de datos con `JSON.stringify` y `JSON.parse`.
  * Manejo de rutas absolutas mediante `node:path` y `node:url` (`fileURLToPath`).
* **Arquitectura Modular en Capas:**
  * **Routes:** Definición de endpoints y asociación de verbos HTTP (GET, POST).
  * **Controllers:** Captura de parámetros, manejo de respuestas HTTP y validaciones de entrada (`req.body`).
  * **Services:** Lógica de negocio e interacción con el almacenamiento en disco (`fighters.json`).
* **Modo Desarrollo (node --watch):** Auto-recarga nativa del servidor en Node.js (v18.11+).

## Estructura del Proyecto

```plaintext
src/
├── app.js                          # Configuración de Express, middlewares y captura de 404
├── server.js                       # Punto de entrada de la aplicación y escucha del puerto
├── routes/
│   └── kickboxing.routes.js        # Endpoints para luchadores de kickboxing
├── controllers/
│   └── kickboxing.controller.js    # Controladores para GET y POST con validaciones
├── services/
│   └── kickboxing.service.js       # Operaciones de lectura y escritura en el archivo JSON
└── data/
    └── fighters.json               # Archivo JSON de persistencia local
.gitignore                          # Exclusión de node_modules y archivos de entorno
package.json                        # Configuración de dependencias y scripts de npm
```

## Configuración del Proyecto

### 1. Archivo .gitignore

Asegura que las dependencias instaladas no se suban al sistema de control de versiones:

```plaintext
node_modules/
package-lock.json
```

### 2. Configuración de package.json

Verifica la inclusión de `"type": "module"` y el uso de los scripts de ejecución:

```json
{
  "name": "kickboxing-json-persistence",
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

### 3. Base de Datos Inicial (src/data/fighters.json)

Crea el archivo `fighters.json` dentro del directorio `src/data/` con registros base:

```json
[
  {
    "id": "1",
    "name": "Rico Verhoeven",
    "weightClass": "Heavyweight",
    "wins": 60,
    "losses": 10,
    "kos": 20
  },
  {
    "id": "2",
    "name": "Giorgio Petrosyan",
    "weightClass": "Featherweight",
    "wins": 104,
    "losses": 3,
    "kos": 42
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

El servidor quedará escuchando en `http://localhost:3000`.

## Documentación de la API (Endpoints)

**Base URL:** `/api/v1`

### 1. Obtener la lista de luchadores

* **Método:** `GET`
* **Ruta:** `/api/v1/fighters`
* **Descripción:** Lee el archivo `fighters.json` y retorna el listado completo de peleadores.

#### Respuesta Exitosa (200 OK):
```json
{
  "status": "success",
  "total": 2,
  "data": [
    {
      "id": "1",
      "name": "Rico Verhoeven",
      "weightClass": "Heavyweight",
      "wins": 60,
      "losses": 10,
      "kos": 20
    },
    {
      "id": "2",
      "brand": "Giorgio Petrosyan",
      "weightClass": "Featherweight",
      "wins": 104,
      "losses": 3,
      "kos": 42
    }
  ]
}
```

### 2. Registrar un nuevo luchador

* **Método:** `POST`
* **Ruta:** `/api/v1/fighters`
* **Headers:** `Content-Type: application/json`
* **Descripción:** Valida la información recibida en el cuerpo de la petición (`req.body`), le asigna un ID único basado en marca de tiempo, añade el registro al arreglo y sobrescribe el archivo `fighters.json`.

#### Cuerpo de la Petición (JSON):
```json
{
  "name": "Badr Hari",
  "weightClass": "Heavyweight",
  "wins": 106,
  "losses": 17,
  "kos": 92
}
```

#### Respuesta Exitosa (201 Created):
```json
{
  "status": "success",
  "data": {
    "id": "1728163800000",
    "name": "Badr Hari",
    "weightClass": "Heavyweight",
    "wins": 106,
    "losses": 17,
    "kos": 92
  }
}
```

#### Respuesta de Error de Validación (400 Bad Request):
Si el campo `name` o `weightClass` están ausentes o vacíos:
```json
{
  "status": "error",
  "message": "El campo 'name' es obligatorio y debe ser un texto válido."
}
```

## Pruebas con cURL

Ejecuta los siguientes comandos en tu terminal para probar los endpoints del proyecto:

```bash
# 1. Obtener todos los luchadores
curl -X GET http://localhost:3000/api/v1/fighters

# 2. Registrar un nuevo luchador en el archivo JSON
curl -X POST http://localhost:3000/api/v1/fighters \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Badr Hari\", \"weightClass\": \"Heavyweight\", \"wins\": 106, \"losses\": 17, \"kos\": 92}"

# 3. Volver a consultar para verificar que el luchador fue guardado permanentemente
curl -X GET http://localhost:3000/api/v1/fighters
```
