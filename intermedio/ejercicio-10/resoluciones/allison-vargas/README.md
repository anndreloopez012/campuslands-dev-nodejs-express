# Intermedio 10 - ordenamiento de resultados (Allison Vargas)

## Que hace este ejercicio

API de ping pong con listados que se pueden ordenar por uno o varios campos. El ordenamiento vive en un unico servicio reutilizable (`services/ordenamiento.service.js`) que se configura por recurso:

- `validators/orden/jugadores.orden.js` y `partidos.orden.js`: declaran que campos se pueden ordenar, de que tipo es cada uno, el orden por defecto, las vistas predefinidas y los limites.
- `services/ordenamiento.service.js`: valida los parametros de la URL (devuelve todos los errores juntos), compara segun el tipo de dato y pagina el resultado.
- `utils/respuesta.js`: arma la respuesta con los headers `X-Total-Count` y `X-Orden`.

Reglas del ordenamiento:

- Solo se aceptan campos declarados en la configuracion. Cualquier otro responde 400 con la lista de campos validos.
- Hasta 4 criterios por consulta, sin repetir campos.
- Los textos se comparan sin distinguir mayusculas ni acentos (Alvaro y Alvaro con tilde quedan juntos).
- Los campos de tipo enum se ordenan por su jerarquia y no alfabeticamente (por ejemplo la ronda: grupos, octavos, cuartos, semifinal, final).
- Los valores nulos van al final o al principio segun `nulos`, sin importar la direccion.
- Siempre se agrega `id:asc` como desempate para que el resultado sea estable entre peticiones.

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
    |   `-- orden/
    |-- middlewares/
    |-- utils/
    `-- data/
```

- routes: jugadores, partidos y campos de orden.
- controllers: llaman al service y responden el listado.
- services: motor de ordenamiento, jugadores y partidos.
- validators: configuracion de orden por recurso y validacion de id.
- middlewares: notFound y errorHandler.
- utils: errores tipados, catchAsync, respuesta de listados y lector de JSON.
- data: 24 jugadores y 40 partidos en JSON.

## Como ejecutar

```bash
cd intermedio/ejercicio-10/resoluciones/allison-vargas
npm install
npm run dev
```

El servidor queda en http://localhost:3000

## Respuesta esperada

```bash
curl http://localhost:3000/intermedio/ejercicio-10
```

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "ordenamiento de resultados"
}
```

## Endpoints

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | /jugadores | Lista ordenable de jugadores (por defecto `ranking:asc`) |
| GET | /jugadores/:id | Detalle de un jugador |
| GET | /jugadores/:id/partidos | Partidos de un jugador, con los mismos parametros que /partidos |
| GET | /partidos | Lista ordenable de partidos (por defecto `fecha:desc`) |
| GET | /orden/campos | Campos ordenables, tipos, vistas y orden por defecto de cada recurso |

## Parametros de consulta

| Parametro | Descripcion |
| --- | --- |
| orden | Criterios separados por coma. Cada uno es `campo`, `campo:asc`, `campo:desc` o `-campo` |
| vista | Orden predefinido. No se puede combinar con `orden` |
| nulos | `primero` o `ultimo` (por defecto `ultimo`) |
| pagina | Por defecto 1 |
| limite | Por defecto 10, maximo 50 |

Jugadores, campos ordenables: `id`, `nombre`, `pais`, `categoria`, `edad`, `ranking`, `puntos`, `victorias`, `derrotas`, `efectividad`, `fechaIngreso`, `activo`. Vistas: `ranking`, `puntos`, `efectividad`, `veteranos`, `nuevos`.

Partidos, campos ordenables: `id`, `fecha`, `torneo`, `ronda`, `ganador`, `perdedor`, `setsPerdedor`, `duracionMin`, `puntosTotales`. Vistas: `recientes`, `antiguos`, `largos`, `finales`, `renidos`.

```bash
curl "http://localhost:3000/intermedio/ejercicio-10/jugadores?orden=puntos:desc,nombre:asc"
curl "http://localhost:3000/intermedio/ejercicio-10/jugadores?orden=-edad&limite=5"
curl "http://localhost:3000/intermedio/ejercicio-10/jugadores?vista=efectividad"
curl "http://localhost:3000/intermedio/ejercicio-10/jugadores?nulos=primero"
curl "http://localhost:3000/intermedio/ejercicio-10/partidos?orden=ronda:desc,fecha:desc"
curl "http://localhost:3000/intermedio/ejercicio-10/partidos?orden=duracionMin:desc&nulos=primero"
curl "http://localhost:3000/intermedio/ejercicio-10/jugadores/3/partidos?orden=fecha"
curl "http://localhost:3000/intermedio/ejercicio-10/orden/campos"
curl -i "http://localhost:3000/intermedio/ejercicio-10/jugadores?orden=puntos:desc"
```

## Formato de respuesta

```json
{
  "ok": true,
  "data": [],
  "orden": {
    "aplicado": [{ "campo": "puntos", "direccion": "desc" }],
    "desempate": "id:asc",
    "nulos": "ultimo",
    "vista": null,
    "predeterminado": false
  },
  "paginacion": {
    "pagina": 1,
    "limite": 10,
    "total": 24,
    "totalPaginas": 3
  }
}
```

## Errores

```json
{
  "ok": false,
  "message": "Parametros de ordenamiento invalidos",
  "codigo": "ORDEN_INVALIDO",
  "errores": [
    { "campo": "orden", "mensaje": "color no es un campo ordenable. Validos: id, nombre, pais, categoria, edad, ranking, puntos, victorias, derrotas, efectividad, fechaIngreso, activo" }
  ]
}
```

Status usados: 400 parametros o id invalidos, 404 jugador o ruta inexistente.
