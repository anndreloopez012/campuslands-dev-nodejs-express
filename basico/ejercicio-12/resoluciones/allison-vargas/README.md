# Basico 12 - async await (Allison Vargas)

## Que hace este ejercicio

Simula reproducir una pelicula de miedo con verificacion de edad minima.
GET /basico/ejercicio-12/peliculas/:id/ver?edad= encadena tres pasos
asincronos con await (buscar la pelicula, verificar la edad, "reproducirla"),
todos dentro de un solo bloque try/catch. Si cualquiera de los tres
pasos falla, la ejecucion salta directo al catch, sin necesitar un
.catch() por cada paso (a diferencia del ejercicio 11).

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
    |   `-- peliculas.service.js
    `-- data/
        `-- peliculas.json
```

- routes: define los endpoints HTTP.
- controllers: encadena los pasos async con await y try/catch.
- services: logica de busqueda, validacion y "reproduccion".
- data: catalogo de peliculas de ejemplo.

## Como ejecutar

```bash
cd basico/ejercicio-12/resoluciones/allison-vargas
npm install
npm run dev
```

Respuesta esperada en GET /basico/ejercicio-12:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "async await"
}
```

## Casos de la ruta /ver

```bash
# caso feliz: edad suficiente
curl "http://localhost:3000/basico/ejercicio-12/peliculas/1/ver?edad=20"

# pelicula que no existe -> 404
curl "http://localhost:3000/basico/ejercicio-12/peliculas/99/ver?edad=20"

# edad insuficiente -> 403
curl "http://localhost:3000/basico/ejercicio-12/peliculas/2/ver?edad=15"

# falta el parametro edad -> 400
curl "http://localhost:3000/basico/ejercicio-12/peliculas/1/ver"
```
