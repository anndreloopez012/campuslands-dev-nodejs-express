# Ejercicio 28 - coleccion de ejemplos HTTP

API de un battle royale hecha con Node.js y Express (login, escuadras y
partidas con eliminaciones). El foco es la **coleccion de ejemplos**: un
juego de peticiones listas para mandar que muestran como se usa la API,
paso a paso y con los errores.

Hay dos versiones de la coleccion:

| Carpeta    | Para que herramienta                                   |
| ---------- | ------------------------------------------------------ |
| `http/`    | Extension **REST Client** de VS Code (archivos `.http`) |
| `postman/` | **Postman** (importar el `.json`)                      |

## La coleccion `.http`

```text
http/
├── 00-salud.http            el servidor responde
├── 01-auth.http             login, uso del token y errores de auth
├── 02-escuadras.http        crear, unirse y limites
├── 03-partida-completa.http flujo completo: 4 jugadores, 2 escuadras, hasta que hay ganador
└── 04-errores.http          JSON roto, datos malos, sin token, ids malos
```

Como se usa: abrir el archivo en VS Code con la extension REST Client y
dar clic en **Send Request** arriba de cada peticion, en orden.

Cosas del formato que se usan:

```http
@baseUrl = http://localhost:3028

### Login
# @name login
# espera: 200
POST {{baseUrl}}/api/auth/login
Content-Type: application/json

{ "gamertag": "Raven" }

###
@token = {{login.response.body.$.data.token}}

### Quien soy
# espera: 200
GET {{baseUrl}}/api/auth/yo
Authorization: Bearer {{token}}
```

- `@baseUrl`: variable del archivo, si cambia el puerto se cambia en un
  solo lugar.
- `###`: separa una peticion de otra. Lo que va despues sirve de titulo.
- `# @name login`: le pone nombre a la respuesta para usarla despues.
- `{{login.response.body.$.data.token}}`: saca el token de la respuesta
  del login. Asi se encadenan las peticiones sin copiar y pegar.
- `# espera: 200`: es un comentario para REST Client, pero el script de
  este ejercicio lo usa para revisar el status.

Cada archivo empieza con `POST /api/dev/reset`, que borra los datos para
que se pueda correr varias veces seguidas. Esa ruta solo existe si
`NODE_ENV` no es `production`.

## Que la coleccion no se quede vieja

Una coleccion que nadie corre se rompe sin que nadie se de cuenta. Por eso
hay un script que la corre entera:

```bash
npm run coleccion
```

- `scripts/leer-http.js` lee los `.http` (variables, `@name`, `espera`,
  headers y body).
- `scripts/correr-http.js` manda cada peticion en orden, reemplaza las
  `{{variables}}` y las respuestas anteriores, y compara el status con
  `# espera:`.
- `scripts/probar-coleccion.js` levanta la app sola en un puerto libre y
  corre todos los archivos. Con `-- --url http://localhost:3028` usa un
  servidor que ya esta prendido.

Resultado:

```text
03-partida-completa.http
  ok   200 (espera 200)  POST /api/dev/reset
  ok   200 (espera 200)  POST /api/auth/login
  ...
  ok   409 (espera 409)  POST /api/partidas/1/iniciar
  ok   403 (espera 403)  POST /api/partidas/1/escuadras
  ...
  ok   200 (espera 200)  GET /api/partidas/1/ranking

49 peticiones, 0 con problemas
```

Ademas, `npm test` (`test/coleccion.test.js`) revisa:

- Que cada `.http` corra sin errores y que toda peticion tenga `# espera:`.
- Que la partida completa termine con Cuervos de ganador.
- Que **cada ruta de la API tenga al menos un ejemplo** en los `.http`.
- El lector de `.http` y el de JSONPath.
- Que cada peticion de Postman tenga un test de status y que las
  variables que usa (`{{tokenRaven}}`, `{{partidaId}}`...) se guarden
  antes en algun test.

```text
ℹ tests 30
ℹ pass 30
ℹ fail 0
```

## La coleccion de Postman

`postman/battle-royale.postman_collection.json` tiene el mismo flujo en
carpetas (Preparar, Auth, Escuadras, Partida, Errores), pero 1 contra 1
para que sea mas corto.

1. En Postman: **Import** y elegir el archivo.
2. Levantar el servidor con `npm start`.
3. Clic derecho en la coleccion y **Run collection**.

Los tests de cada peticion guardan el token y los ids en variables de la
coleccion (`pm.collectionVariables.set(...)`), y las siguientes los usan.

Tambien se puede correr desde la terminal con newman (el CLI de Postman):

```bash
npx newman run postman/battle-royale.postman_collection.json
```

La estructura de esta coleccion la revisan los tests, pero yo no la corri
con newman ni con Postman.

## Requisitos

Node.js 20 o superior. Sin base de datos. Para usar los `.http` a mano,
VS Code con la extension REST Client.

## Instalacion y ejecucion

```bash
npm install
npm start
```

| Script              | Descripcion                                    |
| ------------------- | ---------------------------------------------- |
| `npm start`         | Servidor en http://localhost:3028              |
| `npm run dev`       | Servidor con recarga automatica                |
| `npm run coleccion` | Corre toda la coleccion `.http` y revisa los status |
| `npm test`          | Tests de la coleccion                          |

## La API

Reglas del juego:

- Login simulado: solo se manda el `gamertag` y se recibe un token.
- Escuadras de hasta 4. El que la crea es el lider. Un jugador solo
  puede estar en una escuadra.
- Partida: `lobby` -> `en_curso` -> `terminada`. El lider inscribe a su
  escuadra, el que creo la partida la inicia (minimo 2 escuadras).
- En una eliminacion el asesino es el del token. No se puede eliminar a
  un companero ni eliminar si ya te eliminaron.
- Cuando solo queda una escuadra con gente viva, esa gana.

| Metodo | Ruta                              | Token | Descripcion                 |
| ------ | --------------------------------- | ----- | --------------------------- |
| GET    | `/health`                         | No    | El servidor vive            |
| POST   | `/api/dev/reset`                  | No    | Borra todo (no en production) |
| POST   | `/api/auth/login`                 | No    | `{ gamertag }` -> token     |
| GET    | `/api/auth/yo`                    | Si    | Quien soy                   |
| POST   | `/api/escuadras`                  | Si    | Crea `{ nombre }`           |
| GET    | `/api/escuadras/:id`              | No    | Ver escuadra                |
| POST   | `/api/escuadras/:id/unirse`       | Si    | Unirse                      |
| POST   | `/api/partidas`                   | Si    | Crea `{ mapa }`             |
| GET    | `/api/partidas/:id`               | No    | Estado de la partida        |
| POST   | `/api/partidas/:id/escuadras`     | Si    | Inscribe `{ escuadraId }`   |
| POST   | `/api/partidas/:id/iniciar`       | Si    | Inicia                      |
| POST   | `/api/partidas/:id/eliminaciones` | Si    | `{ victima }`               |
| GET    | `/api/partidas/:id/ranking`       | No    | Bajas por jugador y ganador |

Mapas: `Isla Calavera`, `Desierto Rojo`, `Ciudad Neon`.

Ranking al final de `03-partida-completa.http`:

```json
{
  "ok": true,
  "data": {
    "partidaId": 1,
    "estado": "terminada",
    "ganador": "Cuervos",
    "jugadores": [
      { "gamertag": "Hawk", "bajas": 1 },
      { "gamertag": "Raven", "bajas": 1 },
      { "gamertag": "Wolf", "bajas": 1 }
    ]
  }
}
```

## Errores que muestra la coleccion

| Caso                                  | Status | Mensaje                                                |
| ------------------------------------- | ------ | ------------------------------------------------------ |
| Sin token / token inventado           | 401    | `Falta el token, haz login primero` / `Token invalido` |
| Gamertag con espacios                 | 400    | `gamertag debe tener de 3 a 16 letras, numeros o _`    |
| Ya estas en otra escuadra             | 409    | `Hawk ya esta en otra escuadra`                        |
| Iniciar con menos de 2 escuadras      | 409    | `Hacen falta al menos 2 escuadras para iniciar`        |
| Inscribir sin ser lider               | 403    | `Solo Wolf (lider) puede inscribir a Lobos`            |
| Iniciar sin haber creado la partida   | 403    | `Solo Raven puede iniciar la partida`                  |
| Eliminar a un companero               | 409    | `No se puede eliminar a alguien de tu propia escuadra` |
| Eliminar estando eliminado            | 403    | `Fang no esta vivo en esta partida`                    |
| Eliminar con la partida terminada     | 409    | `La partida esta en "terminada", para esto tiene que estar en "en_curso"` |
| JSON roto                             | 400    | `El body no es un JSON valido`                         |
| Mapa que no existe                    | 400    | `mapa debe ser uno de: Isla Calavera, Desierto Rojo, Ciudad Neon` |

## Notas

Todo vive en memoria, al reiniciar el servidor se pierde.
