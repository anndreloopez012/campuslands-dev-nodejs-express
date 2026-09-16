# Ejercicio 27 - logs simples (Maria Montepeque)

## Que hace

API de resultados de un torneo MOBA construida solo con `node:http` (sin
Express), enfocada en un sistema de **logs simple pero util**.

`src/core/logger.js`:

- Niveles `debug`, `info`, `warn`, `error` con umbral configurable.
- Dos formatos: `pretty` (con color si la terminal lo soporta) y `json`.
- Loggers hijos con contexto (`logger.child({ reqId })`), de modo que todos
  los logs de una peticion comparten su id.
- Cada linea va a consola, a un historial en memoria (ultimas 50) y se
  agrega en `logs/app.log` como JSON (una linea por evento).

`src/middlewares/request-logger.js` asigna un `X-Request-Id`, mide la
duracion con `process.hrtime.bigint()` y al terminar la respuesta escribe una
linea con status, milisegundos y bytes; el nivel depende del status (2xx/3xx
`info`, 4xx `warn`, 5xx `error`).

Los servicios tambien registran eventos de negocio (partida registrada,
partida rechazada, partida sospechosamente corta).

## Configuracion

Por flags o variables de entorno:

| Flag               | Variable      | Valores                 | Defecto        |
| ------------------ | ------------- | ----------------------- | -------------- |
| `--level=debug`    | `LOG_LEVEL`   | debug, info, warn, error| `info`         |
| `--format=json`    | `LOG_FORMAT`  | pretty, json            | `pretty`       |
| `--file=ruta`      | `LOG_FILE`    | ruta de archivo         | `logs/app.log` |

```bash
npm start
npm run start:debug
npm run start:json
```

## Endpoints

| Metodo | Ruta        | Descripcion                                          |
| ------ | ----------- | ---------------------------------------------------- |
| GET    | `/health`   | Estado                                               |
| GET    | `/teams`    | Equipos registrados                                  |
| GET    | `/matches`  | Partidas registradas                                 |
| POST   | `/matches`  | Registra una partida                                 |
| GET    | `/logs`     | Ultimos logs en memoria (`?level=warn`, `?limit=5`)  |
| GET    | `/crash`    | Fuerza un error 500 para ver el log de error         |

Body de `POST /matches`:

```json
{ "blue": "Nexus Titans", "red": "Void Walkers", "winner": "Void Walkers", "durationMin": 34 }
```

## Ejemplos de peticiones

```bash```

```curl http://localhost:3027/teams```

![alt text](image.png)

```curl -i http://localhost:3027/matches -H "x-request-id: demo-1"```

![alt text](image-1.png)

```curl -X POST http://localhost:3027/matches -H "Content-Type: application/json" -d '{"blue":"Nexus Titans","red":"Void Walkers","winner":"Void Walkers","durationMin":34}'```

![alt text](image-2.png)

```curl -X POST http://localhost:3027/matches -H "Content-Type: application/json" -d '{"blue":"Nexus Titans","red":"Crimson Lane","winner":"Nexus Titans","durationMin":17}'```

![alt text](image-3.png)

```curl -X POST http://localhost:3027/matches -H "Content-Type: application/json" -d '{"blue":"Nexus Titans","red":"Nexus Titans","winner":"Nadie","durationMin":5}'```

![alt text](image-4.png)

```curl http://localhost:3027/nada```

![alt text](image-5.png)

```curl http://localhost:3027/crash```

![alt text](image-6.png)

```curl "http://localhost:3027/logs?level=warn"```

![alt text](image-7.png)
