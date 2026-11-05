# Avanzado 07 - cache en memoria

API de un concesionario de autos de lujo (catalogo, cotizaciones y resumenes por marca) que pone un **cache en memoria** delante de una fuente de datos lenta. Lo importante no es guardar valores en un `Map`, sino resolver lo que viene despues: cuando vence un dato, cuando hay que borrarlo, cuando muchos piden lo mismo a la vez y como saber si el cache esta sirviendo.

Tematica: autos de lujo. Ruta base: `/avanzado/ejercicio-07`.

## Ejecutar

```bash
npm install
npm start
npm test
```

El servidor usa el puerto `3000` o el de la variable `PORT`. Para probar vencimientos sin esperar de verdad, arrancar con `RELOJ_VIRTUAL=true npm start`: habilita `POST /reloj/avanzar`.

## Idea de diseno

- **Cache con vida limitada.** Cada entrada guarda su valor, cuando vence y sus etiquetas. Las lecturas son perezosas: un valor vencido se descarta al consultarlo (o con `POST /cache/purgar`).
- **Datos obsoletos mientras se renuevan.** Cada entrada tiene `ttlMs` (fresca) y `staleMs` (ventana de gracia). Dentro de la ventana, la respuesta sale al instante con `X-Cache: STALE` y se lanza una sola renovacion en segundo plano. Si la renovacion falla se sigue sirviendo el dato viejo hasta que caduque.
- **Capacidad y desalojo LRU.** El cache tiene un maximo de entradas. Al llenarse primero se descarta lo ya vencido y, si hace falta, lo que lleva mas tiempo sin usarse.
- **Etiquetas para invalidar.** Cada entrada lleva etiquetas (`auto:5`, `listados`, `marca:ferrari`). Al modificar un auto se invalidan solo las etiquetas afectadas: ese auto y sus cotizaciones, los listados y el resumen de la marca (la vieja y la nueva si cambio).
- **Cache-aside con carga compartida.** `CacheAside` lee del cache y, si falla, carga de la fuente y guarda. Si cien peticiones piden el mismo auto frio a la vez, solo una va a la fuente y las demas esperan esa misma carga (`X-Cache: COALESCED`).
- **Sin guardar datos viejos por una carrera.** Si un auto se modifica mientras otra peticion lo esta leyendo de la fuente, el valor leido ya es viejo: se entrega a quien lo pidio, pero no se guarda.
- **Ausencias recordadas.** Un 404 tambien se guarda, solo 10 segundos, para que consultar mil veces un id inexistente no golpee la fuente. Crear el auto borra esa ausencia.
- **Cache en capas.** La cotizacion se calcula a partir del auto, que a su vez sale del cache de autos. Ambas capas comparten etiqueta, asi que cambiar el precio invalida las dos.
- **Cache HTTP.** Las respuestas llevan `ETag` y `Cache-Control: private, max-age=<segundos que le quedan>`, y se responde `304` ante `If-None-Match`. Se respeta `Cache-Control: no-cache` en la peticion (renueva el dato) y `no-store` (no usa el cache).
- **Observabilidad.** `GET /cache/estadisticas` muestra aciertos, obsoletos, fallos, desalojos, expiraciones, invalidaciones, tasa de acierto, cargas compartidas y cuantas veces se leyo de verdad la fuente.

La tasa de acierto cuenta como acierto tanto un dato fresco como uno obsoleto, porque en ambos casos la peticion no espero a la fuente.

## Valores de cada cache

| Dato | Fresco | Gracia |
| --- | --- | --- |
| Auto | 60 s | 30 s |
| Listado | 30 s | 15 s |
| Cotizacion | 120 s | no |
| Resumen de marca | 60 s | no |
| Ausencia (404) | 10 s | no |

La capacidad por defecto es de 100 entradas.

## Rutas

| Ruta | Descripcion |
| --- | --- |
| `GET /` | Respuesta base del ejercicio |
| `GET /autos` | Filtros `marca`, `categoria`, `minimo`, `maximo`, `disponible`, `orden`; paginacion |
| `POST /autos` | Crear `{ marca, modelo, anio, categoria, precioUsd, potenciaHp, vin, disponible? }` |
| `GET /autos/:id` | Detalle (cacheado) |
| `PATCH /autos/:id` | Cambios parciales; invalida el cache relacionado |
| `DELETE /autos/:id` | Elimina; invalida el cache relacionado |
| `GET /autos/:id/cotizacion` | Parametros `moneda` (USD, EUR, GTQ, MXN), `anticipo` (0-90), `meses` (12, 24, 36, 48, 60) |
| `GET /marcas/:marca/resumen` | Modelos, disponibles y precios de la marca |
| `GET /cache/estadisticas` | Contadores del cache |
| `GET /cache/claves` | Entradas guardadas (`etiqueta`, `prefijo`), sin sus valores |
| `DELETE /cache/claves/:clave` | Borra una entrada |
| `DELETE /cache/etiquetas/:etiqueta` | Invalida todas las entradas con esa etiqueta |
| `DELETE /cache` | Vacia el cache |
| `POST /cache/purgar` | Quita las entradas ya caducadas |
| `GET /reloj`, `POST /reloj/avanzar` | Reloj; avanzar solo con `RELOJ_VIRTUAL=true` (`{ ms }`) |

Las respuestas de lectura incluyen `X-Cache` con uno de estos valores: `MISS`, `HIT`, `STALE`, `COALESCED`, `REFRESH` o `BYPASS`.

## Ejemplos

Ver el cache en accion (la segunda respuesta dice `X-Cache: HIT`):

```bash
curl -i http://localhost:3000/avanzado/ejercicio-07/autos/1
curl -i http://localhost:3000/avanzado/ejercicio-07/autos/1
```

Revalidar con el ETag (responde `304` sin cuerpo):

```bash
curl -i http://localhost:3000/avanzado/ejercicio-07/autos/1 \
  -H "If-None-Match: \"EL-ETAG-RECIBIDO\"" -H "Cache-Control: max-age=0"
```

Forzar una lectura nueva o saltarse el cache:

```bash
curl -i http://localhost:3000/avanzado/ejercicio-07/autos/1 -H "Cache-Control: no-cache"
curl -i http://localhost:3000/avanzado/ejercicio-07/autos/1 -H "Cache-Control: no-store"
```

Cotizar en otra moneda y ver la invalidacion al cambiar el precio:

```bash
curl "http://localhost:3000/avanzado/ejercicio-07/autos/1/cotizacion?moneda=EUR&anticipo=30&meses=48"
curl -X PATCH http://localhost:3000/avanzado/ejercicio-07/autos/1 \
  -H "Content-Type: application/json" -d '{"precioUsd": 260000}'
curl "http://localhost:3000/avanzado/ejercicio-07/autos/1/cotizacion?moneda=EUR&anticipo=30&meses=48"
```

Inspeccionar el cache:

```bash
curl http://localhost:3000/avanzado/ejercicio-07/cache/estadisticas
curl "http://localhost:3000/avanzado/ejercicio-07/cache/claves?etiqueta=auto:1"
curl -X DELETE http://localhost:3000/avanzado/ejercicio-07/cache/etiquetas/listados
```

Ver un dato obsoleto (con `RELOJ_VIRTUAL=true`):

```bash
curl -s http://localhost:3000/avanzado/ejercicio-07/autos/1 > /dev/null
curl -X POST http://localhost:3000/avanzado/ejercicio-07/reloj/avanzar \
  -H "Content-Type: application/json" -d '{"ms": 70000}'
curl -i http://localhost:3000/avanzado/ejercicio-07/autos/1
```

## Estructura

```
src/
  app.js, server.js
  constants/      politicas de cache, categorias, monedas
  domain/         cache.js (el nucleo), cargador.js (cache-aside), inventario, cotizacion
  services/       une el cache con el inventario y define las etiquetas
  routes/         autos, marcas, cache y reloj
  validators/     validacion escrita a mano
  errores/        catalogo de errores
  middlewares/    errores, 404, 405, Content-Type
  utils/          ETag y Cache-Control, reloj virtual, paginacion
  data/           autos de ejemplo
soporte/          ayudas para las pruebas (cliente HTTP, reloj y compuerta de espera)
test/             pruebas con node:test
```

## Pruebas

`npm test` ejecuta todo con `node:test`, sin dependencias extra. Las pruebas usan un reloj inyectado y una "compuerta" que detiene la fuente de datos a voluntad, asi que ni esperan tiempo real ni dependen de la suerte para probar carreras. Cubren el cache (vencimiento, gracia, desalojo, etiquetas), el cache-aside (carga compartida, obsoletos, ausencias, invalidacion durante una carga), el dominio, la API con sus cabeceras y la administracion del cache. `npm run test:cobertura` muestra la cobertura.

## Errores

Todas las respuestas de error tienen la forma `{ ok: false, message, codigo, contexto?, errores? }`. Un fallo inesperado responde `500` generico y el detalle real va solo al registro del servidor.

| Codigo | Estado |
| --- | --- |
| `AUTO_NO_ENCONTRADO` | 404 |
| `MARCA_NO_ENCONTRADA` | 404 |
| `CLAVE_NO_ENCONTRADA` | 404 |
| `VIN_DUPLICADO` | 409 |
| `RELOJ_REAL` | 409 |
| `VALIDACION` | 400 |
| `JSON_INVALIDO` | 400 |
| `RUTA_NO_ENCONTRADA` | 404 |
| `METODO_NO_PERMITIDO` | 405 |
| `PAYLOAD_GRANDE` | 413 |
| `TIPO_NO_SOPORTADO` | 415 |
| `ERROR_INTERNO` | 500 |
