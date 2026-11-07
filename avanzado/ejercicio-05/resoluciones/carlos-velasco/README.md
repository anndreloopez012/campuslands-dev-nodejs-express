# Avanzado 05: transacciones simuladas

Solucion Node.js/Express con capas separadas: rutas, controladores, servicio de dominio y middleware de errores. Los datos son en memoria y se reinician al apagar el proceso.

## Ejecutar

```bash
npm install
npm run dev
```

## Endpoints

- `GET /health`
- `GET /inventory`
- `POST /purchases`

Todas las respuestas correctas usan `{data: ...}`; los errores incluyen codigo y request id.
