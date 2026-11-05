# Avanzado 09 - Streams basicos (kickboxing)

API en Node.js y Express que maneja datos de combates de kickboxing con streams: exporta archivos grandes sin cargarlos completos en memoria, importa archivos por flujo linea por linea y calcula estadisticas leyendo el flujo de una sola pasada.

## Como ejecutarlo

```bash
npm install
npm start
```

Por defecto escucha en el puerto 3000 (`PORT=3100 npm start` para cambiarlo). Ruta base: `/avanzado/ejercicio-09`.

```bash
npm test
npm run test:cobertura
```

## Que streams se usan

| Pieza | Tipo | Para que sirve |
| --- | --- | --- |
| `Readable.from(generador asincrono)` | Readable en modo objeto | Recorre los combates de a uno, sin armar la lista completa |
| `ANdjson` / `ACsv` | Transform (escribe texto, recibe objetos) | Convierte cada combate en una linea NDJSON o CSV |
| `LimitadorDeBytes` | Transform | Corta la carga si pasa del tamano permitido |
| `DeLineas` | Transform (recibe bytes, entrega objetos) | Arma lineas aunque lleguen partidas entre trozos y respeta caracteres de varios bytes |
| `ValidadorDeLineas` | Transform en modo objeto | Parsea y valida cada linea |
| `AcumuladorDeImportacion` | Writable | Cuenta lineas buenas y malas |
| `AgregadorDeEstadisticas` | Writable | Acumula totales sin guardar los combates |

Todo se conecta con `pipeline`, que propaga errores, destruye los streams y respeta la contrapresion: si el cliente lee lento, el servidor deja de generar combates hasta que haya lugar.

## Datos

Hay 12 peleadores (`src/data/peleadores.json`) en tres categorias y 20.000 combates que se generan de forma determinista a partir del id, asi que no hace falta guardar un archivo enorme. Los combates importados se agregan en memoria con ids a continuacion.

## Endpoints

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/` | Mensaje base del ejercicio |
| GET | `/combates` | Lista paginada con filtros |
| GET | `/combates/:id` | Un combate |
| GET | `/combates/exportar` | Descarga por streaming en NDJSON o CSV |
| GET | `/combates/estadisticas` | Resumen calculado leyendo el flujo |
| POST | `/combates/importar` | Carga un archivo NDJSON |
| GET | `/peleadores` | Lista paginada (filtro `categoria`) |
| GET | `/peleadores/:id` | Un peleador |

Filtros disponibles en listado, exportacion y estadisticas: `peleadorId`, `categoria` (ligero, medio, pesado), `metodo` (ko, tko, decision, descalificacion, empate), `desde` y `hasta` (AAAA-MM-DD).

### Exportar

```bash
curl -O -J "http://localhost:3000/avanzado/ejercicio-09/combates/exportar?formato=csv&categoria=pesado&limite=1000"
curl "http://localhost:3000/avanzado/ejercicio-09/combates/exportar?metodo=ko&desde=2021-01-01"
```

`formato` puede ser `ndjson` (por defecto) o `csv`. `limite` va de 1 a 50000. La respuesta usa `Transfer-Encoding: chunked`, `Content-Disposition` de descarga y `Cache-Control: no-store`. Los errores de la consulta se responden como JSON antes de empezar a transmitir. Si el cliente corta la descarga, el servidor deja de leer datos.

### Importar

Cada linea del archivo es un combate en JSON:

```json
{"fecha":"2026-03-10","categoria":"ligero","rojoId":1,"azulId":2,"ganadorId":1,"metodo":"ko","rounds":2,"golpesRojo":40,"golpesAzul":12}
```

```bash
curl -X POST -H "Content-Type: application/x-ndjson" --data-binary @combates.ndjson "http://localhost:3000/avanzado/ejercicio-09/combates/importar"
```

- Modo `permisivo` (por defecto): guarda las lineas validas y reporta las demas con su numero de linea (hasta 20 errores, el resto se cuenta en `erroresOmitidos`).
- Modo `estricto` (`?modo=estricto`): si una sola linea es invalida no se guarda nada y responde 422.
- Limites: 1 MB por archivo y 2048 caracteres por linea. Si se pasa, se corta la lectura y no se guarda nada.
- Si el cliente se desconecta a la mitad, no se guarda nada.
- Reglas de cada combate: los dos peleadores existen, son distintos y de la categoria del combate; el ganador es uno de los dos (o `null` en empate); `rounds` de 1 a 5; golpes de 0 a 2000; fecha real.

## Respuestas

Exito: `{ "ok": true, "data": ... }`. Error: `{ "ok": false, "message": "...", "codigo": "...", "contexto": {...}, "errores": [...] }`. Un error inesperado devuelve un 500 generico sin detalles internos y se registra en el servidor.

| Codigo | Estado |
| --- | --- |
| COMBATE_NO_ENCONTRADO | 404 |
| PELEADOR_NO_ENCONTRADO | 404 |
| FORMATO_NO_SOPORTADO | 415 |
| IMPORTACION_VACIA | 422 |
| IMPORTACION_RECHAZADA | 422 |
| LINEA_DEMASIADO_LARGA | 413 |
| CARGA_INTERRUMPIDA | 400 |
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
  constants/  combates.js  rutas.js
  data/       peleadores.json
  domain/     generador.js  fuente.js  filtros.js  streams.js
  errores/    index.js
  middlewares/  errores.js  exigirTipo.js  metodoNoPermitido.js  notFound.js
  routes/     combates.routes.js  peleadores.routes.js
  services/   combates.service.js  peleadores.service.js  index.js
  utils/      catchAsync.js  loadJson.js  paginacion.js
  validators/ combates.js  comunes.js
soporte/  helpers de las pruebas
test/     pruebas con node:test
```
