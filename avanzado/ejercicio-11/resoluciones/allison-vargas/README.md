# Avanzado 11 - Importacion masiva (musica)

API en Node.js y Express para cargar catalogos de canciones en bloque. Una importacion se procesa por lotes en segundo plano, con progreso consultable, modos de aplicacion, politicas de conflicto, idempotencia, cancelacion, reversion y reporte de filas rechazadas.

## Como ejecutarlo

```bash
npm install
npm start
```

Por defecto escucha en el puerto 3000 (`PORT=3100 npm start` para cambiarlo). Ruta base: `/avanzado/ejercicio-11`.

```bash
npm test
npm run test:cobertura
```

Los datos viven en memoria. En `src/data/` hay dos archivos de prueba: `muestra.json` (40 canciones validas) y `muestra-con-errores.json` (6 filas, 5 con algun problema).

## Probar rapido

```bash
curl -X POST -H "Content-Type: application/json" --data-binary @src/data/muestra.json "http://localhost:3000/avanzado/ejercicio-11/importaciones?tamanoLote=15"
curl "http://localhost:3000/avanzado/ejercicio-11/importaciones/1"
curl "http://localhost:3000/avanzado/ejercicio-11/resumen"
```

## Como funciona una importacion

1. `POST /importaciones` valida el formato y las opciones, crea la importacion en estado `en_cola` y responde `202` con un `Location`. Con `esperar=true` responde cuando termina (`201`, o `200` si es `dryRun`).
2. Las importaciones se procesan de una en una, en orden. Si ya hay 10 esperando, responde `429` con `Retry-After`.
3. Cada importacion se corta en lotes (`tamanoLote`, de 1 a 500, por defecto 100). Entre lote y lote el proceso cede el turno, asi que el servidor sigue atendiendo y el avance se ve en `GET /importaciones/:id` (`procesadas`, `porcentaje`, `lotes`).
4. Cada fila se valida y se decide: crear, actualizar, omitir o rechazar.

Estados: `en_cola`, `procesando`, `completada`, `fallida`, `cancelada`.

## Formatos de entrada

- `application/json`: `{ "canciones": [ ... ] }`. El numero de fila es la posicion en la lista.
- `application/x-ndjson`: una cancion por linea. El numero de fila es la linea del archivo; una linea que no es JSON se rechaza sin tumbar el resto.

Maximo 5000 canciones y 2 MB por importacion.

| Campo | Obligatorio | Detalle |
| --- | --- | --- |
| isrc | si | 12 caracteres: 2 letras de pais, 3 de registrante y 7 digitos. Se aceptan guiones, espacios y minusculas (`qz-abc-24-00001`) |
| titulo | si | hasta 120 caracteres |
| artista | si | hasta 80 caracteres |
| album | no | hasta 80 caracteres |
| anio | si | de 1900 al anio actual |
| duracionSeg | si | de 10 a 3600 |
| genero | si | rock, pop, jazz, clasica, electronica, hiphop, folk, latina, metal |
| explicito | no | verdadero o falso; por defecto falso |

El ISRC es la clave natural: dos canciones con el mismo ISRC son la misma cancion. Los artistas se crean solos y su nombre se unifica sin importar mayusculas ni acentos (`maria del mar` se guarda como `Maria del Mar` si ya existia asi).

## Opciones (query string)

| Opcion | Valores | Efecto |
| --- | --- | --- |
| modo | `permisivo` (defecto), `todo-o-nada` | Permisivo guarda cada lote al terminarlo y reporta las filas malas. Todo-o-nada valida todo primero y solo aplica si no hay ninguna fila rechazada; si falla queda `fallida` y no cambia nada |
| conflicto | `omitir` (defecto), `actualizar`, `fallar` | Que hacer cuando el ISRC ya existe, en la base o antes en el mismo archivo. `actualizar` sube la `version` solo si algo cambio |
| tamanoLote | 1 a 500 | Filas por lote |
| dryRun | true, false | Calcula todo sin guardar nada |
| esperar | true, false | Espera el resultado final en la misma peticion |

Cabecera opcional `Idempotency-Key`: repetir la misma clave con el mismo contenido y opciones devuelve la importacion original (`200`, cabecera `Idempotent-Replayed: true`) sin procesar de nuevo. La misma clave con otro contenido da `409`.

## Endpoints

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/` | Mensaje base del ejercicio |
| POST | `/importaciones` | Crea una importacion |
| GET | `/importaciones` | Lista (filtro `estado`, paginada) |
| GET | `/importaciones/:id` | Estado, progreso y contadores |
| POST | `/importaciones/:id/cancelar` | Cancela |
| POST | `/importaciones/:id/revertir` | Deshace lo que aplico |
| GET | `/importaciones/:id/rechazos` | Filas rechazadas con sus errores |
| GET | `/importaciones/:id/rechazos/exportar` | Descarga los rechazos (`formato=ndjson` o `csv`) |
| GET | `/canciones` | Lista (filtros `artista`, `genero`, `anio`, `q`) |
| GET | `/canciones/:isrc` | Una cancion |
| GET | `/artistas` | Artistas con su cantidad de canciones |
| GET | `/resumen` | Totales del catalogo |

### Contadores

`creadas`, `actualizadas`, `omitidas` (ya existia, o no cambiaba nada), `rechazadas` y `descartadas` (lo que se habria aplicado pero se tiro por una falla o cancelacion en todo-o-nada). Se guardan hasta 1000 rechazos por importacion y el resto se cuenta en `rechazosOmitidos`.

### Cancelar

- En cola: se cancela al instante.
- Procesando: responde `202` y se detiene al terminar el lote en curso. En permisivo se conservan los lotes ya aplicados; en todo-o-nada no queda ningun cambio.
- Ya terminada: `409`.

### Revertir

Deshace las altas y restaura el estado anterior de las canciones que se actualizaron. Si otra importacion cambio despues una de esas canciones, esa no se toca y se cuenta en `omitidasPorCambios`. No se puede revertir dos veces, ni algo que sigue en curso, ni algo que no aplico cambios.

## Respuestas

Exito: `{ "ok": true, "data": ... }`. Error: `{ "ok": false, "message": "...", "codigo": "...", "contexto": {...}, "errores": [...] }`. Un error inesperado devuelve un 500 generico sin detalles internos y se registra en el servidor; si falla el procesamiento de una importacion, queda `fallida`.

| Codigo | Estado |
| --- | --- |
| CANCION_NO_ENCONTRADA | 404 |
| IMPORTACION_NO_ENCONTRADA | 404 |
| IMPORTACION_FINALIZADA | 409 |
| IMPORTACION_NO_REVERTIBLE | 409 |
| CLAVE_DE_IDEMPOTENCIA_REUTILIZADA | 409 |
| COLA_LLENA | 429 |
| IMPORTACION_VACIA | 422 |
| IMPORTACION_DEMASIADO_GRANDE | 413 |
| FORMATO_NO_SOPORTADO | 415 |
| CODIFICACION_INVALIDA | 400 |
| VALIDACION | 400 |
| JSON_INVALIDO | 400 |
| RUTA_NO_ENCONTRADA | 404 |
| METODO_NO_PERMITIDO | 405 |
| PAYLOAD_GRANDE | 413 |
| ERROR_INTERNO | 500 |

## Estructura

```
src/
  app.js  server.js
  constants/  musica.js  rutas.js
  data/       muestra.json  muestra-con-errores.json
  domain/     catalogo.js  csv.js  texto.js
  errores/    index.js
  middlewares/  errores.js  exigirTipos.js  metodoNoPermitido.js  notFound.js
  routes/     importaciones.routes.js  canciones.routes.js
  services/   importaciones.service.js  canciones.service.js  index.js
  utils/      catchAsync.js  paginacion.js
  validators/ cancion.js  comunes.js
soporte/  helpers de las pruebas (incluye una compuerta para controlar el avance de los lotes)
test/     pruebas con node:test
```
