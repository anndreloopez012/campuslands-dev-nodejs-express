# Ejercicio 29 - refactor de API

API de un torneo de futbol y futbol sala hecha con Node.js y Express.
La entrega tiene **dos versiones de la misma API**:

| Carpeta  | Que es                                                      |
| -------- | ----------------------------------------------------------- |
| `antes/` | La API como estaba: un solo archivo de 264 lineas           |
| `src/`   | La API despues del refactor: separada en capas              |

Un refactor cambia **como esta escrito** el codigo, no **lo que hace**.
Para comprobarlo, los mismos tests corren contra las dos versiones.

## Como se aseguro que no cambiara nada

1. Antes de tocar nada escribi tests de contrato (`test/contrato.test.js`)
   contra la version de `antes/`: status, headers y el body completo,
   incluidos los mensajes de error y el orden de la lista `errors`.
2. Escribi la version nueva en `src/`.
3. El archivo de tests recorre las dos versiones con un `for`:

```js
const versiones = [
    ["antes", crearAppAntes],
    ["despues", crearAppDespues]
];

for (const [version, crearApp] of versiones) {
    describe(`contrato (${version})`, () => { ... });
}
```

4. Si un test pasa en `antes` y falla en `despues`, el refactor cambio
   algo que se ve desde afuera.

### Lo que encontraron los tests

En `antes/` el PUT revisaba la modalidad con `b.modalidad != undefined`.
Con `!=` (comparacion suelta) `null` cuenta como `undefined`, entonces
`"modalidad": null` se ignoraba. En la version nueva yo puse
`!== undefined` y con `null` respondia 400.

El test `PUT con modalidad null se ignora` paso en `antes` y fallo en
`despues`. Lo corregi para que se comporte igual que antes y deje un
comentario en `validators/equipo.validator.js`.

Tambien tenia mal un test mio de la tabla (esperaba que el equipo nuevo
quedara ultimo, pero con diferencia de gol 0 queda arriba de uno con -2).
Ese fallaba en las dos versiones, asi que el error era del test y no del
codigo.

## Que se refactorizo

| Problema en `antes/app.js`                                         | Como quedo en `src/`                                         |
| ------------------------------------------------------------------- | ------------------------------------------------------------ |
| Todo en un archivo: rutas, validacion, datos y calculos             | Capas: `routes`, `controllers`, `services`, `validators`, `repositories` |
| El bloque que parsea el id estaba copiado 4 veces                   | `parsearId()` en `utils/validar.js`                          |
| Un `for` para buscar por id en cada ruta                            | `crearColeccion()` con `buscar`, `listar`, `existe`, `agregar`, `quitar` |
| La validacion de nombre y ciudad estaba en POST y en PUT            | `validators/equipo.validator.js`                             |
| La regla de "nombre repetido" casi igual en POST y PUT              | `exigirNombreLibre()` en el service                          |
| Cada ruta armaba su `res.status(...).json({ ok: false })`           | Los services tiran `AppError` y responde `middlewares/errores.js` |
| Numeros y textos sueltos: `3`, `1`, `99`, `"futbol"`, `"futsal"`    | `constants.js` (`PUNTOS`, `LIMITES`, `MODALIDADES`)          |
| La tabla era un bloque de 50 lineas dentro de la ruta, no se podia probar sola | `calcularTabla()` es una funcion pura con sus propios tests |
| Logica de local y visitante repetida al sumar un partido            | `sumarResultado(fila, aFavor, enContra)` se llama dos veces |
| `var`, `==`, nombres como `b`, `l`, `v`, `m`                        | `const`, `===` y nombres que dicen lo que son               |

Lo que **no** cambio: las rutas, los status, el formato de las respuestas,
los mensajes, el orden de los errores y los datos iniciales.

Las dos versiones exportan `crearApp()`, que da una app nueva con sus
propios datos. Asi cada test empieza limpio.

## Requisitos

Node.js 20 o superior. Sin base de datos.

## Instalacion y ejecucion

```bash
npm install
npm test
```

| Script                | Descripcion                                         |
| --------------------- | --------------------------------------------------- |
| `npm start`           | Version refactorizada en http://localhost:3029      |
| `npm run start:antes` | Version de antes en el mismo puerto, para comparar  |
| `npm run dev`         | Version refactorizada con recarga automatica        |
| `npm test`            | Tests de contrato contra las dos versiones + tabla  |

## Resultado de `npm test`

```text
▶ contrato (antes)
  ...
✔ contrato (antes)
▶ contrato (despues)
  ...
✔ contrato (despues)
▶ calcularTabla
  ...
ℹ tests 81
ℹ pass 81
ℹ fail 0
```

Tambien levante las dos versiones a la vez y `GET /api/tabla?modalidad=futbol`
respondio exactamente lo mismo en las dos.

## Estructura de `src/`

| Carpeta / archivo                  | Que hay dentro                                  |
| ---------------------------------- | ----------------------------------------------- |
| `app.js`                           | Arma la app: datos -> services -> controllers -> rutas |
| `constants.js`                     | Modalidades, puntos y limites                   |
| `data/iniciales.js`                | Equipos y partidos con los que arranca          |
| `repositories/coleccion.js`        | Lista en memoria reutilizable                   |
| `validators/`                      | Reglas del body de equipo y partido             |
| `services/equipos.service.js`      | Crear, editar, borrar, nombre repetido          |
| `services/partidos.service.js`     | Registrar resultado y filtrar por equipo        |
| `services/tabla.service.js`        | `calcularTabla()` (pura)                        |
| `controllers/`                     | Leen la peticion y responden                    |
| `routes/index.js`                  | Solo el mapa de rutas                           |
| `middlewares/errores.js`           | 404 y manejo de errores en un solo lugar        |
| `utils/`                           | `AppError`, `parsearId` y helpers de validacion |

El total de lineas es parecido (264 antes y ~410 despues), pero ahora
cada archivo hace una sola cosa, ninguno pasa de 65 lineas y para cambiar
una regla (por ejemplo los puntos por empate) se toca un solo lugar.

## Endpoints (iguales en las dos versiones)

| Metodo | Ruta                          | Descripcion                                |
| ------ | ----------------------------- | ------------------------------------------ |
| GET    | `/health`                     | El servidor vive                           |
| GET    | `/api/equipos`                | Lista, acepta `?modalidad=futbol\|futsal`  |
| POST   | `/api/equipos`                | Crea `{ nombre, modalidad, ciudad }`       |
| GET    | `/api/equipos/:id`            | Un equipo                                  |
| PUT    | `/api/equipos/:id`            | Cambia `{ nombre, ciudad }`                |
| DELETE | `/api/equipos/:id`            | Borra si no jugo partidos                  |
| GET    | `/api/partidos`               | Lista, acepta `?equipoId=`                 |
| POST   | `/api/partidos`               | `{ localId, visitanteId, golesLocal, golesVisitante }` |
| GET    | `/api/tabla?modalidad=futbol` | Tabla: 3 pts victoria, 1 empate            |

La tabla se ordena por puntos, diferencia de gol, goles a favor y nombre.

## Ejemplo (PowerShell)

```bash
curl.exe "http://localhost:3029/api/tabla?modalidad=futbol"
```

```json
{
  "ok": true,
  "modalidad": "futbol",
  "data": [
    { "equipoId": 3, "nombre": "Xelaju", "pj": 1, "pg": 1, "pe": 0, "pp": 0, "gf": 1, "gc": 0, "dg": 1, "pts": 3 },
    { "equipoId": 2, "nombre": "Municipal", "pj": 1, "pg": 0, "pe": 1, "pp": 0, "gf": 2, "gc": 2, "dg": 0, "pts": 1 },
    { "equipoId": 1, "nombre": "Comunicaciones", "pj": 2, "pg": 0, "pe": 1, "pp": 1, "gf": 2, "gc": 3, "dg": -1, "pts": 1 }
  ]
}
```

## Casos de error

| Caso                                     | Status | Mensaje                                                  |
| ---------------------------------------- | ------ | -------------------------------------------------------- |
| Modalidad que no existe                  | 400    | `modalidad debe ser futbol o futsal`                     |
| Body de equipo o partido mal             | 400    | `Datos invalidos` + lista `errors`                       |
| Cambiar la modalidad en un PUT           | 400    | `la modalidad no se puede cambiar`                       |
| Equipo contra si mismo                   | 400    | `Un equipo no puede jugar contra si mismo`               |
| Futbol contra futsal                     | 400    | `Un equipo de futbol no puede jugar contra uno de futsal` |
| Id que no es entero positivo             | 400    | `El id debe ser un numero entero positivo`               |
| Equipo que no existe                     | 404    | `No existe el equipo con id 99`                          |
| Nombre repetido en la misma modalidad    | 409    | `Ya existe municipal en futbol`                          |
| Borrar un equipo que ya jugo             | 409    | `No se puede borrar un equipo que ya jugo partidos`      |

## Notas

Los datos viven en memoria, al reiniciar el servidor vuelven a los de
`src/data/iniciales.js`.
