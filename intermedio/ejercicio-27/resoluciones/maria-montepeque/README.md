# Ejercicio 27 - documentacion de endpoints

API de una liga de esports de MOBA hecha con Node.js y Express. Los
endpoints estan documentados con **OpenAPI 3** en `docs/openapi.json` y se
pueden leer y probar desde el navegador con **Swagger UI**. Hay tests que
fallan si la documentacion se queda atrasada con el codigo.

## Donde ver la documentacion

| URL                                   | Que es                                          |
| ------------------------------------- | ----------------------------------------------- |
| http://localhost:3027/docs            | Swagger UI: lista, ejemplos y boton "Try it out" |
| http://localhost:3027/openapi.json    | El JSON crudo, para importar en Postman o Insomnia |

En Swagger UI las rutas protegidas tienen un candado. Con el boton
**Authorize** se pone la `x-api-key` (`clave-de-desarrollo`) una sola vez
y ya se pueden probar.

## Que se documento de cada endpoint

- `summary`, `description`, `tags` (Equipos, Partidas, Clasificacion) y
  `operationId`.
- Parametros de ruta y de query con su tipo (`id` entero >= 1, `region`
  con su `enum`).
- El body con su schema y un ejemplo listo para mandar.
- Cada respuesta posible con su status, schema y ejemplo, incluidos los
  errores (400, 401, 403, 404, 409) y el header `Location` del 201.
- Que rutas piden api key (`security`).

Para no repetir, lo comun esta en `components`: los schemas (`Equipo`,
`Partida`, `Error`...), el parametro `EquipoId` y las respuestas de error
(`SinApiKey`, `EquipoNoExiste`...). Las rutas lo usan con `$ref`.

## Tests que cuidan la documentacion

La documentacion escrita a mano se atrasa facil: alguien agrega una ruta
y se olvida de documentarla. Por eso hay tests:

**`test/docs.test.js`**

- Lee las rutas del router de Express y las compara con las de
  `openapi.json`. Si sobra o falta una, falla.
- Cada operacion tiene `summary`, `tag`, `operationId`, una respuesta 2xx
  y, si recibe datos, una de error.
- Los `{parametros}` de cada ruta estan declarados.
- Si una ruta pide api key, documenta el 401 y el 403.
- Todos los `$ref` apuntan a algo que existe.
- El `enum` de regiones es igual a la lista del service.
- `/openapi.json` y `/docs/` responden.

**`test/ejemplos.test.js`**

- Manda a la API los ejemplos que estan en la documentacion y revisa que
  funcionen (201 y el `Location` documentado).
- Compara los mensajes de error de ejemplo con los que da la API de
  verdad.
- Tambien prueba las reglas de la liga (clasificacion, regiones, nombres
  repetidos).

Para comprobarlo agregue una ruta `DELETE /api/equipos/:id` sin
documentarla y fallo el test con:

```text
✖ cada ruta del codigo esta documentada y no sobra ninguna
-   'DELETE /api/equipos/:id',
```

## Requisitos

Node.js 20 o superior. Sin base de datos.

## Instalacion y ejecucion

```bash
npm install
npm start
```

| Script        | Descripcion                                      |
| ------------- | ------------------------------------------------ |
| `npm start`   | Servidor en http://localhost:3027 (docs en /docs) |
| `npm run dev` | Servidor con recarga automatica                  |
| `npm test`    | Tests de la documentacion y de la API            |

La `x-api-key` sale de la variable `ADMIN_API_KEY`, si no esta se usa
`clave-de-desarrollo`.

Al instalar, npm puede avisar que no corrio el script de `@scarf/scarf`.
Viene con Swagger UI y solo manda estadisticas de uso, no hace falta.

## Resultado de `npm test`

```text
ℹ tests 35
ℹ pass 35
ℹ fail 0
```

## Endpoints

Resumen (el detalle esta en `/docs`):

| Metodo | Ruta                          | Api key | Descripcion                    |
| ------ | ----------------------------- | ------- | ------------------------------ |
| GET    | `/api/equipos`                | No      | Lista equipos, `?region=`      |
| POST   | `/api/equipos`                | Si      | Inscribe un equipo de 5        |
| GET    | `/api/equipos/{id}`           | No      | Un equipo                      |
| GET    | `/api/equipos/{id}/jugadores` | No      | Los jugadores del equipo       |
| POST   | `/api/partidas`               | Si      | Registra un resultado          |
| GET    | `/api/clasificacion`          | No      | Tabla de posiciones            |
| GET    | `/openapi.json`               | No      | La especificacion              |
| GET    | `/docs`                       | No      | Swagger UI                     |

## Ejemplos (PowerShell)

```bash
curl.exe "http://localhost:3027/api/equipos?region=LATAM"
```

```bash
curl.exe -X POST http://localhost:3027/api/partidas -H "Content-Type: application/json" -H "x-api-key: clave-de-desarrollo" -d '{\"equipoAzulId\":2,\"equipoRojoId\":4,\"ganador\":\"rojo\",\"duracionMin\":41}'
```

```bash
curl.exe http://localhost:3027/api/clasificacion
```

```json
{
  "ok": true,
  "data": [
    { "equipoId": 3, "nombre": "Red Lotus", "jugadas": 1, "ganadas": 1, "perdidas": 0, "puntos": 3 },
    { "equipoId": 1, "nombre": "Quetzal Gaming", "jugadas": 2, "ganadas": 1, "perdidas": 1, "puntos": 3 },
    { "equipoId": 4, "nombre": "Nordic Titans", "jugadas": 0, "ganadas": 0, "perdidas": 0, "puntos": 0 },
    { "equipoId": 2, "nombre": "Storm Wolves", "jugadas": 1, "ganadas": 0, "perdidas": 1, "puntos": 0 }
  ]
}
```

## Estructura

| Carpeta / archivo     | Que hay dentro                                    |
| --------------------- | ------------------------------------------------- |
| `docs/openapi.json`   | La documentacion OpenAPI                          |
| `src/app.js`          | Sirve `/openapi.json` y `/docs` con swagger-ui-express |
| `src/routes/index.js` | Todas las rutas de `/api`                         |
| `src/controllers/`    | `liga.controller.js`                              |
| `src/services/`       | `liga.service.js` (validaciones y clasificacion)  |
| `src/middlewares/`    | `api-key.middleware.js`                           |
| `src/data/`           | Equipos y partidas en memoria                     |
| `test/`               | Tests de la documentacion y de los ejemplos       |

## Notas

Los datos viven en memoria, al reiniciar el servidor vuelven a los de
`src/data/db.js`.
