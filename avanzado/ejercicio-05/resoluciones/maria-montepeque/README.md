# Avanzado 05 - transacciones simuladas

API de fichajes de futbol y futbol sala hecha con Node.js y Express. Un
fichaje cambia varias cosas a la vez y **no puede quedar a medias**. Como
no hay base de datos, las transacciones se simulan en memoria.

## El problema

Un fichaje son 5 pasos:

1. Cobrarle al club que compra.
2. Pagarle al club que vende.
3. Mover al jugador (su `clubId` y las listas `jugadorIds` de los dos clubes).
4. Registrar el fichaje.
5. Anotar los dos movimientos de caja.

Si el servidor falla en el paso 3, sin transaccion quedaria el dinero
cobrado y pagado pero el jugador en su club viejo. Ademas, si dos fichajes
llegan al mismo tiempo, los dos pueden ver que "hay presupuesto" y
gastarlo dos veces.

## Como se resolvio

`src/datos/almacen.js` imita lo que hace una base de datos:

```js
await almacen.transaccion(async (db) => {
    destino.presupuesto -= monto;   // todo esto se hace sobre un borrador
    origen.presupuesto += monto;
    ...
});
```

- **Atomicidad (todo o nada):** la transaccion trabaja sobre un
  **borrador** (una copia de todo el estado). Si termina bien, el borrador
  pasa a ser el estado real (*commit*). Si tira un error en cualquier
  punto, el borrador se descarta (*rollback*) y no queda ningun cambio.
- **Aislamiento:** un **candado** hace que las transacciones vayan de una
  en una. La segunda espera a que termine la primera y ya ve sus cambios.
- **Nada se toca sin transaccion:** `leer()` devuelve una copia, asi
  nadie puede cambiar el estado por fuera.
- Mientras la transaccion no termina, lo que se lee afuera es el estado
  anterior.

En `fichajes.servicio.js` cada paso tiene un `await` (como si fuera una
base de datos o una API) para que el problema de la concurrencia sea real
y no solo teorico.

### Simular fallas

Para probar el rollback, el header `X-Simular-Fallo` hace que el fichaje
falle **despues** del paso que se indique:

```text
X-Simular-Fallo: mover-jugador
```

Pasos: `cobrar-comprador`, `pagar-vendedor`, `mover-jugador`,
`registrar-fichaje`, `anotar-movimientos`. El header se ignora con
`NODE_ENV=production`.

### Revisar que todo este sano

`GET /api/consistencia` revisa las reglas que siempre se tienen que
cumplir (invariantes):

- El dinero total de todos los clubes es el mismo que al inicio (solo
  pasa de un club a otro).
- Ningun club tiene presupuesto negativo.
- Cada jugador esta en un solo club y coincide con su `clubId`.
- Cada fichaje tiene exactamente 2 movimientos de caja.

Si una transaccion se aplicara a medias, algo de esto fallaria.

### Que pasa sin candado

`crearApp({ conCandado: false })` apaga el candado y hay un test que lo
muestra: Municipal (Q1,500,000) compra dos jugadores de Q1,000,000 al
mismo tiempo.

| Con candado                                    | Sin candado                                       |
| ---------------------------------------------- | ------------------------------------------------- |
| Uno responde 201 y el otro 422 `PRESUPUESTO_INSUFICIENTE` | Los dos responden 201                 |
| Queda 1 fichaje y Q500,000                     | Queda 1 fichaje: el segundo commit **piso** al primero (*lost update*) |

Sin candado el cliente del primer fichaje recibio un 201 de algo que se
perdio.

### Limitaciones

- Copiar todo el estado en cada transaccion esta bien para pocos datos;
  una base de datos real solo bloquea las filas que se tocan.
- El candado sirve dentro de **un** proceso. Con varias instancias del
  servidor hace falta que la base de datos maneje las transacciones.
- Otra forma de hacerlo es con un numero de version (concurrencia
  optimista): si al guardar la version cambio, se reintenta. Aqui use el
  candado porque es mas simple de entender.

## Requisitos

Node.js 20 o superior. Sin base de datos.

## Instalacion y ejecucion

```bash
npm install
npm start
```

| Script        | Descripcion                          |
| ------------- | ------------------------------------ |
| `npm start`   | Servidor en http://localhost:4005    |
| `npm run dev` | Servidor con recarga automatica      |
| `npm test`    | Tests del almacen y de los fichajes  |

## Endpoints

| Metodo | Ruta                | Descripcion                                    |
| ------ | ------------------- | ---------------------------------------------- |
| GET    | `/health`           | El servidor vive                               |
| GET    | `/api/clubes`       | Clubes con presupuesto y cantidad de jugadores |
| GET    | `/api/clubes/:id`   | Club con su plantilla                          |
| POST   | `/api/fichajes`     | `{ jugadorId, clubDestinoId, monto }`          |
| GET    | `/api/fichajes`     | Fichajes hechos                                |
| GET    | `/api/movimientos`  | Movimientos de caja                            |
| GET    | `/api/consistencia` | Revisa las invariantes                         |

Clubes: 1 Comunicaciones, 2 Municipal, 3 Xelaju (plantilla llena, maximo
3), 4 Glucosoral y 5 Bufalos (futsal).

## Ejemplos (PowerShell)

Un fichaje que falla a la mitad:

```bash
curl.exe -X POST http://localhost:4005/api/fichajes -H "Content-Type: application/json" -H "X-Simular-Fallo: mover-jugador" -d '{\"jugadorId\":3,\"clubDestinoId\":1,\"monto\":500000}'
```

```json
{ "ok": false, "code": "FALLA_SIMULADA", "message": "Falla simulada despues del paso \"mover-jugador\". No se guardo ningun cambio." }
```

```bash
curl.exe http://localhost:4005/api/consistencia
```

```json
{ "ok": true, "data": { "consistente": true, "problemas": [], "dineroTotal": 4350000, "version": 0 } }
```

`version: 0`: no se hizo ningun commit.

El mismo fichaje sin falla:

```bash
curl.exe -X POST http://localhost:4005/api/fichajes -H "Content-Type: application/json" -d '{\"jugadorId\":3,\"clubDestinoId\":1,\"monto\":500000}'
```

```json
{ "ok": true, "data": { "id": 1, "jugadorId": 3, "jugador": "Ruben Morales", "de": "Municipal", "a": "Comunicaciones", "monto": 500000 } }
```

## Tests

```text
test/
├── almacen.test.js   commit, rollback, copias, aislamiento, orden con candado, candado despues de un error
└── fichajes.test.js  fichaje bien, falla en cada uno de los 5 pasos, reglas, concurrencia con y sin candado
```

```text
ℹ tests 25
ℹ pass 25
ℹ fail 0
```

Para comprobar que los tests sirven hice que la transaccion trabajara
directo sobre el estado (sin borrador): fallaron 9 tests, todos los de
rollback y aislamiento.

## Casos de error

| Caso                                 | Status | Code                       |
| ------------------------------------ | ------ | -------------------------- |
| Body invalido                        | 400    | `DATOS_INVALIDOS`          |
| Jugador o club que no existe         | 404    | `JUGADOR_NO_ENCONTRADO` / `CLUB_NO_ENCONTRADO` |
| El jugador ya esta en ese club       | 409    | `MISMO_CLUB`               |
| Futbol con futsal                    | 422    | `MODALIDAD_DISTINTA`       |
| No alcanza el presupuesto            | 422    | `PRESUPUESTO_INSUFICIENTE` (con `detalles`) |
| Plantilla del club destino llena     | 422    | `PLANTILLA_LLENA`          |
| Falla simulada                       | 500    | `FALLA_SIMULADA` (sin cambios guardados) |

## Notas

Los datos viven en memoria, al reiniciar el servidor vuelven a los de
`src/datos/inicial.js`.
