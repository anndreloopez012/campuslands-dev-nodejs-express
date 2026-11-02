# Basico 07 - process.argv y CLI (Allison Vargas)

## Que hace este ejercicio

Ademas del endpoint HTTP de siempre, incluye un script de linea de
comandos (src/cli/listar-autos.js) que lee process.argv para filtrar
un catalogo de autos de lujo por marca directamente desde la terminal,
sin pasar por Express. El server.js tambien usa process.argv para
permitir elegir el puerto al arrancar (--port=4000).

## Estructura

```text
.
|-- package.json
|-- README.md
`-- src
    |-- app.js
    |-- server.js
    |-- cli/
    |   `-- listar-autos.js
    |-- routes/
    |   `-- ejercicio.routes.js
    |-- controllers/
    |   `-- ejercicio.controller.js
    |-- services/
    |   `-- autos.service.js
    `-- data/
        `-- autos.json
```

- routes: define los endpoints HTTP.
- controllers: recibe la peticion y arma la respuesta.
- services: lee autos.json, compartido entre el servidor y el CLI.
- cli: script independiente que usa process.argv, no depende de Express.
- data: catalogo de autos de ejemplo.

## Como ejecutar el servidor

```bash
cd basico/ejercicio-07/resoluciones/allison-vargas
npm install
npm run dev
```

Tambien se puede elegir el puerto por CLI:

```bash
node src/server.js --port=4000
```

Respuesta esperada en GET /basico/ejercicio-07:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "process.argv y CLI",
  "cli_disponible": "npm run cli -- --marca=Ferrari"
}
```

## Como usar el CLI

```bash
npm run cli
npm run cli -- --marca=Ferrari
```


