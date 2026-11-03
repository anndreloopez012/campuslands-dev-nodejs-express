# Basico 20 - middleware express.json 

## Que hace este ejercicio

Administra un catalogo de dibujos digitales, pero el foco esta en
demostrar express.json() con dos rutas POST al mismo tiempo,
mandando exactamente el mismo body a ambas:

- POST /basico/ejercicio-20/dibujos: se registra despues de
  app.use(express.json()) en app.js, asi que req.body llega
  parseado normal.
- POST /basico/ejercicio-20/sin-json/dibujos: se registra antes
  de express.json(), a proposito, para que req.body llegue vacio
  aunque se mande el mismo JSON valido.

Tambien incluye un middleware "casero" (registrarPeticion, en
src/middlewares/) que loguea cada peticion y usa next(), para
mostrar el patron general (req, res, next) de cualquier middleware.

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
    |   `-- dibujos.service.js
    `-- middlewares/
        `-- registrarPeticion.js
```

## Como ejecutar

```bash
cd basico/ejercicio-20/resoluciones/allison-vargas
npm install
npm run dev
```

Respuesta esperada en GET /basico/ejercicio-20:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "middleware express.json"
}
```

## El contraste (lo importante de este ejercicio)

Mismo body, dos rutas distintas:

```bash
# CON express.json() -> req.body llega parseado
curl -X POST http://localhost:3000/basico/ejercicio-20/dibujos -H "Content-Type: application/json" -d "{\"nombre\":\"Bosque Neon\",\"capas\":4,\"resolucion\":\"2560x1440\"}"

# SIN express.json() -> req.body llega undefined, aunque el JSON sea valido
curl -X POST http://localhost:3000/basico/ejercicio-20/sin-json/dibujos -H "Content-Type: application/json" -d "{\"nombre\":\"Bosque Neon\",\"capas\":4,\"resolucion\":\"2560x1440\"}"
```

La segunda respuesta se ve asi:

```json
{
  "ok": true,
  "mensaje": "Esta ruta NO tiene express.json() aplicado",
  "tipo_de_body": "undefined",
  "body_es_undefined": true
}
```

## Otros ejemplos

```bash
curl http://localhost:3000/basico/ejercicio-20/dibujos

# falta nombre -> 400
curl -X POST http://localhost:3000/basico/ejercicio-20/dibujos -H "Content-Type: application/json" -d "{\"capas\":2}"
```
