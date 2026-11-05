# Avanzado 12 - Exportacion JSON (peliculas de miedo)

API en Node.js y Express que exporta un catalogo de peliculas de miedo como JSON. La exportacion se genera en streaming, admite tres formas de salida, campos y relaciones a eleccion, filtros, orden, compresion gzip, cache con ETag y exportaciones guardadas con hash de integridad.

## Como ejecutarlo

```bash
npm install
npm start
```

Por defecto escucha en el puerto 3000 (`PORT=3100 npm start` para cambiarlo). Ruta base: `/avanzado/ejercicio-12`.

```bash
npm test
npm run test:cobertura
```

Los datos viven en memoria: 60 peliculas, 8 directores y 24 actores inventados en `src/data/`.

## Probar rapido

```bash
curl "http://localhost:3000/avanzado/ejercicio-12/peliculas/exportar?limite=3&campos=id,titulo,anio"
curl "http://localhost:3000/avanzado/ejercicio-12/peliculas/exportar?forma=envoltorio&pretty=true&subgenero=gore&incluir=director&campos=id,titulo,director"
curl "http://localhost:3000/avanzado/ejercicio-12/peliculas/exportar?forma=ndjson&incluir=ganancia&campos=id,ganancia"
curl --compressed "http://localhost:3000/avanzado/ejercicio-12/peliculas/exportar"
curl -X POST "http://localhost:3000/avanzado/ejercicio-12/exportaciones?nombre=corte&limite=10"
```

## Exportar

`GET /peliculas/exportar`

| Parametro | Valores | Por defecto |
| --- | --- | --- |
| `forma` | `arreglo`, `envoltorio`, `ndjson` | `arreglo` |
| `pretty` | `true`, `false` (no se combina con `ndjson`) | `false` |
| `campos` | lista separada por comas | todos los campos base |
| `incluir` | `director`, `reparto`, `ganancia` | ninguno |
| `orden` | `campo` o `campo:asc` / `campo:desc` | `id:asc` |
| `limite` | 1 a 100000 | todas |
| `descargar` | `true`, `false` | `true` |
| `compresion` | `auto`, `ninguna` | `auto` |
| filtros | `subgenero`, `desde`, `hasta`, `calificacionMin`, `clasificacion`, `directorId`, `actorId`, `q` | sin filtro |

- `arreglo`: un arreglo JSON con las peliculas.
- `envoltorio`: `{ "meta": {...}, "datos": [...] }`. `meta` trae el total, la version del catalogo, los filtros y los campos usados.
- `ndjson`: un objeto JSON por linea.
- Un campo de relacion (`director`, `reparto`, `ganancia`) solo se puede pedir en `campos` si tambien va en `incluir`.
- La salida es identica a `JSON.stringify` del mismo contenido (con 2 espacios si `pretty=true`).
- Se escribe por trozos de 100 filas y respeta la contrapresion: si el cliente lee lento, el servidor deja de serializar. Si el cliente corta, se detiene.
- Con `Accept-Encoding: gzip` se comprime al vuelo.
- Cabeceras: `Content-Type`, `ETag` debil, `Last-Modified`, `Cache-Control: private, no-cache`, `Vary: Accept-Encoding`, `X-Total-Registros`, `X-Content-Type-Options: nosniff` y, con `descargar=true`, `Content-Disposition` con el nombre `peliculas-miedo-AAAAMMDD.json` (o `.ndjson`).
- Con `If-None-Match` o `If-Modified-Since` responde `304` si nada cambio. El ETag depende de los parametros y de la version del catalogo.

`GET /peliculas/exportar/esquema` devuelve el JSON Schema (2020-12) de los campos pedidos.

## Exportaciones guardadas

Una exportacion guardada es una copia fija del resultado en un momento dado.

| Metodo y ruta | Que hace |
| --- | --- |
| `POST /exportaciones` | Guarda una exportacion con los mismos parametros de `/peliculas/exportar` mas `nombre`. `201` con `Location`. |
| `GET /exportaciones` | Lista las guardadas (maximo 20). |
| `GET /exportaciones/:id` | Datos de una exportacion: registros, bytes, `sha256` y `digest`. |
| `GET /exportaciones/:id/descargar` | Descarga el contenido exacto. ETag fuerte, `Digest`, cache inmutable y `304`. |
| `DELETE /exportaciones/:id` | La elimina. |

Cada copia pesa como maximo 5 MB. Aunque el catalogo cambie despues, la descarga sigue entregando los mismos bytes.

## Otras rutas

| Metodo y ruta | Que hace |
| --- | --- |
| `GET /` | Informacion del ejercicio. |
| `GET /peliculas` | Listado paginado (`pagina`, `limite`, `orden` y los mismos filtros). |
| `POST /peliculas` | Crea una pelicula (JSON, hasta 10 kb). Sube la version del catalogo. |
| `GET /peliculas/:id` | Detalle. |
| `DELETE /peliculas/:id` | Elimina. Sube la version del catalogo. |
| `GET /directores`, `GET /actores` | Listados paginados. |

## Errores

Todas las respuestas de error tienen la forma `{ "ok": false, "message": "...", "codigo": "...", "errores": [...] }`. Los errores no previstos devuelven un `500` generico sin detalles internos y se registran en el servidor. Si falla la generacion cuando la respuesta ya empezo, se corta la conexion.

| Codigo | Estado | Cuando |
| --- | --- | --- |
| `VALIDACION` | 400 | Parametros o datos invalidos (se informan todos juntos) |
| `JSON_INVALIDO` | 400 | El body no es JSON |
| `PELICULA_NO_ENCONTRADA` | 404 | No existe la pelicula |
| `EXPORTACION_NO_ENCONTRADA` | 404 | No existe la exportacion guardada |
| `RUTA_NO_ENCONTRADA` | 404 | Ruta desconocida |
| `METODO_NO_PERMITIDO` | 405 | Metodo no admitido (con cabecera `Allow`) |
| `PELICULA_DUPLICADA` | 409 | Ya existe una pelicula con ese titulo y anio |
| `EXPORTACION_LIMITE` | 409 | Ya hay 20 exportaciones guardadas |
| `PAYLOAD_GRANDE` | 413 | El body supera el limite |
| `EXPORTACION_DEMASIADO_GRANDE` | 413 | La copia supera 5 MB |
| `FORMATO_NO_SOPORTADO` | 415 | El `Content-Type` no es `application/json` |
| `ERROR_INTERNO` | 500 | Error inesperado |

## Estructura

```
src/
  app.js, server.js
  constants/    rutas y listas de valores
  data/         peliculas, directores y actores
  domain/       catalogo, proyeccion, serializador, utilidades http
  errores/      catalogo de errores
  middlewares/  errores, notFound, metodoNoPermitido, exigirTipo
  routes/       peliculas, exportaciones, colecciones
  services/     peliculas y exportaciones
  utils/        catchAsync, paginacion, loadJson
  validators/   validaciones escritas a mano
test/           pruebas unitarias y de API
soporte/        ayudas para las pruebas
```
