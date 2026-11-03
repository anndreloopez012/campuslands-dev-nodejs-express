# Avanzado 23 - jobs programados (soldadura)

Taller de soldadura con tareas que corren solas segun un horario tipo **cron**:

| Job | Cron (UTC) | Que hace |
| --- | ---------- | -------- |
| `certificaciones` | `0 7 * * *` | alerta de soldadores con certificacion por vencer (< 30 dias) |
| `mantenimiento` | `0 * * * 1-6` | cada hora de lunes a sabado revisa maquinas con 50+ horas sin mantenimiento |
| `reporte-consumo` | `30 6 * * *` | suma kg de electrodo y m3 de gas del dia anterior (2 reintentos) |
| `limpiar-inspecciones` | `0 3 * * 0` | domingos borra inspecciones de mas de 90 dias |

## Como ejecutar

```bash
npm install
npm start      # http://localhost:4023
npm test
```

## Como funciona

- **`src/jobs/cron.js`**: mini parser hecho a mano de 5 campos (`minuto hora dia mes diaSemana`), con `*`, `*/15`, `1,15`, `9-17`, `1-5/2`. Todo en UTC para que no cambie segun la zona del servidor.
- **`src/jobs/planificador.js`**:
  - `tick(fecha)` corre los jobs que coinciden con ese minuto. El server llama a `tick` cada 10 s, pero solo actua una vez por minuto.
  - **Sin encimarse**: si un job sigue corriendo cuando le vuelve a tocar, esa vez queda como `saltado`.
  - **Timeout** por job: si se cuelga, se marca error y se libera.
  - **Reintentos** configurables.
  - **Historial** de las ultimas 50 ejecuciones (inicio, fin, estado, intentos, resultado o error).
  - Pausar y reanudar.
- El `setInterval` usa `unref()` y se detiene con SIGINT, para no dejar el proceso colgado.
- Para los tests el reloj se inyecta y se llama a `tick` con fechas fijas, asi no hay que esperar horas.

## Endpoints

| Metodo | Ruta | Descripcion |
| ------ | ---- | ----------- |
| GET | `/health` | estado |
| GET | `/api/jobs` | jobs con su `siguiente` ejecucion y la ultima |
| GET | `/api/jobs/:nombre/historial` | historial del job |
| POST | `/api/jobs/:nombre/ejecutar` | correrlo ya (200 ok, 500 error, 409 si ya estaba corriendo) |
| POST | `/api/jobs/:nombre/pausar` | pausar |
| POST | `/api/jobs/:nombre/reanudar` | reanudar |
| GET | `/api/cron/siguientes?expr=...&n=5` | probar una expresion cron |
| GET | `/api/taller/alertas` | alertas generadas por los jobs |

## Ejemplos

```bash
curl localhost:4023/api/jobs
curl -X POST localhost:4023/api/jobs/certificaciones/ejecutar
curl localhost:4023/api/taller/alertas
curl "localhost:4023/api/cron/siguientes?expr=*/30%207%20*%20*%201-5&n=4"
curl -X POST localhost:4023/api/jobs/mantenimiento/pausar
```

## Estructura

```text
src/
├── app.js               registra los jobs y las rutas
├── server.js            inicia el planificador y lo detiene al apagar
├── jobs/
│   ├── cron.js
│   └── planificador.js
└── servicios/taller.js  datos del taller y las tareas
```
