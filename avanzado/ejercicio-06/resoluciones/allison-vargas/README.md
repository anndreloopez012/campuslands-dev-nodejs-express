# Avanzado 06 - colas de tareas conceptuales

API de un taller de motos donde el trabajo se organiza en una **cola de tareas en memoria**: los trabajos se encolan, los mecanicos los reclaman, los completan o fallan, y la cola se encarga de reintentos, esperas, dependencias y trabajos que no hay forma de terminar.

Tematica: motos y mecanica. Ruta base: `/avanzado/ejercicio-06`.

## Ejecutar

```bash
npm install
npm start
npm test
```

El servidor usa el puerto `3000` o el de la variable `PORT`. Para probar esperas y vencimientos sin esperar de verdad, arrancar con `RELOJ_VIRTUAL=true npm start`: habilita `POST /reloj/avanzar`.

## Idea de diseno

Un trabajo no se "ejecuta" dentro de la peticion: se deja en la cola y alguien lo reclama despues. Eso obliga a resolver los problemas tipicos de una cola:

- **Estados.** `bloqueada` (espera dependencias), `programada` (espera una hora), `pendiente` (lista para reclamar), `en_proceso`, `completada`, `muerta` y `cancelada`.
- **Prioridades.** De 0 (urgente) a 3 (baja). Se atiende por prioridad y, dentro de cada una, por orden de llegada.
- **Concurrencia por tipo.** Cada tipo de trabajo tiene un limite de trabajos a la vez (el banco de frenos solo admite uno, el lavado dos). Un tipo lleno no frena a los demas.
- **Lease con token.** Reclamar un trabajo da un token y un plazo. Solo quien tiene el token vigente puede completarlo, fallarlo o extender el plazo (hasta 3 extensiones). Si el plazo vence sin respuesta, el trabajo vuelve a la cola y el token viejo queda invalido. La entrega es "al menos una vez": un mecanico lento puede perder su trabajo y otro lo repite.
- **Reintentos con espera creciente.** Cada fallo reprograma el trabajo esperando `base * 2^(intento-1)` milisegundos, con un tope por tipo. Al agotar los intentos el trabajo pasa a `muerta`.
- **Cola de muertos.** `GET /muertas` lista los trabajos que no se pudieron terminar. `POST /trabajos/:id/reencolar` les da otra oportunidad con los intentos en cero y restaura tambien los trabajos que se habian cancelado por su culpa.
- **Dependencias.** Un trabajo puede esperar a otros. Se libera cuando todos terminan; si alguno muere o se cancela, se cancela en cascada (y se anota quien fue la causa).
- **Clave unica.** `claveUnica` evita duplicados mientras el trabajo siga activo (incluso muerto); cuando se completa o se cancela, la clave se puede reutilizar.
- **Historial.** Cada trabajo guarda cada paso que dio (`creada`, `encolada`, `reclamada`, `fallida`, `lease_expirado`, ...).
- **Estadisticas.** `GET /estadisticas` resume estados, uso de cada tipo, espera promedio, trabajo pendiente mas antiguo y reintentos.
- **Ordenes del taller.** Una orden crea un grafo de trabajos: un diagnostico, los servicios pedidos (que esperan al diagnostico) y, al final, un lavado de prioridad baja que espera a todos los servicios. Si no se puede encolar alguno, los ya creados se cancelan y la orden no existe.
- **Mecanicos simulados.** `POST /procesador/ejecutar` hace que los mecanicos (con sus habilidades y capacidad) reclamen y ejecuten trabajo. Para ver los fallos en accion, la carga de un trabajo acepta `fallosSimulados: n` (falla en los primeros n intentos) y `colgar: true` (el mecanico nunca responde, asi que el plazo vence).
- **Reloj.** El reloj se inyecta: con `RELOJ_VIRTUAL=true` el tiempo solo avanza con `POST /reloj/avanzar`, lo que hace las pruebas deterministas.

## Tipos de trabajo

| Tipo | A la vez | Plazo | Intentos | Espera entre intentos |
| --- | --- | --- | --- | --- |
| `diagnostico` | 2 | 30 s | 3 | 1 s hasta 60 s |
| `cambio_aceite` | 2 | 30 s | 3 | 1 s hasta 60 s |
| `frenos` | 1 | 60 s | 3 | 2 s hasta 60 s |
| `afinacion` | 1 | 60 s | 3 | 2 s hasta 60 s |
| `electrica` | 1 | 45 s | 4 | 1 s hasta 30 s |
| `lavado` | 2 | 20 s | 2 | 0,5 s hasta 5 s |

## Rutas

| Ruta | Descripcion |
| --- | --- |
| `GET /` | Respuesta base del ejercicio |
| `GET /trabajos` | Filtros `estado`, `tipo`, `ordenId`, `prioridad`; paginacion |
| `POST /trabajos` | Encolar `{ tipo, carga?, prioridad?, retrasoMs?, maxIntentos?, claveUnica?, dependeDe? }`; `201`, o `200` con `duplicado: true` |
| `GET /trabajos/:id` | Detalle con historial |
| `POST /trabajos/:id/completar` | `{ token, resultado? }` |
| `POST /trabajos/:id/fallar` | `{ token, mensaje?, definitivo? }` |
| `POST /trabajos/:id/extender` | `{ token }` |
| `POST /trabajos/:id/cancelar` | Solo trabajos que aun no estan en proceso |
| `POST /trabajos/:id/reencolar` | Solo trabajos muertos |
| `GET /trabajadores`, `GET /trabajadores/:id` | Mecanicos y cuantos trabajos llevan |
| `POST /trabajadores/:id/reclamar` | `{ max? }`; devuelve los trabajos con su token |
| `GET /ordenes`, `GET /ordenes/:id` | Ordenes con progreso y costo |
| `POST /ordenes` | `{ cliente, moto, sintomas, servicios, incluirLavado?, prioridad? }` |
| `GET /muertas` | Cola de muertos |
| `GET /estadisticas` | Resumen de la cola |
| `POST /procesador/ejecutar` | `{ max? }`; los mecanicos simulados trabajan |
| `GET /reloj`, `POST /reloj/avanzar` | Reloj; avanzar solo con `RELOJ_VIRTUAL=true` (`{ ms }`) |

## Ejemplos

Crear una orden donde los frenos fallan una vez (con `RELOJ_VIRTUAL=true`):

```bash
curl -X POST http://localhost:3000/avanzado/ejercicio-06/ordenes \
  -H "Content-Type: application/json" \
  -d '{"cliente":"Ana Lopez","moto":{"marca":"Yamaha","modelo":"MT-03","cilindrada":321,"placa":"M123ABC"},"sintomas":["frenos_esponjosos"],"servicios":[{"tipo":"frenos","eje":"ambos","fallosSimulados":1}]}'
```

Que trabajen los mecanicos, esperar el reintento y volver a ejecutar:

```bash
curl -X POST http://localhost:3000/avanzado/ejercicio-06/procesador/ejecutar \
  -H "Content-Type: application/json" -d '{}'
curl -X POST http://localhost:3000/avanzado/ejercicio-06/reloj/avanzar \
  -H "Content-Type: application/json" -d '{"ms": 5000}'
curl -X POST http://localhost:3000/avanzado/ejercicio-06/procesador/ejecutar \
  -H "Content-Type: application/json" -d '{}'
curl http://localhost:3000/avanzado/ejercicio-06/ordenes/1
```

Reclamar a mano, con token:

```bash
curl -X POST http://localhost:3000/avanzado/ejercicio-06/trabajadores/2/reclamar \
  -H "Content-Type: application/json" -d '{"max": 1}'
curl -X POST http://localhost:3000/avanzado/ejercicio-06/trabajos/1/completar \
  -H "Content-Type: application/json" -d '{"token": "EL-TOKEN-RECIBIDO", "resultado": {"costo": 120}}'
```

Ver la cola de muertos y rescatar un trabajo:

```bash
curl http://localhost:3000/avanzado/ejercicio-06/muertas
curl -X POST http://localhost:3000/avanzado/ejercicio-06/trabajos/1/reencolar
curl http://localhost:3000/avanzado/ejercicio-06/estadisticas
```

## Estructura

```
src/
  app.js, server.js
  constants/      estados, tipos de trabajo y limites
  domain/         cola.js (el nucleo), backoff, procesos, ordenes, procesador
  services/       une la cola, las ordenes y los mecanicos
  routes/         trabajos y taller (mecanicos, ordenes, sistema)
  validators/     validacion escrita a mano
  errores/        catalogo de errores
  middlewares/    errores, 404, 405, Content-Type
  data/           mecanicos
soporte/          ayudas para las pruebas (cliente HTTP, reloj y entorno)
test/             pruebas con node:test
```

## Pruebas

`npm test` ejecuta todo con `node:test`, sin dependencias extra. Las pruebas usan un reloj inyectado y un generador de tokens predecible, asi que no esperan tiempo real. Cubren la cola (orden, concurrencia, leases, reintentos, dependencias, cola de muertos, estadisticas), los procesos y el procesador, las ordenes, la validacion, el catalogo de errores y la API completa. `npm run test:cobertura` muestra la cobertura.

## Errores

Todas las respuestas de error tienen la forma `{ ok: false, message, codigo, contexto?, errores? }`. Un fallo inesperado responde `500` generico y el detalle real va solo al registro del servidor.

| Codigo | Estado |
| --- | --- |
| `TRABAJO_NO_ENCONTRADO` | 404 |
| `ORDEN_NO_ENCONTRADA` | 404 |
| `TRABAJADOR_NO_ENCONTRADO` | 404 |
| `DEPENDENCIA_NO_ENCONTRADA` | 422 |
| `DEPENDENCIA_FALLIDA` | 422 |
| `TOKEN_INVALIDO` | 409 |
| `TRABAJO_NO_EN_PROCESO` | 409 |
| `EXTENSIONES_AGOTADAS` | 409 |
| `TRABAJO_EN_PROCESO` | 409 |
| `TRABAJO_FINALIZADO` | 409 |
| `TRABAJO_NO_MUERTO` | 409 |
| `TRABAJADOR_OCUPADO` | 409 |
| `RELOJ_REAL` | 409 |
| `SIMULACION_DESHABILITADA` | 403 |
| `VALIDACION` | 400 |
| `JSON_INVALIDO` | 400 |
| `RUTA_NO_ENCONTRADA` | 404 |
| `METODO_NO_PERMITIDO` | 405 |
| `PAYLOAD_GRANDE` | 413 |
| `TIPO_NO_SOPORTADO` | 415 |
| `ERROR_INTERNO` | 500 |
