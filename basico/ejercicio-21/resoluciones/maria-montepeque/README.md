# Ejercicio 21 - estructura src routes controllers (Maria Montepeque)

## Que hace

API de un estudio de animacion 3D construida solo con `node:http` (sin
Express), enfocada en una estructura de carpetas por capas con routers
montables por prefijo, al estilo de `Router()` + `app.use("/prefijo", router)`.

```text
src/
├── server.js                  levanta el servidor (puerto 3021)
├── app.js                     router raiz, monta /api, 404 y 405
├── core/
│   ├── router.js              createRouter(): get, post, use(prefix, router)
│   └── http.js                json() y readJson()
├── routes/
│   ├── index.js               /health y monta /rigs y /renders
│   ├── rigs.routes.js
│   └── renders.routes.js
├── controllers/
│   ├── rigs.controller.js     valida params y responde HTTP
│   └── renders.controller.js
├── services/
│   ├── rigs.service.js        logica de negocio
│   └── renders.service.js     calcula el tiempo estimado de render
└── data/
    └── rigs.js                datos semilla
```

Cada capa tiene una responsabilidad: `routes` solo declara rutas,
`controllers` traduce HTTP a llamadas de servicio y `services` no conoce
`req`/`res`.

## Endpoints

| Metodo | Ruta                    | Descripcion                              |
| ------ | ----------------------- | ---------------------------------------- |
| GET    | `/`                     | Lista todos los endpoints montados       |
| GET    | `/api/health`           | Estado de la API                         |
| GET    | `/api/rigs`             | Lista de rigs (`?type=biped`)            |
| GET    | `/api/rigs/:id`         | Detalle de un rig                        |
| GET    | `/api/renders`          | Lista de trabajos de render              |
| POST   | `/api/renders`          | Encola un render (body JSON)             |
| GET    | `/api/renders/:id`      | Detalle de un render                     |

Body de `POST /api/renders`:

```json
{ "rigId": 1, "frames": 240, "resolution": "1080p" }
```

`resolution` acepta `720p`, `1080p` o `4k`. El tiempo estimado se calcula
con 1.5 s por frame multiplicado por el factor de la resolucion.

## Como ejecutar

```bash
npm install
npm start
```

## Ejemplos de peticiones

```bash```

```curl http://localhost:3021/```

![alt text](image.png)

```curl http://localhost:3021/api/health```

![alt text](image-1.png)

```curl http://localhost:3021/api/rigs```

![alt text](image-2.png)

```curl "http://localhost:3021/api/rigs?type=quadruped"```

![alt text](image-3.png)

```curl http://localhost:3021/api/rigs/1```

![alt text](image-4.png)

```curl -i http://localhost:3021/api/rigs/9```

![alt text](image-5.png)

```curl -i -X POST http://localhost:3021/api/renders -H "Content-Type: application/json" -d '{"rigId":1,"frames":240,"resolution":"1080p"}'```

![alt text](image-6.png)

```curl -i -X POST http://localhost:3021/api/renders -H "Content-Type: application/json" -d '{"rigId":9,"frames":0,"resolution":"8k"}'```

![](image-7.png)

```curl http://localhost:3021/api/renders```

![alt text](image-8.png)

```curl http://localhost:3021/api/renders/1```

![alt text](image-9.png)

```curl -i -X DELETE http://localhost:3021/api/rigs```

![alt text](image-10.png)
