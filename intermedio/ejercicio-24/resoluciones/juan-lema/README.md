# Ejercicio 24 - testing de servicios (Juan Lema)

## Que hace

Tematica formulas quimicas. Toda la logica vive en la capa de **servicios** y es lo que se prueba, sin levantar HTTP ni mockear nada:

- `services/chemistry.service.js` (puro): analiza formulas (`Ca(OH)2`, `K4[Fe(CN)6]`, hidratos `CuSO4·5H2O` o `CuSO4.5H2O`), las escribe en notacion de Hill, calcula masa molar y porcentaje en masa, y comprueba si una ecuacion esta balanceada (`2H2 + O2 -> 2H2O`).
- `services/compounds.service.js` (con estado): catalogo de compuestos con nombres unicos (sin importar mayusculas, acentos ni espacios), filtro por elemento y consulta por id.
- `errors.js`: los servicios lanzan `DomainError` con un **codigo** (`INVALID_FORMULA`, `UNKNOWN_ELEMENT`, `NOT_FOUND`, `DUPLICATE_NAME`...) y no saben nada de HTTP. `middlewares/error-handler.js` traduce cada codigo a su estado (400, 404, 409) en un unico lugar.

Las masas atomicas son una tabla abreviada de 36 elementos y la masa molar se redondea a 3 decimales. No se modelan cargas ni iones; formulas iguales con nombres distintos se permiten porque los isomeros comparten formula.

### Disenado para probar servicios

- **Fabrica con estado propio**: `createCompoundsService({ seed })` crea una instancia nueva. Cada prueba parte de un servicio limpio (`beforeEach`), no hay estado global compartido ni orden que respetar. La app usa una instancia ya sembrada.
- **Servicios devuelven copias** (`structuredClone`): quien los llama no puede alterar el estado interno.
- **Errores tipados**: las pruebas comprueban `error.code` y no el texto ni un estado HTTP.
- **Entrada hostil controlada**: cualquier entrada invalida (saltos de linea, `null`, claves como `constructor` o `__proto__`, ids como `1e3`) termina en un `DomainError`, nunca en un `TypeError`.

### Que se prueba (241 pruebas)

- `test/chemistry.service.test.js`: tablas de formulas validas (parentesis, corchetes anidados, hidratos) e invalidas (34 casos con su codigo), masas molares calculadas a mano, formula de Hill, ecuaciones balanceadas y desbalanceadas con la diferencia exacta por elemento, y propiedades: multiplicar un grupo equivale a repetir sus atomos, re-parsear la formula de Hill da la misma composicion, los porcentajes suman 100, escalar una ecuacion balanceada la deja balanceada, e intercambiar sus lados invierte la diferencia.
- `test/compounds.service.test.js`: ids consecutivos, validacion, un registro fallido no deja rastro ni consume ids, duplicados por nombre, filtro por simbolo exacto (`C` no coincide con `Cl` ni `Cu`), copias defensivas e independencia entre instancias.
- `test/error-handler.test.js`: cada codigo se traduce al estado esperado, un error inesperado responde `500` generico sin filtrar detalles, y una **prueba de contrato** que lee el codigo fuente: todo codigo que lanza un servicio debe tener estado asignado y no debe haber traducciones sin uso.

Ademas se verifico que la suite **detecta errores reales**: se rompio el codigo a proposito de 40 formas (cambiar una masa atomica, aceptar subindices con cero, ignorar el multiplicador de un grupo, permitir cerrar con el corchete equivocado, devolver el estado interno, cambiar un 404 por 400, filtrar el mensaje de un 500...) y las 40 hicieron fallar al menos una prueba. En el camino aparecieron y se corrigieron tres fallos reales: una entrada con salto de linea provocaba un `TypeError` en dos expresiones regulares, y dos huecos en las propias pruebas (el mapa de estados se comprobaba contra si mismo y `register` no verificaba que devolviera una copia).

Cobertura de los archivos que cargan las pruebas (servicios, errores y traductor): 100 % de lineas, ramas y funciones. Rutas, controladores y `app.js` no forman parte de esta suite; se comprobaron a mano contra el servidor real.

## Como ejecutar

```bash
npm install
npm start
```

## Como ejecutar las pruebas

```bash
npm test
npm run test:coverage
node --test test/chemistry.service.test.js
node --test --test-name-pattern="Hill"
```

Verificado con Node 24; requiere Node 20 o superior.

## Como probar la API

```bash
curl http://localhost:4024/compounds
curl "http://localhost:4024/compounds?element=Cu"
curl http://localhost:4024/compounds/1
curl -X POST http://localhost:4024/compounds -H "Content-Type: application/json" -d "{\"name\":\"Etanol\",\"formula\":\"C2H5OH\"}"
curl -X POST http://localhost:4024/analysis/formula -H "Content-Type: application/json" -d "{\"formula\":\"Ca(OH)2\"}"
curl -X POST http://localhost:4024/analysis/reaction -H "Content-Type: application/json" -d "{\"equation\":\"CH4 + 2O2 -> CO2 + 2H2O\"}"
```

## Como probar los casos de error

```bash
curl http://localhost:4024/compounds/abc
curl http://localhost:4024/compounds/99
curl "http://localhost:4024/compounds?element=Xx"
curl -X POST http://localhost:4024/compounds -H "Content-Type: application/json" -d "{\"name\":\"agua\",\"formula\":\"H2O\"}"
curl -X POST http://localhost:4024/analysis/formula -H "Content-Type: application/json" -d "{\"formula\":\"(H2O\"}"
curl -X POST http://localhost:4024/analysis/reaction -H "Content-Type: application/json" -d "{\"equation\":\"H2 + O2\"}"
```

## Estructura

```text
src/
├── app.js
├── server.js
├── errors.js
├── routes/
│   ├── compounds.routes.js
│   └── analysis.routes.js
├── controllers/
│   ├── compounds.controller.js
│   └── analysis.controller.js
├── services/
│   ├── chemistry.service.js
│   └── compounds.service.js
└── middlewares/error-handler.js
test/
├── chemistry.service.test.js
├── compounds.service.test.js
└── error-handler.test.js
```
