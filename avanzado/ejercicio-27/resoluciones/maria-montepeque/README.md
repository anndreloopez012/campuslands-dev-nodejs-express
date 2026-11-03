# Avanzado 27 - manejo de configuracion avanzada (MOBA esports)

API de draft de un MOBA (los equipos azul y rojo banean y eligen heroes por turnos). Las reglas del draft, la region, los feature flags y los secretos salen de una **configuracion por capas, tipada y validada**, hecha a mano sin librerias (ni dotenv).

## Como ejecutar

```bash
cp .env.example .env
npm install
npm start      # http://localhost:4027
npm test
```

Probar el "fail fast":

```bash
NODE_ENV=production PORT=abc node src/server.js
# Configuracion invalida:
#  - puerto (PORT, desde env) debe ser un entero (llego "abc")
#  - secretos.apiKeyEstadisticas es obligatoria en production (variable API_KEY_ESTADISTICAS)
#  - secretos.jwtSecreto es obligatoria en production (variable JWT_SECRETO)
#  - urlBase debe ser https en production
```

## Capas (la de abajo gana)

1. **Defecto** del esquema (`src/config/esquema.js`)
2. **`config/<NODE_ENV>.json`**: lo que cambia por entorno y NO es secreto (se sube al repo)
3. **`.env`**: para desarrollo local (no se sube; esta `.env.example`)
4. **Variables de entorno reales**: lo que pone el servidor, Docker o la nube

## Lo que hace el cargador (`src/config/cargar.js`)

- **Esquema unico**: cada opcion dice su variable, tipo, defecto, limites, si es secreta y en que entornos es obligatoria.
- **Tipos**: `entero` (con min/max), `booleano` (true/1/si/on), `enum`, `url`, `duracion` (`250ms`, `30s`, `5m`, `1h` -> ms), `texto` (con largo minimo).
- **Junta todos los errores** y los muestra juntos, con de donde vino cada valor (env, archivo o defecto).
- **Reglas cruzadas**: bans <= tamano del equipo; en production `urlBase` debe ser https.
- **Secretos**: obligatorios en production (no vale el defecto de desarrollo) y **prohibidos en `config/*.json`**.
- **Congelada** (`Object.freeze` profundo): nadie la cambia en tiempo de ejecucion.
- **`configPublica`**: copia para mostrar, los secretos salen como `"[configurado]"`.
- La app **recibe** la config ya validada (`crearApp(config)`), no lee `process.env` por su cuenta. Asi los tests pasan la config que quieren.

## Opciones

| Opcion | Variable | Tipo | Defecto |
| ------ | -------- | ---- | ------- |
| puerto | `PORT` | entero 1-65535 | 4027 |
| entorno | `NODE_ENV` | development, test, production | development |
| region | `REGION` | LAN, LAS, NA, EUW, KR | LAN |
| urlBase | `URL_BASE` | url | http://localhost:4027 |
| logNivel | `LOG_NIVEL` | debug, info, warn, error | info |
| draft.tamanoEquipo | `DRAFT_TAMANO_EQUIPO` | entero 1-5 | 5 |
| draft.bansPorEquipo | `DRAFT_BANS` | entero 0-5 | 3 |
| draft.tiempoTurno | `DRAFT_TIEMPO_TURNO` | duracion | 30s |
| funciones.modoRanked | `FUNCION_RANKED` | booleano | false |
| funciones.heroesNuevos | `FUNCION_HEROES_NUEVOS` | booleano | false |
| secretos.apiKeyEstadisticas | `API_KEY_ESTADISTICAS` | texto (20+) | obligatoria en production |
| secretos.jwtSecreto | `JWT_SECRETO` | texto (32+) | obligatoria en production |

## Endpoints

| Metodo | Ruta | Descripcion |
| ------ | ---- | ----------- |
| GET | `/health` | estado |
| GET | `/api/config` | config sin secretos (404 en production) |
| GET | `/api/heroes` | heroes habilitados (mas con `FUNCION_HEROES_NUEVOS`) |
| POST | `/api/drafts` | empezar un draft |
| GET | `/api/drafts/:id` | estado, turno actual y segundos restantes |
| POST | `/api/drafts/:id/acciones` | `{ "equipo": "azul", "tipo": "ban", "heroe": "Aurora" }` |
| GET | `/api/ranked/temporada` | solo si `FUNCION_RANKED=true` |

```bash
curl localhost:4027/api/config
curl -X POST localhost:4027/api/drafts
curl -X POST localhost:4027/api/drafts/1/acciones -H "Content-Type: application/json" -d '{"equipo":"azul","tipo":"ban","heroe":"Aurora"}'
```

## Estructura

```text
config/
├── development.json
├── test.json
└── production.json
src/
├── app.js
├── server.js            carga la config y si esta mal sale con codigo 1
├── config/
│   ├── esquema.js
│   ├── dotenv.js        lector de .env hecho a mano
│   └── cargar.js        capas, tipos, validacion, congelado
└── servicios/draft.js
```
