# Avanzado 10 - Lectura de CSV (pingpong)

API en Node.js y Express que lee archivos CSV de partidos de pingpong con un lector propio (sin librerias), valida cada fila, guarda los partidos en memoria y calcula rankings y enfrentamientos.

## Como ejecutarlo

```bash
npm install
npm start
```

Por defecto escucha en el puerto 3000 (`PORT=3100 npm start` para cambiarlo). Ruta base: `/avanzado/ejercicio-10`.

```bash
npm test
npm run test:cobertura
```

Al arrancar, el servidor lee `src/data/partidos.csv` (60 partidos) con el mismo importador que usa la API; queda registrado como importacion 1.

## Como funciona el lector CSV

`src/domain/csv.js` implementa un lector de estados que recibe el texto por trozos y entrega filas completas:

- Campos entre comillas con comas, saltos de linea y comillas dobles escapadas (`""`).
- Fin de linea `\n`, `\r\n` o `\r`, incluso si el `\r\n` queda partido entre dos trozos.
- Lineas en blanco ignoradas, pero el numero de linea que se reporta es siempre el de la linea real del archivo.
- Errores claros con la linea: comillas sin cerrar, comillas en mitad de un campo, texto pegado despues de cerrar comillas, campo mayor a 200 caracteres.
- Deteccion automatica del delimitador (`,` `;` tabulador `|`) mirando las primeras filas; tolera algunas filas con otra cantidad de columnas.
- Escritura con las mismas reglas y proteccion contra inyeccion de formulas: una celda que empieza con `=`, `+`, `-` o `@` se exporta con un apostrofe delante.

`src/domain/texto.js` decodifica el archivo: UTF-8 por defecto (con o sin BOM) o el `charset` del `Content-Type` (`iso-8859-1`, `latin1`, `windows-1252`). Bytes invalidos dan `CODIFICACION_INVALIDA`.

## Formato del archivo

Los encabezados se reconocen sin importar mayusculas, acentos ni separadores (`Sets Local`, `sets_local` y `setsLocal` son lo mismo) y pueden venir en cualquier orden. Las columnas desconocidas se ignoran y se informan.

| Columna | Obligatoria | Detalle |
| --- | --- | --- |
| fecha | si | `AAAA-MM-DD` o `DD/MM/AAAA`, real y no futura |
| local, visita | si | 2 a 40 caracteres, distintos entre si, no pueden empezar con `=`, `+` o `@` |
| setsLocal, setsVisita | si | enteros; el ganador debe tener exactamente los sets que exige el formato |
| torneo | no | hasta 60 caracteres; por defecto `Sin torneo` |
| mesa | no | 1 a 20 |
| mejorDe | no | 3, 5 o 7; por defecto 5 (alias `formato`) |
| puntosLocal, puntosVisita | no | vienen los dos o ninguno; cada jugador debe tener al menos 11 puntos por set ganado |

Un partido repetido (misma fecha, torneo y pareja, aunque cambie el orden o la escritura de los nombres) se salta y se cuenta como duplicado.

## Endpoints

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/` | Mensaje base del ejercicio |
| POST | `/csv/analizar` | Describe un CSV sin guardar nada |
| POST | `/partidos/importar` | Importa un CSV (`Content-Type: text/csv`) |
| GET | `/partidos` | Lista paginada con filtros |
| GET | `/partidos/exportar` | Descarga los partidos como CSV |
| GET | `/partidos/:id` | Un partido |
| GET | `/jugadores/ranking` | Ranking de jugadores |
| GET | `/jugadores/enfrentamientos?a=&b=` | Resultado entre dos jugadores |
| GET | `/jugadores/:nombre` | Resumen y ultimos partidos de un jugador |
| GET | `/importaciones` | Historial de importaciones |
| GET | `/importaciones/:id` | Detalle con errores por fila |
| DELETE | `/importaciones/:id` | Revierte una importacion |

### Importar

```bash
curl -X POST -H "Content-Type: text/csv" --data-binary @partidos.csv "http://localhost:3000/avanzado/ejercicio-10/partidos/importar"
curl -X POST -H "Content-Type: text/csv; charset=iso-8859-1" --data-binary @viejo.csv "http://localhost:3000/avanzado/ejercicio-10/partidos/importar?dryRun=true"
```

Parametros opcionales:

- `delimitador`: `auto` (por defecto), `coma`, `puntoycoma`, `tabulador` o `barra`.
- `modo`: `permisivo` (por defecto) guarda las filas validas y reporta las malas; `estricto` no guarda nada si una sola fila es mala (422).
- `dryRun=true`: valida y responde el resumen sin guardar ni registrar la importacion.
- `nombre`: etiqueta para el historial.

Limites: 1 MB y 5000 filas por archivo. Se reportan hasta 50 errores y el resto se cuenta en `erroresOmitidos`.

Cada fila mala se informa asi:

```json
{ "fila": 4, "errores": [{ "campo": "fecha", "mensaje": "debe ser una fecha real como AAAA-MM-DD o DD/MM/AAAA" }] }
```

### Analizar

`POST /csv/analizar` devuelve el delimitador detectado, la codificacion, las columnas reconocidas, ignoradas y faltantes, las filas con una cantidad de columnas distinta, una vista previa de 5 filas y `listoParaImportar`.

### Listar, exportar y estadisticas

- Filtros de `/partidos` y `/partidos/exportar`: `jugador`, `torneo`, `desde`, `hasta`, `importacionId`.
- `/partidos/exportar` acepta `delimitador` (`coma` por defecto) y `bom=true` para que Excel abra bien los acentos. Lo exportado se puede volver a importar.
- `/jugadores/ranking`: `torneo`, `minPartidos`, `limite`. Ordena por victorias y luego por diferencia de sets.

## Respuestas

Exito: `{ "ok": true, "data": ... }`. Error: `{ "ok": false, "message": "...", "codigo": "...", "contexto": {...}, "errores": [...] }`. Un error inesperado devuelve un 500 generico sin detalles internos y se registra en el servidor.

| Codigo | Estado |
| --- | --- |
| PARTIDO_NO_ENCONTRADO | 404 |
| JUGADOR_NO_ENCONTRADO | 404 |
| IMPORTACION_NO_ENCONTRADA | 404 |
| IMPORTACION_YA_REVERTIDA | 409 |
| FORMATO_NO_SOPORTADO | 415 |
| CODIFICACION_INVALIDA | 400 |
| CSV_VACIO | 422 |
| CSV_MAL_FORMADO | 422 |
| ENCABEZADOS_INVALIDOS | 422 |
| LIMITE_DE_FILAS | 413 |
| IMPORTACION_RECHAZADA | 422 |
| VALIDACION | 400 |
| RUTA_NO_ENCONTRADA | 404 |
| METODO_NO_PERMITIDO | 405 |
| PAYLOAD_GRANDE | 413 |
| ERROR_INTERNO | 500 |

## Estructura

```
src/
  app.js  server.js
  constants/  csv.js  rutas.js
  data/       partidos.csv
  domain/     csv.js  encabezados.js  texto.js  almacen.js  estadisticas.js
  errores/    index.js
  middlewares/  errores.js  exigirTipo.js  metodoNoPermitido.js  notFound.js
  routes/     csv.routes.js  partidos.routes.js  jugadores.routes.js  importaciones.routes.js
  services/   importador.service.js  partidos.service.js  jugadores.service.js  importaciones.service.js  index.js
  utils/      catchAsync.js  loadJson.js  paginacion.js
  validators/ partido.js  comunes.js
soporte/  helpers de las pruebas
test/     pruebas con node:test
```
