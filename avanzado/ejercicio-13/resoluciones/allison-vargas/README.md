# Avanzado 13 - Observabilidad y logs (ciencia ficcion)

API en Node.js y Express para gestionar misiones de una flota estelar. El foco no esta en las misiones sino en poder **ver que pasa dentro del servidor**: cada peticion lleva un identificador, todo se registra como JSON estructurado, los datos sensibles se ocultan y los logs se pueden consultar y ajustar sin reiniciar.

## Como ejecutarlo

```bash
npm install
npm start          # puerto 3000, cambia con PORT=3100
LOG_NIVEL=debug npm start
npm test
npm run test:cobertura
```

Ruta base: `/avanzado/ejercicio-13`. Los datos viven en memoria (8 naves en `src/data/naves.json`).

## Probar rapido

```bash
curl -i http://localhost:3000/avanzado/ejercicio-13/naves
curl -i -H "X-Request-Id: mi-traza-0001" -H "Content-Type: application/json" \
  -d '{"naveId":1,"destino":"Marte","objetivo":"Mapear el valle"}' \
  http://localhost:3000/avanzado/ejercicio-13/misiones
curl "http://localhost:3000/avanzado/ejercicio-13/logs?requestId=mi-traza-0001"
curl -X PUT -H "Content-Type: application/json" -d '{"nivel":"debug"}' \
  http://localhost:3000/avanzado/ejercicio-13/logs/nivel
```

## Que se implemento

### Logger estructurado (`src/observabilidad/logger.js`)

- Niveles `debug < info < warn < error`. Lo que esta por debajo del nivel actual no se escribe.
- Cada entrada es un objeto JSON: `tiempo`, `nivel`, `mensaje`, el contexto y los datos extra.
- `logger.hijo({ requestId })` crea un logger que agrega contexto sin repetirlo en cada llamada. Todos los hijos comparten el nivel del padre, asi que cambiarlo en caliente afecta a todo.
- Los errores se serializan con `tipo`, `mensaje`, `codigo`, las primeras lineas de la `pila` y la `causa`.
- Puede tener varios destinos (consola y memoria). Si uno falla, los demas siguen recibiendo.

### Redaccion de datos sensibles (`src/observabilidad/redaccion.js`)

- Oculta con `[REDACTADO]` claves como `password`, `token`, `authorization`, `cookie`, `apiKey`, sin importar mayusculas, guiones o guiones bajos, y a cualquier profundidad.
- Tambien redacta parametros sensibles de la url (`?token=...`).
- Corta textos de mas de 2000 caracteres y soporta referencias circulares y objetos muy profundos.

### Request id (`src/middlewares/requestId.js`)

- Si llega `X-Request-Id` con formato valido (8 a 64 caracteres `A-Z a-z 0-9 . _ -`) se reutiliza; si no, se genera un UUID y se deja un `warn`.
- Se devuelve en la cabecera `X-Request-Id` y en el body de los errores, para que quien reporta un problema pueda dar el id.
- `req.log` ya trae el `requestId`, asi los servicios registran eventos de negocio (`mision.creada`, `mision.lanzada`, ...) ligados a la peticion.

### Log de accesos (`src/middlewares/accesos.js`)

Una entrada `http.respuesta` por peticion con `metodo`, `ruta` (redactada), `patron` (`/naves/:id`), `status`, `duracionMs`, `bytes`, `ip` y `agente`. El nivel depende del status: `info` (2xx/3xx), `warn` (4xx), `error` (5xx). Si el cliente corta antes de terminar se registra `http.abortada`. `/logs` y `/health` no se registran para no generar ruido.

### Errores

Los errores de negocio responden con su codigo. Los errores no previstos responden un `500` generico (sin pila ni detalles internos) y se registran como `error.no_controlado` con la pila completa.

## Rutas

| Metodo y ruta | Que hace |
| --- | --- |
| `GET /` | Informacion del ejercicio |
| `GET /health` | Estado, tiempo activo y nivel de log actual |
| `GET /logs` | Ultimos logs en memoria. Filtros: `nivel` (minimo), `requestId`, `mensaje`, `limite` (1-200) |
| `DELETE /logs` | Vacia la memoria de logs |
| `GET /logs/nivel` | Nivel actual |
| `PUT /logs/nivel` | Cambia el nivel sin reiniciar. Body `{ "nivel": "debug" }` |
| `GET /naves`, `GET /naves/:id` | Naves de la flota |
| `POST /naves/:id/telemetria` | Lectura `{ combustible, temperaturaC, velocidadKms }`. Combustible menor a 15 genera un `warn` |
| `GET /misiones?estado=` | Lista misiones |
| `POST /misiones` | Crea `{ naveId, destino, objetivo, prioridad? }` |
| `GET /misiones/:id` | Detalle |
| `POST /misiones/:id/lanzar` | `planificada -> en_curso` |
| `POST /misiones/:id/finalizar` | `{ resultado: "exito" | "fallo", notas? }` |

La memoria guarda las ultimas 500 entradas; al llenarse descarta las mas antiguas y lo informa en `estadisticas.descartadas`.

## Errores

| Codigo | Estado | Cuando |
| --- | --- | --- |
| `VALIDACION` | 400 | Datos o parametros invalidos |
| `JSON_INVALIDO` | 400 | Body que no es JSON |
| `NAVE_NO_ENCONTRADA`, `MISION_NO_ENCONTRADA` | 404 | No existe |
| `RUTA_NO_ENCONTRADA` | 404 | Ruta desconocida |
| `METODO_NO_PERMITIDO` | 405 | Metodo no admitido (cabecera `Allow`) |
| `NAVE_NO_DISPONIBLE` | 409 | La nave esta en mantenimiento |
| `NAVE_OCUPADA` | 409 | La nave ya tiene una mision en curso |
| `TRANSICION_INVALIDA` | 409 | Cambio de estado no permitido |
| `PAYLOAD_GRANDE` | 413 | Body muy grande |
| `FORMATO_NO_SOPORTADO` | 415 | Falta `Content-Type: application/json` |
| `ERROR_INTERNO` | 500 | Error inesperado |

## Estructura

```
src/
  app.js, server.js
  observabilidad/  logger, redaccion, destinos (consola y memoria)
  middlewares/     requestId, accesos, errores, notFound, metodoNoPermitido, exigirTipo
  routes/          misiones (naves y misiones), observabilidad (health y logs)
  services/        misiones
  validators/      validaciones escritas a mano
  errores/         catalogo de errores
test/              logger, redaccion, memoria y pruebas de API
soporte/           reloj y cronometro falsos para pruebas deterministas
```
