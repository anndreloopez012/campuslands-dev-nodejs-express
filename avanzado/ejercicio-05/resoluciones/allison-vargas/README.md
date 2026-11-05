# Avanzado 05 - transacciones simuladas

API de traspasos de futbol y futbol sala (clubes, jugadores, agentes, fichajes e intercambios) donde cada operacion que toca varios registros se ejecuta como una **transaccion simulada en memoria**: o se aplica completa o no se aplica nada.

Tematica: futbol y futbol sala. Ruta base: `/avanzado/ejercicio-05`.

## Ejecutar

```bash
npm install
npm start
npm test
```

El servidor usa el puerto `3000` o el de la variable `PORT`.

## Idea de diseno

Un fichaje cambia, a la vez, el presupuesto de dos clubes, el saldo de un agente, el club del jugador, dos contadores de plantilla y cuatro asientos del libro. Si falla cualquier paso, nada de eso debe quedar a medias.

- **Escrituras en escena.** `src/tx/` implementa un almacen con transacciones. Dentro de una transaccion, las escrituras se acumulan aparte; la transaccion lee sus propios cambios, pero nadie mas los ve. Si el trabajo lanza un error, simplemente se descartan: la reversion es gratuita y no hay estado a medias.
- **Confirmacion atomica con control optimista.** Cada registro tiene una version. Al confirmar se comprueba que ningun registro leido o escrito haya cambiado desde que la transaccion empezo; si cambio, hay `CONFLICTO_DE_VERSION` y no se aplica nada. Si todo coincide, todas las escrituras se aplican en un solo bloque sincrono.
- **Reintentos.** Ante un conflicto la transaccion se repite desde cero sobre los datos nuevos, hasta un maximo. Solo se reintenta por conflicto: un error de regla de negocio no se reintenta.
- **Puntos de control.** `puntoDeControl` y `revertirA` permiten deshacer parte de una transaccion sin abandonarla.
- **Salidas diferidas.** `tx.encolar` guarda avisos que solo se publican (`GET /notificaciones`) si la transaccion se confirma. Una transaccion revertida no avisa de nada.
- **Tiempo maximo.** Una transaccion que tarda mas del limite se cancela con `TRANSACCION_EXPIRADA`.
- **Simulacion.** `POST /fichajes/simulacion` ejecuta la operacion real y siempre la revierte, devolviendo el antes y el despues de cada registro. Una regla rota responde `viable: false` con la razon, sin lanzar error.
- **Idempotencia.** Con la cabecera `Idempotency-Key`, repetir una peticion devuelve el mismo resultado (`200` e `Idempotent-Replay: true`) sin ejecutarla otra vez. La clave se guarda dentro de la misma transaccion, asi que dos peticiones simultaneas con la misma clave tambien se ejecutan una sola vez. Una peticion que falla no consume la clave.
- **Diario.** Cada intento queda registrado (`GET /transacciones`): confirmada, revertida, conflicto o simulada, con las escrituras y la duracion.
- **Auditoria.** `GET /auditoria` comprueba los invariantes: el dinero total no cambia, los contadores de plantilla coinciden con los jugadores reales, las plantillas estan en rango, nadie queda sin club ni en un club de otra modalidad, y cada fichaje suma cero en el libro.

Limites de la simulacion: las lecturas puntuales se validan, pero no hay proteccion contra "fantasmas" en listados (un registro nuevo que aparece en una consulta). Los ids de `insertar` salen de una secuencia que no se revierte, como en una base de datos real, asi que puede haber huecos tras una reversion.

## Reglas del dominio

- Los clubes tienen modalidad (`futbol` o `futsal`), presupuesto, plantilla y limites de plantilla. Un jugador solo puede ir a un club de su misma modalidad.
- Fichaje: el precio debe alcanzar el minimo del jugador; el club comprador paga precio mas una comision del 5% al agente (redondeada hacia arriba) y debe tener presupuesto y espacio en la plantilla; el vendedor no puede quedar por debajo de su minimo.
- Un jugador movido no puede volver a moverse durante 30 dias.
- Intercambio: dos jugadores de clubes distintos y misma modalidad se cruzan; opcionalmente un club paga una compensacion al otro.
- Los importes son enteros (miles de euros).

## Rutas

| Ruta | Descripcion |
| --- | --- |
| `GET /` | Respuesta base del ejercicio |
| `GET /clubes`, `GET /clubes/:id` | Clubes (filtro `modalidad`); el detalle incluye sus jugadores |
| `GET /jugadores`, `GET /jugadores/:id` | Filtros `clubId`, `modalidad`, `buscar`; paginacion |
| `GET /agentes` | Agentes y su saldo |
| `POST /fichajes` | Fichar `{ jugadorId, clubDestinoId, precio, salario? }`; acepta `Idempotency-Key` |
| `POST /fichajes/simulacion` | Mismo cuerpo; muestra los cambios sin aplicarlos |
| `GET /fichajes`, `GET /fichajes/:id` | Filtros `clubId`, `tipo` |
| `POST /intercambios` | `{ jugadorAId, jugadorBId, compensacion?: { pagaClubId, monto } }` |
| `POST /intercambios/simulacion` | Mismo cuerpo; solo simula |
| `GET /movimientos` | Libro; filtros `clubId`, `agenteId`, `fichajeId` |
| `GET /transacciones` | Diario; filtros `estado`, `nombre` |
| `GET /notificaciones` | Avisos publicados por transacciones confirmadas |
| `GET /auditoria` | Verificacion de invariantes |

Para ver la reversion en accion, `POST /fichajes` y `POST /intercambios` aceptan `simularFalloEn` con el nombre de un paso (`validado`, `debitado`, `acreditado`, `comision`, `movido`, `plantillas`, `registrado`; en intercambios `validado`, `compensado`, `movidoA`, `movidoB`, `registrado`). La operacion falla con `503 FALLO_SIMULADO` justo en ese paso y todo queda como antes. En el codigo se puede deshabilitar con `permitirFallos: false`.

## Ejemplos

Fichar con clave de idempotencia:

```bash
curl -i -X POST http://localhost:3000/avanzado/ejercicio-05/fichajes \
  -H "Content-Type: application/json" -H "Idempotency-Key: fichaje-0001" \
  -d '{"jugadorId": 21, "clubDestinoId": 1, "precio": 9000}'
```

Repetir el mismo comando responde `200` con `"repetida": true` y no vuelve a mover dinero.

Simular antes de decidir:

```bash
curl -X POST http://localhost:3000/avanzado/ejercicio-05/fichajes/simulacion \
  -H "Content-Type: application/json" \
  -d '{"jugadorId": 22, "clubDestinoId": 3, "precio": 9000}'
```

Provocar un fallo a mitad de camino y comprobar que nada cambio:

```bash
curl -X POST http://localhost:3000/avanzado/ejercicio-05/fichajes \
  -H "Content-Type: application/json" \
  -d '{"jugadorId": 22, "clubDestinoId": 3, "precio": 9000, "simularFalloEn": "movido"}'
curl http://localhost:3000/avanzado/ejercicio-05/clubes/3
curl "http://localhost:3000/avanzado/ejercicio-05/transacciones?estado=revertida"
curl http://localhost:3000/avanzado/ejercicio-05/auditoria
```

## Errores

Todas las respuestas de error tienen la forma `{ ok: false, message, codigo, contexto?, errores? }`. Un fallo inesperado responde `500` generico y el detalle real va solo al registro del servidor.

| Codigo | Estado |
| --- | --- |
| `JUGADOR_NO_ENCONTRADO` | 404 |
| `CLUB_NO_ENCONTRADO` | 404 |
| `FICHAJE_NO_ENCONTRADO` | 404 |
| `MISMO_CLUB` | 422 |
| `JUGADORES_DEL_MISMO_CLUB` | 422 |
| `MODALIDAD_DISTINTA` | 422 |
| `PRECIO_BAJO_EL_MINIMO` | 422 |
| `PRESUPUESTO_INSUFICIENTE` | 422 |
| `COMPENSACION_INVALIDA` | 422 |
| `PLANTILLA_COMPLETA` | 409 |
| `PLANTILLA_MINIMA` | 409 |
| `JUGADOR_RECIEN_FICHADO` | 409 |
| `IDEMPOTENCIA_CONFLICTO` | 422 |
| `CONFLICTO_DE_VERSION` | 409 |
| `TRANSACCION_EXPIRADA` | 408 |
| `FALLO_SIMULADO` | 503 |
| `VALIDACION` | 400 |
| `JSON_INVALIDO` | 400 |
| `RUTA_NO_ENCONTRADA` | 404 |
| `METODO_NO_PERMITIDO` | 405 |
| `PAYLOAD_GRANDE` | 413 |
| `TIPO_NO_SOPORTADO` | 415 |
| `ERROR_INTERNO` | 500 |

## Estructura

```text
src/
  app.js, server.js
  constants/        rutas y reglas numericas
  errores/          catalogo de errores y crear()
  tx/               almacen, transaccion y diario
  domain/           operaciones (fichar, intercambiar), idempotencia, invariantes
  services/         casos de uso sobre el almacen
  routes/           clubes, jugadores, fichajes, intercambios, libro
  validators/       validacion de entrada (400)
  middlewares/      errores, exigirJson, metodoNoPermitido, notFound
  data/             clubes, jugadores y agentes iniciales
soporte/            ayudas de las pruebas (reloj controlable, entorno, cliente)
test/               116 pruebas
```

## Pruebas

```bash
npm test
npm run test:cobertura
```

Cubren el motor (confirmacion, reversion, conflictos, reintentos, puntos de control, tiempo, simulacion), cada regla de negocio, un fallo forzado en cada paso comprobando que el estado queda identico, operaciones simultaneas con pausas controladas, una carga mezclada de 40 operaciones entrelazadas que debe terminar con todos los invariantes intactos, y la API completa.
