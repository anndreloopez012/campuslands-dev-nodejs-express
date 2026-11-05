# API de MOBA esports

Version 1.0.0. Base: `/intermedio/ejercicio-27`

Equipos, torneos e inscripciones de una liga de MOBA. Todas las respuestas JSON usan el formato { ok, data } en caso de exito y { ok: false, message, codigo, errores? } en caso de error. Un metodo que no esta documentado para una ruta responde 405 con el header Allow. Una ruta inexistente responde 404 con codigo RUTA_NO_ENCONTRADA. Los requests con body deben enviar Content-Type: application/json y pesar menos de 10 KB.

## Sistema

Estado y documentacion de la API.

### GET /

**Ruta principal del ejercicio**

Confirma que la API esta arriba.

Respuestas:

- `200` La API responde.

Ejemplo:

```
curl "http://localhost:3000/intermedio/ejercicio-27/"
```

### GET /docs

**Documentacion en HTML**

Pagina con todos los endpoints, generada a partir de la misma especificacion OpenAPI.

Respuestas:

- `200` Pagina HTML autocontenida.

Ejemplo:

```
curl "http://localhost:3000/intermedio/ejercicio-27/docs"
```

### GET /docs/openapi.json

**Especificacion OpenAPI**

Documento OpenAPI 3.0 en JSON. Se puede importar en Postman, Insomnia o Swagger UI.

Respuestas:

- `200` Especificacion completa.

Ejemplo:

```
curl "http://localhost:3000/intermedio/ejercicio-27/docs/openapi.json"
```

## Equipos

Alta, consulta y baja de equipos.

### GET /equipos

**Lista equipos**

Devuelve los equipos con filtros, orden y paginacion. El total viene tambien en el header X-Total-Count.

Parametros:

| Nombre | En | Tipo | Obligatorio | Descripcion |
| --- | --- | --- | --- | --- |
| `region` | consulta | uno de: na, eu, latam, asia | no | Filtra por region. |
| `buscar` | consulta | texto de 1 a 30 caracteres | no | Texto contenido en el nombre o en el tag. |
| `orden` | consulta | uno de: id, nombre, victorias | no | Campo de orden. |
| `pagina` | consulta | entero desde 1 | no | Numero de pagina, desde 1. |
| `limite` | consulta | entero entre 1 y 50 | no | Resultados por pagina. |

Respuestas:

- `200` Pagina de equipos. (headers: X-Total-Count)
- `400` Algun parametro de consulta es invalido.

Ejemplo:

```
curl "http://localhost:3000/intermedio/ejercicio-27/equipos?region=eu&buscar=wolves&orden=victorias"
```

### POST /equipos

**Crea un equipo**

Registra un equipo nuevo con 0 victorias y 0 derrotas.

Body JSON:

| Campo | Tipo | Obligatorio | Descripcion |
| --- | --- | --- | --- |
| `nombre` | texto de 3 a 30 caracteres | si | Nombre del equipo. Unico sin distinguir mayusculas. |
| `tag` | texto de 2 a 5 caracteres, formato ^[A-Z0-9]+$ | si | Sigla del equipo. Unica y no se puede cambiar despues. |
| `region` | uno de: na, eu, latam, asia | si | Region donde compite. |

```json
{
  "nombre": "Aurora Nine",
  "tag": "AUR",
  "region": "latam"
}
```

Respuestas:

- `201` Equipo creado. (headers: Location)
- `400` El body es invalido.
- `409` El nombre o el tag ya existen.
- `415` El Content-Type no es application/json.

Ejemplo:

```
curl -X POST "http://localhost:3000/intermedio/ejercicio-27/equipos" -H "Content-Type: application/json" -d '{"nombre":"Aurora Nine","tag":"AUR","region":"latam"}'
```

### GET /equipos/{id}

**Detalle de un equipo**

Parametros:

| Nombre | En | Tipo | Obligatorio | Descripcion |
| --- | --- | --- | --- | --- |
| `id` | ruta | entero desde 1 | si | Id del equipo. |

Respuestas:

- `200` El equipo.
- `400` El id no es un entero positivo.
- `404` No existe el equipo.

Ejemplo:

```
curl "http://localhost:3000/intermedio/ejercicio-27/equipos/2"
```

### PATCH /equipos/{id}

**Actualiza nombre o region**

Solo se pueden cambiar el nombre y la region. El tag es permanente. Debe enviarse al menos un campo.

Parametros:

| Nombre | En | Tipo | Obligatorio | Descripcion |
| --- | --- | --- | --- | --- |
| `id` | ruta | entero desde 1 | si | Id del equipo. |

Body JSON:

| Campo | Tipo | Obligatorio | Descripcion |
| --- | --- | --- | --- |
| `nombre` | texto de 3 a 30 caracteres | no | Nombre del equipo. Unico sin distinguir mayusculas. |
| `region` | uno de: na, eu, latam, asia | no | Region donde compite. |

```json
{
  "nombre": "Crimson Wolves Prime"
}
```

Respuestas:

- `200` Equipo actualizado.
- `400` El id o el body son invalidos.
- `404` No existe el equipo.
- `409` Otro equipo ya usa ese nombre.
- `415` El Content-Type no es application/json.

Ejemplo:

```
curl -X PATCH "http://localhost:3000/intermedio/ejercicio-27/equipos/2" -H "Content-Type: application/json" -d '{"nombre":"Crimson Wolves Prime"}'
```

### DELETE /equipos/{id}

**Elimina un equipo**

No se puede eliminar un equipo que esta inscrito en algun torneo.

Parametros:

| Nombre | En | Tipo | Obligatorio | Descripcion |
| --- | --- | --- | --- | --- |
| `id` | ruta | entero desde 1 | si | Id del equipo. |

Respuestas:

- `200` Equipo eliminado.
- `400` El id no es un entero positivo.
- `404` No existe el equipo.
- `409` El equipo esta inscrito en un torneo.

Ejemplo:

```
curl -X DELETE "http://localhost:3000/intermedio/ejercicio-27/equipos/7"
```

## Torneos

Consulta de torneos.

### GET /torneos

**Lista torneos**

Devuelve los torneos con la cantidad de equipos inscritos.

Parametros:

| Nombre | En | Tipo | Obligatorio | Descripcion |
| --- | --- | --- | --- | --- |
| `estado` | consulta | uno de: inscripcion, en_curso, finalizado | no | Filtra por etapa. |
| `formato` | consulta | uno de: eliminacion, liga, suizo | no | Filtra por formato. |
| `orden` | consulta | uno de: id, inicio, premio | no | Campo de orden. |
| `pagina` | consulta | entero desde 1 | no | Numero de pagina, desde 1. |
| `limite` | consulta | entero entre 1 y 50 | no | Resultados por pagina. |

Respuestas:

- `200` Pagina de torneos. (headers: X-Total-Count)
- `400` Algun parametro de consulta es invalido.

Ejemplo:

```
curl "http://localhost:3000/intermedio/ejercicio-27/torneos?estado=inscripcion&formato=liga&orden=premio"
```

### GET /torneos/{id}

**Detalle de un torneo**

Parametros:

| Nombre | En | Tipo | Obligatorio | Descripcion |
| --- | --- | --- | --- | --- |
| `id` | ruta | entero desde 1 | si | Id del torneo. |

Respuestas:

- `200` El torneo.
- `400` Algun id no es un entero positivo.
- `404` No existe el torneo.

Ejemplo:

```
curl "http://localhost:3000/intermedio/ejercicio-27/torneos/1"
```

## Inscripciones

Equipos inscritos en cada torneo.

### GET /torneos/{id}/inscripciones

**Equipos inscritos en un torneo**

Parametros:

| Nombre | En | Tipo | Obligatorio | Descripcion |
| --- | --- | --- | --- | --- |
| `id` | ruta | entero desde 1 | si | Id del torneo. |

Respuestas:

- `200` Inscripciones del torneo.
- `400` Algun id no es un entero positivo.
- `404` No existe el torneo.

Ejemplo:

```
curl "http://localhost:3000/intermedio/ejercicio-27/torneos/1/inscripciones"
```

### POST /torneos/{id}/inscripciones

**Inscribe un equipo**

Solo funciona mientras el torneo esta en etapa de inscripcion, hay cupos y el equipo no esta inscrito.

Parametros:

| Nombre | En | Tipo | Obligatorio | Descripcion |
| --- | --- | --- | --- | --- |
| `id` | ruta | entero desde 1 | si | Id del torneo. |

Body JSON:

| Campo | Tipo | Obligatorio | Descripcion |
| --- | --- | --- | --- |
| `equipoId` | entero entre 1 y 1000000 | si | Id del equipo que se inscribe. |

```json
{
  "equipoId": 3
}
```

Respuestas:

- `201` Inscripcion creada. (headers: Location)
- `400` El id o el body son invalidos.
- `404` No existe el torneo.
- `409` Inscripcion cerrada, torneo lleno o equipo repetido.
- `415` El Content-Type no es application/json.
- `422` El equipo no existe.

Ejemplo:

```
curl -X POST "http://localhost:3000/intermedio/ejercicio-27/torneos/1/inscripciones" -H "Content-Type: application/json" -d '{"equipoId":3}'
```

### DELETE /torneos/{id}/inscripciones/{equipoId}

**Retira un equipo del torneo**

Solo se puede retirar mientras el torneo esta en etapa de inscripcion.

Parametros:

| Nombre | En | Tipo | Obligatorio | Descripcion |
| --- | --- | --- | --- | --- |
| `id` | ruta | entero desde 1 | si | Id del torneo. |
| `equipoId` | ruta | entero desde 1 | si | Id del equipo inscrito. |

Respuestas:

- `200` Inscripcion retirada.
- `400` Algun id no es un entero positivo.
- `404` El torneo no existe o el equipo no esta inscrito.
- `409` El torneo ya no admite cambios en las inscripciones.

Ejemplo:

```
curl -X DELETE "http://localhost:3000/intermedio/ejercicio-27/torneos/1/inscripciones/2"
```
