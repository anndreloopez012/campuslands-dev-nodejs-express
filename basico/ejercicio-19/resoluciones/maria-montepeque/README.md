# Ejercicio 19 - req.params y req.query (Maria Montepeque)

## Que hace

API de un estudio de tatuajes enfocada en `req.params` y `req.query`,
construida solo con `node:http` (sin Express).

- `src/core/router.js`: enrutador GET que extrae parametros de ruta
  (`:artistId`, `:designId`, `:size`) en `req.params` y la query string en
  `req.query`.
- `src/core/query.js`: `parseQuery(query, schema)` convierte y valida la
  query (tipo, valores permitidos, minimos, maximos y valores por defecto).
- `src/services/studio.service.js`: filtra, ordena y pagina disenos por
  artista y cotiza un diseno segun su tamano.
- `src/controllers/studio.controller.js`: valida params, aplica el esquema de
  query y responde 200, 400 o 404.

## Endpoints

| Ruta                                  | Params                | Query                                          |
| ------------------------------------- | --------------------- | ---------------------------------------------- |
| `GET /artists`                        | -                     | -                                              |
| `GET /artists/:artistId`              | `artistId` entero     | -                                              |
| `GET /artists/:artistId/designs`      | `artistId` entero     | `style`, `maxPrice`, `sort`, `order`, `page`, `limit` |
| `GET /designs/:designId/quote/:size`  | `designId`, `size`    | -                                              |

Reglas de query en `/designs`:

- `sort`: `name` (defecto) o `basePrice`.
- `order`: `asc` (defecto) o `desc`.
- `page`: entero >= 1 (defecto 1).
- `limit`: entero entre 1 y 5 (defecto 5).
- `maxPrice`: numero >= 0.

`size` acepta `small`, `medium` o `large`.

## Como ejecutar

```bash
npm install
npm start
```

## Ejemplos de peticiones

```bash```

```curl http://localhost:3019/artists```

![alt text](image.png)

```curl http://localhost:3019/artists/1```

![alt text](image-1.png)

```curl -i http://localhost:3019/artists/abc```

![alt text](image-2.png)

```curl -i http://localhost:3019/artists/99```

![alt text](image-3.png)

```curl http://localhost:3019/artists/1/designs```

![alt text](image-4.png)

```curl "http://localhost:3019/artists/1/designs?style=blackwork&sort=basePrice&order=desc"```

![alt text](image-5.png)

```curl "http://localhost:3019/artists/1/designs?maxPrice=180&page=1&limit=1"```

![alt text](image-6.png)

```curl -i "http://localhost:3019/artists/1/designs?sort=color&limit=50"```

![alt text](image-7.png)

```curl http://localhost:3019/designs/104/quote/large```

![alt text](image-8.png)

```curl -i http://localhost:3019/designs/104/quote/xl```

![alt text](image-9.png)

```curl -i http://localhost:3019/designs/999/quote/small```

![alt text](image-10.png)