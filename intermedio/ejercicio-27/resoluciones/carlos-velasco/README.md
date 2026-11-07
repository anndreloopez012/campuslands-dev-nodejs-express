# INTERMEDIO 27 - Documentacion de endpoints

## Objetivo

Crear una API Node.js con Express cuya documentacion sea **self-service**: la propia API expone `/docs` (human-readable) y `/openapi.json` (OpenAPI 3.0, importable en Swagger UI o Postman) generados desde una unica fuente de verdad en el codigo.

## Concepto principal

La documentacion viva resuelve el problema clasico: el README se desincroniza del codigo. Aqui la fuente unica es `src/docs/api.docs.js`, que **declara cada endpoint ANTES de implementarlo**:

```js
{
  metodo: 'POST',
  ruta: '/partidas',
  resumen: 'Programa una partida sobre un campeon existente',
  body: { campeonId: 'integer (referencial)', titulo: 'string (min 3)', formato: '["bo1","bo3","bo5"]' },
  respuestas: [{ codigo: 201, ... }, { codigo: 400, ... }]
}
```

Y dos generadores leen esa declaracion:

- `aOpenapi()` produce un `openapi 3.0.3` oficial: paths con parametros `{$1}`, requestBody y responses.
- `/docs` produce el listado legible por grupos.

Ventaja extra: si importas `http://localhost:3000/openapi.json` en Swagger Editor veras la API graficada exactamente como esta implementada.

## Estructura del proyecto

```text
resoluciones/carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── docs/
    │   └── api.docs.js           (fuente unica de verdad)
    ├── errors/
    │   └── app.error.js
    ├── middlewares/
    │   └── error.handler.js
    ├── routes/
    │   ├── api.routes.js         (implementacion de negocio)
    │   └── index.routes.js       (publica /docs y /openapi.json)
    ├── controllers/
    │   ├── champions.controller.js
    │   └── matches.controller.js
    └── services/
        ├── champions.service.js
        └── matches.service.js
```

## Como ejecutar

```bash
npm install
npm run start
```

## Endpoints

| Metodo | Ruta          | Descripcion                       | Codigo |
| ------ | ------------- | --------------------------------- | ------ |
| GET    | /health       | Estado y rutas de documentacion   | 200    |
| GET    | /docs         | Documentacion human-readable      | 200    |
| GET    | /openapi.json | Especificacion OpenAPI 3.0        | 200    |
| GET    | /campeones    | Lista campeones (query `rol=`)    | 200 / 400 |
| GET    | /campeones/:id| Detalle                           | 200 / 404 |
| POST   | /campeones    | Crea campeon                      | 201 / 400 |
| GET    | /partidas     | Partidas con campeon embebido     | 200    |
| POST   | /partidas     | Programa partida                  | 201 / 400 |

## Ejemplos de peticiones

```bash
# La API se auto-documenta
curl http://localhost:3000/docs | head -c 600
curl http://localhost:3000/openapi.json | head -c 400

# Usar la documentacion como cliente: campeon por query
curl "http://localhost:3000/campeones?rol=asesina"

# Caso documentado: POST /campeones con el body del ejemplo openapi
curl -X POST http://localhost:3000/campeones \
  -H "Content-Type: application/json" \
  -d '{"name": "Orion", "rol": "mago", "danioBase": 55, "dificultad": "media"}'

# Caso documentado: error 400
curl -X POST http://localhost:3000/campeones \
  -H "Content-Type: application/json" \
  -d '{"name": "Bo", "rol": "piloto", "danioBase": 55, "dificultad": "media"}'

# POST /partidas referencial
curl -X POST http://localhost:3000/partidas \
  -H "Content-Type: application/json" \
  -d '{"campeonId": 1, "titulo": "Grand Final", "formato": "bo5"}'
```

## Punto clave

Documentar en codigo es la unica manera de que no se desincronice: cada vez que se agrega un endpoint se agrega su declaracion en la fuente unica, y la misma sigue viva en `/docs` y `/openapi.json` sin duplicar informacion.
