# Ejercicio 23 - testing con node test

API de un taller de soldadura hecha con Node.js y Express, con tests
escritos con el test runner que ya trae Node (`node:test` y
`node:assert`). No hace falta instalar Jest ni Mocha.

## Que hace la API

- Cotiza trabajos de soldadura segun proceso (MIG, TIG, electrodo),
  material (acero, aluminio, inoxidable) y metros. Si el trabajo es muy
  chico se cobra un minimo de Q150.
- El aluminio no se puede soldar con electrodo (422).
- Guarda trabajos con un estado que solo puede avanzar asi:

```text
pendiente -> en_proceso -> terminado
    |             |
    +-> cancelado <-+
```

## Como estan los tests

```text
test/
├── cotizacion.test.js       unitarios de la funcion cotizar
├── trabajos.service.test.js unitarios del service de trabajos
└── api.test.js              integracion: peticiones HTTP reales
```

`node --test` busca solo los archivos `*.test.js` dentro de `test/`.

**Unitarios** (`cotizacion.test.js`, `trabajos.service.test.js`):

- Llaman las funciones directo, sin servidor.
- `cotizar` es una funcion pura (misma entrada, misma salida), por eso es
  la mas facil de probar.
- Se usa `assert.equal`, `assert.deepEqual`, `assert.match` y
  `assert.throws` para revisar que tire el error con el `statusCode`
  correcto.
- Un `for` genera un test por cada valor malo de `metros` (0, -1, 501,
  "3", null, Infinity).

**Integracion** (`api.test.js`):

- `before` levanta la app con `app.listen(0)`. El puerto 0 hace que el
  sistema de uno libre, asi no choca con otro servidor.
- Las peticiones se hacen con `fetch`, que ya viene en Node 18+. No hace
  falta supertest.
- `after` cierra el servidor.

**Aislamiento:** los datos estan en memoria y los tests los cambian. Por
eso `data/db.js` tiene `resetDb()` y cada archivo lo llama en
`beforeEach`. Asi cada test empieza igual y no depende del orden.

**Por que `app.js` y `server.js` estan separados:** `app.js` arma la app
sin hacer `listen`. El test importa `app.js` y lo levanta en su propio
puerto; `server.js` es solo para `npm start`.

| Carpeta / archivo | Que hay dentro                                    |
| ----------------- | ------------------------------------------------- |
| `src/app.js`      | La app sin `listen`                               |
| `src/server.js`   | El `listen` para `npm start`                      |
| `src/services/`   | `cotizacion.service.js` y `trabajos.service.js`   |
| `src/controllers/`| `taller.controller.js`                            |
| `src/routes/`     | `index.js`                                        |
| `src/data/`       | `db.js` con los trabajos y `resetDb()`            |
| `test/`           | Los tests                                         |

## Requisitos

Node.js 20 o superior (el test runner es estable desde Node 20). Sin
base de datos.

## Instalacion y ejecucion

```bash
npm install
npm test
```

| Script               | Descripcion                                         |
| -------------------- | --------------------------------------------------- |
| `npm test`           | Corre todos los tests una vez                       |
| `npm run test:watch` | Vuelve a correr los tests cada vez que se guarda    |
| `npm start`          | Levanta el servidor en http://localhost:3023        |
| `npm run dev`        | Servidor con recarga automatica                     |

Correr un solo archivo de tests:

```bash
node --test test/cotizacion.test.js
```

## Resultado de `npm test`

```text
▶ API del taller
  ✔ GET /health responde ok
  ✔ POST /api/cotizaciones calcula el costo
  ✔ POST /api/cotizaciones con aluminio y electrodo da 422
  ✔ POST /api/trabajos crea y despues se puede leer
  ...
▶ cotizar
  ✔ calcula precio por metro por metros
  ✔ cobra el minimo si el trabajo es muy chico
  ✔ no deja soldar aluminio con electrodo (422)
  ✔ no confunde propiedades del prototipo con procesos
  ...
▶ trabajos.service
  ✔ crea un trabajo pendiente con el costo calculado
  ✔ despues del reset el trabajo creado ya no esta
  ✔ no deja saltar de pendiente a terminado (409)
  ...
ℹ tests 33
ℹ pass 33
ℹ fail 0
```

Para comprobar que los tests sirven, cambie a proposito las transiciones
para dejar pasar de `pendiente` a `terminado` y fallo
`no deja saltar de pendiente a terminado (409)`.

## Endpoints

| Metodo | Ruta                       | Descripcion                                   |
| ------ | -------------------------- | --------------------------------------------- |
| GET    | `/health`                  | Comprueba que el servidor vive                |
| GET    | `/api/precios`             | Tabla de precio por metro                     |
| POST   | `/api/cotizaciones`        | Calcula el costo sin guardar nada             |
| GET    | `/api/trabajos`            | Lista trabajos, acepta `?estado=`             |
| POST   | `/api/trabajos`            | Crea un trabajo (queda `pendiente`)           |
| GET    | `/api/trabajos/:id`        | Un trabajo                                    |
| PATCH  | `/api/trabajos/:id/estado` | Cambia el estado si la transicion es valida   |

Bodies:

- Cotizacion: `proceso`, `material`, `metros`.
- Trabajo: lo mismo mas `cliente`.
- Estado: `{ "estado": "en_proceso" }`.

## Ejemplos (PowerShell)

```bash
curl.exe -X POST http://localhost:3023/api/cotizaciones -H "Content-Type: application/json" -d '{\"proceso\":\"TIG\",\"material\":\"aluminio\",\"metros\":2}'
```

```json
{ "ok": true, "data": { "proceso": "TIG", "material": "aluminio", "metros": 2, "precioMetro": 120, "costo": 240, "seAplicoMinimo": false } }
```

```bash
curl.exe -X PATCH http://localhost:3023/api/trabajos/2/estado -H "Content-Type: application/json" -d '{\"estado\":\"en_proceso\"}'
```

## Casos de error

| Caso                                    | Status | Mensaje                                         |
| --------------------------------------- | ------ | ----------------------------------------------- |
| Proceso, material o metros invalidos    | 400    | `Datos invalidos` + lista `errors`              |
| Aluminio con electrodo                  | 422    | `El aluminio no se puede soldar con electrodo, usa MIG o TIG` |
| Transicion de estado no permitida       | 409    | `No se puede pasar de terminado a cancelado`    |
| Trabajo que no existe                   | 404    | `No existe el trabajo con id 99`                |
| JSON mal escrito                        | 400    | `El body no es un JSON valido`                  |

## Notas

Los datos viven en memoria, al reiniciar el servidor vuelven a los de
`src/data/db.js`.
