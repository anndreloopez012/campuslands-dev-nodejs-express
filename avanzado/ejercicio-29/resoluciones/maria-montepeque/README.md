# Avanzado 29 - deploy readiness (futbol y futbol sala)

API de una liga con dos modalidades (futbol 11 y futbol sala), preparada para **desplegarse en produccion**: config validada, chequeos de salud, logs en JSON, apagado ordenado, Dockerfile y un checklist automatico que dice si se puede desplegar.

## Como ejecutar

```bash
cp .env.example .env    # solo como referencia, la app lee las variables del entorno
npm install
npm start               # http://localhost:4029
npm test
DATABASE_URL=postgres://x GIT_SHA=abc123 npm run verificar   # checklist de despliegue
```

Con Docker:

```bash
docker build -t liga-api .
docker run -p 4029:4029 -e DATABASE_URL=postgres://... -e GIT_SHA=$(git rev-parse --short HEAD) liga-api
```

## Checklist de produccion (lo que tiene)

| Tema | Como se resolvio |
| ---- | ---------------- |
| Config | `src/config.js` valida todo al arrancar. En production exige `DATABASE_URL` y `GIT_SHA`. Si falta algo, no arranca (codigo 1) |
| Salud | `/health/live` (el proceso responde) y `/health/ready` (revisa la base de datos con timeout de 500 ms; 503 si falla o si se esta apagando) |
| Version | `/version` dice nombre, version, commit, entorno y version de node |
| Logs | una linea JSON por peticion: nivel, requestId, metodo, ruta, status, ms, ip |
| Request id | `X-Request-Id` (se respeta el del proxy si viene) |
| Seguridad | `nosniff`, `X-Frame-Options: DENY`, CSP, sin `X-Powered-By`, body maximo 10kb |
| Limite | 120 peticiones por minuto por ip (`LIMITE_POR_MINUTO`), 429 con `Retry-After`. La salud no cuenta |
| Errores | un 500 nunca manda el detalle al cliente, solo el `requestId` para buscarlo en los logs |
| Proxy | `CONFIAR_PROXY=true` activa `trust proxy` para que `req.ip` sea la del cliente |
| Apagado | SIGTERM/SIGINT: ready pasa a 503, se espera lo que esta en curso y se corta a los `TIEMPO_APAGADO_MS` |
| Keep-alive | `keepAliveTimeout` 65 s (mas que el balanceador) |
| Docker | `node:20-alpine`, `npm install --omit=dev`, `USER node`, `HEALTHCHECK`, `CMD ["node", ...]` para recibir senales |
| `.dockerignore` | sin `node_modules`, `.env`, tests ni scripts |
| package.json | `engines.node`, `start` sin `--watch`, supertest en devDependencies |

## `npm run verificar`

`scripts/verificar-despliegue.js` revisa el proyecto y la config de production y sale con codigo 1 si algo falla (se puede usar en el CI antes de desplegar):

```text
OK    package.json tiene engines.node (>=20)
OK    npm start no usa --watch ni nodemon (node src/index.js)
OK    Dockerfile no corre como root
OK    Dockerfile tiene HEALTHCHECK
...
OK    config de production valida (commit abc123)

Listo para desplegar
```

## Endpoints

| Metodo | Ruta | Descripcion |
| ------ | ---- | ----------- |
| GET | `/health`, `/health/live`, `/health/ready` | salud |
| GET | `/version` | version y commit |
| GET | `/api/futbol/tabla` y `/api/futbol-sala/tabla` | tabla de posiciones |
| POST | `/api/partidos` | `{ modalidad, local, visitante, golesLocal, golesVisitante }` |

```bash
curl -X POST localhost:4029/api/partidos -H "Content-Type: application/json" \
  -d '{"modalidad":"futbol-sala","local":"Glucosoral","visitante":"Bizcocho FS","golesLocal":5,"golesVisitante":2}'
curl localhost:4029/api/futbol-sala/tabla
curl localhost:4029/health/ready
```

Tabla: 3 puntos por ganar y 1 por empatar; desempata por diferencia de gol, goles a favor y nombre.

## Estructura

```text
Dockerfile
.dockerignore
.env.example
scripts/verificar-despliegue.js
src/
├── index.js            arranque, senales y apagado
├── app.js
├── config.js
├── http/
│   ├── salud.js        live, ready (con timeout) y version
│   └── middlewares.js  request id, log JSON, seguridad, limite por ip
└── servicios/liga.js
```
