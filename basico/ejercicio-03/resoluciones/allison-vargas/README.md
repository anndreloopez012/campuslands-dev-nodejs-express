# Basico 03 - modulos CommonJS (Allison Vargas)

## Que hace este ejercicio

Simula el draft de campeones de un MOBA. Todo el proyecto usa el sistema de
modulos CommonJS de Node.js: cada archivo expone su funcionalidad con
module.exports y la importa en otros con require(...) (a diferencia del
ejercicio anterior, que uso import/export de ES Modules). El endpoint
principal responde con un resumen del draft, y un segundo endpoint lista
los campeones disponibles.

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
    |   `-- draft.service.js
    `-- data/
        `-- campeones.data.js
```

- routes: define los endpoints HTTP.
- controllers: recibe la peticion y arma la respuesta.
- services: contiene la logica (arma el resumen del draft).
- data: campeones de ejemplo, sin base de datos.

## Como ejecutar

```bash
cd basico/ejercicio-03/resoluciones/allison-vargas
npm install
npm run dev
```

Respuesta esperada en GET /basico/ejercicio-03:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "modulos CommonJS",
  "draft": {
    "total_campeones_disponibles": 3,
    "roles_disponibles": ["mid", "jungla", "soporte"]
  }
}
```
