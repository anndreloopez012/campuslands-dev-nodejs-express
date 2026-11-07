# Avanzado 30: integracion de expediciones con auditoria

Solucion Node.js/Express con capas separadas: rutas, controladores, servicio de dominio y middleware de errores. Los datos son en memoria y se reinician al apagar el proceso.. Las capas separan contrato HTTP (`routes`), adaptacion (`controllers`), reglas (`services`) y manejo uniforme de errores (`middlewares`). Datos en memoria reiniciados al apagar el proceso.

## Ejecucion

```bash
npm install
npm run dev
```

## Endpoints

- `GET /health`
- `GET /expeditions`
- `POST /expeditions`
- `POST /expeditions/:id/complete`
- `GET /audit`

Las respuestas correctas usan `data`; los errores incluyen codigo y request id.

El servicio valida transiciones planned a completed y agrega cada accion al registro de auditoria.
