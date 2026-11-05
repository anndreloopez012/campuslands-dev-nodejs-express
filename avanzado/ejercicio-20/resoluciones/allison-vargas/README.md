# Avanzado 20 - Idempotencia (dibujo digital)

API en Node.js y Express para encargar ilustraciones digitales (comisiones) y pagarlas. Si el cliente reintenta porque se corto la conexion, hace doble clic o su app reenvia la peticion, **la operacion se ejecuta una sola vez**. Se usa la cabecera `Idempotency-Key`, el mismo mecanismo que usan las APIs de pago.

## Como ejecutarlo

```bash
npm install
npm start          # puerto 3000, cambia con PORT=3100
npm test
```

Ruta base: `/avanzado/ejercicio-20`. La pasarela de pago esta simulada (tarda 150 ms y devuelve un id de transaccion).

## Probar rapido

```bash
BASE=http://localhost:3000/avanzado/ejercicio-20
H='-H Content-Type:application/json -H X-Cliente-Id:cliente-uno'
curl -i $H -H "Idempotency-Key: 7c1f2a90-pedido-1" \
  -d '{"artistaId":2,"tipo":"personaje","descripcion":"Hechicera con capa de estrellas"}' $BASE/comisiones
# repetir exactamente lo mismo devuelve la misma comision con Idempotent-Replayed: true
curl -i $H -H "Idempotency-Key: 7c1f2a90-pago-1" -d '{"comisionId":1,"monto":70000}' $BASE/pagos
```

## Como funciona (`src/idempotencia/`)

1. El cliente genera una clave unica por operacion (por ejemplo un UUID) y la envia en `Idempotency-Key`. Si reintenta, envia **la misma clave**.
2. El servidor calcula una **huella** de la peticion: metodo, ruta y body en JSON canonico (el orden de las claves no importa).
3. Busca la clave **para ese cliente** (`X-Cliente-Id`):

| Situacion | Respuesta |
| --- | --- |
| Clave nueva | Se reserva como `en_proceso` y se ejecuta la operacion |
| Ya completada, misma huella | Se devuelve la respuesta guardada (status, body, `Location`) con `Idempotent-Replayed: true`. No se ejecuta nada |
| Ya completada, **otra huella** | `422 CLAVE_REUTILIZADA`: es un error del cliente reusar la clave para otra cosa |
| Todavia `en_proceso` | `409 PETICION_EN_CURSO` con `Retry-After: 1` |

4. Al responder:
   - Respuestas `2xx` y `4xx` se guardan: son el resultado de la operacion (un `400` por datos invalidos seguira siendo `400`).
   - Respuestas `5xx` **no se guardan** y la clave se libera: el fallo fue del servidor o de la pasarela y el cliente debe poder reintentar con la misma clave.
   - Si la conexion se corta antes de responder, la clave tambien se libera.
5. Las claves vencen a las **24 horas**. Un `en_proceso` que lleva mas de **30 segundos** se considera colgado y se libera.

## Idempotencia no es control de concurrencia

Dos pestanas pueden pagar la misma comision con **claves distintas**. Para eso la idempotencia no sirve: cada clave es una operacion distinta. Por eso los pagos de una misma comision pasan por un **candado por comision** (una cola de promesas): el segundo pago espera al primero, ve el saldo actualizado y recibe `409 PAGO_EXCEDE_SALDO` en lugar de cobrar dos veces.

## Idempotencia natural

`PUT /comisiones/:id/estado` no necesita clave: pedir el mismo estado dos veces deja todo igual y responde `cambio: false`. `GET`, `PUT` y `DELETE` deberian ser idempotentes por diseno; `POST` es el que necesita la cabecera.

## Rutas

| Metodo y ruta | Clave | Que hace |
| --- | --- | --- |
| `GET /` | | Informacion del ejercicio |
| `GET /artistas` | | Artistas y tarifas |
| `GET /comisiones` | | Comisiones del cliente (`X-Cliente-Id`) |
| `POST /comisiones` | si | `{ artistaId, tipo: retrato|personaje|fondo, descripcion, resolucion?: 2k|4k, urgente? }`. 4k suma 30%, urgente 50% |
| `GET /comisiones/:id` | | Detalle con saldo |
| `PUT /comisiones/:id/estado` | | `{ estado }`: `pagada -> en_progreso -> entregada` |
| `GET /pagos?comisionId=` | | Pagos |
| `POST /pagos` | si | `{ comisionId, monto }`. Cobra en la pasarela; al llegar a saldo 0 la comision queda `pagada` |

## Errores

| Codigo | Estado | Cuando |
| --- | --- | --- |
| `VALIDACION` | 400 | Datos invalidos |
| `JSON_INVALIDO` | 400 | Body que no es JSON |
| `CLAVE_IDEMPOTENCIA_REQUERIDA` | 400 | Falta `Idempotency-Key` en un POST |
| `CLAVE_IDEMPOTENCIA_INVALIDA` | 400 | La clave no tiene 8 a 64 caracteres `A-Z a-z 0-9 _ -` |
| `CLIENTE_REQUERIDO` | 401 | Falta `X-Cliente-Id` |
| `ARTISTA_NO_ENCONTRADO`, `COMISION_NO_ENCONTRADA` | 404 | No existe |
| `RUTA_NO_ENCONTRADA` | 404 | Ruta desconocida |
| `METODO_NO_PERMITIDO` | 405 | Metodo no admitido |
| `PETICION_EN_CURSO` | 409 | La misma clave todavia se procesa |
| `PAGO_EXCEDE_SALDO` | 409 | El monto supera lo que falta pagar |
| `TRANSICION_INVALIDA` | 409 | Cambio de estado no permitido |
| `PAYLOAD_GRANDE` | 413 | Body muy grande |
| `FORMATO_NO_SOPORTADO` | 415 | Falta `Content-Type: application/json` |
| `CLAVE_REUTILIZADA` | 422 | Misma clave con otra peticion |
| `ERROR_INTERNO` | 500 | Error inesperado |
| `PASARELA_NO_DISPONIBLE` | 502 | Fallo la pasarela; se puede reintentar con la misma clave |

## Estructura

```
src/
  app.js, server.js
  idempotencia/  almacen (claves por cliente, vigencia, bloqueos), middleware (huella, repeticion, liberacion)
  services/      estudio (comisiones, pagos y candados), pasarela simulada
  routes/        estudio
  validators/    validaciones escritas a mano
  middlewares/   errores, notFound, metodoNoPermitido, exigirTipo
  errores/       catalogo de errores
test/            almacen, huella, candados y pruebas de API con una pasarela controlada
```
