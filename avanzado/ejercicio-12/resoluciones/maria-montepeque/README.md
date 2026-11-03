# Avanzado 12 - exportacion JSON

API de un catalogo de peliculas de miedo hecha con Node.js y Express que
**exporta el catalogo a un archivo JSON**. Son 2000 peliculas, pero
podrian ser millones: la exportacion sale por stream, comprimida y sin
datos privados.

## Lo que hay que cuidar al exportar

### 1. JSON valido aunque sea enorme

Para no armar un string gigante, el JSON se manda **de a pedazos**
(`src/exportar/serializar.js`):

```text
{"meta":{...},"peliculas":[
{"id":1,...},
{"id":2,...}
],"total":2000}
```

- Sigue siendo **un** JSON valido (no NDJSON), asi se puede abrir con
  cualquier programa.
- El `total` va **al final** porque recien se sabe despues de recorrer
  todo.
- Cada 500 peliculas le da paso al event loop para no bloquear las demas
  peticiones.

### 2. `JSON.stringify` tiene sorpresas

Los datos internos tienen tipos que JSON no entiende:

| Valor              | `JSON.stringify` normal   | Con `replacerSeguro`      |
| ------------------ | ------------------------- | ------------------------- |
| `new Set([...])`   | `{}` (se pierde)          | arreglo                   |
| `new Map(...)`     | `{}`                      | objeto                    |
| `10n` (BigInt)     | **TypeError**             | `"10"` (texto, para no perder precision) |
| `Date`             | ISO (ya funcionaba)       | ISO                       |

Hay un test que muestra el problema sin el replacer.

### 3. Que no se escapen datos privados

Las peliculas tienen `costoProduccionUsd` y `notasInternas`. La
exportacion usa una **lista blanca** (`CAMPOS_PUBLICOS`): solo sale lo
que esta en la lista. Con `?campos=` se puede elegir un subconjunto, y
pedir un campo que no esta en la lista da 400. El `id` siempre va.

### 4. Tamano: gzip

Si el cliente manda `Accept-Encoding: gzip`, la salida pasa por
`zlib.createGzip()` en el mismo `pipeline`. En los tests pesa **menos de
la quinta parte**.

### 5. No exportar dos veces lo mismo: ETag

Cada exportacion tiene un `ETag` que depende de la **version de los
datos** y de los filtros. Si el cliente vuelve a pedir con
`If-None-Match: <etag>` y nada cambio, responde **304** sin cuerpo. Al
calificar una pelicula sube la version y el ETag viejo deja de servir.

### 6. Descarga

`Content-Disposition: attachment; filename="peliculas-2026-11-03.json"`
hace que el navegador lo descargue con ese nombre.

## Requisitos

Node.js 20 o superior. Sin base de datos.

## Instalacion y ejecucion

```bash
npm install
npm start
```

| Script        | Descripcion                          |
| ------------- | ------------------------------------ |
| `npm start`   | Servidor en http://localhost:4012    |
| `npm run dev` | Servidor con recarga automatica      |
| `npm test`    | Tests del serializador y de la API   |

## Endpoints

| Metodo | Ruta                                  | Descripcion                                      |
| ------ | ------------------------------------- | ------------------------------------------------ |
| GET    | `/health`                             | El servidor vive                                 |
| GET    | `/api/peliculas/exportar`             | Exporta, `?campos=`, `?subgenero=`, `?desde=`    |
| PATCH  | `/api/peliculas/:id/calificacion`     | `{ calificacion }` (cambia la version de datos)  |
| GET    | `/api/exportar/campos`                | Campos que se pueden exportar                    |

Subgeneros: `sobrenatural`, `psicologico`, `folk`, `ciencia ficcion`,
`slasher`.

## Ejemplos (PowerShell)

Descargar todo comprimido (curl lo descomprime con `--compressed`):

```bash
curl.exe --compressed -o peliculas.json http://localhost:4012/api/peliculas/exportar
```

Solo algunos campos y filtros:

```bash
curl.exe "http://localhost:4012/api/peliculas/exportar?campos=titulo,anio&subgenero=folk&desde=2019"
```

```json
{
  "meta": { "formato": "1.0", "exportadoEn": "2026-11-03T02:10:00.000Z", "versionDatos": 1, "campos": ["id", "titulo", "anio"], "filtros": { "subgenero": "folk", "desde": 2019 } },
  "peliculas": [
    { "id": 5, "titulo": "Midsommar", "anio": 2019 },
    { "id": 10, "titulo": "La Llorona", "anio": 2019 }
  ],
  "total": 2
}
```

Volver a pedir con el ETag:

```bash
curl.exe -i http://localhost:4012/api/peliculas/exportar -H "If-None-Match: \"exp-1a2b3c4d5e6f7a8b\""
```

```text
HTTP/1.1 304 Not Modified
```

## Tests

- `test/serializar.test.js`: el problema de `JSON.stringify` con Set y
  BigInt, el replacer, proyectar, el stream arma un JSON valido (tambien
  vacio) y sale en muchos pedazos.
- `test/api.test.js`: 2000 peliculas con meta y total, campos privados
  que no salen, `?campos=` y filtros, campo privado = 400, gzip (bytes
  reales con `http.get`), 304 con ETag, ETag distinto por campos, ETag
  viejo despues de un cambio.

```text
ℹ tests 15
ℹ pass 15
ℹ fail 0
```

Una cosa que aprendi: supertest descomprime el gzip solo, asi que para
medir el tamano comprimido el test usa `http.get` directo.

Para comprobar que los tests sirven quite la revision de la lista blanca
y fallo `pedir un campo privado da 400`.
