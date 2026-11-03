# Avanzado 24 - documentacion OpenAPI manual (formulas quimicas)

API que calcula masas molares (`Ca(OH)2`, `Al2(SO4)3`...) y guarda compuestos, con su **documentacion OpenAPI 3.0 escrita a mano** (sin generadores ni swagger-ui).

## Como ejecutar

```bash
npm install
npm start      # http://localhost:4024
npm test
```

- Documentacion legible: http://localhost:4024/docs
- Especificacion: http://localhost:4024/openapi.json (se puede pegar en https://editor.swagger.io)

## Como se uso la documentacion

1. **`src/docs/openapi.js`**: el objeto OpenAPI con `info`, `servers`, `tags`, `paths`, `parameters`, `requestBody` con ejemplos, `responses` por status, y `components.schemas` reutilizados con `$ref`.
2. **Una sola fuente de verdad**: el middleware `validarBody` valida el body con el **mismo schema** del `requestBody`. Si cambio la documentacion, cambia la validacion.
3. **`src/docs/validador.js`**: validador pequeno hecho a mano (type, required, properties, additionalProperties, enum, minLength, maxLength, minimum, items, $ref).
4. **`src/docs/html.js`**: genera la pagina `/docs` a partir del OpenAPI (con escape de HTML).

## Tests de contrato (`test/contrato.test.js`)

La parte importante: que la documentacion **no mienta**.

- Todas las rutas registradas en Express estan en el OpenAPI y al reves (si agrego una ruta y no la documento, falla).
- Cada operacion tiene `summary`, `operationId` unico, tags que existen y respuestas.
- Todos los `$ref` existen y los ejemplos cumplen su propio schema.
- Se hacen peticiones reales y se valida que **cada respuesta** (200, 201, 400, 404, 409) tenga un status documentado y cumpla su schema.

## Endpoints

| Metodo | Ruta | Descripcion |
| ------ | ---- | ----------- |
| GET | `/health` | estado |
| GET | `/api/compuestos?tipo=acido` | listar (tipos: acido, base, sal, oxido, organico) |
| GET | `/api/compuestos/{formula}` | ver uno |
| POST | `/api/compuestos` | `{ formula, nombre, tipo, peligroso? }` |
| POST | `/api/masa-molar` | `{ formula }` -> masa molar y aporte de cada elemento |
| GET | `/openapi.json` | especificacion |
| GET | `/docs` | pagina de documentacion |

## Ejemplos

```bash
curl -X POST localhost:4024/api/masa-molar -H "Content-Type: application/json" -d '{"formula":"Ca(OH)2"}'
curl "localhost:4024/api/compuestos?tipo=acido"
curl "localhost:4024/api/compuestos/H2SO4"
curl -X POST localhost:4024/api/compuestos -H "Content-Type: application/json" \
  -d '{"formula":"NaHCO3","nombre":"Bicarbonato de sodio","tipo":"sal"}'
```

Respuesta de masa molar:

```json
{
  "ok": true,
  "data": {
    "formula": "Ca(OH)2",
    "atomos": { "Ca": 1, "O": 2, "H": 2 },
    "masaMolar": 74.092,
    "unidad": "g/mol",
    "detalle": [
      { "simbolo": "Ca", "cantidad": 1, "aporte": 40.078 },
      { "simbolo": "O", "cantidad": 2, "aporte": 31.998 },
      { "simbolo": "H", "cantidad": 2, "aporte": 2.016 }
    ]
  }
}
```

## Estructura

```text
src/
├── app.js
├── server.js
├── docs/
│   ├── openapi.js     la especificacion escrita a mano
│   ├── validador.js   valida con los schemas del OpenAPI
│   └── html.js        pagina /docs
├── quimica/formula.js parser de formulas (con parentesis) y masa molar
└── servicios/compuestos.js
```
