# Ejercicio 25 - respuestas HTTP correctas (Maria Montepeque)

## Que hace

API de un gremio de heroes RPG construida solo con `node:http` (sin
Express), enfocada en que **cada respuesta HTTP sea correcta**: codigo de
estado adecuado, cabeceras coherentes y un formato de error estandar.

`src/core/reply.js` centraliza las respuestas:

| Helper        | Codigo | Que garantiza                                                    |
| ------------- | ------ | ---------------------------------------------------------------- |
| `ok`          | 200    | `Content-Type`, `Content-Length` y `X-Request-Id` en todo JSON   |
| `created`     | 201    | Cabecera `Location` apuntando al recurso nuevo                   |
| `noContent`   | 204    | Sin body                                                         |
| `cached`      | 200/304| `ETag` + `Cache-Control`; responde 304 si `If-None-Match` coincide |
| `problem`     | 4xx/5xx| Body `application/problem+json` (RFC 9457) con `title`, `status`, `detail`, `instance` |

Ademas `src/app.js`:

- Asigna un `X-Request-Id` a cada peticion y lo devuelve siempre.
- Responde **406** si el cliente no acepta JSON (`Accept: text/html`).
- Responde **405** con cabecera `Allow` cuando la ruta existe pero el metodo no.
- Soporta **HEAD** en las rutas GET (mismas cabeceras, sin body).
- Traduce `HttpError` a su codigo (415 sin `Content-Type` JSON, 400 JSON
  malformado) y cualquier error inesperado a 500 sin filtrar detalles.

Las validaciones de negocio responden **422** (datos bien formados pero
invalidos) con una lista de `errors` por campo, y los conflictos de estado
(nombre repetido, nivel maximo alcanzado) responden **409**.

## Endpoints

| Metodo | Ruta                    | Respuestas posibles                 |
| ------ | ----------------------- | ----------------------------------- |
| GET    | `/health`               | 200 (`Cache-Control: no-store`)     |
| GET    | `/heroes`               | 200, 304                            |
| POST   | `/heroes`               | 201, 400, 409, 415, 422             |
| GET    | `/heroes/:id`           | 200, 304, 400, 404                  |
| POST   | `/heroes/:id/level-up`  | 200, 400, 404, 409                  |
| DELETE | `/heroes/:id`           | 204, 400, 404                       |

Body de `POST /heroes`:

```json
{ "name": "Lyra", "class": "picaro", "level": 3 }
```

## Como ejecutar

```bash
npm install
npm start
```

## Ejemplos de peticiones

```bash```

```curl -i http://localhost:3025/heroes```

![alt text](image.png)

```curl -i http://localhost:3025/heroes/1 -H 'If-None-Match: "<etag de la respuesta anterior>"'```

![alt text](image-1.png)

```curl -I http://localhost:3025/heroes```

![alt text](image-2.png)

```curl -i http://localhost:3025/heroes -H "Accept: text/html"```

![alt text](image-3.png)

```curl -i -X PUT http://localhost:3025/heroes```

![alt text](image-4.png)

```curl -i -X POST http://localhost:3025/heroes -d '{"name":"Lyra"}'```

![alt text](image-5.png)

```curl -i -X POST http://localhost:3025/heroes -H "Content-Type: application/json" -d '{rota'```

![alt text](image-6.png)

```curl -i -X POST http://localhost:3025/heroes -H "Content-Type: application/json" -d '{"name":"L","class":"bardo","level":99}'```

![alt text](image-7.png)

```curl -i -X POST http://localhost:3025/heroes -H "Content-Type: application/json" -d '{"name":"Lyra","class":"picaro","level":3}'```

![alt text](image-8.png)

```curl -i -X POST http://localhost:3025/heroes -H "Content-Type: application/json" -d '{"name":"lyra","class":"mago","level":1}'```

![alt text](image-9.png)

```curl -i -X POST http://localhost:3025/heroes/3/level-up```

![alt text](image-10.png)

```curl -i -X POST http://localhost:3025/heroes/2/level-up```

![alt text](image-11.png)

```curl -i http://localhost:3025/heroes/abc```

![alt text](image-12.png)

```curl -i -X DELETE http://localhost:3025/heroes/3```

![alt text](image-13.png)

```curl -i -X DELETE http://localhost:3025/heroes/3```

![alt text](image-14.png)
