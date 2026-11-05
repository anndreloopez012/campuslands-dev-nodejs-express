# Intermedio 19 - dotenv y config

## Que hace

API de un estudio de tatuajes (Tinta Viva Studio) cuya configuracion sale de variables de entorno. Se cargan con dotenv desde un archivo `.env`, se validan al arrancar y se exponen en un modulo unico (`src/config/index.js`). Las reglas del estudio (horario, duracion de sesion, citas por dia, dias cerrados, anticipacion maxima y porcentaje de deposito) se leen de ahi.

Si falta una variable, tiene un valor invalido o el horario no alcanza para una sesion, el servidor no arranca y muestra la lista de errores.

## Estructura

```
.env.example
src/
  app.js
  server.js
  config/index.js
  constants/citas.js
  controllers/
  data/
  middlewares/
  repositories/
  routes/
  services/
  utils/
  validators/
```

## Como ejecutar

```
npm install
copy .env.example .env
npm run dev
```

En Linux o macOS el segundo paso es `cp .env.example .env`. El archivo `.env` no se sube al repositorio (esta en `.gitignore`); solo se entrega `.env.example`.

Las variables del sistema tienen prioridad sobre el `.env`, y el `.env` sobre los valores por defecto.

| Variable | Defecto | Descripcion |
|---|---|---|
| PORT | 3000 | Puerto del servidor (1-65535) |
| NODE_ENV | development | development, test o production |
| APP_NAME | Tinta Viva Studio | Nombre del estudio |
| API_KEY | solo en desarrollo | Clave para `x-api-key` (16-64 caracteres). Obligatoria en production |
| LOG_LEVEL | info | silent, info o debug |
| HORA_APERTURA | 10:00 | Formato HH:MM |
| HORA_CIERRE | 19:00 | Formato HH:MM |
| DURACION_SESION_MIN | 60 | Minutos por sesion (15-480) |
| MAX_CITAS_POR_DIA | 4 | Citas por tatuador y dia (1-20) |
| DIAS_CERRADOS | 0 | Dias de la semana cerrados, 0 domingo a 6 sabado, separados por coma |
| DIAS_ANTICIPACION_MAX | 90 | Dias maximos de anticipacion (1-365) |
| DEPOSITO_PORCENTAJE | 20 | Porcentaje del precio estimado (0-100) |

## Respuesta esperada

`GET /intermedio/ejercicio-19`

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "dotenv y config"
}
```

## Endpoints

Base: `/intermedio/ejercicio-19`

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/config` | Configuracion publica del estudio |
| GET | `/config/completa` | Configuracion completa y origen de cada variable. Requiere `x-api-key` |
| GET | `/tatuadores` | Lista tatuadores |
| GET | `/tatuadores/:id` | Detalle de un tatuador |
| GET | `/tatuadores/:id/horarios?fecha=AAAA-MM-DD` | Horas libres de un tatuador en una fecha |
| GET | `/citas` | Lista citas |
| GET | `/citas/:id` | Detalle de una cita |
| POST | `/citas` | Crea una cita |
| PATCH | `/citas/:id/estado` | Cambia el estado de una cita |

## Campos del body

`POST /citas` (todos obligatorios):

| Campo | Tipo | Regla |
|---|---|---|
| cliente | texto | 2 a 60 caracteres |
| email | texto | email valido |
| tatuadorId | entero | debe existir y estar activo |
| fecha | texto | AAAA-MM-DD |
| hora | texto | HH:MM |
| zona | texto | 3 a 40 caracteres |
| precioEstimado | entero | 1 a 20000 |

`PATCH /citas/:id/estado`: `estado` (confirmada, completada o cancelada).

Transiciones: pendiente a confirmada o cancelada; confirmada a completada o cancelada.

## Parametros de consulta

- `/tatuadores`: `estilo` (realismo, tradicional, linea fina, blackwork, acuarela, neotradicional), `activo` (true o false), `orden` (id, nombre), `pagina`, `limite`.
- `/citas`: `estado`, `tatuadorId`, `fecha` (AAAA-MM-DD), `orden` (fecha, reciente), `pagina`, `limite`.

## Ejemplos

curl:

```
curl http://localhost:3000/intermedio/ejercicio-19/config
curl -H "x-api-key: cambia-esta-clave-por-una-propia" http://localhost:3000/intermedio/ejercicio-19/config/completa
curl "http://localhost:3000/intermedio/ejercicio-19/tatuadores/1/horarios?fecha=2026-12-14"
curl -X POST http://localhost:3000/intermedio/ejercicio-19/citas -H "Content-Type: application/json" -d "{\"cliente\":\"Ana Ruiz\",\"email\":\"ana@correo.test\",\"tatuadorId\":2,\"fecha\":\"2026-12-16\",\"hora\":\"10:00\",\"zona\":\"muneca\",\"precioEstimado\":200}"
```

PowerShell:

```
Invoke-RestMethod http://localhost:3000/intermedio/ejercicio-19/config
Invoke-RestMethod -Headers @{ "x-api-key" = "cambia-esta-clave-por-una-propia" } http://localhost:3000/intermedio/ejercicio-19/config/completa
$body = @{ cliente = "Ana Ruiz"; email = "ana@correo.test"; tatuadorId = 2; fecha = "2026-12-16"; hora = "10:00"; zona = "muneca"; precioEstimado = 200 } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/intermedio/ejercicio-19/citas -ContentType "application/json" -Body $body
```

## Formato de respuesta

Exito: `{ "ok": true, "data": ... }`. Los listados agregan `paginacion` con `pagina`, `limite`, `total` y `totalPaginas`. Al crear una cita responde 201 con el header `Location`.

La configuracion completa muestra la API key enmascarada y `origenes`, que indica si cada valor vino de `sistema`, `.env` o `defecto`.

## Errores

Formato: `{ "ok": false, "message": "...", "codigo": "...", "errores": [...] }`

| Status | Codigo | Cuando |
|---|---|---|
| 400 | VALIDACION, CONSULTA_INVALIDA, JSON_INVALIDO | Body o parametros invalidos |
| 400 | HORARIO_FUERA_DE_RANGO | La sesion no cabe entre apertura y cierre |
| 400 | FECHA_PASADA, FECHA_MUY_LEJANA | Fecha fuera del rango permitido |
| 400 | DIA_CERRADO | El estudio no abre ese dia de la semana |
| 401 | API_KEY_FALTANTE | Falta el header `x-api-key` |
| 403 | API_KEY_INVALIDA | La clave no coincide |
| 404 | TATUADOR_NO_ENCONTRADO, CITA_NO_ENCONTRADA | No existe el recurso |
| 405 | METODO_NO_PERMITIDO | Metodo no soportado en la ruta |
| 409 | TATUADOR_INACTIVO, DIA_COMPLETO, HORARIO_OCUPADO, TRANSICION_INVALIDA | Conflicto con el estado actual |
| 422 | REFERENCIA_INVALIDA | El tatuador indicado no existe |
