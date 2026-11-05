# Avanzado 02 - arquitectura escalable

API de torneos de shooters competitivos organizada para crecer: cada funcionalidad es un modulo independiente, los modulos se hablan por eventos y todo lo que tiene estado o depende del entorno se inyecta.

Tematica: shooters competitivos. Ruta base: `/avanzado/ejercicio-02`.

## Ejecutar

```bash
npm install
npm start
npm test
```

## Idea de diseno

- **Modulos verticales.** `jugadores`, `partidas` y `clasificacion` tienen cada uno su ruta, servicio, esquema y repositorio. Agregar uno nuevo es crear su carpeta y sumarlo en `src/modulos/index.js`.
- **Contenedor de dependencias.** Nada hace `new` de otro modulo: las piezas se registran y se piden por nombre. En las pruebas se reemplaza cualquiera (repositorio, cache, almacen del limitador) sin tocar codigo.
- **Eventos entre modulos.** `partidas` publica `partida.finalizada`; `clasificacion` lo escucha y recalcula el rating. Ninguno importa al otro. Si un manejador falla, la peticion no se rompe y el error queda en el log.
- **Sin estado en el proceso que importe.** Cache, limitador y repositorios estan detras de interfaces pequenas, listas para cambiarse por Redis o una base de datos al correr varias instancias.
- **Operable.** `/salud` (liveness), `/listo` (readiness por modulo), `X-Request-Id`, logs JSON, limite de peticiones y apagado ordenado con SIGTERM.

```text
src/
  app.js              arma contenedor, modulos y middlewares
  server.js           arranque y apagado
  apagado.js          cierre ordenado del servidor
  config/             variables de entorno validadas
  core/               contenedor, bus de eventos, cache, logger, orden de modulos
  middlewares/        id de peticion, bitacora, limitador, errores, 404, 405, 415
  modulos/
    jugadores/        alta y consulta de jugadores
    partidas/         partidas y resultados
    clasificacion/    ranking con rating tipo Elo
```

Cada modulo define `nombre`, `ruta`, `dependencias`, `emite`, `escucha`, `registrar`, `crearRouter` y, si lo necesita, `alIniciar`, `alDetener` y `estado`.

## Rutas

| Ruta | Descripcion |
| --- | --- |
| `GET /` | Respuesta base del ejercicio |
| `GET /salud` | El proceso esta vivo |
| `GET /listo` | Estado de cada modulo (503 si alguno falla o se esta apagando) |
| `GET /modulos` | Modulos, dependencias y eventos |
| `GET /jugadores` | Filtros `region`, `buscar`; `orden`, `pagina`, `limite` |
| `GET /jugadores/:id` | Detalle |
| `POST /jugadores` | Crear `{ alias, region }` |
| `GET /partidas` | Filtros `estado`, `mapa`, `jugadorId` |
| `GET /partidas/:id` | Detalle |
| `POST /partidas` | Crear `{ jugadorA, jugadorB, mapa }` |
| `POST /partidas/:id/resultado` | Registrar `{ puntajeA, puntajeB }` |
| `GET /clasificacion` | Ranking (filtro `region`, paginado) |
| `GET /clasificacion/:jugadorId` | Posicion de un jugador |

Regiones: `NA`, `EU`, `LATAM`, `ASIA`. Mapas: `Bastion`, `Refineria`, `Puerto`, `Azotea`.

## Reglas de negocio

- Alias unico sin importar mayusculas; entre 3 y 16 caracteres (letras, numeros, guion bajo).
- Una partida enfrenta a dos jugadores distintos que existen (si no, 422).
- El resultado se registra una sola vez (409 despues) y no admite empates (422).
- Todos empiezan en 1000. Cada resultado mueve el rating con factor K 32: ganarle a alguien mas fuerte vale mas. La suma de ratings se conserva.

## Cache, limite y trazabilidad

- El ranking se cachea (`X-Cache: HIT/MISS`), se invalida con cada evento y vence con `CACHE_TTL_MS`. Si llegan varias lecturas a la vez con la cache vacia, se calcula una sola vez. Tiene `ETag`, asi que un cliente puede revalidar y recibir 304.
- Limite por IP con ventana fija. Cada respuesta trae `RateLimit-Limit`, `RateLimit-Remaining` y `RateLimit-Reset`; al pasarse, 429 con `Retry-After`.
- Cada peticion lleva `X-Request-Id` (se respeta el del cliente si es valido). Ese id aparece en los errores y en el log.

## Variables de entorno

| Variable | Defecto | Uso |
| --- | --- | --- |
| `PORT` | 3000 | Puerto |
| `NODE_ENV` | development | development, production o test |
| `LIMITE_PETICIONES` | 100 | Peticiones por ventana y por IP |
| `LIMITE_VENTANA_MS` | 60000 | Duracion de la ventana |
| `CACHE_TTL_MS` | 5000 | Vida maxima de la cache |
| `APAGADO_TIMEOUT_MS` | 10000 | Espera maxima al apagar |
| `PROXIES_CONFIABLES` | 0 | Proxies delante (para que la IP sea la real) |

Si algun valor es invalido, el servidor no arranca y lista todos los errores juntos.

## Apagado ordenado

Con SIGTERM o SIGINT: `/listo` pasa a 503 para que el balanceador deje de enviar trafico, se dejan de aceptar conexiones, se espera a las peticiones en curso (hasta `APAGADO_TIMEOUT_MS`), se llaman los `alDetener` de los modulos y el proceso sale con codigo 0. Si se agota el tiempo, fuerza el cierre y sale con 1.

## Ejemplos

```bash
curl http://localhost:3000/avanzado/ejercicio-02/listo
curl -X POST http://localhost:3000/avanzado/ejercicio-02/partidas \
  -H "Content-Type: application/json" \
  -d '{"jugadorA":1,"jugadorB":2,"mapa":"Puerto"}'
curl -X POST http://localhost:3000/avanzado/ejercicio-02/partidas/1/resultado \
  -H "Content-Type: application/json" \
  -d '{"puntajeA":13,"puntajeB":9}'
curl -i "http://localhost:3000/avanzado/ejercicio-02/clasificacion?region=NA"
```

Error:

```json
{
  "ok": false,
  "message": "Datos invalidos",
  "codigo": "VALIDACION",
  "idPeticion": "0b8e5c0a-8c4f-4d57-9d0e-3f6a7b1d2c11",
  "errores": [{ "campo": "alias", "mensaje": "debe tener entre 3 y 16 caracteres" }]
}
```

## Pruebas

`npm test` corre 116 pruebas con `node:test`: nucleo (contenedor, eventos, cache, limitador, configuracion, orden de modulos), API de cada modulo, operacion (salud, trazabilidad, 429, errores), integracion entre modulos (concurrencia, fallos aislados, eventos repetidos, modulo nuevo) y apagado ordenado. Una prueba revisa las importaciones para garantizar que ningun modulo depende de otro y que el nucleo no conoce Express.
