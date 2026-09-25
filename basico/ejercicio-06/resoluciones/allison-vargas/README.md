# Basico 06 - path y rutas seguras (Allison Vargas)

## Que hace este ejercicio

Simula la busqueda de fichas tecnicas de motos en un taller mecanico. El
endpoint GET /basico/ejercicio-06/fichas/:modelo recibe un nombre de
modelo por la URL y usa el modulo path de Node.js (path.normalize,
path.resolve, path.sep) para construir una ruta de archivo segura
dentro de src/data/fichas, sin confiar directamente en lo que manda el
cliente. Si alguien intenta "escapar" de esa carpeta (por ejemplo con
../../algo), la peticion se rechaza con 400 antes de tocar el disco.

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
    |   `-- fichas.service.js
    `-- data/
        `-- fichas/
            |-- yamaha-r15.json
            |-- honda-cb190.json
            `-- suzuki-gn125.json
```

- routes: define los endpoints HTTP.
- controllers: recibe la peticion y traduce cada error a un status HTTP.
- services: construye la ruta segura con path y lee el archivo.
- data/fichas: fichas tecnicas de ejemplo, una por modelo.

## Como ejecutar

```bash
cd basico/ejercicio-06/resoluciones/allison-vargas
npm install
npm run dev
```

Respuesta esperada en GET /basico/ejercicio-06:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "path y rutas seguras"
}
```

Ejemplo: GET /basico/ejercicio-06/fichas/yamaha-r15:

```json
{
  "ok": true,
  "ficha": { "modelo": "Yamaha R15", "cilindraje": "155cc", "tipo": "deportiva" }
}
```

Ejemplo de intento de path traversal, GET /basico/ejercicio-06/fichas/..%2F..%2Fpackage:

```json
{ "ok": false, "message": "Nombre de modelo invalido" }
```
