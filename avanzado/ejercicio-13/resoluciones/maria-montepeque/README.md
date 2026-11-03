# Avanzado 13 - observabilidad y logs

API de misiones espaciales hecha con Node.js y Express. El foco es poder
**saber que paso** en el servidor cuando algo sale mal: logs
estructurados, un id por peticion que aparece en todas sus lineas, y
nada de secretos escritos en los logs.

## Logs estructurados (`src/logs/logger.js`)

En vez de `console.log("se creo la mision 3")`, cada evento es **una
linea JSON**:

```json
{"time":"2026-11-03T02:30:00.000Z","level":"info","msg":"mision creada","requestId":"6f1c...","misionId":3,"destino":"marte","diasViaje":210}
```

Las herramientas de logs (Loki, Datadog, CloudWatch) pueden filtrar por
cualquier campo: "todas las lineas de `requestId` 6f1c...", "todos los
`level: error` de hoy".

| Que               | Como                                                         |
| ----------------- | ------------------------------------------------------------ |
| Niveles           | `debug` < `info` < `warn` < `error`. Con `LOG_LEVEL=warn` no salen info ni debug |
| Logger hijo       | `logger.hijo({ requestId })` agrega contexto fijo a todas sus lineas |
| Redaccion         | Llaves como `password`, `token`, `authorization`, `codigoAcceso`, `cookie`, `tarjeta` se escriben como `[OCULTO]`, aunque esten anidadas o en arreglos y sin importar mayusculas |
| Errores           | Un `Error` se convierte en `{ tipo, mensaje, stack }` (si no, `JSON.stringify` lo deja en `{}`) |
| Destino           | Por defecto stdout; en los tests se guardan en un arreglo     |

## Seguir una peticion (`src/http/middlewares.js`)

1. **Request id:** cada peticion recibe un id (`X-Request-Id`). Si viene
   de otro servicio (un gateway) con un id valido, se reusa: asi se puede
   seguir una peticion entre varios servicios.
2. **Contexto con `AsyncLocalStorage`:** el logger hijo con el id se
   guarda en un almacen que "sigue" a la peticion por todos los `await`.
   El service hace `log(loggerGeneral).info(...)` **sin recibir el req** y
   la linea igual sale con el `requestId` correcto, aunque haya dos
   peticiones al mismo tiempo.
3. **Una linea por peticion** al terminar (`res.on("finish")`): metodo,
   ruta, status, duracion, bytes y user-agent. El nivel depende de lo que
   paso:
   - 5xx -> `error`
   - 4xx -> `warn`
   - mas lenta que el umbral (1s) -> `warn` con `lenta: true`
   - el resto -> `info`
4. **Errores 500:** el stack completo va **solo al log**. La respuesta
   dice "error interno" y el `requestId`, para que el cliente lo pueda
   reportar y se encuentre el log.

En `server.js` tambien se loguean `unhandledRejection` y
`uncaughtException` antes de que el proceso se caiga.

## Requisitos

Node.js 20 o superior. Sin base de datos.

## Instalacion y ejecucion

```bash
npm install
npm start
```

| Script        | Descripcion                        |
| ------------- | ---------------------------------- |
| `npm start`   | Servidor en http://localhost:4013  |
| `npm run dev` | Servidor con recarga automatica    |
| `npm test`    | Tests del logger y de la API       |

Para ver tambien los `debug` (en PowerShell):

```powershell
$env:LOG_LEVEL="debug"; npm start
```

## Endpoints

| Metodo | Ruta                  | Descripcion                                      |
| ------ | --------------------- | ------------------------------------------------ |
| GET    | `/health`             | El servidor vive                                 |
| GET    | `/api/destinos`       | Destinos posibles                                |
| POST   | `/api/misiones`       | `{ nave, destino, tripulantes, codigoAcceso }`   |
| GET    | `/api/misiones/:id`   | Una mision                                       |
| GET    | `/api/telemetria`     | `?esperaMs=` para simular una peticion lenta     |

El destino `agujero-negro` tiene un bug a proposito para ver como queda
el log de un error 500.

## Ejemplo

```bash
curl.exe -X POST http://localhost:4013/api/misiones -H "Content-Type: application/json" -d '{\"nave\":\"Nostromo\",\"destino\":\"marte\",\"tripulantes\":7,\"codigoAcceso\":\"MU-TH-UR-6000\"}'
```

Lo que sale en la consola del servidor (con `LOG_LEVEL=debug`):

```text
{"time":"...","level":"debug","msg":"calculando trayectoria","requestId":"6f1c...","destino":"marte"}
{"time":"...","level":"info","msg":"mision creada","requestId":"6f1c...","misionId":1,"destino":"marte","diasViaje":210}
{"time":"...","level":"info","msg":"peticion terminada","requestId":"6f1c...","metodo":"POST","ruta":"/api/misiones","status":201,"duracionMs":7.4,"bytes":143,"lenta":false,"headers":{"user-agent":"curl/8.4.0"}}
```

El `codigoAcceso` nunca aparece. Con un body invalido:

```text
{"level":"warn","msg":"mision rechazada por datos invalidos","requestId":"...","errores":[...],"body":{"nave":"X","codigoAcceso":"[OCULTO]"}}
```

## Tests

- `test/logger.test.js`: formato de la linea, nivel minimo, hijos,
  redaccion anidada sin cambiar el original, errores con stack, y dos
  "peticiones" en paralelo con `AsyncLocalStorage` que no se mezclan.
- `test/api.test.js`: todas las lineas de una peticion con el mismo id
  (tambien las del service), linea de acceso, reusar el id que viene,
  dos peticiones al mismo tiempo, 4xx como warn sin el secreto,
  `Authorization` tapado, 500 con stack solo en el log, peticion lenta,
  nivel `warn`.

```text
ℹ tests 16
ℹ pass 16
ℹ fail 0
```

Para comprobar que sirven saque `authorization` de la lista de llaves
sensibles y fallaron 2 tests (el token quedaba escrito en el log).
