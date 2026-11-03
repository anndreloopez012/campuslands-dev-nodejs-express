# Avanzado 04 - errores de dominio

API de un battle royale (recoger loot, curarse, disparar) hecha con
Node.js y Express. El foco esta en **como se manejan los errores**: el
juego tira errores con nombre propio y la capa HTTP los convierte en una
respuesta estandar.

## El problema con `throw new AppError(409, "...")`

En los ejercicios anteriores el service decia el status HTTP. Eso mezcla
dos cosas: la regla del juego ("el inventario esta lleno") y como se
responde por HTTP (422). Si manana el juego se usa desde otro lado (un
bot, una cola de mensajes) ese 422 no significa nada. Ademas el cliente
solo tenia el mensaje en texto para saber que paso, y si se cambia el
texto el cliente se rompe.

## Como esta hecho

```text
src/
├── dominio/
│   ├── errores.js      ErrorDeDominio, 5 familias y el CATALOGO de codes
│   └── partida.js      la clase Partida con las reglas del juego
├── servicios/          busca la partida y le pide la accion
├── http/
│   ├── problemas.js    el UNICO lugar que convierte errores en status HTTP
│   ├── middlewares.js  requestId, 404 y manejador de errores
│   ├── controlador.js  valida la entrada y llama al servicio
│   └── rutas.js
└── datos/db.js
```

### 1. El dominio solo dice QUE paso

```js
throw error("INVENTARIO_LLENO", "Raven ya tiene 5 de 5 espacios ocupados", { capacidad: 5, ocupados: 5 });
```

- `code`: un texto fijo que no cambia nunca. El cliente decide que
  hacer segun el code, no segun el mensaje.
- mensaje: para personas, se puede cambiar o traducir.
- `detalles`: datos para que el cliente pueda mostrar algo util
  (cuantos espacios hay, quien recogio el item...).

Cada code esta en `CATALOGO` con su familia. Si alguien usa un code que
no existe, la funcion `error()` avisa, porque eso es un bug.

Hay un test que revisa que ningun archivo de `dominio/` importe express
o sepa de status HTTP.

### 2. Cinco familias

| Familia          | Que significa                                 | Status |
| ---------------- | --------------------------------------------- | ------ |
| `DatosInvalidos` | El pedido esta mal armado                     | 400    |
| `NoEncontrado`   | No existe la partida, el jugador o el item    | 404    |
| `Conflicto`      | Choca con algo que ya paso (item ya recogido) | 409    |
| `EstadoInvalido` | No se puede en el estado actual (partida en lobby, jugador eliminado) | 409 |
| `ReglaDelJuego`  | El pedido esta bien pero las reglas no lo dejan | 422  |

La tabla de status vive solo en `http/problemas.js`. Cambiar un status es
cambiar una linea.

### 3. Respuesta estandar: Problem Details (RFC 9457)

Todos los errores, incluso los 404 de rutas y el JSON roto, salen con
`Content-Type: application/problem+json` y esta forma:

```json
{
  "type": "/api/errores/inventario-lleno",
  "title": "Inventario lleno",
  "status": 422,
  "detail": "Raven ya tiene 5 de 5 espacios ocupados",
  "instance": "/api/partidas/1/jugadores/Raven/recoger",
  "code": "INVENTARIO_LLENO",
  "requestId": "6b0b3f0e-...",
  "capacidad": 5,
  "ocupados": 5
}
```

- `type` es una URL de esta misma API: abrirla explica el error.
- `requestId` tambien va en el header `X-Request-Id`.
- Los `detalles` del error van al mismo nivel (el estandar lo permite).

### 4. Los errores que no esperabamos

Si algo falla y no es un error del dominio (un bug), se responde 500
**sin** el mensaje real, porque puede tener datos internos:

```json
{ "type": "/api/errores/error-interno", "title": "Error interno", "status": 500, "detail": "Algo salio mal de nuestro lado. Si se repite, manda el requestId a soporte.", "code": "ERROR_INTERNO", "requestId": "..." }
```

El mensaje real queda en el log con el mismo `requestId`, para poder
buscarlo.

### 5. Catalogo publico

`GET /api/errores` lista todos los codes con su status, titulo y
descripcion. Sirve como documentacion para quien hace el cliente.

## Las reglas del juego

- Inventario de 5 espacios; la municion no ocupa espacio.
- Un item solo lo puede recoger una persona.
- El botiquin cura hasta 100, el escudo llega hasta 50. Si ya esta lleno
  no se gasta.
- Al disparar se gasta 1 de municion; el dano baja primero el escudo y
  despues la vida.
- Un jugador eliminado no puede actuar ni ser atacado.
- Cuando queda uno vivo la partida termina y gana.
- Si una accion falla no cambia nada (no se gasta municion, el item sigue
  en el suelo).

## Requisitos

Node.js 20 o superior. Sin base de datos.

## Instalacion y ejecucion

```bash
npm install
npm start
```

| Script        | Descripcion                          |
| ------------- | ------------------------------------ |
| `npm start`   | Servidor en http://localhost:4004    |
| `npm run dev` | Servidor con recarga automatica      |
| `npm test`    | Tests del dominio y de HTTP          |

## Endpoints

| Metodo | Ruta                                            | Body                          |
| ------ | ----------------------------------------------- | ----------------------------- |
| GET    | `/health`                                       |                               |
| GET    | `/api/partidas/:id`                             |                               |
| POST   | `/api/partidas/:id/jugadores/:gamertag/recoger` | `{ itemId }`                  |
| POST   | `/api/partidas/:id/jugadores/:gamertag/usar`    | `{ itemId }`                  |
| POST   | `/api/partidas/:id/jugadores/:gamertag/disparar`| `{ objetivo, armaId }`        |
| GET    | `/api/errores`                                  | Catalogo de errores           |
| GET    | `/api/errores/:slug`                            | Un error (a donde apunta `type`) |

Datos de prueba:

- Partida 1 (`en_curso`): Raven, Wolf y Ghost.
- Partida 2 (`lobby`): Hawk y Fang.
- Items 1 rifle (35), 2 escopeta (60), 3 y 4 municion, 5, 6, 9, 10 y 11
  botiquines, 7 y 8 escudos.

## Ejemplos (PowerShell)

```bash
curl.exe -X POST http://localhost:4004/api/partidas/1/jugadores/Raven/recoger -H "Content-Type: application/json" -d '{\"itemId\":2}'
```

```bash
curl.exe -i -X POST http://localhost:4004/api/partidas/1/jugadores/Raven/disparar -H "Content-Type: application/json" -d '{\"objetivo\":\"Wolf\",\"armaId\":2}'
```

Sin municion todavia:

```text
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/problem+json; charset=utf-8
```

```json
{
  "municion": 0,
  "type": "/api/errores/sin-municion",
  "title": "Sin municion",
  "status": 422,
  "detail": "Raven no tiene municion para Escopeta",
  "instance": "/api/partidas/1/jugadores/Raven/disparar",
  "code": "SIN_MUNICION",
  "requestId": "..."
}
```

Que significa ese error:

```bash
curl.exe http://localhost:4004/api/errores/sin-municion
```

## Catalogo de errores

| Code                    | Status | Cuando                                     |
| ----------------------- | ------ | ------------------------------------------ |
| `DATOS_INVALIDOS`       | 400    | Body o params mal (trae la lista `errores`) |
| `PARTIDA_NO_ENCONTRADA` | 404    | No existe la partida                       |
| `JUGADOR_NO_ENCONTRADO` | 404    | El gamertag no esta en la partida          |
| `ITEM_NO_ENCONTRADO`    | 404    | No existe el item                          |
| `ITEM_YA_RECOGIDO`      | 409    | Ya lo tiene alguien (trae `recogidoPor`)   |
| `PARTIDA_NO_EN_CURSO`   | 409    | La partida esta en lobby o terminada       |
| `JUGADOR_ELIMINADO`     | 409    | El que actua o el objetivo ya fue eliminado |
| `INVENTARIO_LLENO`      | 422    | 5 de 5 espacios (trae `capacidad` y `ocupados`) |
| `ITEM_NO_EN_INVENTARIO` | 422    | Usar algo que no lleva                     |
| `ITEM_NO_USABLE`        | 422    | Usar un arma                               |
| `VIDA_COMPLETA`         | 422    | Botiquin con vida 100                      |
| `ESCUDO_COMPLETO`       | 422    | Escudo con escudo 50                       |
| `ARMA_NO_EQUIPADA`      | 422    | Disparar con un arma que no lleva          |
| `SIN_MUNICION`          | 422    | Disparar sin balas                         |
| `AUTO_DISPARO`          | 422    | Dispararse a uno mismo                     |
| `ERROR_INTERNO`         | 500    | Un bug, el detalle solo va al log          |

## Tests

```text
test/
├── dominio.test.js   la clase Partida y los errores, sin express
└── problemas.test.js cada familia con su status, formato Problem Details, 500 sin filtrar, catalogo
```

```text
ℹ tests 33
ℹ pass 33
ℹ fail 0
```

El 500 se prueba simulando un bug con `t.mock.method` sobre la base de
datos: la respuesta no tiene el mensaje real y el log si.

Para comprobar que los tests sirven meti dos errores a proposito:

- Cambiar `ReglaDelJuego` a 400: fallaron 3 tests.
- Mandar el mensaje real en el 500: fallo
  `500 sin filtrar el mensaje real, y se registra con el requestId`.

## Notas

Los datos viven en memoria, al reiniciar el servidor vuelven a los de
`src/datos/db.js`.
