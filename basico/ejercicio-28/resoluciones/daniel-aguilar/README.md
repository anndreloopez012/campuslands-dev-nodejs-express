# Ejercicio 28 — Configuración por entorno

**Temática:** battle royale · **Nivel:** Básico guiado

## Objetivo

Hacer que la misma aplicación se comporte distinto en **development**, **test** y **production** sin cambiar el código: perfiles con valores por defecto, variables de entorno que los sobrescriben, secretos fuera del repositorio y validación al arrancar.

## Requisitos

- Node.js 20.6 o superior (necesario para `--env-file`)

## Instalación y ejecución

```bash
npm install

# Desarrollo
cp .env.development.example .env.development     # Windows: copy ...
npm run start:dev          # o: npm run dev (con recarga automática)

# Producción (local, para probar)
cp .env.production.example .env.production       # edita API_KEY con un valor real
npm run start:prod

npm start                  # sin archivo: perfil development por defecto
npm test
```

## Perfiles

| Valor | `development` | `test` | `production` |
| --- | --- | --- | --- |
| `port` (por defecto) | 3000 | 0 (puerto libre al azar) | 8080 |
| `logLevel` | `debug` | `error` | `info` |
| `maxPlayersPerMatch` | 20 | 4 | 100 |
| Rutas de depuración (`/debug/*`) | sí | sí | **no** |
| Variables obligatorias | — | — | `API_KEY` |

Un perfil se elige con `NODE_ENV`; si no está definida se usa `development`.

## Variables de entorno

| Variable | Descripción | Validación |
| --- | --- | --- |
| `NODE_ENV` | Perfil a usar | `development`, `test` o `production` |
| `PORT` | Sobrescribe el puerto del perfil | Entero 1–65535 |
| `LOG_LEVEL` | Sobrescribe el nivel de log | `debug`, `info`, `warn`, `error` |
| `MAX_PLAYERS` | Sobrescribe el máximo de jugadores por partida | Entero 1–1000 |
| `API_KEY` | Secreto; **obligatoria en production** | Texto no vacío |

Orden de prioridad: **variable de entorno > perfil**.

## Estructura

```text
ejercicio-28/
├── .env.development.example
├── .env.production.example
├── package.json
├── README.md
├── src/
│   ├── config.js                      # perfiles, validación y loadConfig(env)
│   ├── app.js                         # createApp(config)
│   ├── server.js                      # falla al arrancar si la config es inválida
│   ├── routes/index.js                # registra /debug solo si debugRoutes
│   └── controllers/match.controller.js
└── test/app.test.js
```

## Seguridad de la configuración

- `.gitignore` excluye `.env` y `.env.*`, salvo los `*.example`, que solo tienen valores ficticios.
- La API key **nunca** se devuelve; `/config` solo informa `apiKeyConfigured: true/false`.
- `loadConfig` devuelve un objeto congelado (`Object.freeze`): no puede modificarse en ejecución.
- **Fail fast:** si falta `API_KEY` en producción o un valor es inválido, el proceso termina con un mensaje claro antes de aceptar tráfico.

## Endpoints

| Método | Ruta | Descripción | Códigos |
| --- | --- | --- | --- |
| GET | `/health` | Estado del servicio | 200 |
| GET | `/basico/ejercicio-28` | Endpoint principal (muestra el entorno) | 200 |
| GET | `/config` | Configuración activa, sin secretos | 200 |
| GET | `/matches/limits` | Máximo de jugadores del entorno | 200 |
| POST | `/matches/join` | Intenta unir `players` jugadores | 201, 400, 422 |
| GET | `/debug/profile` | Datos del proceso (**no existe en production**) | 200 / 404 |

## Ejemplos

```bash
curl http://localhost:3000/config
curl http://localhost:3000/matches/limits

curl -i -X POST http://localhost:3000/matches/join \
  -H "Content-Type: application/json" -d '{"players":25}'
# development (máx. 20) -> 422

curl http://localhost:3000/debug/profile        # 200 en development, 404 en production
```

Probar el fail fast:

```bash
NODE_ENV=production npm start
# Configuracion invalida: Faltan variables obligatorias en produccion: API_KEY
```

## Pruebas

```bash
npm test
```
