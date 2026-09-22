# Ejercicio 27 - documentacion de endpoints (Juan Lema)

## Que hace

Tematica MOBA esports. Catalogo de campeones (`GET /champions`, `GET /champions/:id`, `POST /champions`) documentado con **OpenAPI 3.0** e interfaz interactiva con **Swagger UI**:

- `src/docs/openapi.js` es el documento OpenAPI completo (rutas, parametros, cuerpos, respuestas de exito y de error, schemas reutilizables con `$ref`, ejemplos) escrito como un objeto JS plano, sin YAML ni generadores.
- `GET /openapi.json` expone el documento crudo; `GET /docs` sirve Swagger UI (`swagger-ui-express`) leyendo ese mismo objeto, con boton "Try it out" para ejecutar peticiones reales desde el navegador.

## El problema real: la documentacion se desactualiza

Un README o un Swagger a mano queda desincronizado del codigo en cuanto alguien cambia una validacion y se olvida de tocar la doc. Este ejercicio no se conforma con escribir el spec: **`test/openapi-contract.test.js` verifica automaticamente que el documento no mienta**, en ambas direcciones:

- Lo documentado es cierto: para cada operacion del spec, hace una peticion HTTP real (usando los ejemplos que estan en el propio documento) y comprueba que el status devuelto es uno de los documentados, y que el `code` de cada error coincide con el que dice el spec.
- Lo cierto esta documentado: por cada endpoint compara la lista exacta de status que el spec declara contra la lista esperada (por ejemplo `GET /champions/:id` debe declarar `200`, `400` y `404`, ni uno menos). Sin esta prueba, borrar un `404` del spec por error no lo detecta nada — se confirmo mutando el spec a proposito (ver abajo).
- El documento es coherente consigo mismo: todo `$ref` usado en `paths` resuelve a un schema real en `components`, y el `enum` de `Role` documentado coincide exactamente con `ROLES` del servicio (import directo, no un valor copiado a mano).
- El ejemplo de creacion que aparece en la doc de `POST /champions` es el mismo objeto que se envia en la prueba: si alguien pone un ejemplo que no pasa la propia validacion de la API, la prueba lo nota.

### Verificacion de la calidad de las pruebas

Cobertura: **100 %** de lineas, ramas y funciones en `src/`. Se rompio la aplicacion y el propio documento OpenAPI a proposito de 15 formas (quitar una validacion del servicio, desincronizar el `enum` de roles documentado del real, borrar un `404` o un `400` del spec, romper un `$ref`, poner un ejemplo que no cumple su propio schema, dejar de servir `/openapi.json`...): **15 de 15** hicieron fallar al menos una prueba. Las dos primeras veces que borre un status documentado (`404` de `GET /champions/:id` y `400` de `POST /champions`) la suite no lo detecto — eso fue lo que me llevo a agregar la prueba de "lo cierto esta documentado" descrita arriba.

Probado tambien a mano en el navegador: Swagger UI en `http://localhost:4027/docs` carga los 2 grupos (Sistema, Campeones), los 4 endpoints y los 4 schemas, y el boton "Try it out" en `GET /champions` ejecuta la peticion real y devuelve los 3 campeones semilla.

## Como ejecutar

```bash
npm install
npm start
```

Abre `http://localhost:4027/docs` para la documentacion interactiva.

## Como ejecutar las pruebas

```bash
npm test
npm run test:coverage
node --test test/openapi-contract.test.js
```

Verificado con Node 24; requiere Node 20 o superior.

## Como probar la API

```bash
curl http://localhost:4027/openapi.json
curl http://localhost:4027/champions
curl -X POST http://localhost:4027/champions -H "Content-Type: application/json" -d "{\"name\":\"Vex Umbrio\",\"role\":\"adc\",\"winRate\":50.4}"
curl "http://localhost:4027/champions?role=top"
```

## Como probar los casos de error

```bash
curl "http://localhost:4027/champions?role=carry"
curl -X POST http://localhost:4027/champions -H "Content-Type: application/json" -d "{\"name\":\"X\"}"
curl http://localhost:4027/champions/99
curl http://localhost:4027/champions/abc
```

## Estructura

```text
src/
├── app.js
├── server.js
├── errors.js
├── docs/openapi.js
├── routes/champions.routes.js
├── controllers/champions.controller.js
├── services/champions.service.js
└── middlewares/error-handler.js
test-support/
└── client.js
test/
├── champions.service.test.js
├── champions.routes.test.js
└── openapi-contract.test.js
```
