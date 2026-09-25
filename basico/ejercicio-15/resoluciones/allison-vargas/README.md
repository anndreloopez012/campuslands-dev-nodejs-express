# Basico 15 - mini API HTTP nativa

## Que hace este ejercicio

A diferencia de TODOS los ejercicios anteriores, este NO usa Express.
Levanta un servidor con el modulo nativo node:http de Node.js y hace a
mano lo que Express normalmente resuelve por nosotros:

- Parsear la URL de la peticion (new URL(req.url, ...)).
- Enrutar comparando req.method y las partes de la ruta a mano.
- Armar la respuesta con res.writeHead() y res.end(), sin
  res.json() ni res.status().

El resultado es un pequeno catalogo de puestos de comida urbana, con la
misma separacion en capas (routes, controllers, services) que los demas
ejercicios, aunque aqui "routes" es un enrutador manual.

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
    |   `-- puestos.service.js
    `-- data/
        `-- puestos.json
```

- routes: compara metodo + url a mano (no hay express.Router()).
- controllers: arma la respuesta con res.writeHead()/res.end().
- services: lee puestos.json, igual que en otros ejercicios.

## Como ejecutar

No hay dependencias externas (no se usa Express), pero de todas formas
corre npm install para mantener el flujo estandar:

```bash
cd basico/ejercicio-15/resoluciones/allison-vargas
npm install
npm run dev
```

Respuesta esperada en GET /basico/ejercicio-15:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "mini API HTTP nativa"
}
```

## Otros endpoints

```bash
curl http://localhost:3000/basico/ejercicio-15/puestos
curl http://localhost:3000/basico/ejercicio-15/puestos/2
curl http://localhost:3000/basico/ejercicio-15/puestos/99
curl http://localhost:3000/basico/ejercicio-15/no-existe
```
