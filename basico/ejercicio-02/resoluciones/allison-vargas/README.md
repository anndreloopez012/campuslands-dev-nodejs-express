# Basico 02 - npm scripts y package.json 

## Que hace este ejercicio

Simula el "loadout" de una partida de un shooter competitivo. El endpoint
principal responde con un resumen del equipo disponible, y un segundo
endpoint lista el arsenal completo. El foco del ejercicio esta en el
package.json: separa app.js (configuracion de Express) de server.js
(quien levanta el puerto), y usa dos scripts de npm distintos para correr
el proyecto.

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
    |   `-- loadout.service.js
    `-- data/
        `-- armas.data.js
```

- routes: define los endpoints HTTP.
- controllers: recibe la peticion y arma la respuesta.
- services: contiene la logica (arma el resumen del loadout).
- data: arsenal de ejemplo, sin base de datos.

## Scripts disponibles

- npm run dev: levanta el servidor con node --watch (se reinicia solo al guardar cambios).
- npm run start: levanta el servidor una sola vez, sin watch.

## Como ejecutar

```bash
cd basico/ejercicio-02/resoluciones/allison-vargas
npm install
npm run dev
```

Respuesta esperada en GET /basico/ejercicio-02:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "npm scripts y package.json",
  "loadout": {
    "total_armas_disponibles": 3,
    "scripts_disponibles": ["dev", "start"]
  }
}
```
