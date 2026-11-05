# Avanzado 01 - diseno API versionada

API de personajes de un RPG con dos versiones conviviendo en el mismo servidor. v1 queda congelada y deprecada; v2 es la version vigente.

Tematica: videojuegos RPG. Ruta base: `/avanzado/ejercicio-01`.

## Ejecutar

```bash
npm install
npm start
npm test
```

El servidor usa el puerto 3000 (o `PORT`).

## Idea de diseno

- La version va en la URL: `/v1/...` y `/v2/...`.
- La logica de dominio (crear, buscar, validar nombres, calcular atributos) vive en un unico servicio que no sabe nada de versiones.
- Cada version tiene su propio router, su presentador (forma de la respuesta), sus validaciones y su formato de error. Cambiar v2 no puede romper v1.
- Los datos son los mismos: lo que se crea en una version se ve en la otra.

## Rutas

| Ruta | Descripcion |
| --- | --- |
| `GET /avanzado/ejercicio-01` | Respuesta base del ejercicio |
| `GET /avanzado/ejercicio-01/versiones` | Versiones, estado, fechas y cambios rotos |
| `GET /v1/personajes` | Lista completa, filtro `clase` |
| `GET /v1/personajes/:id` | Detalle |
| `POST /v1/personajes` | Crear `{ nombre, clase }` |
| `GET /v2/personajes` | Lista paginada: `clase`, `nivelMin`, `nivelMax`, `buscar`, `orden`, `pagina`, `limite` |
| `GET /v2/personajes/:id` | Detalle |
| `POST /v2/personajes` | Crear `{ nombre, clase, nivel? }` |
| `PATCH /v2/personajes/:id` | Editar `nombre` y/o `nivel` |
| `DELETE /v2/personajes/:id` | Eliminar (204) |
| `GET /v2/clases` | Catalogo de clases |

## Diferencias v1 y v2

| | v1 | v2 |
| --- | --- | --- |
| Vida | `hp` | `atributos: { vida, mana, fuerza }` |
| Exito | `{ ok, data }` | `{ data }` |
| Listado | `{ ok, data, total }` | `{ data, meta, links }` + `X-Total-Count` |
| Error | `{ ok: false, message, codigo, errores }` | `application/problem+json` |

## Ciclo de vida de v1

Desde `2026-07-01` v1 esta deprecada y cada respuesta lleva:

```text
API-Version: 1
Deprecation: @1782864000
Sunset: Wed, 31 Mar 2027 23:59:59 GMT
Link: </avanzado/ejercicio-01/v2>; rel="successor-version"
```

Pasada la fecha de retiro responde `410` con codigo `VERSION_RETIRADA`. Una version inexistente (`/v9/...`) responde `404` con `VERSION_NO_SOPORTADA`.

## Ejemplos

```bash
curl http://localhost:3000/avanzado/ejercicio-01/versiones
curl -i http://localhost:3000/avanzado/ejercicio-01/v1/personajes/1
curl "http://localhost:3000/avanzado/ejercicio-01/v2/personajes?clase=mago&orden=nivel_desc&limite=2"
curl -X POST http://localhost:3000/avanzado/ejercicio-01/v2/personajes \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Kaelen","clase":"arquero","nivel":5}'
curl -X PATCH http://localhost:3000/avanzado/ejercicio-01/v2/personajes/3 \
  -H "Content-Type: application/json" -d '{"nivel":20}'
curl -X DELETE http://localhost:3000/avanzado/ejercicio-01/v2/personajes/3
```

Error en v2:

```json
{
  "type": "/avanzado/ejercicio-01/errores/validacion",
  "title": "Solicitud invalida",
  "status": 400,
  "detail": "Datos invalidos",
  "instance": "/avanzado/ejercicio-01/v2/personajes",
  "code": "VALIDACION",
  "errors": [{ "pointer": "/nombre", "detail": "debe tener entre 3 y 20 caracteres" }]
}
```

## Estructura

```text
src/
  app.js            router, /versiones y version no soportada
  constants/        rutas, clases RPG, definicion de versiones
  domain/           atributos por nivel y estado del ciclo de vida
  services/         logica de personajes sin versiones
  versions/v1/      router y presentador de v1
  versions/v2/      router y presentador de v2
  middlewares/      ciclo de vida, errores por formato, 404, 405, 415
  validators/       esquemas por version
```

## Pruebas

`npm test` corre 45 pruebas con `node:test`: contrato congelado de v1, contrato y comportamiento de v2, ciclo de vida con reloj inyectado (antes, durante y despues del retiro) y consistencia entre versiones.
