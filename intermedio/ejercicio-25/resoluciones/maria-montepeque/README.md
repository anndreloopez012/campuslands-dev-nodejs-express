# Ejercicio 25 - testing de rutas

API de personajes de un videojuego RPG hecha con Node.js y Express. Las
rutas se prueban con `supertest` y el test runner de Node (`node:test`).
Se revisa lo que ve el cliente: status, headers y body.

## Que hace la API

- Lista personajes (con filtro `?clase=`), los crea, los sube de nivel y
  les agrega items al inventario.
- Al crear responde 201 con el header `Location` del personaje nuevo.
- Borrar solo lo puede hacer el game master con
  `Authorization: Bearer <token>`.

Reglas: el nombre tiene de 3 a 20 letras y no se repite, la clase es
`guerrero`, `mago`, `arquero` o `clerigo`, el nivel maximo es 50 y el
inventario tiene 5 espacios.

## Como estan hechos los tests

**`crearApp()` en vez de una app suelta.** `src/app.js` exporta una
funcion que arma una app nueva con sus propios datos:

```js
crearApp({ personajes: PERSONAJES_DE_PRUEBA, tokenGm: "token-de-prueba" });
```

Cada test crea su app con `appDePrueba()`, asi nunca comparten datos y no
hace falta un `resetDb`. Hay un test que lo comprueba: despues de crear un
personaje, el siguiente test sigue viendo solo 2.

**supertest.** Recibe la app, la levanta sola en un puerto libre y deja
encadenar la peticion:

```js
const res = await request(appDePrueba())
    .post("/api/personajes")
    .send({ nombre: "Mirella", clase: "clerigo" });

assert.equal(res.status, 201);
assert.equal(res.headers.location, "/api/personajes/3");
```

Que se revisa en las rutas:

| Que                     | Ejemplo                                                   |
| ----------------------- | --------------------------------------------------------- |
| Status                  | 200, 201, 204, 400, 401, 403, 404, 409                    |
| Headers                 | `Content-Type` JSON, `Location` al crear                  |
| Body completo           | `deepEqual` del personaje creado y de la lista de errores |
| Query params            | `.query({ clase: "mago" })`                               |
| Headers de auth         | `.set("Authorization", "Bearer ...")`                     |
| JSON mal escrito        | `.set("Content-Type", ...)` + `.send('{"nombre": ')`      |
| Varias peticiones       | crear y despues leer con el `Location` en la misma app    |
| Orden de los middleware | sin token da 401 aunque el id no exista                   |

```text
test/
├── personajes.get.test.js     GET lista, filtro, por id, ids malos, 404
├── personajes.post.test.js    crear, subir nivel, inventario
└── personajes.delete.test.js  borrar con y sin token
test-helpers/
└── app-de-prueba.js           crea la app con datos y token de prueba
```

El helper esta fuera de `test/` porque `node --test` ejecuta todos los
archivos que hay dentro de esa carpeta, y lo contaba como un test.

`supertest` esta en `devDependencies`: solo se usa para probar, no hace
falta en produccion.

## Requisitos

Node.js 20 o superior. Sin base de datos.

## Instalacion y ejecucion

```bash
npm install
npm test
```

| Script        | Descripcion                                    |
| ------------- | ---------------------------------------------- |
| `npm test`    | Corre los tests de rutas                       |
| `npm start`   | Levanta el servidor en http://localhost:3025   |
| `npm run dev` | Servidor con recarga automatica                |

El token del GM sale de la variable `GM_TOKEN`. Si no esta se usa
`token-del-gm` y se muestra un aviso.

```powershell
$env:GM_TOKEN="mi-token-secreto"; npm start
```

## Resultado

```text
▶ DELETE /api/personajes/:id (solo GM)
  ✔ 401 sin token
  ✔ 403 con un token que no es del GM
  ✔ 204 sin body con el token correcto, y despues da 404
  ✔ el token se revisa antes que el id
  ...
▶ POST /api/personajes
  ✔ 201 con el personaje nuevo y el header Location
  ✔ lo creado se puede leer despues en la misma app
  ✔ cada app empieza limpia (lo del test anterior no esta)
  ✔ 409 si el nombre ya existe sin importar mayusculas
  ...
ℹ tests 30
ℹ pass 30
ℹ fail 0
```

Para comprobar que los tests sirven, cambie el middleware del GM para que
dejara pasar sin token y fallaron 3 tests (`401 sin token`, `401 si el
header no es Bearer` y `el token se revisa antes que el id`).

## Estructura

| Carpeta / archivo   | Que hay dentro                                  |
| ------------------- | ----------------------------------------------- |
| `src/app.js`        | `crearApp()`                                    |
| `src/server.js`     | Crea la app real y hace `listen`                |
| `src/routes/`       | `personajes.routes.js`                          |
| `src/controllers/`  | `personajes.controller.js`                      |
| `src/services/`     | `personajes.service.js` (reglas del juego)      |
| `src/middlewares/`  | `gm.middleware.js`                              |
| `src/data/`         | Personajes iniciales                            |

## Endpoints

| Metodo | Ruta                                | Descripcion                          |
| ------ | ----------------------------------- | ------------------------------------ |
| GET    | `/health`                           | Comprueba que el servidor vive       |
| GET    | `/api/personajes`                   | Lista, acepta `?clase=`              |
| POST   | `/api/personajes`                   | Crea `{ nombre, clase }`             |
| GET    | `/api/personajes/:id`               | Un personaje                         |
| POST   | `/api/personajes/:id/subir-nivel`   | Sube un nivel y suma vida            |
| POST   | `/api/personajes/:id/inventario`    | Agrega `{ item }`                    |
| DELETE | `/api/personajes/:id`               | Borra (solo GM)                      |

## Ejemplos (PowerShell)

```bash
curl.exe -i -X POST http://localhost:3025/api/personajes -H "Content-Type: application/json" -d '{\"nombre\":\"Mirella\",\"clase\":\"clerigo\"}'
```

```text
HTTP/1.1 201 Created
Location: /api/personajes/4
```

```json
{ "ok": true, "data": { "id": 4, "nombre": "Mirella", "clase": "clerigo", "nivel": 1, "vida": 100, "inventario": [] } }
```

```bash
curl.exe -X DELETE http://localhost:3025/api/personajes/4 -H "Authorization: Bearer mi-token-secreto"
```

## Casos de error

| Caso                                   | Status | Mensaje                                          |
| -------------------------------------- | ------ | ------------------------------------------------ |
| Clase o nombre invalidos               | 400    | `Datos invalidos` + lista `errors`               |
| Id que no es entero positivo           | 400    | `El id debe ser un numero entero positivo`       |
| Personaje que no existe                | 404    | `No existe el personaje con id 99`               |
| Nombre repetido                        | 409    | `Ya existe un personaje llamado ALDRIC`          |
| Subir nivel estando en 50              | 409    | `Lyra ya esta en el nivel maximo (50)`           |
| Inventario lleno                       | 409    | `El inventario de Lyra esta lleno (5 items)`     |
| Borrar sin token                       | 401    | `Falta el token del GM`                          |
| Borrar con otro token                  | 403    | `Ese token no es del GM`                         |
| Metodo o ruta que no existe            | 404    | `La ruta PUT /api/personajes/1 no existe`        |

## Notas

Los datos viven en memoria, al reiniciar el servidor vuelven a los de
`src/data/personajes.js`.
