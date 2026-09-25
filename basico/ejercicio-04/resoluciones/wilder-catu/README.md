# API Battle Royale

## Descripción

Este proyecto consiste en una pequeña solución backend desarrollada con Node.js para administrar jugadores de un escenario de Battle Royale.

El ejercicio está enfocado en el uso de **ES Modules** y en los conceptos básicos necesarios para construir una API.

Se utilizan:

- Node.js
- ES Modules
- HTTP
- JSON
- Rutas
- Métodos HTTP
- Validación de datos
- Códigos de respuesta HTTP
- Manejo de errores
- npm scripts

El proyecto no utiliza Express ni dependencias externas.

## Estructura

```text
battle-royale-node/
├── app.js
├── package.json
└── README.md
```

Todo el código JavaScript se encuentra dentro de `app.js`.

## Requisitos

Se necesita:

- Node.js 20 o superior.
- npm.

No es necesario instalar paquetes adicionales.

## ES Modules

El proyecto utiliza ES Modules.

Para habilitar este sistema se agregó en `package.json`:

```json
"type": "module"
```

Esto permite utilizar:

```javascript
import http from "http";
import { URL } from "url";
```

en lugar del sistema CommonJS:

```javascript
const http = require("http");
```

## Instalación

Entrar en la carpeta del proyecto:

```bash
cd battle-royale-node
```

No es necesario ejecutar:

```bash
npm install
```

porque no existen dependencias externas.

## Ejecución

Para iniciar el servidor:

```bash
npm start
```

El servidor estará disponible en:

```text
http://localhost:3000
```

Para desarrollo:

```bash
npm run dev
```

Este comando utiliza `node --watch`.

Para verificar la sintaxis:

```bash
npm run check
```

## Datos de los jugadores

La API administra jugadores de Battle Royale.

Cada jugador contiene:

```json
{
    "id": 1,
    "nombre": "Shadow",
    "nivel": 25,
    "victorias": 8
}
```

Los datos se almacenan temporalmente en memoria.

Si el servidor se detiene, los cambios realizados desaparecen.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Información de la API |
| GET | `/jugadores` | Obtener todos los jugadores |
| GET | `/jugadores/:id` | Obtener un jugador |
| POST | `/jugadores` | Crear un jugador |
| PUT | `/jugadores/:id` | Actualizar un jugador |
| DELETE | `/jugadores/:id` | Eliminar un jugador |

## 1. Consultar la API

Ejecutar:

```bash
curl http://localhost:3000/
```

La API mostrará información general y las rutas disponibles.

También se puede abrir directamente en el navegador:

```text
http://localhost:3000/
```

## 2. Obtener jugadores

```bash
curl http://localhost:3000/jugadores
```

Respuesta:

```json
{
    "total": 2,
    "jugadores": [
        {
            "id": 1,
            "nombre": "Shadow",
            "nivel": 25,
            "victorias": 8
        },
        {
            "id": 2,
            "nombre": "Ghost",
            "nivel": 20,
            "victorias": 5
        }
    ]
}
```

## 3. Obtener un jugador

Para consultar un jugador específico:

```bash
curl http://localhost:3000/jugadores/1
```

Respuesta:

```json
{
    "id": 1,
    "nombre": "Shadow",
    "nivel": 25,
    "victorias": 8
}
```

Si el jugador no existe:

```bash
curl http://localhost:3000/jugadores/99
```

La API responde con código `404`:

```json
{
    "error": "Jugador no encontrado."
}
```

## 4. Crear un jugador

Se utiliza el método `POST`.

```bash
curl -X POST http://localhost:3000/jugadores \
-H "Content-Type: application/json" \
-d "{\"nombre\":\"Raven\",\"nivel\":15,\"victorias\":3}"
```

Respuesta:

```json
{
    "mensaje": "Jugador creado correctamente.",
    "jugador": {
        "id": 3,
        "nombre": "Raven",
        "nivel": 15,
        "victorias": 3
    }
}
```

La API devuelve el código `201`.

## 5. Actualizar un jugador

Se utiliza `PUT`.

```bash
curl -X PUT http://localhost:3000/jugadores/1 \
-H "Content-Type: application/json" \
-d "{\"nombre\":\"Shadow Elite\",\"nivel\":30,\"victorias\":12}"
```

La API busca el jugador por su ID y actualiza sus datos.

## 6. Eliminar un jugador

Se utiliza `DELETE`.

```bash
curl -X DELETE http://localhost:3000/jugadores/1
```

Respuesta:

```json
{
    "mensaje": "Jugador eliminado correctamente.",
    "jugador": {
        "id": 1,
        "nombre": "Shadow",
        "nivel": 25,
        "victorias": 8
    }
}
```

## Validaciones

La API valida la información antes de crear o actualizar jugadores.

### Nombre

El nombre es obligatorio y debe ser texto.

Correcto:

```json
{
    "nombre": "Raven"
}
```

Incorrecto:

```json
{
    "nombre": ""
}
```

### Nivel

El nivel debe ser un número entero entre `1` y `100`.

Correcto:

```json
{
    "nivel": 25
}
```

Incorrecto:

```json
{
    "nivel": 150
}
```

### Victorias

Las victorias deben ser un número entero mayor o igual a `0`.

Correcto:

```json
{
    "victorias": 8
}
```

Incorrecto:

```json
{
    "victorias": -5
}
```

## Códigos HTTP

La API utiliza:

| Código | Significado |
|---|---|
| `200` | Solicitud correcta |
| `201` | Recurso creado |
| `400` | Datos inválidos |
| `404` | Recurso o ruta no encontrada |

## Manejo de errores

Cuando los datos son incorrectos, la API devuelve información sobre el problema.

Por ejemplo:

```json
{
    "nombre": "",
    "nivel": 150,
    "victorias": -2
}
```

La respuesta será similar a:

```json
{
    "error": "Los datos enviados no son válidos.",
    "detalles": [
        "El nombre es obligatorio y debe ser texto.",
        "El nivel debe ser un número entero entre 1 y 100.",
        "Las victorias deben ser un número entero mayor o igual a 0."
    ]
}
```

## Funcionamiento interno

El servidor se crea utilizando el módulo nativo `http`:

```javascript
const servidor = http.createServer(async (req, res) => {
    // lógica de la API
});
```

Después se obtiene:

```text
Método HTTP
Ruta
Datos enviados
```

Con esta información se determina qué operación debe realizarse.

El flujo general es:

```text
Solicitud HTTP
      |
      v
Método + Ruta
      |
      v
Validación
      |
      v
Operación
      |
      v
Respuesta JSON
```

## Funciones principales

Aunque todo el código se encuentra en `app.js`, se divide internamente mediante funciones.

### enviarRespuesta()

Se encarga de enviar las respuestas HTTP en formato JSON.

### leerCuerpo()

Lee los datos enviados mediante `POST` y `PUT`.

### validarJugador()

Comprueba que los datos recibidos sean válidos.

### obtenerIdDesdeRuta()

Obtiene el ID desde una ruta como:

```text
/jugadores/1
```

## Proceso de solución

La solución sigue el proceso planteado en el problema.

### 1. Analizar los requerimientos

El escenario seleccionado es Battle Royale.

El recurso principal será:

```text
jugadores
```

### 2. Definir los datos

Cada jugador contiene:

```text
id
nombre
nivel
victorias
```

### 3. Definir los endpoints

Se implementaron operaciones:

```text
GET
POST
PUT
DELETE
```

### 4. Implementar el caso principal

Primero se implementó la consulta de jugadores.

### 5. Agregar validaciones

Se validaron:

- Nombre.
- Nivel.
- Victorias.
- ID.

### 6. Agregar manejo de errores

Se contemplaron:

- JSON inválido.
- Datos incorrectos.
- Jugador inexistente.
- Ruta inexistente.
- ID inválido.

### 7. Realizar pruebas

La API puede probarse utilizando:

- Navegador.
- Postman.
- Thunder Client.
- curl.

## Prueba rápida

Primero comprobar la sintaxis:

```bash
npm run check
```

Después iniciar:

```bash
npm start
```

En otra terminal consultar:

```bash
curl http://localhost:3000/jugadores
```

Crear un jugador:

```bash
curl -X POST http://localhost:3000/jugadores \
-H "Content-Type: application/json" \
-d "{\"nombre\":\"Raven\",\"nivel\":15,\"victorias\":3}"
```

Consultar nuevamente:

```bash
curl http://localhost:3000/jugadores
```

Actualizar:

```bash
curl -X PUT http://localhost:3000/jugadores/3 \
-H "Content-Type: application/json" \
-d "{\"nombre\":\"Raven Elite\",\"nivel\":20,\"victorias\":7}"
```

Eliminar:

```bash
curl -X DELETE http://localhost:3000/jugadores/3
```

## Resultado

El proyecto implementa una pequeña API de Battle Royale utilizando Node.js y ES Modules.

No utiliza Express ni paquetes externos.

El objetivo principal es practicar:

```text
Node.js
ES Modules
HTTP
Rutas
JSON
Validación
Métodos HTTP
Códigos HTTP
Manejo de errores
npm scripts
```

Todo el código JavaScript se mantiene dentro de `app.js`, por lo que el proyecto conserva una estructura sencilla y apropiada para practicar los fundamentos de una API backend.