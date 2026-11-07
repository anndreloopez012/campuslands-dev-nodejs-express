# Avanzado 27: configuracion validada al iniciar

Solucion Node.js/Express con capas separadas: rutas, controladores, servicio de dominio y middleware de errores. Los datos son en memoria y se reinician al apagar el proceso.. Las capas separan contrato HTTP (`routes`), adaptacion (`controllers`), reglas (`services`) y manejo uniforme de errores (`middlewares`). Datos en memoria reiniciados al apagar el proceso.

## Ejecucion

```bash
npm install
npm run dev
```

## Endpoints

- `GET /health`
- `GET /config`

Las respuestas correctas usan `data`; los errores incluyen codigo y request id.

Variables disponibles: `NODE_ENV`, `PORT`, `FEATURE_MAPS` y `FEATURE_LEADERBOARD`. La configuracion se valida al iniciar.
