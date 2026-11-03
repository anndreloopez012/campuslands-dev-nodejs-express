# API Battle Royale — Módulos ES Modules en Node.js y Express

Este proyecto es una API REST minimalista desarrollada en Node.js con Express para gestionar jugadores en un escenario de Battle Royale. Su objetivo principal es poner en práctica el uso de **ES Modules** (`import` / `export`), la arquitectura por capas (rutas, controladores, servicios y datos) y el manejo correcto de peticiones y respuestas HTTP.

## Tecnologías y Conceptos Aplicados

* **Node.js**: Entorno de ejecución para JavaScript en el servidor.
* **Express.js**: Framework para la creación de rutas y gestión del servidor HTTP.
* **ES Modules (`import`/`export`)**: Sintaxis moderna de módulos nativos de JavaScript (`"type": "module"`).
* **Arquitectura N-Capas**:

  * `data/`: Persistencia de datos en memoria.
  * `services/`: Lógica de negocio (filtrado, transformaciones, creación).
  * `controllers/`: Gestión de peticiones HTTP, respuestas y validación de entrada.
  * `routes/`: Definición de endpoints y mapeo a controladores.

## Estructura del Proyecto

```text
src/
├── app.js                       # Configuración de Express, middlewares y rutas
├── server.js                    # Punto de entrada y arranque del servidor HTTP
├── routes/
│   └── player.routes.js         # Definición de rutas del recurso /players
├── controllers/
│   └── player.controller.js     # Captura de req/res y validaciones HTTP
├── services/
│   └── player.service.js        # Lógica de negocio de la partida
└── data/
    └── players.data.js          # Estado inicial de jugadores en memoria
```

## Instrucciones de Instalación y Ejecución

### 1. Clonar e Instalar Dependencias

```bash
# Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>

# Entrar al directorio del proyecto
cd battle-royale-esmodules

# Instalar dependencias
npm install
```

### 2. Configuración de ES Modules

Asegúrate de que el archivo `package.json` contenga la propiedad `"type": "module"`:

```json
{
  "name": "battle-royale-esmodules",
  "version": "1.0.0",
  "type": "module",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js"
  },
  "dependencies": {
    "express": "^4.19.2"
  }
}
```

### 3. Iniciar el Servidor

```bash
npm start
```

El servidor se ejecutará por defecto en:

```text
http://localhost:3000
```

## Documentación de la API

### Base URL

```text
/api/v1
```

### 1. Obtener todos los jugadores

* **Método:** `GET`
* **Ruta:** `/api/v1/players`
* **Filtros Opcionales:** `?status=alive` (Retorna únicamente jugadores con estado `alive`).

#### Respuesta Exitosa (`200 OK`)

```json
{
  "status": "success",
  "data": [
    {
      "id": "1",
      "username": "ApexHunter",
      "health": 100,
      "shield": 50,
      "kills": 3,
      "status": "alive"
    },
    {
      "id": "2",
      "username": "ShadowNinja",
      "health": 80,
      "shield": 0,
      "kills": 1,
      "status": "alive"
    }
  ]
}
```

### 2. Registrar un nuevo jugador

* **Método:** `POST`
* **Ruta:** `/api/v1/players`
* **Headers:** `Content-Type: application/json`

#### Cuerpo (`Body`)

```json
{
  "username": "ViperZero"
}
```

#### Respuesta Exitosa (`201 Created`)

```json
{
  "status": "success",
  "data": {
    "id": "4",
    "username": "ViperZero",
    "health": 100,
    "shield": 50,
    "kills": 0,
    "status": "alive"
  }
}
```

#### Respuesta de Error (`400 Bad Request`)

```json
{
  "status": "error",
  "message": "El campo 'username' es obligatorio y debe ser un texto válido."
}
```

## Pruebas con cURL

Puedes probar la API desde tu terminal ejecutando los siguientes comandos con el servidor encendido:

### 1. Obtener la lista completa de jugadores

```bash
curl -X GET http://localhost:3000/api/v1/players
```

### 2. Obtener solo los jugadores vivos

```bash
curl -X GET "http://localhost:3000/api/v1/players?status=alive"
```

### 3. Crear un nuevo jugador

```bash
curl -X POST http://localhost:3000/api/v1/players \
  -H "Content-Type: application/json" \
  -d '{"username": "ViperZero"}'
```

### 4. Probar validación de error enviando un body vacío

```bash
curl -X POST http://localhost:3000/api/v1/players \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Aspectos Clave de ES Modules

### 1. Inclusión de extensión `.js`

En las sentencias `import` de archivos locales, la extensión `.js` es **obligatoria**.

Ejemplo:

```javascript
import { getPlayersController } from "../controllers/player.controller.js";
```

### 2. `export` vs `export default`

Se utilizó `export default` para la exportación de instancias principales (`app.js` y `player.routes.js`) y `export` nombrando miembros para funciones auxiliares de controladores y servicios.
