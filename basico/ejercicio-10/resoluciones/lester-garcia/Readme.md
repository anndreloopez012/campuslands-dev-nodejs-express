# API PingPong — Funciones Asincrónicas

Este proyecto es una API REST desarrollada con Node.js y Express sobre la temática de ping pong (tenis de mesa). El objetivo principal de este ejercicio es dominar el flujo de funciones asincrónicas mediante la sintaxis moderna de async/await, promesas explícitas (Promise) para simular latencia de red en operaciones de cómputo y lectura/escritura asíncrona de archivos JSON (fs/promises).

## Tecnologías y Conceptos Aplicados

* **Node.js:** Entorno de ejecución en el servidor.
* **Express.js:** Framework web para la construcción de la API REST.
* **ES Modules (import/export):** Sintaxis moderna de módulos configurada con `"type": "module"`.
* **Programación Asincrónica (async / await):**
  * Control explícito de la asincronía en servicios y controladores.
  * Creación de promesas personalizadas con `Promise` para simular retardos no bloqueantes de red (`setTimeout`).
  * Uso de `fs/promises` para la lectura (`fs.readFile`) y escritura (`fs.writeFile`) asíncrona en archivos JSON.
  * Captura y manejo seguro de excepciones asíncronas con bloques `try/catch`.
* **Arquitectura en Capas:**
  * **Routes:** Enrutamiento y mapeo de verbos HTTP (GET, POST).
  * **Controllers:** Gestión de peticiones/respuestas, validación de payloads y códigos de estado HTTP.
  * **Services:** Lógica de negocio, simulación de cálculos de métricas y persistencia asíncrona.
* **Modo Desarrollo (node --watch):** Recarga automática nativa.

## Estructura del Proyecto

```plaintext
src/
├── app.js                          # Configuración de Express, middlewares y manejo de 404
├── server.js                       # Punto de entrada de la aplicación y arranque del servidor
├── routes/
│   └── pingpong.routes.js         # Definición de endpoints para jugadores y estadísticas
├── controllers/
│   └── pingpong.controller.js     # Controladores asíncronos con manejo de try/catch
├── services/
│   └── pingpong.service.js        # Operaciones asíncronas, simulación de latencia y lectura JSON
└── data/
    └── players.json                # Persistencia local en formato JSON
.gitignore                          # Exclusión de archivos no rastreables por Git
package.json                        # Configuración de dependencias y scripts de ejecución
```

## Configuración del Proyecto

### 1. Archivo .gitignore

Asegura que node_modules no sea rastreado por Git:

```plaintext
node_modules/
package-lock.json
```

### 2. Configuración de package.json

Verifica la inclusión de `"type": "module"` y el script de ejecución en modo desarrollo:

```json
{
  "name": "pingpong-async-functions",
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

### 3. Base de Datos Inicial (src/data/players.json)

Crea el archivo `players.json` dentro del directorio `src/data/`:

```json
[
  {
    "id": "1",
    "name": "Fan Zhendong",
    "playstyle": "Offensive Shakehand",
    "rank": 1,
    "matchesWon": 340
  },
  {
    "id": "2",
    "name": "Ma Long",
    "playstyle": "All-round Attacker",
    "rank": 2,
    "matchesWon": 450
  },
  {
    "id": "3",
    "name": "Truls Möregårdh",
    "playstyle": "Creative Shakehand",
    "rank": 5,
    "matchesWon": 180
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

**Base URL:** `/api/v1`

### 1. Obtener todos los jugadores

* **Método:** `GET`
* **Ruta:** `/api/v1/players`
* **Descripción:** Retorna el listado completo de jugadores tras resolver una lectura asíncrona simulada.

#### Respuesta Exitosa (200 OK):
```json
{
  "status": "success",
  "total": 3,
  "data": [
    {
      "id": "1",
      "name": "Fan Zhendong",
      "playstyle": "Offensive Shakehand",
      "rank": 1,
      "matchesWon": 340
    },
    {
      "id": "2",
      "name": "Ma Long",
      "playstyle": "All-round Attacker",
      "rank": 2,
      "matchesWon": 450
    }
  ]
}
```

### 2. Obtener un jugador por ID

* **Método:** `GET`
* **Ruta:** `/api/v1/players/:id`
* **Descripción:** Busca y retorna los detalles de un jugador de manera asíncrona por su ID.

#### Respuesta Exitosa (200 OK):
```json
{
  "status": "success",
  "data": {
    "id": "1",
    "name": "Fan Zhendong",
    "playstyle": "Offensive Shakehand",
    "rank": 1,
    "matchesWon": 340
  }
}
```

### 3. Consultar estadísticas de rendimiento de un jugador

* **Método:** `GET`
* **Ruta:** `/api/v1/players/:id/stats`
* **Descripción:** Simula una tarea asíncrona intensiva (300 ms de latencia) para calcular métricas de rendimiento y tasa de victorias estimada.

#### Respuesta Exitosa (200 OK):
```json
{
  "status": "success",
  "data": {
    "id": "1",
    "name": "Fan Zhendong",
    "rank": 1,
    "estimatedWinRate": "94.4%",
    "status": "Active Competitor"
  }
}
```

### 4. Registrar un nuevo jugador

* **Método:** `POST`
* **Ruta:** `/api/v1/players`
* **Headers:** `Content-Type: application/json`
* **Descripción:** Valida la entrada, genera un ID único y persiste el nuevo registro en `players.json` de forma asíncrona.

#### Cuerpo de la Petición (JSON):
```json
{
  "name": "Hugo Calderano",
  "playstyle": "Offensive Two-winged Loop",
  "rank": 6,
  "matchesWon": 210
}
```

#### Respuesta Exitosa (201 Created):
```json
{
  "status": "success",
  "data": {
    "id": "1728163800000",
    "name": "Hugo Calderano",
    "playstyle": "Offensive Two-winged Loop",
    "rank": 6,
    "matchesWon": 210
  }
}
```

#### Respuesta de Error de Validación (400 Bad Request):
```json
{
  "status": "error",
  "message": "El campo 'rank' es obligatorio y debe ser un número válido."
}
```

## Pruebas con cURL

Ejecuta las siguientes pruebas desde la terminal para verificar el funcionamiento asíncrono de los endpoints:

```bash
# 1. Consultar la lista general de jugadores
curl -X GET http://localhost:3000/api/v1/players

# 2. Consultar un jugador por ID
curl -X GET http://localhost:3000/api/v1/players/1

# 3. Consultar las estadísticas calculadas asíncronamente
curl -X GET http://localhost:3000/api/v1/players/1/stats

# 4. Registrar un nuevo jugador (POST)
curl -X POST http://localhost:3000/api/v1/players \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Hugo Calderano\", \"playstyle\": \"Offensive Two-winged Loop\", \"rank\": 6, \"matchesWon\": 210}"
```
