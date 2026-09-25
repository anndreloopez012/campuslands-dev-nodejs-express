# Basico 17 - rutas GET 

## Que hace este ejercicio

Administra un catalogo de destinos turisticos, mostrando las dos formas
de recibir datos en una ruta GET:

- query params (req.query): GET /destinos?pais=Colombia&precioMax=500
  para filtrar sin cambiar la ruta.
- route params (req.params): GET /destinos/:id para pedir un
  recurso especifico.

Tambien demuestra un detalle clave del orden de las rutas:
/destinos/populares se declara ANTES que /destinos/:id, porque
si estuviera despues, Express tomaria "populares" como si fuera el
valor de :id y esa ruta nunca se alcanzaria.

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
    |   `-- destinos.service.js
    `-- data/
        `-- destinos.json
```

## Como ejecutar

```bash
cd basico/ejercicio-17/resoluciones/allison-vargas
npm install
npm run dev
```

Respuesta esperada en GET /basico/ejercicio-17:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "rutas GET"
}
```

## Ejemplos

```bash
# todos los destinos
curl http://localhost:3000/basico/ejercicio-17/destinos

# filtrado por query params
curl "http://localhost:3000/basico/ejercicio-17/destinos?pais=Colombia"
curl "http://localhost:3000/basico/ejercicio-17/destinos?precioMax=500"

# ruta estatica (debe funcionar aunque exista /destinos/:id)
curl http://localhost:3000/basico/ejercicio-17/destinos/populares

# ruta dinamica por id
curl http://localhost:3000/basico/ejercicio-17/destinos/1
curl http://localhost:3000/basico/ejercicio-17/destinos/99
```
