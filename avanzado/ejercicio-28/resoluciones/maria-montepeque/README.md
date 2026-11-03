# Avanzado 28 - separacion app server (battle royale)

API de un battle royale (lobby, jugadores, zona que se cierra por fases) organizada en **tres piezas separadas**:

| Archivo | Responsabilidad | Toca el proceso? |
| ------- | --------------- | ---------------- |
| `src/app.js` | `crearApp()`: rutas, middlewares, errores. **No hace listen** | no |
| `src/servidor.js` | `crearServidor(app)`: http, iniciar en un puerto, apagado ordenado | no |
| `src/index.js` | punto de entrada: lee `PORT`, escucha senales, `process.exit` | si |

## Como ejecutar

```bash
npm install
npm start      # http://localhost:4028
npm test
```

Variables opcionales: `PORT` (4028), `HOST` (0.0.0.0), `TIEMPO_APAGADO_MS` (10000).

## Por que separar

- **Tests de la app sin puertos**: `supertest(crearApp())` no abre nada, es rapido y no choca con otros tests.
- **Tests del servidor con puertos de verdad**: puerto `0` = el sistema da uno libre, se pueden levantar varios a la vez.
- **Cada app es nueva**: dos instancias no comparten datos.
- `index.js` es el unico que sabe de `process.env`, senales y `process.exit`. Si se importa la app desde otro lado (tests, otro proyecto) no se queda escuchando ni mata el proceso.

## Apagado ordenado (graceful shutdown)

Cuando llega `SIGINT` (Ctrl+C) o `SIGTERM` (Docker / Kubernetes al parar):

1. `app.locals.apagando = true` -> `/health/ready` responde **503** (el balanceador deja de mandar trafico) y las peticiones nuevas por conexiones keep-alive reciben 503 con `Connection: close`.
2. `server.close()` deja de aceptar conexiones nuevas.
3. `closeIdleConnections()` cierra las conexiones que no estan haciendo nada.
4. Se **espera** a que terminen las peticiones en curso.
5. Si tardan mas que `TIEMPO_APAGADO_MS`, `closeAllConnections()` corta todo (apagado forzado, sale con codigo 1).
6. Llamar `detener()` dos veces devuelve la misma promesa.

Ademas:

- Si el puerto esta ocupado: `"El puerto 4028 ya esta en uso, cierra el otro proceso o cambia PORT"` y sale con codigo 1.
- `uncaughtException` y `unhandledRejection` se registran y se apaga ordenado.
- `/health/live` (el proceso responde) vs `/health/ready` (puede recibir trafico).

## Endpoints

| Metodo | Ruta | Descripcion |
| ------ | ---- | ----------- |
| GET | `/health`, `/health/live`, `/health/ready` | estado |
| GET | `/api/partidas` | partidas |
| GET | `/api/partidas/:id` | una partida |
| POST | `/api/partidas/:id/jugadores` | `{ "alias": "ninja_gt" }` |
| POST | `/api/partidas/:id/iniciar` | minimo 2 jugadores |
| GET | `/api/partidas/:id/zona` | fase, radio y dano de la zona segun el tiempo |
| GET | `/api/partidas/:id/repeticion?ms=3000` | peticion lenta para probar el apagado |

Probar el apagado a mano: en una terminal `npm start`, en otra

```bash
curl "localhost:4028/api/partidas/1/repeticion?ms=5000"
```

y antes de los 5 segundos presiona Ctrl+C en el servidor: la peticion termina bien y luego el servidor se apaga.

## Tests

- `test/app.test.js`: la app sola con supertest (incluye la bandera de apagado).
- `test/servidor.test.js`: puerto real, dos instancias, puerto ocupado, apagado limpio que espera la peticion lenta, apagado forzado por tiempo, `detener()` dos veces.

## Estructura

```text
src/
├── app.js
├── servidor.js
├── index.js
└── servicios/partidas.js
```
