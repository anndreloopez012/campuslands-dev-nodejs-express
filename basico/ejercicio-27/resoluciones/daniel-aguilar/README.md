# Ejercicio 27 — Logs simples

**Temática:** MOBA esports · **Nivel:** Básico guiado

## Objetivo

Registrar lo que ocurre en la API con un **logger propio y simple**: niveles (`debug`, `info`, `warn`, `error`), marca de tiempo, una línea por petición, eventos de negocio y protección de datos sensibles.

## Requisitos

- Node.js 20 o superior

## Instalación y ejecución

```bash
npm install
npm start
npm run dev
npm test
```

Variables opcionales:

| Variable | Por defecto | Descripción |
| --- | --- | --- |
| `PORT` | `3000` | Puerto del servidor |
| `LOG_LEVEL` | `info` | Nivel mínimo a registrar: `debug`, `info`, `warn`, `error` |
| `LOG_FILE` | _(vacío)_ | Si se define, además de la consola se agrega cada línea a ese archivo |

```bash
LOG_LEVEL=debug npm start                  # Linux / macOS
LOG_FILE=logs/app.log npm start            # guarda en archivo (logs/ está en .gitignore)
$env:LOG_LEVEL="debug"; npm start          # PowerShell
```

## Estructura

```text
ejercicio-27/
├── package.json
├── README.md
├── src/
│   ├── app.js                         # createApp({ logger })
│   ├── server.js                      # lee LOG_LEVEL / LOG_FILE
│   ├── utils/logger.js                # createLogger, redacción, escritor a archivo
│   ├── middlewares/request-logger.js  # una línea por petición
│   ├── routes/index.js
│   └── controllers/heroes.controller.js
└── test/app.test.js
```

## Formato de los logs

```text
2026-10-03T16:20:00.000Z INFO  GET /heroes 200 1.8ms
2026-10-03T16:20:03.412Z WARN  GET /heroes/99 404 0.9ms
2026-10-03T16:20:08.101Z INFO  Partida registrada {"id":1,"mode":"ranked","durationMin":32,"winner":"azul"}
2026-10-03T16:20:11.774Z INFO  Intento de login {"user":"ana","password":"[REDACTED]"}
2026-10-03T16:20:15.020Z ERROR Error no controlado: Fallo simulado del servidor {"stack":"Error: ..."}
```

| Nivel | Cuándo |
| --- | --- |
| `debug` | Detalle para desarrollo |
| `info` | Operación normal (peticiones 2xx/3xx, eventos de negocio) |
| `warn` | Algo anómalo pero controlado (peticiones 4xx, datos rechazados) |
| `error` | Fallos (peticiones 5xx, errores inesperados) |

Con `LOG_LEVEL=warn` solo se ven `warn` y `error`.

## Endpoints

| Método | Ruta | Descripción | Códigos |
| --- | --- | --- | --- |
| GET | `/health` | Estado del servicio | 200 |
| GET | `/basico/ejercicio-27` | Endpoint principal | 200 |
| GET | `/heroes` | Lista de héroes | 200 |
| GET | `/heroes/:id` | Detalle (genera WARN si no existe) | 200, 400, 404 |
| POST | `/matches` | Registra una partida (evento de negocio) | 201, 400 |
| POST | `/auth/demo` | Demuestra la redacción de contraseñas | 200 |
| GET | `/boom` | Fuerza un error 500 para ver el log `ERROR` | 500 |

## Ejemplos

```bash
curl http://localhost:3000/heroes
curl -i http://localhost:3000/heroes/99

curl -X POST http://localhost:3000/matches \
  -H "Content-Type: application/json" \
  -d '{"mode":"ranked","durationMin":32,"winner":"azul"}'

curl -X POST http://localhost:3000/auth/demo \
  -H "Content-Type: application/json" \
  -d '{"user":"ana","password":"super-secreta"}'

curl -i http://localhost:3000/boom
```

Después de cada comando, mira la consola del servidor.

## Buenas prácticas aplicadas

- **Nunca** se registran contraseñas, tokens ni API keys: `redact()` los reemplaza por `[REDACTED]`, incluso dentro de objetos anidados.
- El **cliente no ve** el detalle de los errores inesperados; el detalle (incluido el `stack`) queda en el log.
- El logger se **inyecta** en la aplicación (`createApp({ logger })`), así las pruebas capturan las líneas sin ensuciar la consola.
- `LOG_LEVEL` se valida al arrancar: un valor inválido detiene el servidor con un mensaje claro.

## Pruebas

```bash
npm test
```
