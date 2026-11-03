# Ejercicio 24 - testing de servicios

API de formulas quimicas hecha con Node.js y Express. Calcula la masa
molar de una formula como `H2SO4` o `Ca(OH)2` y guarda compuestos. El
foco esta en **probar los services solos**, sin levantar el servidor y
sin depender de la base de datos, usando `node:test` y sus mocks.

## Que hace la API

- `parsearFormula("Al2(SO4)3")` devuelve `{ Al: 2, S: 3, O: 12 }`.
  Soporta parentesis anidados y avisa si la formula esta mal escrita.
- `masaMolar` suma masa atomica por cantidad de cada elemento.
- `registrar` guarda un compuesto si la formula es valida y no existe ya.

## Como se hizo testeable el service

El service **no importa** su repositorio ni la tabla periodica. Los recibe
como parametros (inyeccion de dependencias):

```js
function crearCompuestosService({ repo, tablaPeriodica, reloj = () => new Date() }) { ... }
```

- En la app real (`src/container.js`) se le pasa el repo en memoria, la
  tabla de verdad y el reloj de verdad.
- En los tests se le pasan piezas falsas:
  - **repo falso** con `mock.fn()`, para ver cuantas veces y con que lo
    llamaron, y hacer que falle cuando quiero.
  - **tabla falsa** con numeros redondos (`H: 1, O: 16`), asi las cuentas
    se ven a ojo: H2O = 18.
  - **reloj fijo**, para que la fecha guardada siempre sea la misma y se
    pueda comparar con `deepEqual`.

## Los tests

```text
test/
├── formula.test.js              el parser, funcion pura (tabla de casos)
├── compuestos.service.test.js   el service con repo, tabla y reloj falsos
└── compuestos.repository.test.js el service con el repo y la tabla reales
```

Cosas que se prueban del service:

| Que                                         | Como                                              |
| ------------------------------------------- | ------------------------------------------------- |
| La cuenta de masa molar                     | `assert.equal` con la tabla falsa                 |
| Que busque duplicados con la formula limpia | `repo.buscarPorFormula.mock.calls[0].arguments`   |
| Que guarde los datos exactos con la fecha   | `deepEqual` sobre lo que recibio `repo.guardar`   |
| Que con duplicado de 409 y **no** guarde    | `mockImplementation` + `callCount() === 0`        |
| Que valide antes de tocar el repo           | `callCount() === 0` despues de varios errores     |
| Que si el repo falla el error suba          | el mock tira un error y se usa `assert.rejects`   |

Ademas `formula.test.js` usa una tabla de casos buenos y malos con un
`for`, asi agregar un caso es agregar una linea.

## Requisitos

Node.js 20 o superior. Sin base de datos.

## Instalacion y ejecucion

```bash
npm install
npm test
```

| Script                  | Descripcion                                    |
| ----------------------- | ---------------------------------------------- |
| `npm test`              | Corre todos los tests                          |
| `npm run test:coverage` | Corre los tests y muestra la cobertura         |
| `npm start`             | Levanta el servidor en http://localhost:3024   |
| `npm run dev`           | Servidor con recarga automatica                |

## Resultado

```text
ℹ tests 32
ℹ pass 32
ℹ fail 0
```

Cobertura (`npm run test:coverage`):

```text
file                       | line % | branch % | funcs %
---------------------------------------------------------
 data/tabla-periodica.js   | 100.00 |   100.00 |  100.00
 repositories/compuestos.repository.js | 100.00 | 100.00 | 100.00
 services/compuestos.service.js        | 100.00 | 100.00 | 100.00
 utils/app-error.js        | 100.00 |   100.00 |  100.00
 utils/formula.js          | 100.00 |   100.00 |  100.00
```

La cobertura solo dice que lineas se ejecutaron, no que esten bien. Para
comprobar que los tests sirven, quite a proposito la multiplicacion de los
parentesis en `formula.js` y fallaron 3 tests (`Ca(OH)2`, `Al2(SO4)3` y
`K4(Fe(CN)6)`).

## Estructura

| Carpeta / archivo      | Que hay dentro                                   |
| ---------------------- | ------------------------------------------------ |
| `src/container.js`     | Arma el service con las piezas reales            |
| `src/services/`        | `compuestos.service.js` (recibe sus dependencias) |
| `src/repositories/`    | Repo en memoria con funciones async              |
| `src/utils/formula.js` | Parser de formulas                               |
| `src/data/`            | Tabla periodica (20 elementos)                   |
| `src/controllers/`     | `quimica.controller.js`                          |
| `src/routes/`          | `index.js`                                       |
| `test/`                | Los tests                                        |

## Endpoints

| Metodo | Ruta                             | Descripcion                          |
| ------ | -------------------------------- | ------------------------------------ |
| GET    | `/health`                        | Comprueba que el servidor vive       |
| GET    | `/api/elementos`                 | Elementos que conoce la API          |
| GET    | `/api/masa-molar?formula=H2SO4`  | Calcula la masa molar con detalle    |
| GET    | `/api/compuestos`                | Compuestos guardados                 |
| POST   | `/api/compuestos`                | Guarda `{ nombre, formula }`         |

En la URL los parentesis se pueden mandar tal cual con curl
(`?formula=Ca(OH)2`).

## Ejemplos (PowerShell)

```bash
curl.exe "http://localhost:3024/api/masa-molar?formula=Ca(OH)2"
```

```json
{
  "ok": true,
  "data": {
    "formula": "Ca(OH)2",
    "masaMolar": 74.092,
    "unidad": "g/mol",
    "detalle": [
      { "elemento": "Ca", "cantidad": 1, "masaAtomica": 40.078, "aporte": 40.078 },
      { "elemento": "O", "cantidad": 2, "masaAtomica": 15.999, "aporte": 31.998 },
      { "elemento": "H", "cantidad": 2, "masaAtomica": 1.008, "aporte": 2.016 }
    ]
  }
}
```

```bash
curl.exe -X POST http://localhost:3024/api/compuestos -H "Content-Type: application/json" -d '{\"nombre\":\"Glucosa\",\"formula\":\"C6H12O6\"}'
```

```json
{ "ok": true, "data": { "id": 2, "nombre": "Glucosa", "formula": "C6H12O6", "masaMolar": 180.156, "registrado": "2026-11-03T00:31:51.281Z" } }
```

## Casos de error

| Caso                                  | Status | Mensaje                                  |
| ------------------------------------- | ------ | ---------------------------------------- |
| Sin formula                           | 400    | `La formula es obligatoria`              |
| Formula mal escrita (`h2o`, `H2O)`)   | 400    | `Caracter no valido "h" en h2o`, `Hay un ")" de mas en H2O)` |
| Subindice 0 o parentesis vacio        | 400    | `Un subindice no puede ser 0 en H0`      |
| Elemento que no esta en la tabla      | 422    | `No tengo la masa de: Xy`                |
| Registrar sin nombre                  | 400    | `nombre es obligatorio`                  |
| Formula ya registrada                 | 409    | `H2O ya esta registrado como Agua`       |

## Notas

Los compuestos viven en memoria, al reiniciar el servidor solo queda el
agua de ejemplo.
