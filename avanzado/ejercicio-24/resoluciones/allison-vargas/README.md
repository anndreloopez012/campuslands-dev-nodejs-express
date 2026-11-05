# Avanzado 24 - Documentacion OpenAPI manual (formulas quimicas)

API en Node.js y Express que analiza formulas quimicas (masa molar, composicion porcentual, conversion gramos-moles) y guarda un catalogo de compuestos. El foco es la **documentacion OpenAPI 3.1 escrita a mano** y, sobre todo, **pruebas que garantizan que la documentacion no miente**.

## Como ejecutarlo

```bash
npm install
npm start          # puerto 3000, cambia con PORT=3100
npm test
```

Ruta base: `/avanzado/ejercicio-24`.

- Especificacion: `GET /openapi.json` (con `ETag`; se puede abrir en Swagger Editor o Postman).
- Documentacion legible: `GET /docs` (HTML generado desde la misma especificacion, sin CDN).

## Probar rapido

```bash
BASE=http://localhost:3000/avanzado/ejercicio-24
curl -H "Content-Type: application/json" -d '{"formula":"CuSO4.5H2O"}' $BASE/formulas/analisis
curl -H "Content-Type: application/json" -d '{"formula":"H2O","gramos":36}' $BASE/formulas/conversion
curl "$BASE/compuestos?categoria=acido"
```

## La especificacion (`src/docs/openapi.js`)

- `info`, `servers`, `tags` y una operacion por ruta con `operationId`, `summary`, parametros, body y respuestas.
- Esquemas reutilizables en `components.schemas` (`Error`, `Elemento`, `Analisis`, `Conversion`, `Compuesto`...) con `additionalProperties: false`, rangos, patrones y enums.
- Respuestas reutilizables en `components.responses` (`ErrorValidacion`, `NoEncontrado`, `FormatoNoSoportado`) con ejemplos.
- Un ayudante `exito(...)` arma el sobre `{ ok: true, data }` para no repetirlo.
- Las listas de valores (por ejemplo las categorias) se importan del codigo, asi no pueden desincronizarse.

## Pruebas de contrato (`test/contrato.test.js`)

1. **Cada ruta de Express esta documentada y cada ruta documentada existe**: se recorre el router y se compara con `paths`.
2. **No hay `$ref` rotas** ni `operationId` repetidos; cada operacion tiene resumen, una respuesta 2xx y declara sus parametros de ruta.
3. **Los ejemplos de request cumplen su esquema y la API los acepta**.
4. **Las respuestas reales cumplen lo documentado**: se hacen llamadas reales (exitos y errores) y se valida que el status este documentado y que el body cumpla el esquema.
5. `/openapi.json` sirve exactamente la especificacion y responde `304` con `If-None-Match`.

Para validar se escribio un validador minimo de JSON Schema (`src/docs/validador.js`): `type`, `const`, `enum`, `properties`, `required`, `additionalProperties`, `items`, `minItems`, `minLength`, `maxLength`, `pattern`, `minimum`, `maximum`, `exclusiveMinimum` y `$ref` internas.

## Parser de formulas (`src/quimica/formula.js`)

- Elementos con mayuscula y minuscula opcional, subindices, parentesis o corchetes anidados (`K4[Fe(CN)6]`) e hidratos con `·`, `.` o `*` y coeficiente (`CuSO4 con 5H2O`).
- Errores con la posicion exacta: elemento desconocido, parentesis sin cerrar, subindice 0, caracter inesperado.

## Rutas

| Metodo y ruta | Que hace |
| --- | --- |
| `GET /` | Informacion del ejercicio |
| `GET /openapi.json` | Especificacion OpenAPI 3.1 |
| `GET /docs` | Documentacion HTML |
| `GET /elementos`, `GET /elementos/:simbolo` | Elementos disponibles |
| `POST /formulas/analisis` | `{ formula }` -> masa molar y composicion |
| `POST /formulas/conversion` | `{ formula, gramos }` -> moles y moleculas |
| `GET /compuestos?categoria=&q=` | Catalogo |
| `POST /compuestos` | `{ nombre, formula, categoria }` |
| `GET /compuestos/:id`, `DELETE /compuestos/:id` | Detalle con analisis, y baja |

## Errores

| Codigo | Estado | Cuando |
| --- | --- | --- |
| `VALIDACION` | 400 | Datos o parametros invalidos |
| `JSON_INVALIDO` | 400 | Body que no es JSON |
| `FORMULA_INVALIDA` | 400 | La formula no se puede interpretar |
| `ELEMENTO_NO_ENCONTRADO`, `COMPUESTO_NO_ENCONTRADO` | 404 | No existe |
| `RUTA_NO_ENCONTRADA` | 404 | Ruta desconocida |
| `METODO_NO_PERMITIDO` | 405 | Metodo no admitido |
| `COMPUESTO_DUPLICADO` | 409 | La formula ya esta en el catalogo |
| `PAYLOAD_GRANDE` | 413 | Body muy grande |
| `FORMATO_NO_SOPORTADO` | 415 | Falta `Content-Type: application/json` |
| `ERROR_INTERNO` | 500 | Error inesperado |

## Estructura

```
src/
  app.js, server.js
  docs/         openapi (especificacion), validador (json schema minimo), pagina (html)
  quimica/      parser de formulas, masa molar y conversion
  services/     quimica (elementos y compuestos)
  routes/       un unico router con todas las rutas (para poder compararlo con la spec)
  middlewares/  errores, notFound, metodoNoPermitido, exigirTipo
  errores/      catalogo de errores
test/           parser, contrato entre codigo y documentacion
```
