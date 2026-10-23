# Ejercicio 28 - coleccion de ejemplos HTTP (Juan Lema)

## Que hace

Tematica battle royale. API de puntos de loot (`drops`): listar con filtros, ver uno, crear, reclamar y borrar. Lo central del ejercicio es [`http/drops.http`](http/drops.http): una coleccion de 17 peticiones de ejemplo en formato **REST Client** (`@baseUrl` + bloques `###`, compatible con la extension REST Client de VS Code y con el HTTP Client de IntelliJ/WebStorm), lista para abrir y ejecutar con un clic.

## El problema real: una coleccion de ejemplos tambien se desactualiza

Un archivo `.http` escrito a mano miente en cuanto cambia una respuesta y nadie actualiza el ejemplo. Igual que en el ejercicio anterior con el spec OpenAPI, aqui la coleccion **se verifica sola**:

- `test-support/http-collection.js` parsea `http/drops.http` (sin ninguna libreria: separa por `###`, lee el comentario `# expect: <status>`, el metodo, la URL, los headers y el cuerpo JSON).
- `test/http-collection.test.js` reproduce las 17 peticiones **en orden, contra un servidor real**, y compara el status de cada respuesta con lo que la propia coleccion declara en su `# expect`. Si alguien cambia el codigo y una respuesta deja de coincidir con el ejemplo, o edita el `.http` y pone un status que ya no es cierto, la prueba falla.
- La coleccion cuenta una historia real con estado compartido (como haria una persona haciendo clic en cada peticion en VS Code): crea un drop, reclama el drop 1, intenta reclamarlo de nuevo (`409`), borra el drop 2 y confirma que desaparecio (`404`). Una prueba adicional confirma ese estado final acumulado.
- `test/http-collection-parser.test.js` prueba el parser en si mismo (bloques bien formados, variables `@nombre = valor` ignoradas, bloques invalidos rechazados con un mensaje claro) para no confiar a ciegas en una herramienta casera.

### Verificacion de la calidad de las pruebas

Cobertura: **100 %** de lineas, ramas y funciones en `src/` y en el soporte de pruebas. Se rompio la aplicacion **y la propia coleccion `.http`** a proposito de 14 formas (quitar la validacion de `lootTier`, dejar que `remove` no borre nada, responder `200` en vez de `204`, y tambien editar el `.http` para que un ejemplo de error deje de esperar el status correcto): **14 de 14** hicieron fallar al menos una prueba, confirmando que un `.http` con un dato equivocado se detecta igual que un bug en el codigo.

Probado tambien a mano con `curl` siguiendo el mismo orden que la coleccion, contra el servidor real.

## Como ejecutar

```bash
npm install
npm start
```

Abre `http/drops.http` en VS Code con la extension **REST Client** (o en cualquier cliente compatible) y haz clic en "Send Request" sobre cada bloque `###`.

## Como ejecutar las pruebas

```bash
npm test
npm run test:coverage
node --test test/http-collection.test.js
```

Verificado con Node 24; requiere Node 20 o superior.

## Como probar la API

```bash
curl http://localhost:4028/drops
curl "http://localhost:4028/drops?zone=Bosque%20Norte&lootTier=raro"
curl -X POST http://localhost:4028/drops -H "Content-Type: application/json" -d "{\"zone\":\"Torre de Radio\",\"lootTier\":\"epico\"}"
curl -X PATCH http://localhost:4028/drops/1/claim
curl -X DELETE http://localhost:4028/drops/2
```

## Como probar los casos de error

```bash
curl http://localhost:4028/drops/999
curl "http://localhost:4028/drops?lootTier=mitico"
curl -X POST http://localhost:4028/drops -H "Content-Type: application/json" -d "{\"lootTier\":\"epico\"}"
curl -X PATCH http://localhost:4028/drops/1/claim
curl -X PATCH http://localhost:4028/drops/1/claim
```

## Estructura

```text
http/
└── drops.http
src/
├── app.js
├── server.js
├── errors.js
├── routes/drops.routes.js
├── controllers/drops.controller.js
├── services/drops.service.js
└── middlewares/error-handler.js
test-support/
├── client.js
└── http-collection.js
test/
├── drops.service.test.js
├── drops.routes.test.js
├── http-collection.test.js
└── http-collection-parser.test.js
```
