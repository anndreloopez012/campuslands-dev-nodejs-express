# Intermedio 04 - servicios reutilizables (Allison Vargas)

## Que hace este ejercicio

API de un battle royale donde la logica vive en servicios pequenos que se reutilizan entre distintos modulos:

- `puntuacion.service`: calcula los puntos de una partida y la liga segun los puntos. Lo usan `partidas`, `jugadores` y `ranking`.
- `paginacion.service`: pagina y valida `pagina` y `limite`. Lo usan los listados de jugadores, partidas y ranking.
- `jugadores.service`: acceso y actualizacion de jugadores. Lo usan `partidas` y `ranking`.

Los controllers solo validan la entrada, llaman al service y responden.

## Estructura

```text
.
|-- package.json
|-- README.md
`-- src
    |-- app.js
    |-- server.js
    |-- routes/
    |-- controllers/
    |-- services/
    |-- validators/
    |-- middlewares/
    |-- utils/
    `-- data/
```

- routes: un router por recurso y un index.js que los monta.
- controllers: validar, llamar al service y responder.
- services: logica reutilizable (puntuacion, paginacion, jugadores, partidas, ranking).
- validators: validan el body y lanzan AppError 400.
- middlewares: validacion del id, 404 y manejo central de errores.
- utils: AppError, catchAsync y lector de JSON.
- data: archivo JSON con los jugadores.

## Como ejecutar

```bash
cd intermedio/ejercicio-04/resoluciones/allison-vargas
npm install
npm run dev
```

El servidor queda en http://localhost:3000

## Respuesta esperada

```bash
curl http://localhost:3000/intermedio/ejercicio-04
```

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "servicios reutilizables"
}
```

## Endpoints

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | /jugadores | Lista jugadores con su liga, paginado |
| GET | /jugadores/:id | Detalle de un jugador |
| GET | /jugadores/:id/estadisticas | Partidas, eliminaciones y promedio |
| GET | /partidas | Lista partidas, filtro `?jugadorId=1`, paginado |
| POST | /partidas | Registra una partida (`jugadorId`, `posicion`, `eliminaciones`) |
| GET | /ranking | Jugadores ordenados por puntos, paginado |

Paginacion: `?pagina=1&limite=10` (limite maximo 50).

Puntos por partida: 10 por eliminacion mas un bono por posicion (1: 100, hasta 5: 50, hasta 10: 25).

```bash
curl "http://localhost:3000/intermedio/ejercicio-04/ranking?pagina=1&limite=3"
curl http://localhost:3000/intermedio/ejercicio-04/jugadores/1/estadisticas
curl -X POST http://localhost:3000/intermedio/ejercicio-04/partidas -H "Content-Type: application/json" -d "{\"jugadorId\":4,\"posicion\":1,\"eliminaciones\":7}"
```

Errores: 400 datos o paginacion invalidos, 404 jugador inexistente.
