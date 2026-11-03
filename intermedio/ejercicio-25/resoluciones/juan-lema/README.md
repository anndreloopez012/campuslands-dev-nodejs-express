# Ejercicio 25 - testing de rutas (Juan Lema)

## Que hace

Tematica videojuegos RPG. API con autenticacion por token y un catalogo de personajes con dueno, filtros, orden y paginacion. El foco es probar las **rutas completas**: metodo + URL + headers + cuerpo + codigo de estado, con peticiones HTTP reales (`fetch`) contra un servidor levantado en un puerto libre, sin mockear Express.

- `POST /auth/login`, `GET /auth/me`, `POST /auth/logout`: token opaco (`crypto.randomUUID`), `Cache-Control: no-store` en todo `/auth`, `WWW-Authenticate` en los `401`.
- `GET /characters` (publica): filtro `class`, `minLevel`, orden `sort` (`id`, `name`, `-name`, `level`, `-level`) y paginacion `page`/`limit`, con `X-Total-Count` y `meta` en el cuerpo.
- `GET /characters/:id` (publica): soporta cache condicional (`ETag` + `If-None-Match` -> `304`), lo da gratis Express (`res.json`) y se verifica aqui.
- `POST /characters` (protegida): el dueno es quien tiene el token, nunca el cuerpo; rechaza campos no editables (`id`, `ownerId`) para evitar mass assignment.
- `PATCH /characters/:id`, `DELETE /characters/:id` (protegidas): solo el dueno o un rol `admin`.

### Contrato HTTP verificado por las pruebas, no solo el camino feliz

- **405 + `Allow`** en cada ruta cuando el metodo no corresponde, y **`OPTIONS` -> `204`** con el mismo `Allow` (preflight).
- **415** si el `Content-Type` no es JSON cuando hay cuerpo; **400** si el JSON esta malformado; **413** si supera 10 KB. Los tres se deciden antes de tocar la logica de negocio.
- **401** sin token o con token invalido/cerrado (con el desafio `WWW-Authenticate` correcto), **403** si el token es valido pero no es el dueno ni admin, **404** si el recurso no existe, **409** si el nombre ya esta en uso.
- Todo error usa el mismo sobre `{ ok: false, code, message }`; un error inesperado responde `500` generico, se registra en el servidor y **no filtra** el mensaje interno ni rastros del codigo fuente.
- Seguridad basica de cabeceras: sin `X-Powered-By`, con `X-Content-Type-Options: nosniff`.

Ninguna prueba depende de datos dejados por otra: cada `beforeEach` levanta una app nueva (`createApp()`) con su propio catalogo semilla.

### Que se prueba (284 pruebas, 4 archivos)

- `test/auth.routes.test.js`: login, `/me`, `/logout`, esquemas `Bearer` en distintas mayusculas, usuario inexistente vs password incorrecta responden **exactamente igual** (no revela que usuarios existen), y que el token de una instancia de la app no sirve en otra.
- `test/characters.read.routes.test.js`: filtros, orden (con desempate por id), paginacion, `ETag`/`304`, `HEAD` con los mismos headers que `GET`, mayusculas y barra final en la URL.
- `test/characters.write.routes.test.js`: creacion con `Location` y `201`, `PATCH` parcial, permisos dueno/admin/ajeno para cada personaje del catalogo semilla, atomicidad (si el nombre falla, el nivel tampoco se aplica), `DELETE` idempotente en el sentido de que la segunda vez da `404`.
- `test/protocol.routes.test.js`: `405`/`OPTIONS`, `Content-Type`, JSON malformado, limite de 10 KB, cabeceras compartidas, un inventario de que ruta exige token y cual no, y una prueba de contrato que exige que **todo** error 4xx tenga la forma `{ ok, code, message }`. El `500` se fuerza inyectando un servicio que lanza un error con datos sensibles, para comprobar que no se filtran.

`test-support/client.js` es el cliente HTTP compartido (no es una prueba: vive fuera de `test/` para que el runner no lo ejecute). `src/app.js` exporta `createApp({ auth, characters })`: en produccion arma sus servicios reales; las pruebas inyectan servicios rotos quirurgicamente cuando necesitan forzar un `500`.

### Verificacion de la calidad de las pruebas

Cobertura: **100 %** de lineas, ramas y funciones en todo `src/`. Ademas se rompio la aplicacion a proposito de 48 formas (password comparada mal, `OPTIONS` sin responder, filtro de clase ignorado, `mass assignment` sin bloquear, rutas protegidas sin `authenticate`, un `500` que filtra el mensaje interno...): **44 de 48** hicieron fallar al menos una prueba. Las 4 restantes son mutaciones equivalentes: dos cambian un objeto que el servicio ya no puede alcanzar (un campo bloqueado por la lista blanca de `readBody` antes de esa linea) y dos afectan una copia defensiva del servicio que, al viajar por HTTP, ya queda serializada en JSON antes de que algo pueda mutarla — invisibles para pruebas de rutas por diseno, no huecos reales.

## Como ejecutar

```bash
npm install
npm start
```

## Como ejecutar las pruebas

```bash
npm test
npm run test:coverage
node --test test/protocol.routes.test.js
node --test --test-name-pattern="405"
```

Verificado con Node 24; requiere Node 20 o superior. Usuarios de prueba: `aria/demo123` (id 1), `brom/demo456` (id 2), `gm/demo789`, rol admin.

## Como probar la API

```bash
curl http://localhost:4025/characters
curl -X POST http://localhost:4025/auth/login -H "Content-Type: application/json" -d "{\"username\":\"aria\",\"password\":\"demo123\"}"
curl http://localhost:4025/auth/me -H "Authorization: Bearer TOKEN"
curl -X POST http://localhost:4025/characters -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d "{\"name\":\"Kael\",\"class\":\"guerrero\",\"level\":10}"
curl "http://localhost:4025/characters?class=guerrero&sort=-level"
curl -X PATCH http://localhost:4025/characters/9 -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d "{\"level\":11}"
curl -X DELETE http://localhost:4025/characters/9 -H "Authorization: Bearer TOKEN"
```

## Como probar los casos de error

```bash
curl -i -X OPTIONS http://localhost:4025/characters
curl -i -X PUT http://localhost:4025/characters
curl http://localhost:4025/characters/99
curl -X POST http://localhost:4025/characters -H "Content-Type: application/json" -d "{\"name\":\"Sin token\"}"
curl -X POST http://localhost:4025/characters -H "Authorization: Bearer TOKEN_DE_BROM" -H "Content-Type: application/json" -d "{}"
```

## Estructura

```text
src/
├── app.js
├── server.js
├── errors.js
├── routes/
│   ├── auth.routes.js
│   └── characters.routes.js
├── controllers/
│   ├── auth.controller.js
│   └── characters.controller.js
├── services/
│   ├── auth.service.js
│   └── characters.service.js
└── middlewares/
    ├── authenticate.js
    ├── allow-methods.js
    └── error-handler.js
test-support/
└── client.js
test/
├── auth.routes.test.js
├── characters.read.routes.test.js
├── characters.write.routes.test.js
└── protocol.routes.test.js
```
