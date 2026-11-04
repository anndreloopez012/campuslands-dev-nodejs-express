# Intermedio 13 - relaciones simples (Allison Vargas)

## Que hace este ejercicio

API de ciencia ficcion con tres recursos relacionados entre si y una tabla intermedia:

- Uno a muchos: una nave tiene muchos tripulantes y muchas misiones (`tripulante.naveId` y `mision.naveId`).
- Muchos a muchos: un tripulante participa en varias misiones y una mision tiene varios tripulantes. La relacion vive en `asignaciones` (`misionId`, `tripulanteId`, `rol`) y se maneja desde `/misiones/:id/tripulantes`.

La API mantiene la integridad de las relaciones:

- Al crear o mover un registro, la nave referenciada debe existir. Si no, responde 422 `REFERENCIA_INVALIDA` indicando el campo.
- Una nave no admite mas tripulantes que su capacidad (409 `NAVE_LLENA`) y su capacidad no puede bajar de los tripulantes que ya tiene.
- Una nave con tripulantes o misiones no se puede borrar (409 `NAVE_CON_RELACIONES`).
- Un tripulante solo puede asignarse a misiones de su propia nave, una sola vez por mision, y cada mision admite un unico lider.
- Un tripulante o una mision con asignaciones no puede cambiar de nave hasta desasignar.
- Al borrar un tripulante o una mision se borran sus asignaciones.
- Las misiones siguen un ciclo de estados: `planificada` a `en-curso` o `cancelada`, y `en-curso` a `completada` o `cancelada`. Una mision `completada` o `cancelada` no cambia de estado ni de equipo.
- Todos los recursos aceptan `incluir` para traer los datos relacionados en la misma respuesta (por ejemplo `/tripulantes/1?incluir=nave,misiones`).

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
    |-- repositories/
    |-- validators/
    |-- middlewares/
    |-- utils/
    `-- data/
```

- routes: naves, tripulantes y misiones (con las rutas de la relacion muchos a muchos).
- controllers: validan el body, llaman al service y arman la respuesta.
- services: reglas de negocio, integridad de las relaciones, filtros, orden y paginacion.
- repositories: almacenamiento en memoria; asignaciones tiene consultas por mision y por tripulante.
- validators: esquemas del body, lector de parametros de consulta y de `incluir`.
- middlewares: carga de nave, tripulante y mision con `router.param`, metodo no permitido, notFound y errorHandler.
- utils: errores tipados, catchAsync, respuestas, paginacion y lector de JSON.
- data: 5 naves, 18 tripulantes, 7 misiones y 15 asignaciones en JSON.

## Como ejecutar

```bash
cd intermedio/ejercicio-13/resoluciones/allison-vargas
npm install
npm run dev
```

El servidor queda en http://localhost:3000. Los datos viven en memoria: al reiniciar vuelven a los del JSON.

## Respuesta esperada

```bash
curl http://localhost:3000/intermedio/ejercicio-13
```

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "relaciones simples"
}
```

## Endpoints

Todas las rutas cuelgan de `/intermedio/ejercicio-13`.

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET, POST | /naves | Lista paginada y crea una nave |
| GET, PATCH, DELETE | /naves/:id | Detalle con ocupacion, actualiza y borra |
| GET, POST | /tripulantes | Lista paginada y crea un tripulante |
| GET, PATCH, DELETE | /tripulantes/:id | Detalle, actualiza y borra |
| GET | /tripulantes/:id/misiones | Misiones en las que participa, con su rol |
| GET, POST | /misiones | Lista paginada y crea una mision |
| GET, PATCH, DELETE | /misiones/:id | Detalle, actualiza (incluye cambio de estado) y borra |
| GET | /misiones/:id/tripulantes | Equipo de la mision |
| POST | /misiones/:id/tripulantes | Asigna un tripulante a la mision |
| DELETE | /misiones/:id/tripulantes/:tripulanteId | Quita al tripulante de la mision |

## Campos del body

| Recurso | Campos |
| --- | --- |
| Nave | `nombre` (2-60), `clase` (`carguero`, `explorador`, `militar`, `cientifica`), `anioLanzamiento` (2100-2400), `capacidad` (1-50) |
| Tripulante | `nombre` (2-60), `rango` (`capitan`, `oficial`, `piloto`, `ingeniero`, `medico`, `cadete`), `especie` (`humano`, `androide`, `cyborg`, `marciano`, por defecto `humano`), `naveId` |
| Mision | `nombre` (3-80), `destino` (2-60), `estado` (`planificada`, `en-curso`, `completada`, `cancelada`, por defecto `planificada`), `naveId`, `inicio` (AAAA-MM-DD) |
| Asignacion | `tripulanteId`, `rol` (`lider`, `apoyo`, `especialista`, por defecto `apoyo`) |

En POST todos los campos sin valor por defecto son obligatorios. En PATCH basta con enviar uno. Los campos desconocidos se rechazan con 400.

## Parametros de consulta

Los listados aceptan `pagina` (por defecto 1), `limite` (por defecto 10, maximo 50), `orden` e `incluir`. El detalle acepta solo `incluir`.

| Listado | Filtros | Orden | Incluir |
| --- | --- | --- | --- |
| /naves | `clase`, `capacidadMin` | `nombre` (por defecto), `anio`, `capacidad` | `tripulantes`, `misiones` |
| /tripulantes | `naveId`, `rango`, `especie` | `nombre` (por defecto), `rango` | `nave`, `misiones` |
| /misiones | `estado`, `naveId` | `inicio` (por defecto), `nombre` | `nave`, `tripulantes` |

## Ejemplos

```bash
curl "http://localhost:3000/intermedio/ejercicio-13/naves?incluir=tripulantes,misiones"
curl "http://localhost:3000/intermedio/ejercicio-13/tripulantes?naveId=4&orden=rango"
curl "http://localhost:3000/intermedio/ejercicio-13/tripulantes/12?incluir=nave,misiones"
curl "http://localhost:3000/intermedio/ejercicio-13/misiones?estado=en-curso&incluir=nave,tripulantes"
curl http://localhost:3000/intermedio/ejercicio-13/misiones/1/tripulantes

curl -X POST http://localhost:3000/intermedio/ejercicio-13/tripulantes \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Nuevo Cadete","rango":"cadete","naveId":2}'

curl -X POST http://localhost:3000/intermedio/ejercicio-13/misiones/3/tripulantes \
  -H "Content-Type: application/json" \
  -d '{"tripulanteId":11,"rol":"apoyo"}'

curl -X PATCH http://localhost:3000/intermedio/ejercicio-13/misiones/3 \
  -H "Content-Type: application/json" -d '{"estado":"en-curso"}'

curl -i -X DELETE http://localhost:3000/intermedio/ejercicio-13/misiones/3/tripulantes/11
curl -i -X DELETE http://localhost:3000/intermedio/ejercicio-13/naves/1
```

En PowerShell, las comillas del JSON dan problemas con `curl`. Se puede usar Thunder Client, Postman o `Invoke-RestMethod`:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/intermedio/ejercicio-13/tripulantes -ContentType "application/json" -Body '{"nombre":"Nuevo Cadete","rango":"cadete","naveId":2}'
```

## Formato de respuesta

```json
{
  "ok": true,
  "data": {
    "id": 12,
    "nombre": "Rurik Salazar",
    "rango": "capitan",
    "especie": "cyborg",
    "naveId": 4,
    "nave": { "id": 4, "nombre": "Condor Estelar", "clase": "militar" },
    "misiones": [
      { "id": 4, "nombre": "Mineria de Hielo", "estado": "completada", "rol": "lider" }
    ]
  }
}
```

Los listados agregan `paginacion` y el header `X-Total-Count`.

## Errores

```json
{
  "ok": false,
  "message": "La referencia indicada no existe",
  "codigo": "REFERENCIA_INVALIDA",
  "errores": [
    { "campo": "naveId", "mensaje": "la nave 99 no existe" }
  ]
}
```

| Status | Cuando |
| --- | --- |
| 400 | body, id o parametros de consulta invalidos, o JSON mal formado |
| 404 | nave, tripulante, mision o asignacion inexistente |
| 405 | metodo no soportado en la ruta (con header `Allow`) |
| 409 | nave llena, nombre repetido, asignacion repetida, tripulante de otra nave, mision cerrada, lider duplicado, transicion de estado invalida o borrado con relaciones |
| 422 | el id enviado en el body (`naveId` o `tripulanteId`) no existe |
