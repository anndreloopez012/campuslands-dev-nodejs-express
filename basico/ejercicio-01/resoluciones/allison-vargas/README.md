# Basico 01 - Node runtime y consola (Allison Vargas)
## Que hace este ejercicio

Cada vez que el servidor arranca o se consulta el endpoint principal, "el mundo
RPG despierta" y se muestra por consola informacion real del runtime de
Node.js (version, plataforma, arquitectura y tiempo activo), usando
console.log, console.table y console.error.

## Estructura

```text
.
|-- package.json
|-- README.md
`-- src
    |-- app.js
    |-- routes/
    |   `-- ejercicio.routes.js
    |-- controllers/
    |   `-- ejercicio.controller.js
    `-- services/
        `-- mundo.service.js
```

- routes: define los endpoints HTTP.
- controllers: recibe la peticion y arma la respuesta.
- services: contiene la logica (leer el runtime de Node).

## Como ejecutar

```bash
cd basico/ejercicio-01/resoluciones/allison-vargas
npm install
npm run dev
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "Node runtime y consola",
  "estado_del_mundo": {
    "version_node": "v20.x.x",
    "plataforma": "linux",
    "arquitectura": "x64",
    "tiempo_encendido_segundos": 12.34
  }
}
```

