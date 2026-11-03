# Avanzado 11 - importacion masiva (Lucas Pajarito)

## Que hace

Tematica **musica**. Expone un endpoint de importacion masiva (`POST /tracks/bulk`) que procesa un lote de canciones, validando cada registro de forma individual y generando un reporte detallado (`insertedCount`, `rejectedCount`, `inserted`, `rejected`). Responde `201` si todos los elementos fueron validos o `207 Multi-Status` si hubo exitos y rechazos parciales.

## Como ejecutar

```bash
npm install
npm start
```

## Como probar

Importacion masiva exitosa:

```bash
curl -X POST http://localhost:4011/tracks/bulk -H "Content-Type: application/json" -d "{\"tracks\":[{\"title\":\"Bohemian Rhapsody\",\"artist\":\"Queen\",\"durationSeconds\":354},{\"title\":\"Starlight\",\"artist\":\"Muse\",\"durationSeconds\":240}]}"
curl http://localhost:4011/tracks
```

## Como probar importacion parcial / errores

```bash
curl -i -X POST http://localhost:4011/tracks/bulk -H "Content-Type: application/json" -d "{\"tracks\":[{\"title\":\"Time\",\"artist\":\"Pink Floyd\",\"durationSeconds\":413},{\"title\":\"\",\"artist\":\"Muse\",\"durationSeconds\":-10}]}"
```

Responde `207` indicando 1 insertado y 1 rechazado con la razon e indice.

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/
│   └── tracks.routes.js
├── controllers/
│   └── tracks.controller.js
└── services/
    └── bulk-tracks.service.js
```
