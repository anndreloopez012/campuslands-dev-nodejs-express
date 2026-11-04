# Intermedio 06 - validacion centralizada (Allison Vargas)

## Que hace este ejercicio

API de un taller de motos donde toda la validacion de entrada vive en un solo lugar:

- `validators/engine.js`: motor de validacion con reglas declarativas (`string`, `integer`, `number`, `enum`, `required`, `min`, `max`, `pattern`, `default`, `coerce`). Limpia los datos (trim, mayusculas, conversion de numeros) y descarta los campos que no estan en el esquema.
- `validators/schemas/`: un esquema por recurso, sin codigo repetido en las rutas.
- `middlewares/validate.js`: valida `params`, `query` y `body` con un esquema y junta todos los errores en una sola respuesta 400.

Los controllers y services reciben datos ya validados y limpios.

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
    |   |-- engine.js
    |   `-- schemas/
    |-- middlewares/
    |-- utils/
    `-- data/
```

- routes: conectan cada endpoint con su esquema de validacion y su controller.
- controllers: llaman al service y responden.
- services: reglas de negocio (placa unica, transiciones de estado de la orden).
- validators: motor de validacion y esquemas por recurso.
- middlewares: validate, 404 y manejo central de errores.
- utils: AppError, catchAsync y lector de JSON.
- data: datos iniciales en JSON.

## Como ejecutar

```bash
cd intermedio/ejercicio-06/resoluciones/allison-vargas
npm install
npm run dev
```

El servidor queda en http://localhost:3000

## Respuesta esperada

```bash
curl http://localhost:3000/intermedio/ejercicio-06
```

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "validacion centralizada"
}
```

## Endpoints

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | /motos | Lista motos, filtros `?marca=&estado=&anioDesde=` |
| GET | /motos/:id | Detalle de una moto |
| POST | /motos | Crea una moto |
| PUT | /motos/:id | Actualiza una moto |
| DELETE | /motos/:id | Elimina una moto sin ordenes (204) |
| GET | /ordenes | Lista ordenes, filtros `?estado=&motoId=` |
| GET | /ordenes/:id | Detalle de una orden |
| POST | /ordenes | Crea una orden de servicio |
| PATCH | /ordenes/:id/estado | Cambia el estado de la orden |

Ejemplo de moto valida: `marca`, `modelo`, `anio`, `cilindraje`, `placa` con formato `M123ABC` y `estado` opcional.

```bash
curl -X POST http://localhost:3000/intermedio/ejercicio-06/motos -H "Content-Type: application/json" -d "{\"marca\":\"Bajaj\",\"modelo\":\"Pulsar 200\",\"anio\":2023,\"cilindraje\":200,\"placa\":\"m321xyz\"}"
curl "http://localhost:3000/intermedio/ejercicio-06/motos?estado=activa&anioDesde=2020"
curl -X PATCH http://localhost:3000/intermedio/ejercicio-06/ordenes/1/estado -H "Content-Type: application/json" -d "{\"estado\":\"terminada\"}"
```

## Formato de error de validacion

```json
{
  "ok": false,
  "message": "Datos invalidos",
  "errores": [
    { "origen": "body", "campo": "marca", "mensaje": "marca es obligatorio" },
    { "origen": "body", "campo": "anio", "mensaje": "anio debe ser un entero" }
  ]
}
```

Errores: 400 datos invalidos, 404 recurso inexistente, 409 placa repetida, orden de moto vendida, transicion de estado no permitida o moto con ordenes.
