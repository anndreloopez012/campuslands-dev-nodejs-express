# Basico 05 - fs para leer archivos (Allison Vargas)

## Que hace este ejercicio

Lee informacion de equipos de futbol y futbol sala desde un archivo real
en disco (src/data/equipos.json), usando el modulo fs de Node.js
(readFile de node:fs/promises), en vez de tener los datos
hardcodeados en un array dentro del codigo. El endpoint principal
responde con un resumen (cuantos equipos hay por modalidad), y un
segundo endpoint lista los equipos completos.

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
    |   `-- equipos.service.js
    `-- data/
        `-- equipos.json
```

- routes: define los endpoints HTTP.
- controllers: recibe la peticion y maneja errores de lectura del archivo.
- services: usa fs/promises para leer y parsear equipos.json.
- data: el archivo real que se lee, sin base de datos.

## Como ejecutar

```bash
cd basico/ejercicio-05/resoluciones/allison-vargas
npm install
npm run dev
```

Respuesta esperada en GET /basico/ejercicio-05:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "fs para leer archivos",
  "resumen": {
    "total_equipos": 3,
    "equipos_por_modalidad": {
      "futbol": 2,
      "futbol sala": 1
    }
  }
}
```
