# Ejercicio 19 — `req.params` y `req.query`

**Temática:** tatuajes · **Nivel:** Básico inicial

## Objetivo

Distinguir y validar las dos formas de recibir datos en la URL:

- **`req.params`**: parte de la ruta, identifica *qué recurso* (`/artists/3`).
- **`req.query`**: después del `?`, afina *cómo* se consulta (`?style=realismo&limit=5`).

## Requisitos

- Node.js 20 o superior

## Instalación y ejecución

```bash
npm install
npm start
npm run dev
npm test
```

Servidor en `http://localhost:3000` (configurable con `PORT`).

## Estructura

```text
ejercicio-19/
├── package.json
├── README.md
├── src/
│   ├── app.js
│   ├── server.js
│   ├── data/studios.js
│   ├── utils/query.js                 # parseInteger, parsePositiveNumber, parseList
│   ├── routes/index.js
│   └── controllers/artists.controller.js
└── test/app.test.js
```

## Endpoints

| Método | Ruta | Usa | Códigos |
| --- | --- | --- | --- |
| GET | `/health` | — | 200 |
| GET | `/basico/ejercicio-19` | — | 200 |
| GET | `/artists` | `style`, `maxRate`, `sort`, `order`, `limit` | 200, 400 |
| GET | `/artists/:id` | `params.id` | 200, 400, 404 |
| GET | `/artists/:id/works` | `params.id` + `style`, `minHours` | 200, 400, 404 |
| GET | `/studios/:studio/artists/:artistId` | dos parámetros de ruta | 200, 400, 404 |

### Parámetros de `GET /artists`

| Parámetro | Regla | Por defecto |
| --- | --- | --- |
| `style` | Texto; se puede repetir (`?style=a&style=b`) | sin filtro |
| `maxRate` | Número positivo (tarifa máxima por hora) | sin filtro |
| `sort` | `name` o `hourlyRate` | `name` |
| `order` | `asc` o `desc` | `asc` |
| `limit` | Entero de 1 a 20 | `10` |

## Ejemplos

```bash
curl http://localhost:3000/artists/3
curl "http://localhost:3000/artists?style=realismo"
curl "http://localhost:3000/artists?style=realismo&style=minimalista"
curl "http://localhost:3000/artists?maxRate=50&sort=hourlyRate&order=desc"
curl "http://localhost:3000/artists/1/works?minHours=7"
curl http://localhost:3000/studios/tinta-viva/artists/2

curl -i "http://localhost:3000/artists?limit=0"          # 400
curl -i "http://localhost:3000/artists?sort=password"    # 400 (lista blanca)
```

## Conceptos aplicados

- Todo en `req.params` y `req.query` llega como **texto**; se convierte y se valida antes de usarlo.
- Un parámetro repetido llega como **arreglo**; `parseList` lo normaliza siempre.
- `sort` se compara contra una **lista blanca** para no ordenar por campos arbitrarios.
- Valores por defecto con `??` (`req.query.sort ?? 'name'`).

## Pruebas

```bash
npm test
```
