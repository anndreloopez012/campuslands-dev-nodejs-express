# Configuración avanzada para MOBA esports

Configuración centralizada, validada al iniciar y separada de la lógica HTTP. Los valores por defecto permiten ejecutar el servicio sin un archivo `.env`.

## Inicio

```bash
npm install
npm start
```

Puedes copiar `.env.example` como `.env` o definir variables en el entorno. `PORT` debe estar entre 1 y 65535; `NODE_ENV` acepta `development`, `test` o `production`; `LOG_LEVEL` acepta `error`, `warn`, `info` o `debug`; `TRUST_PROXY` acepta `true` o `false`.

## Rutas

- `GET /health`: estado y nombre del servicio.
- `GET /api/arena`: configuración pública del entorno de arena.

Los valores sensibles no forman parte de la respuesta pública.
