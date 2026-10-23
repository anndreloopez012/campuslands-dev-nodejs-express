# BÁSICO 04 — Módulos ES Modules

## Descripción

API básica desarrollada con **Node.js**, **Express** y **ES Modules** para administrar partidas de un escenario Battle Royale.

El proyecto permite consultar partidas, buscar una partida por ID, crear nuevas partidas y validar los datos recibidos.

## Tecnologías

* Node.js 20+
* Express
* JavaScript
* ES Modules
* `curl`

## Estructura

```text
carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── server.js
    ├── app.js
    ├── routes/
    │   └── match.routes.js
    ├── controllers/
    │   └── match.controller.js
    ├── services/
    │   └── match.service.js
    └── data/
        └── matches.js
```

### Responsabilidad de cada parte

* `server.js`: inicia el servidor.
* `app.js`: configura Express y registra las rutas.
* `routes/`: define los endpoints.
* `controllers/`: recibe las peticiones y construye las respuestas.
* `services/`: contiene la lógica de las partidas.
* `data/`: contiene los datos almacenados en memoria.

La aplicación mantiene una separación sencilla de responsabilidades para evitar concentrar toda la lógica en un solo archivo.

## ES Modules

El proyecto utiliza ES Modules mediante `"type": "module"` en `package.json`.

Se utilizan:

```js
import express from "express";
```

```js
import { matches } from "../data/matches.js";
```

```js
export const getAllMatches = () => {
    return matches;
};
```

También se utiliza exportación por defecto:

```js
export default app;
```

Esto diferencia el ejercicio del anterior, que utilizaba CommonJS con `require()` y `module.exports`.

## Funcionamiento

El flujo de una petición es:

```text
Cliente
   ↓
Ruta
   ↓
Controlador
   ↓
Servicio
   ↓
Datos
   ↓
Respuesta JSON
```

Los datos se almacenan temporalmente en un arreglo dentro de `data/matches.js`. No se utiliza una base de datos externa.

Cuando se crea una partida, esta se agrega al arreglo y permanece disponible mientras el servidor continúe ejecutándose.

## Instalación

Desde la carpeta del proyecto:

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

Servidor:

```text
http://localhost:3000
```

## Endpoints

| Método | Endpoint           | Descripción                   |
| ------ | ------------------ | ----------------------------- |
| GET    | `/health`          | Verificar el estado de la API |
| GET    | `/api/matches`     | Listar partidas               |
| GET    | `/api/matches/:id` | Consultar una partida         |
| POST   | `/api/matches`     | Crear una partida             |

## Pruebas con curl

Todas las pruebas se ejecutan con el servidor activo.

### 1. Health check

```bash
curl http://localhost:3000/health
```

Resultado:

```json
{
  "ok": true,
  "message": "API funcionando correctamente",
  "topic": "Modulos ES Modules"
}
```

### 2. Listar partidas

```bash
curl http://localhost:3000/api/matches
```

Resultado inicial:

```json
{
  "ok": true,
  "total": 3,
  "data": [
    {
      "id": 1,
      "name": "Clasificatoria Nocturna",
      "map": "Island",
      "players": 100,
      "status": "waiting"
    },
    {
      "id": 2,
      "name": "Torneo Squad",
      "map": "Desert",
      "players": 64,
      "status": "active"
    },
    {
      "id": 3,
      "name": "Partida Casual",
      "map": "Forest",
      "players": 50,
      "status": "finished"
    }
  ]
}
```

### 3. Consultar una partida

```bash
curl http://localhost:3000/api/matches/1
```

### 4. Consultar una partida inexistente

```bash
curl http://localhost:3000/api/matches/99
```

Debe producir una respuesta `404` indicando que la partida no fue encontrada.

### 5. Crear una partida

```bash
curl -X POST http://localhost:3000/api/matches \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Final Battle Royale",
    "map": "Island",
    "players": 100
  }'
```

Resultado:

```json
{
  "ok": true,
  "message": "Partida creada correctamente",
  "data": {
    "id": 4,
    "name": "Final Battle Royale",
    "map": "Island",
    "players": 100,
    "status": "waiting"
  }
}
```

### 6. Probar validación

```bash
curl -X POST http://localhost:3000/api/matches \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Partida incompleta"
  }'
```

Debe producir una respuesta `400` indicando que faltan datos obligatorios.

## Códigos HTTP utilizados

| Código | Uso                                      |
| ------ | ---------------------------------------- |
| `200`  | Petición procesada correctamente         |
| `201`  | Partida creada correctamente             |
| `400`  | Datos de entrada inválidos o incompletos |
| `404`  | Partida no encontrada                    |

## Resultado

El ejercicio demuestra el uso de **ES Modules en Node.js** mediante `import` y `export`, además de una estructura básica de API separando rutas, controladores, servicios y datos.

La aplicación es pequeña intencionalmente: el objetivo principal es comprender cómo funcionan los módulos ES Modules dentro de una aplicación Node.js/Express y cómo organizar el código sin concentrar toda la lógica en un único archivo.
