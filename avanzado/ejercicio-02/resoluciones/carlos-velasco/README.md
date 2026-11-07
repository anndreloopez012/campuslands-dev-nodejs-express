# AVANZADO 02 - arquitectura escalable (Resolucion de Carlos Velasco)

Backend en Node.js + Express con tematica de **shooters** que demuestra **arquitectura escalable**: el sistema esta organizado en **modulos independientes por feature**, cada uno dueno de sus rutas, controlador, servicio y almacen, con un nucleo compartido (`core/`).

## Idea clave

- **Modulos por feature** (`src/modules/players`, `src/modules/matches`): agregar una feature nueva (por ejemplo, `loadouts`) es crear una carpeta y registrarla; no hay que tocar el resto.
- **Nucleo compartido** (`src/core/`): errores de dominio y error handler unicos para todo el sistema.
- **Frontera entre modulos**: `matches` coordina con `players` unicamente a traves de la interfaz publica de su servicio, nunca escribiendo en su almacen.
- **Registro declarativo** (`src/modules/index.js`): el montaje de rutas y la etiqueta de modulo para los errores se calculan de la misma lista.

## Como ejecutar

```bash
cd avanzado/ejercicio-02/resoluciones/carlos-velasco
npm install
npm run dev
```

## Endpoints

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/health` | Estado + modulos registrados |
| GET | `/api/players` | Listar jugadores |
| GET | `/api/players/leaderboard` | Ranking por winRate |
| GET | `/api/players/:id` | Detalle de jugador |
| POST | `/api/players` | Registrar jugador |
| GET | `/api/matches` | Listar partidas |
| POST | `/api/matches` | Registrar partida (actualiza stats del jugador) |

## Ejemplos con curl

```bash
curl http://localhost:3002/health
curl -X POST http://localhost:3002/api/players -H "Content-Type: application/json" \
  -d '{"callsign":"Nova","main":"franco","aimRating":80,"reaction":210}'
curl -X POST http://localhost:3002/api/matches -H "Content-Type: application/json" \
  -d '{"playerId":1,"winnerId":1}'
curl http://localhost:3002/api/players/leaderboard
curl -i -X POST http://localhost:3002/api/players -H "Content-Type: application/json" -d '{"callsign":"Nova"}'   # 400/409 con modulo responsable
```

## Casos de error manejados

- `400` campos obligatorios ausentes o `aimRating` fuera de rango.
- `409` callsign duplicado.
- `404` jugador inexistente en detalle o al registrar partida.
- El error handler incluye `module`, identificado automaticamente por el router del modulo.

## Estructura

```text
src/
├── core/                       # nucleo compartido
│   ├── errors/app.error.js
│   ├── middlewares/error.handler.js
│   └── index.js
├── modules/
│   ├── index.js                # registro declarativo de modulos
│   ├── players/                # routes + controller + service + store
│   └── matches/                # routes + service + store (controllers juntos)
└── app.js
```
