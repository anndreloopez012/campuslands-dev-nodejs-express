# Basico 04 - modulos ES Modules 

## Que hace este ejercicio

Simula el estado de una partida de battle royale. Todo el proyecto usa el
sistema de modulos ES Modules de Node.js: cada archivo expone su
funcionalidad con export y la importa en otros con import (a diferencia
del ejercicio anterior, que uso CommonJS con require/module.exports).
El package.json incluye "type": "module" para habilitar esta sintaxis.
El endpoint principal responde con un resumen de la partida, y un segundo
endpoint lista los jugadores conectados.

## Estructura

```text
.
|-- package.json
|-- README.md
`-- src
    |-- app.js
    |-- server.js
    |-- routes/
    |   `-- ejercicio.routes.js
    |-- controllers/
    |   `-- ejercicio.controller.js
    |-- services/
    |   `-- partida.service.js
    `-- data/
        `-- jugadores.data.js
```

- routes: define los endpoints HTTP.
- controllers: recibe la peticion y arma la respuesta.
- services: contiene la logica (arma el resumen de la partida).
- data: jugadores de ejemplo, sin base de datos.

## Como ejecutar

```bash
cd basico/ejercicio-04/resoluciones/allison-vargas
npm install
npm run dev
```

Respuesta esperada en GET /basico/ejercicio-04:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "modulos ES Modules",
  "partida": {
    "total_jugadores": 3,
    "jugadores_vivos": 2
  }
}
```
