# Avanzado 11 - importacion masiva

API de un catalogo de canciones hecha con Node.js y Express que permite
**importar miles de canciones de una vez** desde un archivo NDJSON (una
cancion por linea), sin cargar el archivo entero en memoria.

## Como funciona

```text
req (body)  ->  limitarBytes  ->  separarLineas  ->  validar + decidir  ->  lotes de 500  ->  catalogo
```

1. El body se lee **como stream** (no con `express.json()`): se puede
   subir un archivo de 20MB sin tenerlo todo en memoria.
2. Cada linea se parsea y se valida. Una linea mala **no frena** la
   importacion: se anota con su numero y se sigue.
3. Las canciones buenas se juntan en **lotes** (500 por defecto) y se
   aplican de a lote. En una base de datos real es la diferencia entre
   10,000 `INSERT` y 20 `INSERT` de 500 filas.
4. Al final se devuelve un **reporte**.

La clave de cada cancion es el **ISRC** (el codigo unico de una
grabacion, ej. `USUM71703861`). Se acepta con guiones o minusculas y se
limpia.

### Opciones (query)

| Opcion        | Valores                         | Que hace                                               |
| ------------- | ------------------------------- | ------------------------------------------------------ |
| `modo`        | `insertar` (por defecto)        | Si el ISRC ya existe, se reporta como duplicado y no se toca |
|               | `upsert`                        | Si ya existe, se actualiza                             |
|               | `saltar`                        | Si ya existe, se ignora sin reportarlo                 |
| `todoONada`   | `true` / `false`                | Si hay **una** linea con problemas no se guarda **nada** (los lotes se guardan aparte hasta el final) |
| `simular`     | `true` / `false`                | Hace todo y da el reporte, pero no guarda (para revisar antes) |

Ademas:

- Un ISRC repetido **dentro del mismo archivo** es un error de esa linea.
- Una sola importacion a la vez: si llega otra mientras tanto, 409.
- Maximo 20MB por archivo (413) y maximo 100 errores en el reporte.
- Cada importacion queda registrada (`GET /api/importaciones`) con su
  estado, opciones, progreso por lote y reporte.

### Reporte

```json
{
  "ok": true,
  "data": {
    "id": 1,
    "lineas": 5,
    "insertadas": 2,
    "actualizadas": 0,
    "saltadas": 0,
    "duplicadas": 0,
    "invalidas": 3,
    "lotes": 1,
    "errores": [
      { "linea": 2, "errores": ["JSON invalido"] },
      { "linea": 3, "errores": ["genero debe ser uno de: pop, rock, ..."] },
      { "linea": 5, "errores": ["isrc GTXYZ2600001 repetido en el archivo"] }
    ],
    "aplicado": true,
    "erroresTruncados": false,
    "duracionMs": 12
  }
}
```

Responde **201** si se guardo y **200** si no (`simular` o `todoONada`
con problemas, y ahi `motivo` explica por que).

## Requisitos

Node.js 20 o superior. Sin base de datos.

## Instalacion y ejecucion

```bash
npm install
npm start
```

| Script        | Descripcion                           |
| ------------- | ------------------------------------- |
| `npm start`   | Servidor en http://localhost:4011     |
| `npm run dev` | Servidor con recarga automatica       |
| `npm test`    | Tests del importador y de la API      |

## Endpoints

| Metodo | Ruta                        | Descripcion                                    |
| ------ | --------------------------- | ---------------------------------------------- |
| GET    | `/health`                   | El servidor vive                               |
| POST   | `/api/importaciones`        | Body NDJSON, `?modo`, `?todoONada`, `?simular` |
| GET    | `/api/importaciones`        | Importaciones hechas                           |
| GET    | `/api/importaciones/:id`    | Una con su progreso y reporte                  |
| GET    | `/api/canciones`            | Total y lista, `?artista`, `?q`                |
| GET    | `/api/canciones/:isrc`      | Una cancion                                    |
| GET    | `/api/formato`              | Generos, modos y una linea de ejemplo          |

Cada linea del archivo:

```json
{"isrc":"USUM71703861","titulo":"Despacito","artista":"Luis Fonsi","genero":"reggaeton","anio":2017,"duracionSeg":229}
```

Generos: `pop`, `rock`, `reggaeton`, `bachata`, `salsa`, `cumbia`,
`jazz`, `electronica`, `hiphop`, `marimba`.

## Ejemplos (PowerShell)

Primero simular:

```bash
curl.exe -X POST "http://localhost:4011/api/importaciones?simular=true" -H "Content-Type: application/x-ndjson" --data-binary "@canciones.ndjson"
```

Despues importar de verdad, actualizando las que ya existen:

```bash
curl.exe -X POST "http://localhost:4011/api/importaciones?modo=upsert" -H "Content-Type: application/x-ndjson" --data-binary "@canciones.ndjson"
```

(`--data-binary` y no `-d`, porque `-d` le quita los saltos de linea.)

## Tests

- `test/importador.test.js`: validacion y limpieza del ISRC, 10,000
  canciones en 20 lotes con progreso, lineas malas con numero, los tres
  modos, todoONada con y sin errores, simular, maximo de errores.
- `test/api.test.js`: 5000 por HTTP, simular, upsert y registro, todoONada
  por HTTP, dos importaciones a la vez (409), errores 400/413/415,
  buscar lo importado.

```text
ℹ tests 16
ℹ pass 16
ℹ fail 0
```

Los corri 3 veces seguidas (hay un test de dos importaciones al mismo
tiempo). Para comprobar que sirven hice que `todoONada` aplicara los
lotes al momento y fallaron los 2 tests de todoONada.
