# Avanzado 23 - Jobs programados (soldadura)

API en Node.js y Express para un taller de soldadura. Ademas de responder peticiones, el servidor ejecuta **tareas por su cuenta segun un horario**: revisa el mantenimiento de las maquinas, avisa certificaciones de soldadores por vencer, pide consumibles y limpia alertas viejas. El parser de cron y el planificador estan escritos a mano (sin `node-cron`).

## Como ejecutarlo

```bash
npm install
npm start          # puerto 3000, cambia con PORT=3100
npm test
```

Ruta base: `/avanzado/ejercicio-23`. Al arrancar, `server.js` inicia el planificador, que revisa cada 15 segundos que jobs vencieron. Las horas son **UTC**.

## Probar rapido

```bash
BASE=http://localhost:3000/avanzado/ejercicio-23
curl $BASE/jobs
curl -X POST $BASE/jobs/revisar-mantenimiento/ejecucion
curl "$BASE/alertas?estado=abierta"
curl "$BASE/cron/proximas?expresion=*/30%206-20%20*%20*%201-6&cantidad=5"
```

## Jobs del taller

| Job | Cron | Que hace |
| --- | --- | --- |
| `revisar-mantenimiento` | `0 7 * * *` | Todos los dias 07:00. Alerta maquinas al 90% o mas de sus horas limite |
| `vencimiento-certificaciones` | `0 8 * * 1` | Lunes 08:00. Alerta certificaciones que vencen en 30 dias y suspende las vencidas |
| `reponer-consumibles` | `*/30 6-20 * * 1-6` | Cada 30 min de 06:00 a 20:59, lunes a sabado. Crea ordenes de compra bajo el minimo |
| `limpiar-alertas` | `0 3 * * *` | 03:00. Borra alertas resueltas hace mas de 7 dias |

Los jobs son **idempotentes**: correrlos dos veces no duplica alertas abiertas ni ordenes pendientes. Esto importa porque un job puede repetirse (ejecucion manual, reinicio, reintento).

## Cron (`src/jobs/cron.js`)

`minuto hora dia mes diaSemana`, en UTC:

| Sintaxis | Ejemplo | Significa |
| --- | --- | --- |
| `*` | `* * * * *` | Todos |
| Lista | `0 8,13 * * *` | 08:00 y 13:00 |
| Rango | `0 9 * * 1-5` | Lunes a viernes |
| Paso | `*/15 * * * *` | Cada 15 minutos |
| Rango con paso | `0 6-20/2 * * *` | Cada 2 horas entre 6 y 20 |
| Alias | `@hourly`, `@daily`, `@weekly`, `@monthly` | |

- Domingo es `0` o `7`.
- Si se restringen dia del mes **y** dia de semana, basta con que coincida uno (como el cron clasico).
- Valida rangos y avisa expresiones que nunca ocurren (`0 0 31 2 *`).
- `GET /cron/proximas` muestra las proximas fechas de cualquier expresion para probarla antes de usarla.

## Planificador (`src/jobs/planificador.js`)

- **Proxima ejecucion**: se calcula al registrar y despues de cada ejecucion.
- **Sin solapamiento**: si un job sigue corriendo cuando le toca de nuevo, esa ejecucion se registra como `omitida`.
- **Ejecuciones perdidas**: si el servidor estuvo detenido y se saltaron varias, al volver corre **una vez** y agenda la siguiente desde ahora (no intenta ponerse al dia con todas).
- **Timeout**: cada job tiene un tiempo maximo (30 s por defecto). Si lo supera se marca `timeout` y se avisa a la tarea con un `AbortSignal`.
- **Historial**: ultimas 20 ejecuciones con origen (`cron` o `manual`), inicio, fin, duracion, resultado (`exito`, `error`, `timeout`, `omitida`) y detalle.
- **Pausar / reanudar**: al reanudar se recalcula la proxima desde ese momento.
- El temporizador usa `unref()` para no impedir que el proceso termine.
- El reloj se inyecta, asi las pruebas avanzan el tiempo sin esperar.

Limitacion consciente: si se levantan varias instancias del servidor, cada una correria los jobs. En ese caso hace falta un candado compartido (por ejemplo en la base de datos) o un unico proceso dedicado a los jobs.

## Rutas

| Metodo y ruta | Que hace |
| --- | --- |
| `GET /` | Informacion del ejercicio |
| `GET /jobs`, `GET /jobs/:nombre` | Estado, cron, proxima ejecucion, ultima ejecucion y conteos |
| `GET /jobs/:nombre/historial` | Ultimas ejecuciones |
| `POST /jobs/:nombre/ejecucion` | Ejecuta ahora (409 si ya esta corriendo) |
| `POST /jobs/:nombre/pausa`, `POST /jobs/:nombre/reanudacion` | Pausa o reanuda |
| `GET /cron/proximas?expresion=&cantidad=&desde=` | Proximas fechas de una expresion |
| `GET /maquinas` | Maquinas y horas de uso |
| `POST /maquinas/:id/uso` | `{ horas }` (1 a 24) |
| `POST /maquinas/:id/mantenimiento` | Reinicia horas y resuelve su alerta |
| `GET /soldadores` | Soldadores y certificaciones |
| `GET /consumibles` | Stock |
| `POST /consumibles/:id/consumo` | `{ cantidad }` |
| `GET /alertas?estado=abierta|resuelta` | Alertas |
| `POST /alertas/:id/resolucion` | Resuelve |
| `GET /ordenes-compra` | Ordenes creadas por el job |

## Errores

| Codigo | Estado | Cuando |
| --- | --- | --- |
| `VALIDACION` | 400 | Datos o parametros invalidos |
| `JSON_INVALIDO` | 400 | Body que no es JSON |
| `CRON_INVALIDO` | 400 | Expresion cron mal escrita o imposible |
| `JOB_NO_ENCONTRADO`, `MAQUINA_NO_ENCONTRADA`, `CONSUMIBLE_NO_ENCONTRADO`, `ALERTA_NO_ENCONTRADA` | 404 | No existe |
| `RUTA_NO_ENCONTRADA` | 404 | Ruta desconocida |
| `METODO_NO_PERMITIDO` | 405 | Metodo no admitido |
| `JOB_EN_EJECUCION` | 409 | Ejecucion manual de un job que ya corre |
| `STOCK_INSUFICIENTE` | 409 | Consumo mayor al stock |
| `PAYLOAD_GRANDE` | 413 | Body muy grande |
| `FORMATO_NO_SOPORTADO` | 415 | Falta `Content-Type: application/json` |
| `ERROR_INTERNO` | 500 | Error inesperado |

## Estructura

```
src/
  app.js, server.js (inicia el planificador)
  jobs/         cron (parser y siguiente fecha), planificador (tick, solapamiento, timeout, historial)
  services/     taller (maquinas, soldadores, consumibles, alertas) y definicion de los jobs
  routes/       jobs y taller
  middlewares/  errores, notFound, metodoNoPermitido, exigirTipo
  errores/      catalogo de errores
test/           cron, planificador con reloj controlado y pruebas de API
```
