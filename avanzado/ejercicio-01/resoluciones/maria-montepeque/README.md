# Avanzado 01 - diseno API versionada

API de personajes de un RPG hecha con Node.js y Express que tiene **dos
versiones al mismo tiempo**: `v1` (vieja, deprecada) y `v2` (actual).

## El problema

La `v1` ya la usaban clientes (una app del juego, por ejemplo). Se queria
cambiar el formato: agrupar los stats, agregar paginacion y un formato de
errores mas completo. Si se cambiaba la `v1` se rompian esos clientes. La
solucion es sacar una `v2` y mantener la `v1` funcionando hasta una fecha
de apagado.

## Que cambia entre versiones

| Cosa                  | v1                                   | v2                                              |
| --------------------- | ------------------------------------ | ----------------------------------------------- |
| Lista                 | Arreglo directo `[...]`              | `{ ok, data, meta, links }` con paginacion      |
| Personaje             | Plano: `hp`, `mp`                    | `stats: { vida, mana, fuerza }`, `inventario`, `links` |
| Crear                 | `{ nombre, clase }`                  | `{ nombre, clase, stats: { fuerzaExtra } }` + header `Location` |
| Validacion            | Responde el primer error             | Junta todos en `errors`                         |
| Errores               | `{ error: "..." }`                   | `{ ok: false, message, errors }`                |
| Subir de nivel        | No existe                            | `POST /api/v2/personajes/:id/subir-nivel`       |
| Headers               | `API-Version: 1` + deprecacion       | `API-Version: 2`                                |

Los cambios de la v2 son "breaking changes" (un cliente de v1 que lea `hp`
se romperia), por eso van en otra version y no en la misma.

## Como esta hecho

```text
src/
├── app.js                       monta /api/v1 y /api/v2, GET /api y versiones que no existen
├── services/personajes.service.js   la logica del juego, UNA sola para las dos versiones
├── data/db.js                   datos guardados con el modelo interno
├── middlewares/deprecacion.js   headers Deprecation, Sunset, Link y API-Version
└── versions/
    ├── v1/  routes.js  controller.js  mapper.js  validator.js
    └── v2/  routes.js  controller.js  mapper.js  validator.js
```

- **El dominio no se copia.** Las reglas (stats por clase, nombre
  repetido, nivel maximo) estan una sola vez en el service. Si se arregla
  un bug ahi, queda arreglado en las dos versiones.
- **Cada version tiene su mapper.** El dato guardado tiene `vida` y
  `mana`; `v1/mapper.js` lo muestra como `hp` y `mp`, y `v2/mapper.js` lo
  agrupa en `stats`.
- **Cada version tiene su validador.** Cada una acepta un body distinto y
  se lo pasa al service ya limpio.
- **Cada version tiene su manejador de errores** dentro de su router. El
  service tira el mismo `AppError` y cada version lo responde en su
  formato. Por eso `express.json()` tambien va dentro de cada router: un
  JSON roto en v1 responde `{ "error": "JSON invalido" }`.
- **Las dos versiones ven los mismos datos.** Lo que se crea en v1 aparece
  en v2 y al reves.

### Avisar que la v1 se va a apagar

Todas las respuestas de `/api/v1` llevan:

```text
Deprecation: true
Sunset: Wed, 30 Jun 2027 00:00:00 GMT
Link: </api/v2/personajes/2>; rel="successor-version"
```

- `Deprecation`: la version esta deprecada (todavia funciona).
- `Sunset`: el dia que deja de funcionar.
- `Link`: la misma ruta en la version nueva, para que el cliente sepa a
  donde migrar.

Ademas `GET /api` dice que versiones existen y su estado, y pedir una que
no existe (`/api/v3/...`) responde 404 con la lista de versiones.

## Requisitos

Node.js 20 o superior. Sin base de datos.

## Instalacion y ejecucion

```bash
npm install
npm start
```

| Script        | Descripcion                                    |
| ------------- | ---------------------------------------------- |
| `npm start`   | Servidor en http://localhost:4001              |
| `npm run dev` | Servidor con recarga automatica                |
| `npm test`    | Tests de las dos versiones                     |

## Endpoints

| Metodo | Ruta                                 | Descripcion                          |
| ------ | ------------------------------------ | ------------------------------------ |
| GET    | `/health`                            | El servidor vive                     |
| GET    | `/api`                               | Versiones disponibles                |
| GET    | `/api/v1/personajes`                 | Lista (acepta `?clase=`)             |
| POST   | `/api/v1/personajes`                 | Crea `{ nombre, clase }`             |
| GET    | `/api/v1/personajes/:id`             | Un personaje                         |
| GET    | `/api/v2/personajes`                 | Lista paginada (`?clase`, `?page`, `?limit`) |
| POST   | `/api/v2/personajes`                 | Crea `{ nombre, clase, stats? }`     |
| GET    | `/api/v2/personajes/:id`             | Un personaje                         |
| POST   | `/api/v2/personajes/:id/subir-nivel` | Sube un nivel y sus stats            |

Clases: `guerrero`, `maga`, `arquero`, `clerigo`.

## Ejemplos (PowerShell)

El mismo personaje en las dos versiones:

```bash
curl.exe -i http://localhost:4001/api/v1/personajes/1
```

```text
HTTP/1.1 200 OK
API-Version: 1
Deprecation: true
Sunset: Wed, 30 Jun 2027 00:00:00 GMT
Link: </api/v2/personajes/1>; rel="successor-version"
```

```json
{ "id": 1, "nombre": "Aldric", "clase": "guerrero", "nivel": 12, "hp": 340, "mp": 40 }
```

```bash
curl.exe http://localhost:4001/api/v2/personajes/1
```

```json
{
  "ok": true,
  "data": {
    "id": 1,
    "nombre": "Aldric",
    "clase": "guerrero",
    "nivel": 12,
    "stats": { "vida": 340, "mana": 40, "fuerza": 28 },
    "inventario": ["espada larga", "escudo"],
    "links": { "self": "/api/v2/personajes/1", "subirNivel": "/api/v2/personajes/1/subir-nivel" }
  }
}
```

Lista paginada en v2:

```bash
curl.exe "http://localhost:4001/api/v2/personajes?limit=2&page=2"
```

```json
{
  "ok": true,
  "data": ["...2 personajes..."],
  "meta": { "page": 2, "limit": 2, "total": 5, "totalPages": 3 },
  "links": {
    "self": "/api/v2/personajes?limit=2&page=2",
    "next": "/api/v2/personajes?limit=2&page=3",
    "prev": "/api/v2/personajes?limit=2&page=1"
  }
}
```

Crear en v2:

```bash
curl.exe -X POST http://localhost:4001/api/v2/personajes -H "Content-Type: application/json" -d '{\"nombre\":\"Kael\",\"clase\":\"arquero\",\"stats\":{\"fuerzaExtra\":3}}'
```

El mismo error en cada version:

```json
{ "error": "No existe el personaje con id 99" }
```

```json
{ "ok": false, "message": "No existe el personaje con id 99" }
```

## Tests

`test/versiones.test.js` (20 tests) revisa:

- `GET /api` y la version que no existe.
- v1: formato plano, headers de deprecacion con el link correcto,
  errores `{ error }` (tambien el JSON roto) y que `subir-nivel` no existe.
- v2: formato nuevo, paginacion con `next`/`prev` que mantienen los
  filtros, `Location`, errores juntos y `subir-nivel`.
- Que las dos versiones compartan los datos y que un 409 salga en cada
  formato.

```text
ℹ tests 20
ℹ pass 20
ℹ fail 0
```

Para comprobar que sirven, quite el middleware de deprecacion de la v1 y
fallo `manda los headers de deprecacion con el link a la misma ruta en v2`.

## Casos de error

| Caso                         | v1 (`{ error }`)                       | v2 (`{ ok: false, message }`)              |
| ---------------------------- | -------------------------------------- | ------------------------------------------ |
| Body invalido                | 400 `nombre debe tener al menos 3 letras` | 400 `Datos invalidos` + `errors`        |
| JSON roto                    | 400 `JSON invalido`                    | 400 `El body no es un JSON valido`         |
| Id invalido                  | 400 `id invalido`                      | 400 `El id debe ser un numero entero positivo` |
| No existe                    | 404 `No existe el personaje con id 99` | 404 igual                                  |
| Nombre repetido              | 409                                    | 409                                        |
| `page` o `limit` malos       | (no tiene paginacion)                  | 400                                        |
| Nivel maximo (60)            | (no tiene subir-nivel)                 | 409                                        |
| Version que no existe        | 404 `La version v3 no existe` + lista de versiones |                                |

## Notas

Los datos viven en memoria, al reiniciar el servidor vuelven a los de
`src/data/db.js`.
