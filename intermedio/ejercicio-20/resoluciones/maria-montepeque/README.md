# Ejercicio 20 - CORS controlado

API de obras de dibujo digital hecha con Node.js y Express. Usa el
paquete `cors` con una lista blanca de origenes que sale del `.env`, y
una galeria publica que si se puede llamar desde cualquier sitio.

## Que es CORS

Cuando una pagina en `http://localhost:5173` hace `fetch` a esta API en
`http://localhost:3020`, son origenes distintos (cambia el puerto). El
navegador manda el header `Origin` y solo deja que la pagina lea la
respuesta si el servidor contesta con `Access-Control-Allow-Origin`.

- Para `POST` con JSON o `DELETE`, el navegador primero manda un
  **preflight**: una peticion `OPTIONS` preguntando si puede. Si el
  servidor dice que si, manda la peticion de verdad.
- CORS lo revisa el **navegador**. curl o Postman no mandan `Origin` y no
  les aplica, por eso CORS no reemplaza la autenticacion.

## Como esta hecho

`src/config/cors.js` tiene dos configuraciones:

| Config        | Donde se usa      | Origenes                  | Metodos             |
| ------------- | ----------------- | ------------------------- | ------------------- |
| `corsPrivado` | `/api/obras`      | Solo los de `CORS_ORIGINS` | GET, POST, DELETE  |
| `corsPublico` | `/api/galeria`    | Cualquiera (`*`)          | GET                 |

En `corsPrivado`:

- `origin` es una funcion: si el origen esta en la lista lo deja pasar,
  si no responde 403 con un mensaje claro. Si no hay `Origin` (curl,
  otro servidor) tambien pasa.
- `allowedHeaders`: solo `Content-Type` y `Authorization`.
- `exposedHeaders: ["X-Total-Count"]`: sin esto el front no podria leer
  ese header aunque venga en la respuesta.
- `credentials: true`: permite cookies o `Authorization` desde el
  navegador. Por eso no se puede usar `*` aqui, tiene que ser el origen
  exacto.
- `maxAge: 600`: el navegador guarda el resultado del preflight 10
  minutos y no pregunta en cada peticion.

En `app.js` la galeria se monta antes con su cors abierto, y despues
`app.use("/api", cors(corsPrivado))` cubre el resto, incluidos los
`OPTIONS`.

| Carpeta / archivo  | Que hay dentro                                |
| ------------------ | --------------------------------------------- |
| `config.js`        | Lee `.env` y convierte `CORS_ORIGINS` en lista |
| `config/cors.js`   | `corsPrivado` y `corsPublico`                 |
| `routes/`          | `obras.routes.js` y `galeria.routes.js`       |
| `controllers/`     | `obras.controller.js`                         |
| `services/`        | `obras.service.js`                            |
| `utils/`           | `app-error.js`                                |
| `data/`            | `db.js` con las obras en memoria              |

## Variables de entorno

```bash
copy .env.example .env
```

| Variable       | Uso                                         | Por defecto             |
| -------------- | ------------------------------------------- | ----------------------- |
| `PORT`         | Puerto del servidor                         | `3020`                  |
| `CORS_ORIGINS` | Origenes permitidos separados por coma      | `http://localhost:5173` |

Cada origen va con protocolo y puerto y sin `/` al final, por ejemplo
`http://localhost:5173`. `http://localhost:5173/` no coincide.

## Requisitos

Node.js 20 o superior. Sin base de datos.

## Instalacion y ejecucion

```bash
npm install
npm start
```

| Script        | Descripcion                                        |
| ------------- | -------------------------------------------------- |
| `npm start`   | Levanta el servidor en http://localhost:3020       |
| `npm run dev` | Igual pero con recarga automatica (`node --watch`) |

## Endpoints

| Metodo | Ruta              | CORS                | Descripcion                          |
| ------ | ----------------- | ------------------- | ------------------------------------ |
| GET    | `/health`         | Sin CORS            | Comprueba que el servidor vive       |
| GET    | `/api/obras`      | Lista blanca        | Todas las obras, header `X-Total-Count` |
| POST   | `/api/obras`      | Lista blanca        | Crea una obra                        |
| DELETE | `/api/obras/:id`  | Lista blanca        | Borra una obra                       |
| GET    | `/api/galeria`    | Abierto (`*`)       | Solo las obras publicas              |

Body de una obra: `titulo`, `artista`, `programa` (`Procreate`, `Krita`,
`Photoshop`, `Aseprite` o `Clip Studio`) y `publica` opcional (true/false).

## Como probarlo con curl

Con `-i` se ven los headers. El header `Origin` se manda a mano para
simular al navegador.

Origen permitido:

```bash
curl.exe -i http://localhost:3020/api/obras -H "Origin: http://localhost:5173"
```

```text
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Credentials: true
Access-Control-Expose-Headers: X-Total-Count
X-Total-Count: 3
```

Origen que no esta en la lista:

```bash
curl.exe -i http://localhost:3020/api/obras -H "Origin: http://sitio-malo.com"
```

```text
HTTP/1.1 403 Forbidden
{"ok":false,"message":"El origen http://sitio-malo.com no tiene permiso (CORS)"}
```

Preflight como lo haria el navegador antes de un POST:

```bash
curl.exe -i -X OPTIONS http://localhost:3020/api/obras -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: Content-Type"
```

```text
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET,POST,DELETE
Access-Control-Allow-Headers: Content-Type,Authorization
Access-Control-Max-Age: 600
```

Crear una obra desde un origen permitido:

```bash
curl.exe -X POST http://localhost:3020/api/obras -H "Origin: http://localhost:5173" -H "Content-Type: application/json" -d '{\"titulo\":\"Bosque\",\"artista\":\"Lia\",\"programa\":\"Krita\",\"publica\":true}'
```

La galeria responde a cualquier origen:

```bash
curl.exe -i http://localhost:3020/api/galeria -H "Origin: http://sitio-malo.com"
```

```text
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
```

## Probarlo desde el navegador

1. Abre cualquier pagina que no este en la lista, por ejemplo
   `https://example.com`, y en la consola (F12) corre:

   ```js
   fetch("http://localhost:3020/api/obras").then((r) => r.json()).then(console.log);
   ```

   Falla con un error de CORS.

2. Con la galeria si funciona:

   ```js
   fetch("http://localhost:3020/api/galeria").then((r) => r.json()).then(console.log);
   ```

## Casos de error

| Caso                                     | Status | Mensaje                                           |
| ---------------------------------------- | ------ | ------------------------------------------------- |
| Origen fuera de la lista (GET u OPTIONS) | 403    | `El origen http://sitio-malo.com no tiene permiso (CORS)` |
| Obra con datos malos                     | 400    | `Datos invalidos` + lista `errors`                |
| Borrar una obra que no existe            | 404    | `No existe la obra con id 99`                     |

## Notas

Los datos viven en memoria. Si se cambia `CORS_ORIGINS` hay que
reiniciar el servidor.
