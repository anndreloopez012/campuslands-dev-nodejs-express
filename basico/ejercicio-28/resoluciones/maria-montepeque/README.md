# Ejercicio 28 - configuracion por entorno (Maria Montepeque)

## Que hace

API de lobby de un battle royale construida solo con `node:http` (sin
Express), enfocada en **configuracion por entorno** validada y trazable.

- `src/config/schema.js`: declara cada variable con su tipo (`number`,
  `string`, `boolean`, `list`), valor por defecto (fijo o distinto por
  entorno), si es secreta y en que entornos es obligatoria.
- `src/config/index.js`: `loadConfig()` resuelve el entorno (`--env=` o
  `NODE_ENV`, por defecto `development`), toma cada valor de las variables de
  entorno o del defecto del entorno, lo convierte al tipo declarado, valida y
  registra la **fuente** de cada valor (`environment` / `default`). Si algo es
  invalido o falta un secreto obligatorio, el servidor no arranca.
- `redact()` enmascara los secretos antes de exponerlos.
- La app se construye con la configuracion inyectada (`createApp(config)`),
  y las rutas de debug solo existen si `FEATURE_DEBUG_ROUTES` esta activo.

Las variables se cargan desde un archivo `.env` con `--env-file-if-exists`
de Node (sin dependencias). Copia `config/example.env` a `.env` para
sobrescribir los valores por defecto; `.env` esta ignorado por git.

## Variables

| Variable               | Tipo    | development | staging | production | Notas                          |
| ---------------------- | ------- | ----------- | ------- | ---------- | ------------------------------ |
| `PORT`                 | number  | 3028        | 3028    | 3028       |                                |
| `LOBBY_SIZE`           | number  | 4           | 20      | 100        |                                |
| `ZONE_SHRINK_SECONDS`  | number  | 10          | 60      | 180        |                                |
| `MAP_NAME`             | string  | Isla Delta  | Isla Delta | Isla Delta |                             |
| `FEATURE_RANKED`       | boolean | true        | true    | false      |                                |
| `FEATURE_DEBUG_ROUTES` | boolean | true        | false   | false      | expone `/debug/config`         |
| `ANTICHEAT_KEY`        | string  | -           | -       | -          | secreta; obligatoria en staging y production |
| `REGIONS`              | list    | sa-east,us-east | ... | ...        | separada por comas             |

## Como ejecutar

```bash
npm install
npm start
npm run start:staging
npm run start:prod
npm run config:check
npm run config:check -- --env=production
```

## Ejemplos de peticiones

```bash```

```curl http://localhost:3028/health```

![alt text](image.png)

```curl http://localhost:3028/match```

![alt text](image-1.png)

```curl "http://localhost:3028/lobby/join/nova?ranked=true"```

![alt text](image-2.png)

```curl http://localhost:3028/debug/config```

![alt text](image-3.png)


En `production`: `/debug/config` responde 404, `ranked=true` responde 403 y el
lobby admite 100 jugadores; ademas exige `ANTICHEAT_KEY` en el `.env`.
