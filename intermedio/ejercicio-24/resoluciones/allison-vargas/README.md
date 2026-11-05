# Intermedio 24 - testing de servicios

## Que hace

API de formulas quimicas: analiza formulas (masa molar y composicion porcentual), convierte entre gramos, moles y moleculas, verifica si una ecuacion esta balanceada y mantiene un catalogo de compuestos. El foco del ejercicio es como probar la capa de servicios de forma aislada.

Para poder probarlos, los servicios se crean con fabricas que reciben sus dependencias:

```js
crearFormulasService({ elementos })
crearCompuestosService({ repositorio, formulas, reloj })
```

Asi, en las pruebas se puede inyectar una tabla de elementos con masas faciles, un repositorio falso, un servicio de formulas simulado y un reloj fijo. En produccion, `src/services/index.js` arma las instancias reales y los controladores las usan desde ahi.

Formulas que entiende el analizador: simples (`H2O`), parentesis y corchetes anidados (`Al2(SO4)3`, `K4[Fe(CN)6]`) e hidratos con punto (`CuSO4.5H2O`). Los errores indican la posicion del problema en el texto.

## Estructura

```
src/
  app.js
  server.js
  constants/quimica.js
  controllers/
  data/compuestos.json
  middlewares/
  repositories/
  routes/
  services/
    formulas.service.js
    compuestos.service.js
    index.js
  utils/
  validators/
test/
  api.test.js
  services/
    formulas.service.test.js
    compuestos.service.test.js
    servicios-integrados.test.js
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

Otros scripts: `npm run test:watch` (repite al guardar) y `npm run test:cobertura` (porcentaje de codigo cubierto). Para ver un check por prueba: `node --test --test-reporter=spec`. Para un solo archivo: `node --test test/services/formulas.service.test.js`.

| Archivo | Que prueba | Tecnica |
|---|---|---|
| `formulas.service.test.js` | Analizador, masa molar, composicion, conversiones y balance de ecuaciones | Tabla de elementos inyectada con masas sencillas (H=1, O=16), casos validos e invalidos en tablas de datos |
| `compuestos.service.test.js` | Alta, duplicados, listado con filtros, orden y paginacion, baja | Repositorio falso, servicio de formulas simulado con `mock.fn`, reloj fijo y verificacion de que no se guarda nada cuando algo falla |
| `servicios-integrados.test.js` | Los dos servicios reales juntos | Repositorio en memoria vacio por cada prueba |
| `api.test.js` | Endpoints reales | App levantada en un puerto libre y consultada con `fetch` |

## Respuesta esperada

`GET /intermedio/ejercicio-24`

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "testing de servicios"
}
```

## Endpoints

Base: `/intermedio/ejercicio-24`

| Metodo | Ruta | Descripcion |
|---|---|---|
| POST | `/formulas/analizar` | Masa molar y composicion de una formula |
| POST | `/formulas/conversion` | Convierte gramos a moles y moleculas, o moles a gramos |
| POST | `/formulas/ecuaciones` | Verifica si una ecuacion esta balanceada |
| GET | `/compuestos` | Lista compuestos |
| GET | `/compuestos/:id` | Detalle de un compuesto |
| POST | `/compuestos` | Registra un compuesto (calcula su masa molar) |
| DELETE | `/compuestos/:id` | Elimina un compuesto |

## Campos del body

- `/formulas/analizar`: `formula` (texto, 1 a 80 caracteres).
- `/formulas/conversion`: `formula` y exactamente uno de `gramos` o `moles` (numeros mayores que 0).
- `/formulas/ecuaciones`: `ecuacion` (texto), por ejemplo `2H2 + O2 -> 2H2O`. Acepta `->` o `=` y coeficientes enteros.
- `POST /compuestos`: `nombre` (3 a 60 caracteres), `formula` y `categoria` (acido, base, sal, oxido, organico u otro).

La tabla incluye 36 elementos comunes, desde el hidrogeno hasta el plomo.

## Parametros de consulta

`/compuestos`: `categoria`, `buscar` (texto en nombre o formula), `orden` (id, nombre, masa), `pagina`, `limite`.

## Ejemplos

curl:

```
curl -X POST http://localhost:3000/intermedio/ejercicio-24/formulas/analizar -H "Content-Type: application/json" -d "{\"formula\":\"Ca(OH)2\"}"
curl -X POST http://localhost:3000/intermedio/ejercicio-24/formulas/conversion -H "Content-Type: application/json" -d "{\"formula\":\"H2O\",\"gramos\":36.03}"
curl -X POST http://localhost:3000/intermedio/ejercicio-24/formulas/ecuaciones -H "Content-Type: application/json" -d "{\"ecuacion\":\"H2 + O2 -> H2O\"}"
curl -X POST http://localhost:3000/intermedio/ejercicio-24/compuestos -H "Content-Type: application/json" -d "{\"nombre\":\"Metano\",\"formula\":\"CH4\",\"categoria\":\"organico\"}"
curl "http://localhost:3000/intermedio/ejercicio-24/compuestos?buscar=sodio&orden=masa"
```

PowerShell:

```
$body = @{ formula = "Al2(SO4)3" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/intermedio/ejercicio-24/formulas/analizar -ContentType "application/json" -Body $body
$ecuacion = @{ ecuacion = "2H2 + O2 -> 2H2O" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/intermedio/ejercicio-24/formulas/ecuaciones -ContentType "application/json" -Body $ecuacion
Invoke-RestMethod "http://localhost:3000/intermedio/ejercicio-24/compuestos?categoria=sal"
```

## Formato de respuesta

Exito: `{ "ok": true, "data": ... }`. Los listados agregan `paginacion` y el header `X-Total-Count`. Al crear un compuesto responde 201 con `Location`.

Ejemplo de `/formulas/analizar` con `H2O`:

```json
{
  "ok": true,
  "data": {
    "formula": "H2O",
    "masaMolar": 18.015,
    "atomosTotales": 3,
    "composicion": [
      { "simbolo": "H", "nombre": "Hidrogeno", "atomos": 2, "masa": 2.016, "porcentaje": 11.19 },
      { "simbolo": "O", "nombre": "Oxigeno", "atomos": 1, "masa": 15.999, "porcentaje": 88.81 }
    ]
  }
}
```

## Errores

Formato: `{ "ok": false, "message": "...", "codigo": "...", "errores": [...] }`

| Status | Codigo | Cuando |
|---|---|---|
| 400 | VALIDACION, CONSULTA_INVALIDA, JSON_INVALIDO | Body o parametros invalidos, o gramos y moles juntos |
| 400 | FORMULA_INVALIDA | Sintaxis incorrecta; `errores[0].posicion` indica donde |
| 400 | ELEMENTO_DESCONOCIDO | El simbolo no esta en la tabla |
| 404 | COMPUESTO_NO_ENCONTRADO, RUTA_NO_ENCONTRADA | No existe el recurso |
| 405 | METODO_NO_PERMITIDO | Metodo no soportado en la ruta |
| 409 | FORMULA_DUPLICADA, NOMBRE_DUPLICADO | Ya existe un compuesto con esa formula o nombre |
