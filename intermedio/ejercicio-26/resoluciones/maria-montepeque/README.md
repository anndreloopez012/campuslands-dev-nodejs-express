# Ejercicio 26 - mock de dependencias

API de matchmaking para un shooter competitivo hecha con Node.js y
Express. Pide las estadisticas de cada jugador a una **API externa**, arma
dos equipos balanceados por K/D, elige un mapa al azar y avisa a otro
sistema por webhook. En los tests nada de eso es real: se reemplaza con
mocks de `node:test`.

## Las dependencias que hay que mockear

| Dependencia                  | Donde se usa                  | Como se mockea en los tests            |
| ---------------------------- | ----------------------------- | -------------------------------------- |
| API externa de estadisticas  | `clients/stats.client.js`     | `t.mock.method(globalThis, "fetch", ...)` |
| Webhook de notificaciones    | `clients/notificador.client.js` | el mismo `fetch` falso, se revisa con que se llamo |
| El reloj (`Date.now`)        | cache en `stats.service.js`   | `t.mock.timers.enable({ apis: ["Date"] })` + `tick()` |
| El azar (`Math.random`)      | mapa en `partidas.service.js` | `t.mock.method(Math, "random", () => 0)` |
| `console.warn`               | cuando falla la notificacion  | `t.mock.method(console, "warn", ...)`  |
| La config                    | `NOTIFICAR_URL`               | se cambia `config.notificarUrl` y se restaura en `afterEach` |

En el ejercicio 24 el service recibia sus dependencias por parametro. Aqui
el codigo usa `fetch`, `Date.now` y `Math.random` directo, como se suele
escribir, y los tests los reemplazan **sin cambiar el codigo**.

Se usa `t.mock` (el mock del test) en vez de `mock` global porque se
deshace solo al terminar cada test. Asi un test nunca deja el `fetch`
falso puesto para el siguiente.

## Que se prueba

**`stats.client.test.js`** - el cliente HTTP:

- Que pida la URL correcta y codifique el gamertag (`dark/../admin`
  queda `dark%2F..%2Fadmin`).
- Que mande un `signal` para el timeout.
- Cada forma en que puede fallar la API externa: 404, 500, sin conexion,
  timeout y datos raros. Cada una se traduce a un status claro (404, 502
  o 504).

**`stats.service.test.js`** - calculos y cache:

- K/D, winrate y rango. Si nunca murio no da infinito.
- Con el reloj falso: a los 59 s usa la cache (1 llamada a `fetch`) y a
  los 60 s vuelve a pedir (2 llamadas).
- Si el proveedor falla no se guarda nada en cache.

**`partidas.test.js`** - rutas con supertest:

- Equipos balanceados con el reparto "serpiente" (A B B A A B...).
- Con `Math.random` en 0 sale el primer mapa y con 0.99 el ultimo.
- Se pide una vez la stat por jugador.
- Si un jugador no existe o el proveedor esta caido, la partida no se
  arma.
- Con `NOTIFICAR_URL` se manda el POST con el body correcto. Si la
  notificacion falla, la partida igual se crea (201) y queda un aviso.
- Las validaciones no llaman al proveedor (`callCount() === 0`).

## Requisitos

Node.js 20.11 o superior (`mock.timers` con `Date`). Sin base de datos.

## Instalacion

```bash
npm install
npm test
```

| Script              | Descripcion                                             |
| ------------------- | ------------------------------------------------------- |
| `npm test`          | Corre los tests (no hace ninguna peticion real)         |
| `npm run proveedor` | Levanta una API externa falsa en http://localhost:4026  |
| `npm start`         | Levanta el servidor en http://localhost:3026            |
| `npm run dev`       | Servidor con recarga automatica                         |

## Probarlo a mano

Hace falta la API externa. `dev/proveedor-falso.js` hace de proveedor con
los jugadores `viper`, `nova`, `ghost`, `blaze`, `rook` y `echo`. El
jugador `lento` tarda 5 segundos en responder, para probar el timeout.

En una terminal:

```bash
npm run proveedor
```

En otra:

```bash
npm start
```

## Variables de entorno

```bash
copy .env.example .env
```

| Variable               | Uso                                       | Por defecto              |
| ---------------------- | ----------------------------------------- | ------------------------ |
| `PORT`                 | Puerto del servidor                       | `3026`                   |
| `PROVEEDOR_URL`        | URL de la API de estadisticas             | `http://localhost:4026`  |
| `PROVEEDOR_TIMEOUT_MS` | Cuanto espero al proveedor                | `2000`                   |
| `CACHE_SEGUNDOS`       | Cuanto guardo las stats                   | `60`                     |
| `NOTIFICAR_URL`        | Webhook que recibe cada partida (opcional) | vacio, no notifica      |

## Endpoints

| Metodo | Ruta                              | Descripcion                                  |
| ------ | --------------------------------- | -------------------------------------------- |
| GET    | `/health`                         | Comprueba que el servidor vive               |
| GET    | `/api/jugadores/:gamertag/stats`  | Stats del proveedor con K/D, winrate y rango |
| POST   | `/api/partidas`                   | Arma una partida `{ jugadores: [...] }`      |
| GET    | `/api/partidas`                   | Partidas armadas                             |

`jugadores` tiene que ser una lista par de 2 a 10 gamertags sin repetir.

## Ejemplos (PowerShell)

```bash
curl.exe http://localhost:3026/api/jugadores/viper/stats
```

```json
{ "ok": true, "data": { "gamertag": "viper", "kills": 4200, "muertes": 1500, "victorias": 330, "partidas": 500, "kd": 2.8, "winrate": 66, "rango": "Diamante", "desdeCache": false } }
```

La segunda vez dentro de 60 segundos sale `"desdeCache": true`.

```bash
curl.exe -X POST http://localhost:3026/api/partidas -H "Content-Type: application/json" -d '{\"jugadores\":[\"viper\",\"nova\",\"ghost\",\"blaze\",\"rook\",\"echo\"]}'
```

```json
{
  "ok": true,
  "data": {
    "id": 1,
    "mapa": "Puerto Niebla",
    "equipoA": {
      "jugadores": [
        { "gamertag": "viper", "kd": 2.8, "rango": "Diamante" },
        { "gamertag": "echo", "kd": 1.43, "rango": "Oro" },
        { "gamertag": "ghost", "kd": 0.95, "rango": "Plata" }
      ],
      "kdPromedio": 1.73
    },
    "equipoB": {
      "jugadores": [
        { "gamertag": "blaze", "kd": 2.08, "rango": "Diamante" },
        { "gamertag": "nova", "kd": 1.55, "rango": "Platino" },
        { "gamertag": "rook", "kd": 0.56, "rango": "Bronce" }
      ],
      "kdPromedio": 1.4
    },
    "creada": "2026-11-03T00:38:46.436Z"
  }
}
```

## Resultado de los tests

```text
ℹ tests 39
ℹ pass 39
ℹ fail 0
```

Para comprobar que los tests sirven, meti dos errores a proposito:

- Hacer que la cache nunca venza: fallo `usa la cache hasta que pasan 60 segundos`.
- Quitar el caso del timeout: fallaron `timeout => 504` y `504 si el proveedor tarda demasiado`.

## Casos de error

| Caso                                  | Status | Mensaje                                               |
| ------------------------------------- | ------ | ----------------------------------------------------- |
| Jugador que no existe en el proveedor | 404    | `No existe el jugador nadie`                          |
| Proveedor caido o responde 5xx        | 502    | `No se pudo conectar con el proveedor de estadisticas` |
| Proveedor manda datos que no cuadran  | 502    | `El proveedor de estadisticas mando datos raros`      |
| Proveedor tarda mas de 2 s            | 504    | `El proveedor de estadisticas tardo demasiado`        |
| Cantidad impar o fuera de 2 a 10      | 400    | `Tiene que haber una cantidad par de jugadores, de 2 a 10` |
| Gamertags repetidos                   | 400    | `Hay gamertags repetidos`                             |

## Estructura

| Carpeta / archivo     | Que hay dentro                                   |
| --------------------- | ------------------------------------------------ |
| `src/clients/`        | `stats.client.js` y `notificador.client.js` (usan `fetch`) |
| `src/services/`       | `stats.service.js` (cache) y `partidas.service.js` (equipos) |
| `src/controllers/`    | `shooter.controller.js`                          |
| `src/routes/`         | `index.js`                                       |
| `src/config.js`       | Lee el `.env`                                    |
| `dev/`                | `proveedor-falso.js` para probar a mano          |
| `test/`               | Tests con mocks                                  |

## Notas

Las partidas y la cache viven en memoria.
