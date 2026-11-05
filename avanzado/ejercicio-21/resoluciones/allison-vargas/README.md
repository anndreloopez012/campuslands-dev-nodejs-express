# Avanzado 21 - Concurrencia controlada (animacion 3D)

API en Node.js y Express para un estudio de animacion 3D con una pequena granja de render. Node atiende muchas peticiones a la vez en un solo hilo, asi que el problema no es "hacer hilos" sino **controlar cuanto trabajo pesado corre al mismo tiempo, cuanto espera y que pasa cuando dos personas editan lo mismo**.

## Como ejecutarlo

```bash
npm install
npm start          # puerto 3000, cambia con PORT=3100
npm test
```

Ruta base: `/avanzado/ejercicio-21`. El render esta simulado: cada frame tarda 5 ms en `borrador` y 20 ms en `final`.

## Probar rapido

```bash
BASE=http://localhost:3000/avanzado/ejercicio-21
curl -i $BASE/escenas/1                                   # ETag: "v1"
curl -i -X PUT -H 'Content-Type: application/json' -H 'If-Match: "v1"' \
  -d '{"nombre":"Bosque","luces":4,"objetos":[{"nombre":"arbol","poligonos":1000}]}' $BASE/escenas/1
curl -i -H 'Content-Type: application/json' -H 'X-Cliente-Id: estudio-uno' \
  -d '{"escenaId":1,"calidad":"final","frames":120}' $BASE/renders
curl $BASE/cola
```

## Herramientas de concurrencia (`src/concurrencia/`)

### Semaforo

`crearSemaforo(n)` deja que como maximo `n` tareas usen un recurso. Las demas esperan en una fila en orden de llegada. Una espera se puede cancelar con un `AbortSignal` y sale de la fila. La granja usa un semaforo de **2 renders simultaneos**.

### Cola con limites (contrapresion)

| Limite | Valor | Si se supera |
| --- | --- | --- |
| Renders simultaneos | 2 | El resto espera en cola |
| En espera | 5 | `503 COLA_LLENA` con `Retry-After: 10` |
| Activos por cliente | 2 | `429 LIMITE_POR_CLIENTE` con `Retry-After: 5` |
| Tiempo maximo por render | 10 s | Se aborta y queda `expirado` |

Rechazar temprano con un codigo claro es mejor que aceptar todo y que el servidor se quede sin memoria. El limite por cliente evita que uno solo acapare la granja.

### Cancelacion y timeout

Cada render tiene su `AbortController`. `DELETE /renders/:id` lo saca de la cola o aborta el render en curso; el timeout usa el mismo mecanismo. El renderizador revisa la senal entre frames y se detiene.

Estados: `en_cola -> renderizando -> completado | fallido | expirado | cancelado`.

### Concurrencia optimista en escenas

Cada escena tiene una version y se envia como `ETag: "v3"`. Para modificarla hay que enviar `If-Match` con la version que se edito:

- Sin `If-Match`: `428 PRECONDICION_REQUERIDA`.
- Con una version vieja: `412 CONFLICTO_DE_VERSION` y el `ETag` actual, para que el cliente recargue y combine sus cambios. Asi nadie pisa sin saberlo el trabajo de otro.
- `If-Match: *` acepta cualquier version (sobrescribir a proposito).

No hay bloqueos: se asume que los conflictos son raros y se detectan al guardar.

### Single flight

`GET /escenas/:id/vista-previa` hace un calculo costoso. Si llegan varias peticiones de la misma escena y version al mismo tiempo, **comparten un solo calculo** en lugar de repetirlo. Al editar la escena cambia la version y el siguiente pedido recalcula.

### Version fija en el render

Al encolar se guarda la version de la escena. Si alguien la edita mientras se renderiza, el resultado sigue siendo coherente con lo que se pidio (`escena-3-v1-borrador.mp4`).

## Rutas

| Metodo y ruta | Que hace |
| --- | --- |
| `GET /` | Informacion del ejercicio |
| `GET /escenas`, `POST /escenas` | Lista y crea (`{ nombre, luces, objetos: [{ nombre, poligonos }] }`) |
| `GET /escenas/:id` | Detalle con `ETag` |
| `PUT /escenas/:id` | Reemplaza; exige `If-Match` |
| `GET /escenas/:id/vista-previa` | Calculo compartido (single flight) |
| `POST /renders` | `{ escenaId, calidad?: borrador|final, frames: 1..240 }` con `X-Cliente-Id`. Responde `202 Accepted` y `Location` |
| `GET /renders/:id` | Estado, progreso y posicion en la cola |
| `DELETE /renders/:id` | Cancela (solo el mismo cliente) |
| `GET /cola` | Renders en curso, en espera, limites y conteo por estado |

## Errores

| Codigo | Estado | Cuando |
| --- | --- | --- |
| `VALIDACION` | 400 | Datos invalidos |
| `JSON_INVALIDO` | 400 | Body que no es JSON |
| `CLIENTE_REQUERIDO` | 401 | Falta `X-Cliente-Id` |
| `ESCENA_NO_ENCONTRADA`, `RENDER_NO_ENCONTRADO` | 404 | No existe (o es de otro cliente al cancelar) |
| `RUTA_NO_ENCONTRADA` | 404 | Ruta desconocida |
| `METODO_NO_PERMITIDO` | 405 | Metodo no admitido |
| `RENDER_TERMINADO` | 409 | Se intenta cancelar algo que ya termino |
| `CONFLICTO_DE_VERSION` | 412 | `If-Match` no coincide con la version actual |
| `PAYLOAD_GRANDE` | 413 | Body muy grande |
| `FORMATO_NO_SOPORTADO` | 415 | Falta `Content-Type: application/json` |
| `PRECONDICION_REQUERIDA` | 428 | Falta `If-Match` |
| `LIMITE_POR_CLIENTE` | 429 | El cliente ya tiene 2 renders activos |
| `ERROR_INTERNO` | 500 | Error inesperado |
| `COLA_LLENA` | 503 | Hay 5 renders esperando |

## Estructura

```
src/
  app.js, server.js
  concurrencia/  semaforo y single flight, granja (cola, limites, timeout, cancelacion)
  services/      escenas (versiones y vista previa), renderizador simulado
  routes/        escenas y renders
  validators/    validaciones escritas a mano
  middlewares/   errores, notFound, metodoNoPermitido, exigirTipo
  errores/       catalogo de errores
test/            semaforo, single flight, granja con un renderizador controlado y pruebas de API
soporte/         renderizador manual y utilidades de espera
```
