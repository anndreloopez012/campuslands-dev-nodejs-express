# BÁSICO 03 — Módulos CommonJS

## Descripción

API básica desarrollada con **Node.js**, **Express** y módulos **CommonJS** para administrar equipos de MOBA esports.

El proyecto permite consultar equipos, buscar un equipo por ID, registrar nuevos equipos y validar datos de entrada.

## Tecnologías utilizadas

* Node.js 20+
* Express
* JavaScript
* CommonJS
* `curl` para pruebas HTTP

## Concepto principal: CommonJS

El proyecto utiliza módulos CommonJS mediante:

```js
const express = require("express");
```

Para exportar datos o funciones se utiliza:

```js
module.exports = {
    getAllTeams,
    getTeamById,
    createTeam
};
```

No se utiliza:

```js
import ...
export ...
```

## Estructura del proyecto

```text
carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── server.js
    ├── app.js
    ├── routes/
    │   └── team.routes.js
    ├── controllers/
    │   └── team.controller.js
    ├── services/
    │   └── team.service.js
    └── data/
        └── teams.js
```

## Responsabilidad de cada archivo

### `server.js`

Inicia el servidor HTTP y define el puerto utilizado por la aplicación.

### `app.js`

Configura Express, habilita la lectura de JSON y registra las rutas principales.

### `routes/team.routes.js`

Define los endpoints relacionados con los equipos y los conecta con los controladores.

### `controllers/team.controller.js`

Recibe las peticiones HTTP, valida los datos básicos y construye las respuestas.

### `services/team.service.js`

Contiene la lógica para listar, buscar y crear equipos.

### `data/teams.js`

Contiene los datos iniciales de los equipos en memoria.

## Funcionamiento de la aplicación

El flujo general de una petición es:

```text
Cliente HTTP
    ↓
Ruta
    ↓
Controlador
    ↓
Servicio
    ↓
Datos en memoria
    ↓
Respuesta JSON
```

La aplicación mantiene los equipos en un arreglo dentro de `data/teams.js`.

Cuando se realiza una petición:

1. La ruta identifica el endpoint.
2. El controlador recibe la petición.
3. El servicio realiza la operación solicitada.
4. El controlador devuelve una respuesta JSON.
5. Los datos creados permanecen en memoria mientras el servidor está ejecutándose.

No se utiliza una base de datos externa.

## Instalación



Desde la carpeta del proyecto:

```bash
cd basico/ejercicio-03/resoluciones/carlos-velasco
```

Instalar los paquetes

```bash
npm install
```

## Ejecución

Modo desarrollo:

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

La API queda disponible en:

```text
http://localhost:3000
```

## Endpoints

| Método | Endpoint         | Descripción                   |
| ------ | ---------------- | ----------------------------- |
| GET    | `/health`        | Verificar el estado de la API |
| GET    | `/api/teams`     | Listar todos los equipos      |
| GET    | `/api/teams/:id` | Consultar un equipo por ID    |
| POST   | `/api/teams`     | Crear un equipo               |

## Pruebas con `curl`

Todos los comandos deben ejecutarse en otra terminal mientras el servidor esté activo.

### Verificar el estado de la API

```bash
curl http://localhost:3000/health
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "API funcionando correctamente",
  "topic": "Modulos CommonJS"
}
```

### Listar todos los equipos

```bash
curl http://localhost:3000/api/teams
```

### Consultar un equipo existente

```bash
curl http://localhost:3000/api/teams/1
```

### Consultar un equipo inexistente

```bash
curl http://localhost:3000/api/teams/99
```

Respuesta esperada:

```json
{
  "ok": false,
  "message": "Equipo no encontrado"
}
```

Código HTTP esperado:

```text
404 Not Found
```

### Crear un equipo

```bash
curl -X POST http://localhost:3000/api/teams \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Team Liquid",
    "region": "LCS",
    "game": "League of Legends"
  }'
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Equipo creado correctamente",
  "data": {
    "id": 4,
    "name": "Team Liquid",
    "region": "LCS",
    "game": "League of Legends",
    "active": true
  }
}
```

Código HTTP esperado:

```text
201 Created
```

### Probar la validación de datos

```bash
curl -X POST http://localhost:3000/api/teams \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nuevo equipo"
  }'
```

Respuesta esperada:

```json
{
  "ok": false,
  "message": "name, region y game son obligatorios"
}
```

Código HTTP esperado:

```text
400 Bad Request
```

## Códigos HTTP utilizados

| Código | Uso                          |
| ------ | ---------------------------- |
| `200`  | Petición exitosa             |
| `201`  | Recurso creado correctamente |
| `400`  | Datos de entrada incompletos |
| `404`  | Equipo no encontrado         |

## Resultado

El ejercicio demuestra el uso de **CommonJS** en Node.js mediante `require()` y `module.exports`.

También aplica una estructura básica por responsabilidades para mantener el código organizado:

* Las rutas definen los endpoints.
* Los controladores gestionan las peticiones y respuestas.
* Los servicios contienen la lógica.
* Los datos se mantienen separados de la aplicación principal.
