# Ejercicio 23 - datos en memoria (Maria Montepeque)

## Que hace

API de inventario de electrodos de soldadura construida solo con `node:http`
(sin Express). Los datos viven **solo en memoria** del proceso: se cargan
desde una semilla al arrancar y se pierden al reiniciar el servidor.

- `src/core/memory-store.js`: `createMemoryStore(seed)`, un almacen generico
  sobre `Map` con `insert`, `findAll`, `findById`, `update`, `remove` y
  `reset`. Asigna ids incrementales y marca `createdAt` / `updatedAt`.
- `src/data/electrodes.seed.js`: datos iniciales.
- `src/services/electrodes.service.js`: reglas de negocio sobre el almacen:
  validacion AWS del `code`, duplicados (409), ajuste de stock con `delta`
  (no permite stock negativo) y alerta `lowStock` calculada al vuelo.
- `GET /stats` muestra cuantos registros hay, el stock total, el uptime y la
  memoria usada, para evidenciar que todo vive en el proceso.
- `POST /reset` vuelve a cargar la semilla.

## Endpoints

| Metodo | Ruta                          | Descripcion                                    |
| ------ | ----------------------------- | ---------------------------------------------- |
| GET    | `/health`                     | Estado de la API                               |
| GET    | `/electrodes`                 | Lista (`?process=SMAW`, `?lowStock=true`)      |
| GET    | `/electrodes/:id`             | Detalle                                        |
| POST   | `/electrodes`                 | Crea un electrodo                              |
| PATCH  | `/electrodes/:id/stock`       | Ajusta stock con `{ "delta": -5 }` o `{ "delta": 20 }` |
| DELETE | `/electrodes/:id`             | Elimina (204)                                  |
| GET    | `/stats`                      | Metricas del inventario en memoria             |
| POST   | `/reset`                      | Restaura la semilla                            |

Body de `POST /electrodes`:

```json
{ "code": "E308L", "diameterMm": 2.5, "process": "SMAW", "stock": 60, "minStock": 25 }
```

## Como ejecutar

```bash
npm install
npm start
```

## Ejemplos de peticiones

```bash```

```curl "http://localhost:3023/electrodes?lowStock=true"```

![alt text](docs/image/image.png)

```curl http://localhost:3023/electrodes```

![alt text](docs/image/image-1.png)

```curl "http://localhost:3023/electrodes?process=smaw"```

![alt text](docs/image/image-2.png)

```curl http://localhost:3023/electrodes/2```

![alt text](docs/image/image-3.png)

```curl -i -X POST http://localhost:3023/electrodes -H "Content-Type: application/json" -d '{"code":"E308L","diameterMm":2.5,"process":"SMAW","stock":60,"minStock":25}'```

![alt text](docs/image/image-4.png)

```curl -i -X POST http://localhost:3023/electrodes -H "Content-Type: application/json" -d '{"code":"E308L","diameterMm":2.5,"process":"SMAW","stock":1,"minStock":1}'```

![alt text](docs/image/image-5.png)

```curl -i -X POST http://localhost:3023/electrodes -H "Content-Type: application/json" -d '{"code":"varilla","diameterMm":0,"process":"LASER","stock":-1,"minStock":"x"}'```

![alt text](docs/image/image-6.png)

```curl -X PATCH http://localhost:3023/electrodes/2/stock -H "Content-Type: application/json" -d '{"delta":20}'```

![alt text](docs/image/image-7.png)

```curl -i -X PATCH http://localhost:3023/electrodes/2/stock -H "Content-Type: application/json" -d '{"delta":-500}'```

![alt text](docs/image/image-8.png)

```curl -i -X DELETE http://localhost:3023/electrodes/4```

![alt text](docs/image/image-9.png)

```curl -i -X DELETE http://localhost:3023/electrodes/4```

![alt text](docs/image/image-10.png)

```curl http://localhost:3023/stats```

![alt text](docs/image/image-11.png)

```curl -X POST http://localhost:3023/reset```

![alt text](docs/image/image-12.png)

```curl http://localhost:3023/stats```

![alt text](docs/image/image-13.png)