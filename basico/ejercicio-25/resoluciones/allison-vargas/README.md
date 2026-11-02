# Basico 25 - respuestas HTTP correctas 
## Que hace este ejercicio

Administra personajes de un RPG, usando a proposito el status code
correcto en cada situacion:

| Status | Cuando se usa |
|---|---|
| 200 OK | Consulta o actualizacion exitosa |
| 201 Created | Se creo un personaje nuevo |
| 204 No Content | Se elimino un personaje, sin nada que devolver |
| 400 Bad Request | El body enviado no es valido |
| 403 Forbidden | El personaje existe, pero no cumple el nivel requerido para equipar un arma |
| 404 Not Found | El personaje o el arma pedidos no existen |
| 409 Conflict | Ya existe un personaje con ese nombre |

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
    |   `-- personajes.service.js
    |-- validators/
    |   `-- personaje.validator.js
    `-- data/
        |-- personajes.json
        `-- armas.json
```

## Como ejecutar

```bash
cd basico/ejercicio-25/resoluciones/allison-vargas
npm install
npm run dev
```

Respuesta esperada en GET /basico/ejercicio-25:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "respuestas HTTP correctas"
}
```

## Ejemplos por status code

```bash
# 200
curl http://localhost:3000/basico/ejercicio-25/personajes

# 404
curl http://localhost:3000/basico/ejercicio-25/personajes/99

# 201
curl -X POST http://localhost:3000/basico/ejercicio-25/personajes -H "Content-Type: application/json" -d "{\"nombre\":\"Vessira\",\"nivel\":8,\"clase\":\"arquero\"}"

# 409 (nombre ya existe)
curl -X POST http://localhost:3000/basico/ejercicio-25/personajes -H "Content-Type: application/json" -d "{\"nombre\":\"Thalindor\",\"nivel\":1,\"clase\":\"guerrero\"}"

# 400
curl -X POST http://localhost:3000/basico/ejercicio-25/personajes -H "Content-Type: application/json" -d "{\"nivel\":-1}"

# 204
curl -i -X DELETE http://localhost:3000/basico/ejercicio-25/personajes/2

# 200: equipar arma con nivel suficiente (Thalindor, nivel 12)
curl -X POST http://localhost:3000/basico/ejercicio-25/personajes/1/equipar -H "Content-Type: application/json" -d "{\"armaId\":2}"

# 403: nivel insuficiente para esa arma
curl -X POST http://localhost:3000/basico/ejercicio-25/personajes/2/equipar -H "Content-Type: application/json" -d "{\"armaId\":2}"
```
