# Avanzado 22 - Webhooks simulados (arquitectura 3D)

API en Node.js y Express para un estudio de arquitectura 3D. Cuando pasa algo importante (se crea un proyecto, se publica un plano, se aprueba) la API **avisa por HTTP a los sistemas suscritos**: eso es un webhook. El ejercicio incluye las dos puntas: el **emisor** (firma, reintentos, entregas fallidas) y un **receptor simulado** dentro de la misma app (verificacion de firma, repeticiones y duplicados).

## Como ejecutarlo

```bash
npm install
npm start                                  # puerto 3000, cambia con PORT=3100
WEBHOOKS_PERMITIR_LOCAL=false npm start    # modo estricto: solo https publicas
npm test
```

Ruta base: `/avanzado/ejercicio-22`. Por defecto se permiten urls locales para poder apuntar al receptor simulado.

## Probar rapido

```bash
BASE=http://localhost:3000/avanzado/ejercicio-22
# 1. suscribir el receptor local (guarda el "secreto" de la respuesta: se muestra una sola vez)
curl -H "Content-Type: application/json" -d "{\"url\":\"$BASE/receptor\",\"eventos\":[\"*\"]}" $BASE/suscripciones
# 2. darle el secreto al receptor
curl -X PUT -H "Content-Type: application/json" -d '{"secretos":["whsec_..."]}' $BASE/receptor/configuracion
# 3. provocar eventos
curl -H "Content-Type: application/json" -d '{"nombre":"Museo del Agua","cliente":"Municipalidad","tipo":"museo"}' $BASE/proyectos
curl $BASE/receptor/recibidos
curl $BASE/entregas
```

## Emisor (`src/webhooks/despachador.js`)

### Lo que se envia

`POST` a la url suscrita con el evento en JSON y estas cabeceras:

| Cabecera | Para que |
| --- | --- |
| `X-Webhook-Id` | Id unico del evento (`evt_...`). Sirve al receptor para descartar duplicados |
| `X-Webhook-Evento` | Tipo: `proyecto.creado`, `plano.publicado`, `proyecto.aprobado` o `ping` |
| `X-Webhook-Intento` | Numero de intento |
| `X-Firma` | `t=<timestamp>,v1=<hmac>` |

### Firma (`src/webhooks/firma.js`)

`v1 = HMAC-SHA256(secreto, "<timestamp>.<body>")`. Se firma el timestamp junto con el body para que alguien que capture un webhook **no pueda repetirlo** mas tarde: el receptor rechaza firmas con mas de 5 minutos de diferencia. La comparacion es en tiempo constante.

### Reintentos y entregas fallidas

- Exito: cualquier `2xx`.
- Error, timeout (5 s) o `5xx`: se reintenta con espera exponencial `1 s, 2 s, 4 s, 8 s`.
- Tras 5 intentos la entrega queda `fallida` (dead letter). `POST /entregas/:id/reintento` la vuelve a enviar.
- `410 Gone`: el receptor pide no recibir mas; la suscripcion se **desactiva** y se puede reactivar.
- El envio no bloquea la respuesta de la API: el evento se agenda y se entrega despues.
- No se siguen redirecciones.

### Secretos

- Se generan al suscribir (`whsec_...`) y **se muestran una sola vez**.
- `POST /suscripciones/:id/rotacion` crea uno nuevo; se firma con el nuevo y el anterior sigue valido **24 horas** para que el receptor alcance a actualizarse.

### URLs permitidas

Solo `http`/`https`, sin usuario ni contrasena en la url. En modo estricto (`WEBHOOKS_PERMITIR_LOCAL=false`) solo `https` y nunca direcciones internas (`localhost`, `10.x`, `192.168.x`, `169.254.169.254`...), para que nadie use la API para atacar servicios internos (SSRF).

## Receptor simulado (`src/webhooks/receptor.js`)

Representa el sistema de un cliente y muestra lo que **debe hacer quien recibe** webhooks:

1. Leer el body **crudo** (`express.raw`): la firma se calcula sobre los bytes exactos. Si se parsea y se vuelve a serializar, cambian los espacios y la firma no coincide.
2. Verificar la firma y la tolerancia del timestamp (acepta varios secretos durante una rotacion).
3. Descartar duplicados por `X-Webhook-Id`: el mismo evento puede llegar dos veces si una respuesta se perdio.
4. Responder rapido con `2xx`.

Para probar fallos: `PUT /receptor/configuracion` con `fallarProximos: n` (responde `503` n veces) o `responderGone: true`.

## Rutas

| Metodo y ruta | Que hace |
| --- | --- |
| `GET /` | Informacion del ejercicio |
| `GET /proyectos`, `POST /proyectos` | `{ nombre, cliente, tipo: vivienda|oficina|museo|escuela }` emite `proyecto.creado` |
| `GET /proyectos/:id` | Detalle |
| `POST /proyectos/:id/planos` | `{ nombre, nivel }` emite `plano.publicado` |
| `POST /proyectos/:id/aprobacion` | Emite `proyecto.aprobado` |
| `GET /suscripciones`, `POST /suscripciones` | `{ url, eventos: ["*"] o lista, descripcion? }` |
| `GET /suscripciones/:id`, `DELETE /suscripciones/:id` | Detalle y baja |
| `POST /suscripciones/:id/rotacion` | Rota el secreto |
| `POST /suscripciones/:id/reactivacion` | Reactiva una suscripcion desactivada |
| `POST /suscripciones/:id/prueba` | Envia un evento `ping` |
| `GET /eventos` | Eventos emitidos |
| `GET /entregas?estado=` | `pendiente`, `entregada`, `fallida`, `descartada` |
| `GET /entregas/:id` | Detalle con cada intento |
| `POST /entregas/:id/reintento` | Reenvia una entrega fallida |
| `POST /receptor` | Receptor simulado |
| `PUT /receptor/configuracion` | `{ secretos?, fallarProximos?, responderGone? }` |
| `GET /receptor/recibidos` | Eventos aceptados y rechazos |

## Errores

| Codigo | Estado | Cuando |
| --- | --- | --- |
| `VALIDACION` | 400 | Datos o ids invalidos |
| `JSON_INVALIDO` | 400 | Body que no es JSON |
| `PROYECTO_NO_ENCONTRADO`, `SUSCRIPCION_NO_ENCONTRADA`, `ENTREGA_NO_ENCONTRADA` | 404 | No existe |
| `RUTA_NO_ENCONTRADA` | 404 | Ruta desconocida |
| `METODO_NO_PERMITIDO` | 405 | Metodo no admitido |
| `PROYECTO_YA_APROBADO` | 409 | Se aprueba dos veces |
| `ENTREGA_NO_REINTENTABLE` | 409 | Solo se reintentan entregas fallidas |
| `PAYLOAD_GRANDE` | 413 | Body muy grande |
| `FORMATO_NO_SOPORTADO` | 415 | Falta `Content-Type: application/json` |
| `ERROR_INTERNO` | 500 | Error inesperado |

## Estructura

```
src/
  app.js, server.js
  webhooks/     firma (hmac con timestamp), despachador (suscripciones, entregas, reintentos), receptor simulado
  services/     proyectos (emite eventos)
  routes/       proyectos, suscripciones y entregas, receptor
  validators/   validaciones escritas a mano (incluye urls)
  middlewares/  errores, notFound, metodoNoPermitido, exigirTipo
  errores/      catalogo de errores
test/           firma, urls, despachador con reloj y transporte falsos, y pruebas de punta a punta por HTTP
soporte/        planificador manual, transporte falso y reloj
```
