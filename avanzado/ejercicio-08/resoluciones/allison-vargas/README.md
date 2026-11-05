# Avanzado 08 - event emitter

API de un centro de pruebas de hiperdeportivos donde casi todo ocurre por **eventos**: una vuelta completada dispara reacciones (record, motor caliente, neumaticos gastados) que a su vez emiten otros eventos. Sirve para ver como se organiza un sistema dirigido por eventos con `EventEmitter` de Node.js y que problemas hay que resolver para que sea seguro.

Tematica: hiperdeportivos. Ruta base: `/avanzado/ejercicio-08`.

## Ejecutar

```bash
npm install
npm start
npm test
```

El servidor usa el puerto `3000` o el de la variable `PORT`.

## Idea de diseno

`src/domain/bus.js` envuelve un `EventEmitter` de Node y le agrega lo que un emisor crudo no trae:

- **Catalogo de eventos.** Solo se pueden emitir y escuchar los eventos declarados en `src/constants/eventos.js`, cada uno con los campos que su dato debe traer. Un nombre mal escrito falla de inmediato en lugar de no pasar nada.
- **Sobre con secuencia.** Cada emision genera un sobre congelado `{ seq, evento, en, sesionId, datos }`. La secuencia ordena los eventos y permite pedir "lo que paso despues del 42".
- **Orden de entrega.** `emit` es sincrono: los manejadores corren en el orden en que se registraron, antes de que `emitir` devuelva. `alPrincipio` coloca uno al frente y `unaVez` lo retira tras la primera entrega. El comodin `*` recibe todos los eventos despues de los manejadores especificos.
- **Un listener roto no rompe a los demas.** Cada manejador se ejecuta dentro de un `try/catch` (y su promesa, si es asincrono, se vigila). El error se guarda en `GET /bus/fallos` y se anuncia como evento `listener:error`, pero la emision sigue y quien emitio no se entera.
- **Limite de suscriptores.** Node solo avisa con una advertencia cuando hay demasiados listeners; aqui hay un tope real por evento (15) y se responde `409`. Las suscripciones internas del sistema no cuentan.
- **Proteccion contra bucles.** Si un listener emite un evento que dispara otro listener que emite el mismo... se corta al pasar de 6 emisiones encadenadas.
- **Historial acotado.** Se guardan los ultimos 500 eventos para consultarlos o reenviarlos.
- **Cascada de reacciones.** `src/domain/reacciones.js` escucha `vuelta:completada` y reacciona: la termica avisa de motor caliente (`motor:sobrecalentado`) y la de seguridad aborta la sesion a la segunda alerta seguida; el cronometro rompe el record del circuito (`record:nuevo`); la de neumaticos avisa una vez por sesion. La sesion ya llega abortada en la misma respuesta HTTP porque todo corre de forma sincrona.
- **Buzones.** Con `POST /buzones` creas un suscriptor propio que guarda los eventos que pidas (con `capacidad`, `unaVez`, `alPrincipio` o `simularFallo`). Eliminarlo retira sus suscripciones. Si no cabe en alguno de sus eventos, no queda ninguna suscripcion a medias.
- **Stream en vivo.** `GET /eventos/stream` envia los eventos por Server-Sent Events. Con `desde=N` o la cabecera `Last-Event-ID` repite lo que se perdio al reconectar, y al cerrarse la conexion se quita la suscripcion.

## Reglas de la pista

- Una sesion une piloto, auto y circuito. Cada vuelta lleva `tiempoMs`, `tempMotor` y `desgaste` (porcentaje).
- Motor a 120 grados o mas es una alerta; dos vueltas seguidas con alerta abortan la sesion. Una vuelta normal reinicia la cuenta.
- Desgaste de 80 o mas avisa una sola vez por sesion.
- Una vuelta mas rapida que el record del circuito lo reemplaza.
- A las 50 vueltas la sesion se finaliza sola.

## Eventos

| Evento | Cuando |
| --- | --- |
| `sesion:iniciada` | Se crea una sesion |
| `vuelta:completada` | Se registra una vuelta |
| `record:nuevo` | Una vuelta supera el record del circuito |
| `motor:sobrecalentado` | La temperatura llega al umbral |
| `neumaticos:desgastados` | El desgaste llega al umbral |
| `sesion:finalizada` | La sesion termina bien |
| `sesion:abortada` | La sesion se aborta |
| `listener:error` | Un manejador lanzo un error |

## Rutas

| Ruta | Descripcion |
| --- | --- |
| `GET /` | Respuesta base del ejercicio |
| `GET /circuitos`, `GET /autos`, `GET /records` | Catalogo y records vigentes |
| `GET /sesiones` | Filtros `estado`, `circuitoId`; paginacion |
| `POST /sesiones` | `{ piloto, auto, circuitoId }` |
| `GET /sesiones/:id` | Detalle con vueltas |
| `POST /sesiones/:id/vueltas` | `{ tiempoMs, tempMotor, desgaste }` |
| `POST /sesiones/:id/finalizar` | `{ motivo? }` |
| `POST /sesiones/:id/abortar` | `{ motivo? }` |
| `GET /eventos` | Historial; filtros `evento`, `sesionId`, `desde`, `limite`; devuelve `siguiente` como cursor |
| `GET /eventos/:seq` | Un evento |
| `GET /eventos/stream` | Server-Sent Events; filtros `eventos` (separados por coma) y `desde` |
| `GET /buzones`, `POST /buzones` | `{ nombre, eventos, capacidad?, unaVez?, alPrincipio?, simularFallo? }` |
| `GET /buzones/:id`, `DELETE /buzones/:id` | Detalle con los eventos guardados; eliminar |
| `POST /buzones/:id/vaciar` | Borra lo guardado |
| `GET /bus` | Contadores y suscriptores por evento |
| `GET /bus/suscripciones` | Quien escucha (filtro `evento`) |
| `GET /bus/fallos` | Ultimos errores de manejadores |

## Ejemplos

Crear un buzon que anote las alertas y una sesion de prueba:

```bash
curl -X POST http://localhost:3000/avanzado/ejercicio-08/buzones \
  -H "Content-Type: application/json" \
  -d '{"nombre":"alertas","eventos":["motor:sobrecalentado","sesion:abortada"]}'
curl -X POST http://localhost:3000/avanzado/ejercicio-08/sesiones \
  -H "Content-Type: application/json" \
  -d '{"piloto":"Lena Ortiz","auto":"nevera","circuitoId":2}'
```

Dos vueltas con el motor caliente abortan la sesion:

```bash
curl -X POST http://localhost:3000/avanzado/ejercicio-08/sesiones/1/vueltas \
  -H "Content-Type: application/json" \
  -d '{"tiempoMs":83000,"tempMotor":125,"desgaste":85}'
curl -X POST http://localhost:3000/avanzado/ejercicio-08/sesiones/1/vueltas \
  -H "Content-Type: application/json" \
  -d '{"tiempoMs":85000,"tempMotor":130,"desgaste":90}'
```

Ver la cadena de eventos y lo que guardo el buzon:

```bash
curl http://localhost:3000/avanzado/ejercicio-08/eventos
curl http://localhost:3000/avanzado/ejercicio-08/buzones/1
curl http://localhost:3000/avanzado/ejercicio-08/records
```

Mirar los eventos en vivo (en otra terminal, antes de crear la sesion):

```bash
curl -N "http://localhost:3000/avanzado/ejercicio-08/eventos/stream?eventos=vuelta:completada,sesion:abortada"
```

Provocar un listener roto y ver que nada mas se rompe:

```bash
curl -X POST http://localhost:3000/avanzado/ejercicio-08/buzones \
  -H "Content-Type: application/json" \
  -d '{"nombre":"roto","eventos":["sesion:iniciada"],"simularFallo":true}'
curl -X POST http://localhost:3000/avanzado/ejercicio-08/sesiones \
  -H "Content-Type: application/json" \
  -d '{"piloto":"Mario Vega","auto":"jesko","circuitoId":1}'
curl http://localhost:3000/avanzado/ejercicio-08/bus/fallos
```

## Estructura

```
src/
  app.js, server.js
  constants/      catalogo de eventos, limites y umbrales
  domain/         bus.js (el nucleo), sesiones, reacciones, buzones, records
  services/       une el bus con la pista
  routes/         sesiones, eventos (incluye el stream), buzones y bus
  validators/     validacion escrita a mano
  errores/        catalogo de errores
  middlewares/    errores, 404, 405, Content-Type
  data/           circuitos y autos de ejemplo
soporte/          ayudas para las pruebas (cliente HTTP, reloj y entorno)
test/             pruebas con node:test
```

## Pruebas

`npm test` ejecuta todo con `node:test`, sin dependencias extra. Cubren el bus (orden de entrega, una vez, comodin, limites, bucles, errores sincronos y asincronos, historial), las reglas de la pista y su cadena de eventos, los buzones, el stream SSE leido de verdad desde un cliente HTTP y toda la API. `npm run test:cobertura` muestra la cobertura.

## Errores

Todas las respuestas de error tienen la forma `{ ok: false, message, codigo, contexto?, errores? }`. Un fallo inesperado responde `500` generico y el detalle real va solo al registro del servidor.

| Codigo | Estado |
| --- | --- |
| `SESION_NO_ENCONTRADA` | 404 |
| `BUZON_NO_ENCONTRADO` | 404 |
| `EVENTO_NO_ENCONTRADO` | 404 |
| `SESION_CERRADA` | 409 |
| `LIMITE_DE_SUSCRIPTORES` | 409 |
| `LIMITE_DE_BUZONES` | 409 |
| `BUCLE_DE_EVENTOS` | 508 |
| `VALIDACION` | 400 |
| `JSON_INVALIDO` | 400 |
| `RUTA_NO_ENCONTRADA` | 404 |
| `METODO_NO_PERMITIDO` | 405 |
| `PAYLOAD_GRANDE` | 413 |
| `TIPO_NO_SOPORTADO` | 415 |
| `ERROR_INTERNO` | 500 |
