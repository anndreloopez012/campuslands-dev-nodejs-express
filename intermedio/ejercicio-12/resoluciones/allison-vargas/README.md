# Intermedio 12 - subrecursos REST (Allison Vargas)

## Que hace este ejercicio

API de peliculas de miedo donde cada pelicula tiene dos subrecursos anidados: sus resenas y su reparto. Las URLs expresan la relacion (`/peliculas/:peliculaId/resenas/:resenaId`) y el codigo la respeta:

- Una resena o un miembro del reparto solo existe dentro de su pelicula. `GET /peliculas/2/resenas/1` responde 404 si la resena 1 pertenece a otra pelicula.
- Si la pelicula no existe, todas sus rutas anidadas responden 404 antes de llegar al controlador. Eso se resuelve con `router.param`, que carga `req.pelicula`, `req.resena` o `req.miembro` una sola vez por peticion.
- Al borrar una pelicula se borran en cascada sus resenas y su reparto.
- Reglas de negocio con 409: no se repite pelicula (titulo y anio), no se repite autor de resena en la misma pelicula, no se repite actor en el reparto y hay maximo 3 papeles principales por pelicula.
- Crear responde 201 con el header `Location` apuntando al recurso nuevo. Borrar responde 204. Un metodo no soportado responde 405 con el header `Allow`.
- El detalle de una pelicula incluye un `resumen` (cantidad de resenas, promedio y cantidad de reparto) y `enlaces` a sus subrecursos.

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

- routes: peliculas, y dentro de ella los routers de resenas y reparto (con `mergeParams`).
- controllers: validan el body, llaman al service y arman la respuesta.
- services: reglas de negocio, filtros, orden y paginacion.
- repositories: almacenamiento en memoria (clase base con campos privados).
- validators: esquema declarativo del body, esquemas de cada recurso y lector de parametros de consulta.
- middlewares: carga de pelicula, resena y miembro, metodo no permitido, notFound y errorHandler.
- utils: errores tipados, catchAsync, respuestas, paginacion y lector de JSON.
- data: 8 peliculas, 31 resenas y 32 miembros de reparto en JSON.

## Como ejecutar

```bash
cd intermedio/ejercicio-12/resoluciones/allison-vargas
npm install
npm run dev
```

El servidor queda en http://localhost:3000. Los datos viven en memoria: al reiniciar vuelven a los del JSON.

## Respuesta esperada

```bash
curl http://localhost:3000/intermedio/ejercicio-12
```

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "subrecursos REST"
}
```

## Endpoints

Todas las rutas cuelgan de `/intermedio/ejercicio-12`.

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | /peliculas | Lista paginada con filtros |
| POST | /peliculas | Crea una pelicula |
| GET | /peliculas/:peliculaId | Detalle con resumen y enlaces |
| PATCH | /peliculas/:peliculaId | Actualiza campos de la pelicula |
| DELETE | /peliculas/:peliculaId | Borra la pelicula y sus subrecursos |
| GET | /peliculas/:peliculaId/resenas | Resenas de la pelicula |
| POST | /peliculas/:peliculaId/resenas | Crea una resena |
| GET | /peliculas/:peliculaId/resenas/:resenaId | Detalle de una resena |
| PATCH | /peliculas/:peliculaId/resenas/:resenaId | Actualiza una resena |
| DELETE | /peliculas/:peliculaId/resenas/:resenaId | Borra una resena |
| POST | /peliculas/:peliculaId/resenas/:resenaId/util | Suma un voto de "util" |
| GET | /peliculas/:peliculaId/reparto | Reparto de la pelicula |
| POST | /peliculas/:peliculaId/reparto | Agrega un miembro al reparto |
| GET | /peliculas/:peliculaId/reparto/:miembroId | Detalle de un miembro |
| PATCH | /peliculas/:peliculaId/reparto/:miembroId | Actualiza un miembro |
| DELETE | /peliculas/:peliculaId/reparto/:miembroId | Quita un miembro |

## Campos del body

| Recurso | Campos |
| --- | --- |
| Pelicula | `titulo` (2-80), `anio` (1900-2100), `director` (2-60), `subgenero` (`fantasmas`, `slasher`, `posesion`, `zombis`, `psicologico`, `found-footage`, `monstruos`), `duracionMin` (40-300), `clasificacion` (`PG-13`, `R`, `NC-17`, por defecto `R`) |
| Resena | `autor` (2-40), `puntuacion` (1-5), `comentario` (5-500) |
| Reparto | `actor` (2-60), `personaje` (2-60), `principal` (true o false, por defecto false) |

En POST todos los campos sin valor por defecto son obligatorios. En PATCH basta con enviar uno. Los campos desconocidos se rechazan con 400.

## Parametros de consulta

Todos los listados aceptan `pagina` (por defecto 1), `limite` (por defecto 10, maximo 50) y `orden`.

| Listado | Filtros | Orden |
| --- | --- | --- |
| /peliculas | `subgenero`, `anioMin`, `anioMax` | `titulo` (por defecto), `anio` |
| /resenas | `puntuacionMin` (1-5) | `recientes` (por defecto), `puntuacion`, `utiles` |
| /reparto | `principal` (true o false) | `principales` (por defecto), `actor`, `personaje` |

## Ejemplos

```bash
curl "http://localhost:3000/intermedio/ejercicio-12/peliculas?subgenero=monstruos&orden=anio"
curl http://localhost:3000/intermedio/ejercicio-12/peliculas/1
curl "http://localhost:3000/intermedio/ejercicio-12/peliculas/1/resenas?puntuacionMin=4&orden=puntuacion"
curl http://localhost:3000/intermedio/ejercicio-12/peliculas/1/reparto

curl -i -X POST http://localhost:3000/intermedio/ejercicio-12/peliculas/1/resenas \
  -H "Content-Type: application/json" \
  -d '{"autor":"Nora Vidal","puntuacion":5,"comentario":"Una joya del terror lento."}'

curl -X POST http://localhost:3000/intermedio/ejercicio-12/peliculas/1/resenas/1/util
curl -X PATCH http://localhost:3000/intermedio/ejercicio-12/peliculas/1/resenas/1 \
  -H "Content-Type: application/json" -d '{"puntuacion":4}'
curl -i -X DELETE http://localhost:3000/intermedio/ejercicio-12/peliculas/1/resenas/1
curl http://localhost:3000/intermedio/ejercicio-12/peliculas/2/resenas/1
```

En PowerShell, las comillas del JSON dan problemas con `curl`. Se puede usar Thunder Client, Postman o `Invoke-RestMethod`:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/intermedio/ejercicio-12/peliculas/1/resenas -ContentType "application/json" -Body '{"autor":"Nora Vidal","puntuacion":5,"comentario":"Una joya del terror lento."}'
```

## Formato de respuesta

Un recurso:

```json
{
  "ok": true,
  "data": {
    "id": 32,
    "peliculaId": 1,
    "autor": "Nora Vidal",
    "puntuacion": 5,
    "comentario": "Una joya del terror lento.",
    "util": 0,
    "fecha": "2026-11-04T01:20:10.685Z"
  }
}
```

Un listado de subrecurso incluye la pelicula a la que pertenece y el header `X-Total-Count`:

```json
{
  "ok": true,
  "pelicula": { "id": 1, "titulo": "La Casa del Pozo Seco" },
  "data": [],
  "paginacion": { "pagina": 1, "limite": 10, "total": 5, "totalPaginas": 1 }
}
```

## Errores

```json
{
  "ok": false,
  "message": "Datos invalidos",
  "codigo": "VALIDACION",
  "errores": [
    { "campo": "puntuacion", "mensaje": "debe estar entre 1 y 5" }
  ]
}
```

| Status | Cuando |
| --- | --- |
| 400 | body, id o parametros de consulta invalidos, o JSON mal formado |
| 404 | pelicula, resena o miembro inexistente, o que pertenece a otra pelicula |
| 405 | metodo no soportado en la ruta (con header `Allow`) |
| 409 | pelicula, autor o actor repetido, o mas de 3 papeles principales |
