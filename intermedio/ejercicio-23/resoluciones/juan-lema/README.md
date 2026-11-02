# Ejercicio 23 - testing con node test (Juan Lema)

## Que hace

Tematica soldadura. API que registra trabajos de soldadura, calcula parametros recomendados y controla su ciclo de vida. El foco es como se prueba: todo con el **runner nativo de Node** (`node:test`) y `node:assert/strict`, sin Jest, Mocha ni Supertest.

Las reglas de calculo son **simplificadas y didacticas** (amperios por mm segun proceso y material, tope de 400 A de la maquina, una pasada cada 6 mm). No sustituyen una especificacion de procedimiento de soldadura (WPS) real.

| Proceso | A por mm | Material | Factor |
| --- | --- | --- | --- |
| MIG | 40 | acero | 1 |
| TIG | 35 | acero inoxidable | 0.9 |
| SMAW | 30 | aluminio | 1.2 |

Estados: `pendiente` -> `en_proceso` -> `terminado`, y `cancelado` desde `pendiente` o `en_proceso`. `terminado` y `cancelado` son finales.

### Disenado para poder probarse

- `src/app.js` exporta la app **sin** llamar a `listen`; `server.js` es el unico que abre el puerto. Asi las pruebas la levantan en un puerto libre.
- La logica pura (`services/welding-rules.js`: `recommendParameters`, `canTransition`) esta separada de la logica con estado y validacion (`services/welds.service.js`). Lo puro se prueba en milisegundos y sin HTTP.

### Que se prueba y como (78 pruebas)

- `test/welding-rules.test.js` (unitarias): tabla de casos con valores calculados a mano, limites exactos (6 mm = 1 pasada, 6.01 mm = 2), tope de 400 A, propiedades que deben cumplirse en todo el rango (nunca supera el tope, es monotona creciente, no muta la entrada) y la maquina de estados completa.
- `test/welds.api.test.js` (integracion sobre HTTP real con `fetch`): flujo feliz, 15 cuerpos invalidos (`400`), espesores limite, JSON malformado (`400`, no `500`), campos calculados enviados por el cliente que deben ignorarse, transiciones (`409`) y ids invalidos o inexistentes (`400`/`404`).
- `test/error-handler.test.js` (unitaria aislada): un error inesperado responde `500` generico sin filtrar el mensaje interno y queda registrado; se usa `t.mock.method` para silenciar y observar `console.error`.

Buenas practicas aplicadas: cada prueba crea sus propios datos y no depende del orden; el servidor de pruebas usa `listen(0)` (puerto libre) y se cierra con `closeAllConnections()` para no colgar la ejecucion; las pruebas se generan a partir de tablas de casos para que un fallo diga exactamente cual caso rompio.

Ademas se comprobo que la suite **detecta errores reales**: se rompio la logica a proposito de 13 formas distintas (cambiar un factor, quitar el tope, `floor` en lugar de `ceil`, permitir una transicion prohibida, dejar de validar el tipo del espesor, filtrar el mensaje de un `500`, etc.) y cada una hizo fallar al menos una prueba. Una de ellas destapo un defecto real de `canTransition` con estados como `"constructor"`, ya corregido.

## Como ejecutar

```bash
npm install
npm start
```

## Como ejecutar las pruebas

```bash
npm test
npm run test:coverage
node --test test/welding-rules.test.js
node --test --test-name-pattern="canTransition"
```

Verificado con Node 24; requiere Node 20 o superior.

## Como probar la API

```bash
curl http://localhost:4023/welds
curl http://localhost:4023/welds/1
curl -X POST http://localhost:4023/welds -H "Content-Type: application/json" -d "{\"client\":\"Estructuras Rivas\",\"process\":\"MIG\",\"material\":\"acero inoxidable\",\"thicknessMm\":8}"
curl -X PATCH http://localhost:4023/welds/1/status -H "Content-Type: application/json" -d "{\"status\":\"en_proceso\"}"
```

## Como probar los casos de error

```bash
curl http://localhost:4023/welds/99
curl http://localhost:4023/welds/abc
curl -X POST http://localhost:4023/welds -H "Content-Type: application/json" -d "{\"client\":\"X\",\"process\":\"MIG\",\"material\":\"acero\",\"thicknessMm\":\"8\"}"
curl -X PATCH http://localhost:4023/welds/1/status -H "Content-Type: application/json" -d "{\"status\":\"terminado\"}"
curl -X POST http://localhost:4023/welds -H "Content-Type: application/json" -d "{malformado"
```

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/welds.routes.js
├── controllers/welds.controller.js
├── services/
│   ├── welding-rules.js
│   └── welds.service.js
└── middlewares/error-handler.js
test/
├── welding-rules.test.js
├── welds.api.test.js
└── error-handler.test.js
```
