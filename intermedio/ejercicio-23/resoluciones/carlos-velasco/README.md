# INTERMEDIO 23 - Testing con node test (runner nativo)

## Objetivo

Crear una API Node.js con Express cuyas reglas de negocio se testeen con el runner nativo `node:test` (sin jest ni mocha): `describe/it`, `assert/strict` y `npm test`.

## Concepto principal

El testing unitario prueba **funciones puras** de la capa de servicio: mismas entradas -> mismas salidas, sin HTTP ni estado externo. El runner nativo de Node.js (20+) ya incluye:

```js
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

describe('evaluarJunta', () => {
  it('acepta una junta de alta calidad...', () => {
    assert.equal(resultado.valida, true);
  });
});
```

Con `script: "test": "node --test src/tests/"` cualquier carpeta `src/tests/` corre automaticamente:

```text
npm test -> suites: 2 | tests: 8 | pass: 8 | fail: 0
```

Las herramientas clave: `assert.equal`, `assert.deepEqual`, `assert.throws` (para los errores esperados, como el `TypeError` de las clasificaciones de no-valor).

## Estructura del proyecto

```text
resoluciones/carlos-velasco/
├── package.json              (script "test" con node --test)
├── README.md
└── src/
    ├── app.js
    ├── errors/
    │   └── app.error.js
    ├── middlewares/
    │   └── error.handler.js
    ├── routes/
    │   └── inspection.routes.js
    ├── controllers/
    │   └── inspection.controller.js
    ├── services/
    │   ├── weld.service.js          (logica pura: la que se testearа)
    │   └── inspection.service.js    (persistencia + HTTP mapping)
    └── tests/
        └── juntas.test.js     (describe + it + assert)
```

## Como ejecutar

```bash
npm install
npm test          # corre los 8 tests del nucleo de negocio
npm run start     # levanta la API HTTP
```

## Tests incluidos (8 pass)

| Suite         | Caso                                                         |
| ------------- | ------------------------------------------------------------ |
| evaluarJunta  | acepta junta de calidad y calcula resistencia               |
| evaluarJunta  | rechaza penetracion < 80%                                    |
| evaluarJunta  | rechaza porosidad alta aunque la penetracion sea buena       |
| evaluarJunta  | valida entradas (tipo invalido, fuera de rango, porosidad)   |
| clasificar    | estructural desde 460 MPa                                    |
| clasificar    | industrial de 350 a 459 MPa                                  |
| clasificar    | ligera bajo 350 MPa                                          |
| clasificar    | TypeError con entrada no numerica/positiva                   |

## API HTTP que usa la logica testeada

```bash
# Registrar una inspeccion (el servicio ya esta probado con node:test)
curl -X POST http://localhost:3000/inspecciones \
  -H "Content-Type: application/json" \
  -d '{"tipo": "butt", "penetracion_pct": 90, "porosidad": "baja"}'

# Caso de error: junta rechazada -> 400 "Junta rechazada: penetracion_insuficiente"
curl -X POST http://localhost:3000/inspecciones \
  -H "Content-Type: application/json" \
  -d '{"tipo": "esquina", "penetracion_pct": 40, "porosidad": "baja"}'

# Consultar listado y detalle
curl http://localhost:3000/inspecciones
curl http://localhost:3000/inspecciones/1
```

## Punto clave

El test corre contra `weld.service.js`, no contra Express: la logica de negocio es facil de corregir cuando no depende de HTTP, y la API solo es una puerta de entrada.
