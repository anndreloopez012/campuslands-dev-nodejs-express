# Basico 11 - promesas basicas

## Que hace este ejercicio

Administra un pequeno catalogo de canciones. El foco esta en construir
una Promise a mano: src/services/musica.service.js envuelve el
fs.readFile clasico (el que usa callbacks) en un
new Promise((resolve, reject) => ...), y los controladores encadenan
.then()/.catch() directamente sobre esa promesa, en vez de usar
async/await (eso ya se practico en el ejercicio 10).

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
    |   `-- musica.service.js
    `-- data/
        `-- canciones.json
```

- routes: define los endpoints HTTP.
- controllers: usa .then()/.catch() sobre la promesa del servicio.
- services: construye la Promise manualmente sobre fs.readFile.
- data: catalogo de canciones de ejemplo.

## Como ejecutar

```bash
cd basico/ejercicio-11/resoluciones/allison-vargas
npm install
npm run dev
```

Respuesta esperada en GET /basico/ejercicio-11:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "promesas basicas"
}
```

## Listar canciones

```bash
curl http://localhost:3000/basico/ejercicio-11/canciones
```

## Buscar una cancion por titulo

```bash
curl http://localhost:3000/basico/ejercicio-11/canciones/Eco%20del%20Sur
```

Si el titulo no existe, la promesa se rechaza a proposito y el endpoint
responde 404:

```bash
curl http://localhost:3000/basico/ejercicio-11/canciones/No%20Existe
```

```json
{ "ok": false, "message": "No se encontro la cancion \"No Existe\"" }
```
