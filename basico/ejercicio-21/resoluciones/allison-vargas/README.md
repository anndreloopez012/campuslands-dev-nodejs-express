# Basico 21 - estructura src routes controllers 

## Que hace este ejercicio

Es el primer CRUD completo (listar, ver uno, crear, actualizar, borrar)
sobre proyectos de animacion 3D. El foco no es un concepto nuevo, sino
integrar todo lo visto hasta ahora con una separacion de capas bien
estricta:

- routes: solo mapea metodo HTTP + url a un controlador.
- controllers: solo traduce entre HTTP (req/res, status codes) y
  el servicio. No tiene logica de negocio.
- services: solo maneja los datos. No sabe que existe HTTP, ni
  req, ni res.
- validators: revisa el body antes de crear o actualizar.

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
    |   `-- proyectos.service.js
    |-- validators/
    |   `-- proyecto.validator.js
    `-- data/
        `-- proyectos.json
```

## Como ejecutar

```bash
cd basico/ejercicio-21/resoluciones/allison-vargas
npm install
npm run dev
```

Respuesta esperada en GET /basico/ejercicio-21:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "estructura src routes controllers"
}
```

## CRUD de proyectos

```bash
# listar
curl http://localhost:3000/basico/ejercicio-21/proyectos

# ver uno
curl http://localhost:3000/basico/ejercicio-21/proyectos/1

# crear -> 201
curl -X POST http://localhost:3000/basico/ejercicio-21/proyectos -H "Content-Type: application/json" -d "{\"nombre\":\"Dragon de Cristal\",\"software\":\"Maya\",\"duracion_seg\":60,\"estado\":\"borrador\"}"

# actualizar -> 200
curl -X PUT http://localhost:3000/basico/ejercicio-21/proyectos/1 -H "Content-Type: application/json" -d "{\"nombre\":\"Robot Explorador\",\"software\":\"Blender\",\"duracion_seg\":50,\"estado\":\"completado\"}"

# borrar -> 204 (sin contenido)
curl -i -X DELETE http://localhost:3000/basico/ejercicio-21/proyectos/2

# id que no existe -> 404
curl http://localhost:3000/basico/ejercicio-21/proyectos/99
```
