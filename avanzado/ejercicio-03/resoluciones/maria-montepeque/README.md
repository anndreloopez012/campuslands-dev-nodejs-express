# Avanzado 03 - validacion con schemas

API de una liga de MOBA (campeones y partidas con picks y bans) hecha con
Node.js y Express. Toda la entrada se valida con **schemas de Zod 4**: el
body, la query y los params. Ningun controller ni service revisa tipos a
mano.

## Por que schemas

En los ejercicios del intermedio la validacion era un monton de `if` en
cada service. Con un schema:

- La regla se escribe **una vez** y se reusa (crear y editar usan la misma
  base).
- El schema tambien **convierte** los datos: recorta espacios, pasa a
  minusculas, pone valores por defecto y convierte `"2"` en `2` en la
  query.
- Lo que sale del schema ya esta limpio, y el controller solo usa eso
  (`req.datos`), nunca `req.body` crudo.
- El mismo schema se puede exportar como **JSON Schema** para documentar.

## Como esta hecho

```text
src/schemas/
├── zod.js                configura zod una vez (mensajes en espanol)
├── comunes.schema.js     idParams, paginacion, rol, texto(min, max)
├── campeon.schema.js     campeonCrear, campeonEditar, campeonesQuery
├── partida.schema.js     partidaCrear (reglas entre campos)
└── index.js              schemas publicos y conversion a JSON Schema
src/middlewares/validar.js   el middleware generico
```

### Un solo middleware para todo

```js
router.patch("/campeones/:id", validar({ params: idParams, body: campeonEditar }), c.editarCampeon);
```

- Valida cada parte con `safeParse`.
- Si todo esta bien deja los datos limpios en `req.datos.params`,
  `req.datos.query` y `req.datos.body`.
- Si algo falla responde 400 con **todos** los errores juntos, diciendo
  de donde viene cada uno (`body`, `query`, `params`) y el campo exacto:

```json
{ "donde": "body", "campo": "rojo.picks[0].campeonId", "mensaje": "el campeon 1 ya lo eligio el equipo azul" }
```

### Lo que se uso de Zod

| Que                         | Donde                                                     |
| --------------------------- | --------------------------------------------------------- |
| `z.strictObject`            | Todos los bodies: un campo de mas (`id`, `admin`) da 400. Evita que alguien cambie cosas que no deberia |
| `.trim()`, `.toLowerCase()` | `nombre` recortado, `etiquetas` en minusculas             |
| `.transform()`              | `etiquetas` sin repetidos                                 |
| `.default()`                | `precio` 4800, `etiquetas` `[]`, `bans` `[]`, `page` 1, `limit` 10 |
| `z.coerce.number()`         | Solo en query y params, que siempre llegan como texto. En el body `"3"` **no** se acepta como numero |
| `.extend()` y `.partial()`  | `campeonCrear` y `campeonEditar` salen de la misma base   |
| `.refine()`                 | `campeonEditar` pide al menos un campo                    |
| `.superRefine()`            | Reglas de la partida que miran varios campos              |
| `z.iso.datetime()`          | La fecha de la partida                                    |
| `z.config(z.locales.es())`  | Mensajes en espanol, con mensajes propios donde queda mas claro |
| `z.toJSONSchema()`          | `GET /api/schemas/:nombre`                                |

### Reglas de la partida (superRefine)

Cada equipo manda 5 picks (`jugador`, `campeonId`, `rol`) y hasta 5 bans.

- Cada rol (top, jungla, mid, adc, soporte) va exactamente una vez por
  equipo.
- Un jugador no se repite en su equipo.
- Un campeon solo lo puede elegir un jugador en toda la partida.
- No se puede elegir un campeon baneado (por cualquiera de los dos).
- No se banea dos veces el mismo.

Cada error apunta al campo exacto (`azul.picks[4].jugador`).

Algo que descubri con los tests: Zod **no corre** `superRefine` si algun
campo tiene el tipo o la opcion mal (por ejemplo `ganador: "verde"`),
porque las reglas podrian recibir datos rotos. Primero hay que arreglar la
forma. Un error de rango (como `duracionMin: 5`) si deja correr las reglas,
y salen todos los errores juntos.

### Que valida el schema y que el service

| Schema (sin mirar los datos guardados) | Service (mirando los datos)          |
| -------------------------------------- | ------------------------------------ |
| Tipos, rangos, formatos, campos de mas | El campeon existe (404 / 422)        |
| Reglas entre campos del mismo body     | El nombre no esta repetido (409)     |

## Requisitos

Node.js 20 o superior. Sin base de datos.

## Instalacion y ejecucion

```bash
npm install
npm start
```

| Script        | Descripcion                          |
| ------------- | ------------------------------------ |
| `npm start`   | Servidor en http://localhost:4003    |
| `npm run dev` | Servidor con recarga automatica      |
| `npm test`    | Tests de schemas y de rutas          |

## Endpoints

| Metodo | Ruta                     | Valida                        | Descripcion                    |
| ------ | ------------------------ | ----------------------------- | ------------------------------ |
| GET    | `/health`                |                               | El servidor vive               |
| GET    | `/api/campeones`         | query `campeonesQuery`        | `?rol`, `?dificultadMax`, `?q`, `?page`, `?limit` |
| POST   | `/api/campeones`         | body `campeonCrear`           | Crea un campeon                |
| GET    | `/api/campeones/:id`     | params `idParams`             | Un campeon                     |
| PATCH  | `/api/campeones/:id`     | params + body `campeonEditar` | Cambia solo lo que se manda    |
| POST   | `/api/partidas`          | body `partidaCrear`           | Registra una partida           |
| GET    | `/api/partidas/:id`      | params `idParams`             | Una partida                    |
| GET    | `/api/schemas`           |                               | Schemas disponibles            |
| GET    | `/api/schemas/:nombre`   |                               | Un schema como JSON Schema     |

## Ejemplos (PowerShell)

Crear un campeon (se recorta el nombre, se pone el precio por defecto y
las etiquetas quedan en minusculas y sin repetir):

```bash
curl.exe -X POST http://localhost:4003/api/campeones -H "Content-Type: application/json" -d '{\"nombre\":\" Zed \",\"rol\":\"mid\",\"dificultad\":3,\"etiquetas\":[\"Asesino\",\"asesino\"]}'
```

```json
{ "ok": true, "data": { "id": 13, "nombre": "Zed", "rol": "mid", "dificultad": 3, "precio": 4800, "etiquetas": ["asesino"] } }
```

Un body con varios problemas:

```bash
curl.exe -X POST http://localhost:4003/api/campeones -H "Content-Type: application/json" -d '{\"nombre\":\"Z\",\"rol\":\"support\",\"admin\":true}'
```

```json
{
  "ok": false,
  "message": "Datos invalidos",
  "errors": [
    { "donde": "body", "campo": "nombre", "mensaje": "Demasiado pequeño: se esperaba que texto tuviera >=2 caracteres" },
    { "donde": "body", "campo": "rol", "mensaje": "rol debe ser uno de: top, jungla, mid, adc, soporte" },
    { "donde": "body", "campo": "dificultad", "mensaje": "Entrada inválida: se esperaba número, recibido indefinido" },
    { "donde": "body", "campo": "(raiz)", "mensaje": "campos no permitidos: admin" }
  ]
}
```

Query invalida:

```bash
curl.exe "http://localhost:4003/api/campeones?rol=support&limit=100&color=rojo"
```

Ver el schema como JSON Schema:

```bash
curl.exe http://localhost:4003/api/schemas/campeon-crear
```

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "nombre": { "type": "string", "minLength": 2, "maxLength": 20 },
    "rol": { "type": "string", "enum": ["top", "jungla", "mid", "adc", "soporte"] },
    "dificultad": { "type": "integer", "minimum": 1, "maximum": 3 },
    "precio": { "default": 4800, "type": "integer", "minimum": 450, "maximum": 7800 },
    "etiquetas": "..."
  },
  "required": ["nombre", "rol", "dificultad"],
  "additionalProperties": false
}
```

Una partida: ver el body completo en `test/api.test.js` (`partida()`).

## Tests

```text
test/
├── schemas.test.js  los schemas solos: transformaciones, defaults, campos de mas, coerce, reglas de la partida
└── api.test.js      el middleware en las rutas: donde viene cada error, req.datos, 409/404/422, JSON Schema
```

```text
ℹ tests 38
ℹ pass 38
ℹ fail 0
```

Para comprobar que sirven quite la regla de "no se puede elegir un
baneado" y fallo `no se puede elegir un baneado, ni banear dos veces el
mismo`.

## Casos de error

| Caso                                      | Status | Ejemplo                                            |
| ----------------------------------------- | ------ | -------------------------------------------------- |
| Campo con tipo, rango o formato mal       | 400    | `rol debe ser uno de: top, jungla, mid, adc, soporte` |
| Campo que no existe en el schema          | 400    | `campos no permitidos: id, admin`                  |
| PATCH vacio                               | 400    | `Manda al menos un campo para cambiar`             |
| Regla de la partida                       | 400    | `al equipo rojo le falta el rol jungla`            |
| Query o params invalidos                  | 400    | `limit no puede pasar de 50`                       |
| JSON roto                                 | 400    | `El body no es un JSON valido`                     |
| Campeon o partida que no existe           | 404    | `No existe el campeon con id 99`                   |
| Nombre repetido                           | 409    | `Ya existe un campeon llamado ahri`                |
| Partida con un campeon que no existe      | 422    | `No existen los campeones: 99`                     |

## Notas

Los datos viven en memoria, al reiniciar el servidor vuelven a los de
`src/data/db.js`.
