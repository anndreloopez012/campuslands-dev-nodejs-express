# Intermedio 26 - mock de dependencias

## Que hace

API de un shooter competitivo: jugadores con elo, registro de partidas 3v3 y duelos, ranking y estado de las dependencias externas. El foco del ejercicio es como probar codigo que depende de cosas que no controlas (un servicio anticheat por HTTP, un webhook, la hora, un generador de codigos aleatorios) reemplazandolas por mocks.

Dependencias del servicio de partidas y como se inyectan:

| Dependencia | Para que sirve | Implementaciones |
| --- | --- | --- |
| `anticheat` | Dice si un jugador esta sancionado | `anticheat.http.js` (llama a un servicio por HTTP) y `anticheat.simulado.js` |
| `notificador` | Avisa que se registro una partida | memoria (bitacora), webhook opcional |
| `reloj` | Fecha de registro | `() => new Date()` |
| `generarCodigo` | Codigo de la partida | 3 bytes aleatorios en hex |

Reglas de negocio:
- Competitivo es 3v3 y duelo es 1v1.
- Antes de tocar cualquier dato se consulta al anticheat por todos los jugadores. Si alguno esta sancionado responde 422. Si el anticheat no responde, responde 503 (la partida no se registra).
- El elo se calcula con la formula clasica (factor K 32) usando el promedio de cada equipo. El elo no baja de 0.
- Si falla la notificacion, la partida se registra igual y la respuesta indica `notificacion: "fallida"`.

## Estructura

```
src/
  app.js
  server.js
  adapters/
    anticheat.http.js
    anticheat.simulado.js
    notificador.js
  config/
    index.js
    dependencias.js
  constants/
  controllers/
  data/
  middlewares/
  repositories/
  routes/
  services/
  utils/
  validators/
soporte/
  cliente.js
test/
  adapters/
    anticheat.http.test.js
    anticheat.simulado.test.js
    notificador.test.js
  api.test.js
  config.test.js
  elo.test.js
  jugadores.service.test.js
  partidas.service.test.js
```

## Como ejecutar

```
npm install
npm run dev
```

Puerto 3000 por defecto (`PORT`).

Variables de entorno opcionales:
- `ANTICHEAT_URL`: url base del servicio anticheat. Si no existe se usa el simulado, que sanciona al nick `Wallhack99`.
- `ANTICHEAT_TIMEOUT_MS`: entero entre 100 y 10000. Por defecto 2000.
- `WEBHOOK_URL`: si existe, cada partida tambien se envia por POST a esa url.

## Como correr las pruebas

```
npm test
```

Otros scripts: `npm run test:watch` y `npm run test:cobertura`. Para un solo archivo: `node --test test/partidas.service.test.js`.

Tecnicas de mock que se usan:
- `mock.fn()` para reemplazar una funcion y revisar con que argumentos y cuantas veces se llamo (`mock.calls`, `mock.callCount()`).
- `mockImplementation` para cambiar el comportamiento a mitad de una prueba, por ejemplo para que el anticheat falle.
- `mock.method(objeto, 'metodo', ...)` para reemplazar un metodo existente, incluido `globalThis.fetch`.
- `mock.timers` para avanzar el tiempo y probar el timeout sin esperar.
- Inyeccion de dependencias: las fabricas reciben las dependencias como parametros, asi las pruebas pasan mocks sin modificar el codigo.
- Un servidor HTTP local real (`node:http`) para comprobar el adaptador sin mocks.

Que cubre cada archivo:
- `partidas.service.test.js`: servicio con todas sus dependencias simuladas, incluido el orden de las llamadas.
- `anticheat.http.test.js`: url, reintentos, 404, 5xx, timeout y fetch global.
- `anticheat.simulado.test.js`: nicks sancionados del adaptador simulado.
- `notificador.test.js`: destinos en memoria, webhook y tolerancia a fallos.
- `api.test.js`: la app completa con anticheat y notificador simulados.
- `config.test.js`, `elo.test.js`, `jugadores.service.test.js`: configuracion, formula de elo y reglas de jugadores.

## Respuesta esperada

`GET /intermedio/ejercicio-26`

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "mock de dependencias"
}
```

## Endpoints

Base: `/intermedio/ejercicio-26`

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | / | Ruta principal |
| GET | /salud | Estado del anticheat y del notificador |
| GET | /eventos | Ultimos eventos notificados |
| GET | /jugadores | Lista jugadores |
| POST | /jugadores | Crea un jugador |
| GET | /jugadores/ranking | Ranking por elo |
| GET | /jugadores/:id | Detalle de un jugador |
| GET | /partidas | Lista partidas |
| POST | /partidas | Registra una partida |
| GET | /partidas/:id | Detalle de una partida |

## Campos del body

`POST /jugadores`:
- `nick`: 3 a 16 caracteres, solo letras, numeros y guion bajo. Unico sin distinguir mayusculas. Obligatorio.
- `region`: na, eu, latam o asia. Obligatorio.

`POST /partidas` (todos obligatorios):
- `modo`: competitivo o duelo.
- `mapa`: dust, harbor, citadel o neon.
- `equipoA` y `equipoB`: listas de ids de jugador. 3 por equipo en competitivo, 1 en duelo. Sin repetidos y sin jugadores en los dos equipos.
- `ganador`: A o B.

Los requests con body deben enviar `Content-Type: application/json` y no pueden superar 10 KB.

## Parametros de consulta

- `GET /jugadores`: `region`, `buscar`, `orden` (id, nick, elo), `pagina`, `limite`.
- `GET /jugadores/ranking`: `region`, `pagina`, `limite` (1 a 10, por defecto 5).
- `GET /partidas`: `modo`, `mapa`, `jugadorId`, `orden` (reciente, id), `pagina`, `limite`.
- `GET /eventos`: `pagina`, `limite` (1 a 50, por defecto 20).

## Ejemplos

curl:

```
curl http://localhost:3000/intermedio/ejercicio-26
curl http://localhost:3000/intermedio/ejercicio-26/salud
curl "http://localhost:3000/intermedio/ejercicio-26/jugadores/ranking?region=eu"
curl -X POST http://localhost:3000/intermedio/ejercicio-26/partidas -H "Content-Type: application/json" -d "{\"modo\":\"duelo\",\"mapa\":\"dust\",\"equipoA\":[4],\"equipoB\":[1],\"ganador\":\"A\"}"
curl -X POST http://localhost:3000/intermedio/ejercicio-26/partidas -H "Content-Type: application/json" -d "{\"modo\":\"duelo\",\"mapa\":\"dust\",\"equipoA\":[8],\"equipoB\":[4],\"ganador\":\"A\"}"
```

El ultimo ejemplo usa al jugador 8 (`Wallhack99`) y responde 422.

PowerShell:

```
Invoke-RestMethod http://localhost:3000/intermedio/ejercicio-26/salud
Invoke-RestMethod -Method Post -Uri http://localhost:3000/intermedio/ejercicio-26/partidas -ContentType "application/json" -Body '{"modo":"competitivo","mapa":"neon","equipoA":[1,2,3],"equipoB":[4,5,6],"ganador":"B"}'
Invoke-RestMethod http://localhost:3000/intermedio/ejercicio-26/eventos
```

## Formato de respuesta

Partida registrada (`POST /partidas`, status 201):

```json
{
  "ok": true,
  "data": {
    "id": 1,
    "codigo": "503F24",
    "modo": "duelo",
    "mapa": "dust",
    "equipoA": [4],
    "equipoB": [1],
    "ganador": "A",
    "cambios": [
      { "jugadorId": 4, "antes": 1710, "despues": 1717, "delta": 7 },
      { "jugadorId": 1, "antes": 1500, "despues": 1493, "delta": -7 }
    ],
    "registradaEn": "2026-11-04T12:00:00.000Z",
    "notificacion": "enviada"
  }
}
```

Un listado incluye `paginacion` y el header `X-Total-Count`.

## Errores

```json
{ "ok": false, "message": "Hay jugadores sancionados en la partida", "codigo": "JUGADOR_SANCIONADO", "errores": [{ "campo": "Wallhack99", "mensaje": "Cuenta sancionada por software no permitido" }] }
```

| Status | Cuando | Codigo |
| --- | --- | --- |
| 400 | Datos o parametros invalidos | VALIDACION, ID_INVALIDO, CONSULTA_INVALIDA, JSON_INVALIDO, BODY_INVALIDO |
| 404 | Ruta o recurso inexistente | RUTA_NO_ENCONTRADA, JUGADOR_NO_ENCONTRADO, PARTIDA_NO_ENCONTRADA |
| 405 | Metodo no permitido | METODO_NO_PERMITIDO |
| 409 | Nick repetido | NICK_DUPLICADO |
| 413 | Body mayor a 10 KB | PAYLOAD_GRANDE |
| 415 | Content-Type distinto de application/json | TIPO_NO_SOPORTADO |
| 422 | Jugador inexistente o sancionado | REFERENCIA_INVALIDA, JUGADOR_SANCIONADO |
| 503 | Anticheat no disponible (con header `Retry-After`) o `/salud` con una dependencia caida | ANTICHEAT_NO_DISPONIBLE, DEPENDENCIA_CAIDA |
| 500 | Error inesperado | ERROR_INTERNO |
