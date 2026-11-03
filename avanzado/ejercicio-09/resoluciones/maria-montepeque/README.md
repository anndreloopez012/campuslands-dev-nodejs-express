# Avanzado 09 - streams basicos

API de kickboxing hecha con Node.js y Express que mueve muchos datos
**sin cargarlos todos en memoria**, usando streams.

## Por que streams

Si para exportar 1,000,000 de peleas armo un arreglo, lo paso a JSON y
lo mando, el servidor necesita tener todo en memoria al mismo tiempo, y
el cliente no recibe nada hasta que todo esta listo. Con streams los datos
pasan **de a pedazos**: se genera una pelea, se transforma, se manda, y
se sigue con la siguiente.

## Lo que hay

### 1. Exportar (`GET /api/peleas.ndjson` y `/api/peleas.csv`)

```text
generarPeleas()  ->  filtrar(categoria)  ->  aNdjson() / aCsv()  ->  res
 (async generator)     (Transform)            (Transform)           (Writable)
```

- `generarPeleas` es un `async function*`: cada pelea se crea cuando el
  stream la pide. `Readable.from()` lo convierte en stream.
- `pipeline` (de `node:stream/promises`) conecta todo:
  - maneja la **contrapresion**: si el cliente lee lento, el generador
    espera en vez de llenar la memoria;
  - si algo falla o el cliente **corta la descarga**, destruye todos los
    streams y el generador se detiene (hay un test que corta despues del
    primer pedazo de 1,000,000 y comprueba que se dejo de generar).
- La respuesta sale con `Transfer-Encoding: chunked`: no se sabe el largo
  de antemano.
- NDJSON = un JSON por linea. El cliente puede ir procesando cada linea
  sin esperar el final (un arreglo JSON gigante no se puede leer a medias).
- El CSV escapa comas y comillas (`"Badr ""Golden Boy"" Hari"`).

### 2. Subir (`POST /api/golpes`)

Un sensor manda miles de golpes en NDJSON. El body **no** se lee con
`express.json()` (que junta todo en memoria): se lee como stream.

```text
req  ->  limitarBytes(1MB)  ->  separarLineas()  ->  estadisticasGolpes()
```

- `separarLineas`: un chunk de la red puede cortar una linea a la mitad.
  Lo que sobra se guarda y se une con el siguiente chunk. En `flush` se
  entrega la ultima linea aunque no tenga salto.
- `estadisticasGolpes`: va sumando (validos, promedio, maximo, por tipo)
  sin guardar los golpes. Las lineas malas se cuentan con su numero (y se
  devuelven solo las primeras 10).
- `limitarBytes`: si el body pasa el maximo corta con 413 sin seguir
  leyendo.

## Requisitos

Node.js 20 o superior. Sin base de datos.

## Instalacion y ejecucion

```bash
npm install
npm start
```

| Script        | Descripcion                        |
| ------------- | ---------------------------------- |
| `npm start`   | Servidor en http://localhost:4009  |
| `npm run dev` | Servidor con recarga automatica    |
| `npm test`    | Tests de los streams y de la API   |

## Endpoints

| Metodo | Ruta                  | Descripcion                                         |
| ------ | --------------------- | --------------------------------------------------- |
| GET    | `/health`             | El servidor vive                                    |
| GET    | `/api/peleas.ndjson`  | 5000 peleas en NDJSON, `?categoria=`                |
| GET    | `/api/peleas.csv`     | Las mismas en CSV (descarga)                        |
| POST   | `/api/golpes`         | Body NDJSON con `{ tipo, potencia }` por linea      |
| GET    | `/api/golpes/tipos`   | Tipos de golpe validos                              |

Categorias: `pluma`, `ligero`, `welter`, `medio`, `pesado`. Tipos de
golpe: `jab`, `cross`, `hook`, `uppercut`, `patada`, `rodilla`.

## Ejemplos (PowerShell)

```bash
curl.exe "http://localhost:4009/api/peleas.ndjson?categoria=pesado"
```

```text
{"id":5,"fecha":"2015-01-05","rojo":"Buakaw Banchamek","azul":"Superbon","categoria":"pesado","resultado":"decision","round":5}
{"id":10,"fecha":"2015-01-10",...}
```

```bash
curl.exe -o peleas.csv http://localhost:4009/api/peleas.csv
```

Subir un archivo de golpes:

```bash
curl.exe -X POST http://localhost:4009/api/golpes -H "Content-Type: application/x-ndjson" --data-binary "@golpes.ndjson"
```

```json
{
  "ok": true,
  "data": {
    "validos": 3,
    "invalidos": 2,
    "primerosInvalidos": [{ "linea": 2, "motivo": "JSON invalido" }, { "linea": 4, "motivo": "tipo o potencia invalidos" }],
    "potenciaPromedio": 433,
    "potenciaMax": 900,
    "porTipo": { "jab": 2, "hook": 1 }
  }
}
```

## Tests

- `test/transformaciones.test.js`: lineas cortadas entre chunks, `\r\n`
  y lineas vacias, NDJSON, CSV con comas y comillas, filtro, limite de
  bytes, estadisticas.
- `test/api.test.js`: exportar 300 en NDJSON (chunked), CSV filtrado,
  400 antes de mandar nada, cortar la descarga detiene el generador, subir
  20,000 golpes, lineas invalidas con numero, 413.

```text
ℹ tests 14
ℹ pass 14
ℹ fail 0
```

Para comprobar que sirven hice que `separarLineas` no guardara el pedazo
que sobra de cada chunk: fallaron
`arma las lineas aunque un chunk corte una linea a la mitad` y
`procesa miles de lineas y devuelve el resumen`.
