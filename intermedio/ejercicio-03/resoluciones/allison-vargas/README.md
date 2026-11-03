# Intermedio 03 - controladores limpios (Allison Vargas)

## Que hace este ejercicio

API de equipos de un MOBA esports con controladores delgados. Cada controlador solo valida la entrada con un validator, llama al service y responde. No tiene try/catch ni reglas de negocio: los errores llegan al middleware central gracias a un wrapper (`catchAsync`) y las respuestas salen por un helper comun (`enviar`).

## Estructura

```text
.
|-- package.json
|-- README.md
`-- src
    |-- app.js
    |-- server.js
    |-- routes/
    |-- controllers/
    |-- services/
    |-- validators/
    |-- middlewares/
    |-- utils/
    `-- data/
```

- routes: define los endpoints y valida el parametro id.
- controllers: validar, llamar al service y responder, en una o dos lineas.
- services: reglas de negocio (nombre unico, maximo 5 jugadores, duplicados).
- validators: validan el body y lanzan AppError 400.
- middlewares: validacion del id, 404 y manejo central de errores.
- utils: AppError, catchAsync, helper de respuesta y lector de JSON.
- data: archivo JSON con los equipos.

## Como ejecutar

```bash
cd intermedio/ejercicio-03/resoluciones/allison-vargas
npm install
npm run dev
```

El servidor queda en http://localhost:3000

## Respuesta esperada

```bash
curl http://localhost:3000/intermedio/ejercicio-03
```

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "controladores limpios"
}
```

## Endpoints

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | /equipos | Lista equipos, filtro opcional `?region=LAN` |
| GET | /equipos/:id | Detalle de un equipo |
| POST | /equipos | Crea un equipo (`nombre`, `region`) |
| PUT | /equipos/:id | Actualiza nombre y region |
| DELETE | /equipos/:id | Elimina el equipo (204) |
| POST | /equipos/:id/jugadores | Agrega un jugador (`nick`), maximo 5 |

```bash
curl http://localhost:3000/intermedio/ejercicio-03/equipos?region=LAN
curl -X POST http://localhost:3000/intermedio/ejercicio-03/equipos -H "Content-Type: application/json" -d "{\"nombre\":\"Iron Phoenix\",\"region\":\"EU\"}"
curl -X POST http://localhost:3000/intermedio/ejercicio-03/equipos/1/jugadores -H "Content-Type: application/json" -d "{\"nick\":\"Zephyr\"}"
curl -X DELETE http://localhost:3000/intermedio/ejercicio-03/equipos/3
```

Errores: 400 datos invalidos o id incorrecto, 404 equipo inexistente, 409 nombre repetido, jugador repetido o equipo lleno.
