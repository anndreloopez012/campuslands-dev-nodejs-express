# Ejercicio 29 - refactor de API (Juan Lema)

## Que hace

Tematica futbol y futbol sala. API de partidos (`matches`) con ciclo de vida `programado -> en_juego -> finalizado`, marcador y filtros. El ejercicio entrega **dos implementaciones de la misma API**:

- [`src/legacy/app.js`](src/legacy/app.js): la version "antes del refactor". Un solo archivo, todo en los handlers de Express: bucles `for` en vez de metodos de arreglo, la validacion de id y la busqueda por id **copiadas y pegadas cuatro veces** (en `GET /:id`, `start`, `score`, `finish`), manejo de errores repetido en cada ruta en vez de centralizado, mensajes de transicion invalida con tres redacciones distintas para la misma idea. Funciona correctamente, pero cambiar una regla de validacion implica tocar 4 lugares y arriesgarse a que alguno quede desactualizado.
- [`src/app.js`](src/app.js) (con `services/`, `controllers/`, `routes/`, `middlewares/`): la version "despues del refactor", con la arquitectura por capas del resto del curso. Toda la validacion, la busqueda por id y las transiciones de estado viven una sola vez en `matches.service.js`; el manejo de errores esta centralizado en `middlewares/error-handler.js` con un solo objeto `AppError`.

## Como se garantiza que el refactor no rompio nada

La tecnica central de un refactor seguro es: **las pruebas se escriben una sola vez contra el comportamiento observable (la API por HTTP), y corren igual contra el codigo viejo y el nuevo.** Si ambas pasan, el refactor no cambio el contrato; si alguna version divergiera, quedaria un fallo especifico en esa suite, no en la otra.

- [`test-support/matches-contract.js`](test-support/matches-contract.js) exporta `describeMatchesApiContract(label, createAppFn)`: una sola bateria de pruebas (validaciones, ciclo de vida completo, transiciones invalidas, filtros, errores) escrita en terminos de peticiones HTTP, sin saber nada de como esta organizado el codigo por dentro.
- [`test/legacy.contract.test.js`](test/legacy.contract.test.js) y [`test/refactored.contract.test.js`](test/refactored.contract.test.js) son dos archivos de 3 lineas cada uno: llaman a esa misma funcion con `createLegacyApp` y con `createApp`.
- El resultado: **66 pruebas, ejecutadas dos veces (132 en total)**, una tanda por implementacion. Las dos tandas pasan identicas.

### Lo que el refactor mejora de verdad (y como se nota en las pruebas)

- **Un solo lugar para cada regla**: en la version nueva, agregar una validacion a `matches.service.js` la aplican automaticamente los 6 endpoints que la usan; en la legacy hay que acordarse de copiarla en cada handler. `test/matches.service.test.js` prueba el servicio aislado, sin HTTP, algo que en la version legacy no es posible porque la logica nunca esta separada de Express.
- **Errores centralizados y testeables**: `test/error-handler.test.js` inyecta un servicio roto (`{ list: () => { throw ... } }`) para forzar un `500` y comprobar que no filtra el mensaje interno. Esto es posible gracias a la inyeccion de dependencias (`createApp({ matches })`); la version legacy no tiene un punto de inyeccion, asi que **no hay forma limpia de provocar su rama de error 500 en una prueba**, ni de probar por separado el `if (res.headersSent)` de su middleware de errores. Es la unica diferencia real de cobertura entre ambas (`src/legacy/app.js` queda en 97.4 % de lineas, con esas 2 lineas sin cubrir; el resto del proyecto esta al 100 %) y es en si misma una demostracion de por que refactorizar para hacer inyectable el codigo importa.

### Verificacion de la calidad de las pruebas

Se rompio **ambas implementaciones** a proposito, de 14 formas paralelas (8 en la version refactorizada, 6 en la legacy: dejar de exigir el estado correcto para una transicion, aceptar marcadores negativos, ignorar el filtro de `modality`, aceptar ids con ceros a la izquierda, responder `200` en vez de `201`...): **14 de 14** hicieron fallar la misma bateria de pruebas contra la implementacion mutada, sin tocar la otra. Tambien se probo a mano con `curl` el flujo completo contra el servidor real.

## Como ejecutar

```bash
npm install
npm start
```

`server.js` levanta la version **refactorizada** (`src/app.js`). La version legacy (`src/legacy/app.js`) no se usa en produccion, queda solo como referencia del "antes" para las pruebas.

## Como ejecutar las pruebas

```bash
npm test
npm run test:coverage
node --test test/legacy.contract.test.js
node --test test/refactored.contract.test.js
```

Verificado con Node 24; requiere Node 20 o superior.

## Como probar la API

```bash
curl -X POST http://localhost:4029/matches -H "Content-Type: application/json" -d "{\"homeTeam\":\"Aguilas FC\",\"awayTeam\":\"Halcones Sala\",\"modality\":\"futbol\"}"
curl -X PATCH http://localhost:4029/matches/1/start
curl -X PATCH http://localhost:4029/matches/1/score -H "Content-Type: application/json" -d "{\"homeScore\":2,\"awayScore\":1}"
curl -X PATCH http://localhost:4029/matches/1/finish
curl "http://localhost:4029/matches?modality=futbol&status=finalizado"
```

## Como probar los casos de error

```bash
curl -X PATCH http://localhost:4029/matches/1/finish
curl -X POST http://localhost:4029/matches -H "Content-Type: application/json" -d "{\"homeTeam\":\"Aguilas FC\",\"awayTeam\":\"Aguilas FC\",\"modality\":\"futbol\"}"
curl http://localhost:4029/matches/99
curl "http://localhost:4029/matches?modality=futbol_7"
```

## Estructura

```text
src/
├── app.js
├── server.js
├── errors.js
├── legacy/app.js
├── routes/matches.routes.js
├── controllers/matches.controller.js
├── services/matches.service.js
└── middlewares/error-handler.js
test-support/
├── client.js
└── matches-contract.js
test/
├── legacy.contract.test.js
├── refactored.contract.test.js
├── matches.service.test.js
└── error-handler.test.js
```
