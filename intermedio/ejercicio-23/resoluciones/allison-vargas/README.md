# Intermedio 23 - testing con node test

## Que hace

API de soldadura que calcula el aporte de calor de un procedimiento y registra procedimientos (WPS) validados. El foco del ejercicio son las pruebas: usan el ejecutor nativo de Node (`node:test`) y `node:assert`, sin instalar nada extra.

Formula del aporte de calor, con la velocidad en mm/min:

```
calor (kJ/mm) = (voltaje x amperaje x 60) / (1000 x velocidad) x eficiencia
```

| Proceso | Clave | Eficiencia | Voltaje | Amperaje |
|---|---|---|---|---|
| MIG/MAG | mig | 0.8 | 14 a 40 V | 60 a 500 A |
| TIG | tig | 0.6 | 8 a 20 V | 10 a 300 A |
| Electrodo revestido | electrodo | 0.8 | 18 a 40 V | 40 a 400 A |
| Arco sumergido | arcosumergido | 1.0 | 24 a 40 V | 300 a 1000 A |

| Material | Clave | Limite de calor |
|---|---|---|
| Acero al carbono | acero_carbono | 3.0 kJ/mm |
| Acero inoxidable | acero_inoxidable | 1.5 kJ/mm |
| Aluminio | aluminio | 2.0 kJ/mm |

Clasificacion del calor: bajo hasta 0.8 kJ/mm, medio hasta 1.8 y alto por encima.

## Estructura

```
src/
  app.js
  server.js
  constants/soldadura.js
  controllers/
  data/procedimientos.json
  middlewares/
  repositories/
  routes/
  services/
  utils/
  validators/
test/
  calculos.test.js
  validadores.test.js
  procedimientos.service.test.js
  api.test.js
```

## Como ejecutar

```
npm install
npm run dev
```

Puerto 3000 por defecto (`PORT`).

## Como correr las pruebas

```
npm test
```

Otros scripts:

- `npm run test:watch`: vuelve a correr las pruebas al guardar un archivo.
- `npm run test:cobertura`: muestra el porcentaje de codigo cubierto.
- `node --test --test-reporter=spec`: salida legible, con un check por prueba.
- `node --test test/api.test.js`: corre un solo archivo.

Que cubre cada archivo:

| Archivo | Tipo | Que prueba |
|---|---|---|
| `calculos.test.js` | unitaria | Formula, clasificacion, rangos por proceso y errores del calculo |
| `validadores.test.js` | unitaria | Esquemas del body (faltantes, tipos, enums, campos no permitidos) y validacion de ids |
| `procedimientos.service.test.js` | unitaria con mocks | Reglas del servicio, verificando con `t.mock.method` que no se guarda nada cuando falla una validacion |
| `api.test.js` | integracion | Levanta la app en un puerto libre y prueba los endpoints reales con `fetch`: codigos HTTP, headers, paginacion y errores |

Las pruebas de integracion corren dentro de un solo proceso y comparten los datos en memoria, por eso estan escritas en orden y comparan cantidades antes y despues.

## Respuesta esperada

`GET /intermedio/ejercicio-23`

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "testing con node test"
}
```

## Endpoints

Base: `/intermedio/ejercicio-23`

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/calculos/catalogo` | Procesos y materiales disponibles |
| POST | `/calculos/calor` | Calcula el aporte de calor sin guardar nada |
| GET | `/procedimientos` | Lista procedimientos |
| GET | `/procedimientos/:id` | Detalle de un procedimiento |
| POST | `/procedimientos` | Crea un procedimiento en borrador |
| POST | `/procedimientos/:id/aprobar` | Cambia un borrador a aprobado |

## Campos del body

`POST /calculos/calor` (todos obligatorios):

| Campo | Tipo | Regla |
|---|---|---|
| proceso | texto | mig, tig, electrodo o arcosumergido |
| material | texto | acero_carbono, acero_inoxidable o aluminio |
| voltaje | entero | 1 a 100 y dentro del rango del proceso |
| amperaje | entero | 1 a 1500 y dentro del rango del proceso |
| velocidadMmMin | entero | 50 a 2000 |

`POST /procedimientos`: los mismos campos mas `espesorMm` (entero, 1 a 100) y `soldador` (texto, 2 a 60 caracteres). Si el calor supera el limite del material responde 422.

## Parametros de consulta

`/procedimientos`: `proceso`, `material`, `estado` (borrador o aprobado), `orden` (id, calor, reciente), `pagina`, `limite`.

## Ejemplos

curl:

```
curl http://localhost:3000/intermedio/ejercicio-23/calculos/catalogo
curl -X POST http://localhost:3000/intermedio/ejercicio-23/calculos/calor -H "Content-Type: application/json" -d "{\"proceso\":\"mig\",\"material\":\"aluminio\",\"voltaje\":24,\"amperaje\":200,\"velocidadMmMin\":300}"
curl -X POST http://localhost:3000/intermedio/ejercicio-23/procedimientos -H "Content-Type: application/json" -d "{\"proceso\":\"mig\",\"material\":\"acero_carbono\",\"voltaje\":24,\"amperaje\":200,\"velocidadMmMin\":300,\"espesorMm\":10,\"soldador\":\"Ana Ruiz\"}"
curl -X POST http://localhost:3000/intermedio/ejercicio-23/procedimientos/2/aprobar
curl "http://localhost:3000/intermedio/ejercicio-23/procedimientos?orden=calor&limite=2"
```

PowerShell:

```
$body = @{ proceso = "mig"; material = "aluminio"; voltaje = 24; amperaje = 200; velocidadMmMin = 300 } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/intermedio/ejercicio-23/calculos/calor -ContentType "application/json" -Body $body
Invoke-RestMethod http://localhost:3000/intermedio/ejercicio-23/procedimientos
Invoke-RestMethod -Method Post http://localhost:3000/intermedio/ejercicio-23/procedimientos/2/aprobar
```

## Formato de respuesta

Exito: `{ "ok": true, "data": ... }`. Los listados agregan `paginacion` y el header `X-Total-Count`. Al crear responde 201 con `Location`.

Resultado de `/calculos/calor`:

```json
{
  "ok": true,
  "data": {
    "proceso": "mig",
    "material": "aluminio",
    "eficiencia": 0.8,
    "calorKjMm": 0.768,
    "clasificacion": "bajo",
    "limiteKjMm": 2,
    "dentroDeLimite": true
  }
}
```

## Errores

Formato: `{ "ok": false, "message": "...", "codigo": "...", "errores": [...] }`

| Status | Codigo | Cuando |
|---|---|---|
| 400 | VALIDACION, CONSULTA_INVALIDA, JSON_INVALIDO | Body o parametros invalidos |
| 400 | RANGO_DE_PROCESO | En `/calculos/calor`, voltaje o amperaje fuera del rango del proceso |
| 404 | PROCEDIMIENTO_NO_ENCONTRADO, RUTA_NO_ENCONTRADA | No existe el recurso |
| 405 | METODO_NO_PERMITIDO | Metodo no soportado en la ruta |
| 409 | PROCEDIMIENTO_YA_APROBADO | El procedimiento ya estaba aprobado |
| 422 | RANGO_DE_PROCESO | Al crear un procedimiento, voltaje o amperaje fuera del rango del proceso |
| 422 | CALOR_EXCEDIDO | El calor supera el limite del material |
