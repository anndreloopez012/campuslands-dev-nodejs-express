# Basico 16 - primer servidor Express 

## Que hace este ejercicio

Regresamos a un servidor Express "de verdad": express(), app.use(express.json()),
express.Router() para las rutas, y app.listen(). Sirve un pequeno
catalogo de sneakers y ropa.

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
    |   `-- productos.service.js
    `-- data/
        `-- productos.json
```

- routes: define los endpoints HTTP con express.Router().
- controllers: recibe la peticion y arma la respuesta.
- services: lee productos.json.

## Como ejecutar

```bash
cd basico/ejercicio-16/resoluciones/allison-vargas
npm install
npm run dev
```

Respuesta esperada en GET /basico/ejercicio-16:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "primer servidor Express"
}
```

## Listar productos

```bash
curl http://localhost:3000/basico/ejercicio-16/productos
```
