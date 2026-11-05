# Intermedio 27 - documentacion de endpoints

## Que hace

API de MOBA esports (equipos, torneos e inscripciones) cuyo foco es la documentacion. La API se documenta a si misma con una especificacion OpenAPI 3 que se sirve en dos formatos y que las pruebas comparan contra las rutas reales, para que la documentacion no se desactualice.

Piezas:
- `src/docs/openapi.js` arma el documento OpenAPI a partir de `paths.*.js` (una operacion por endpoint) y `componentes.js` (esquemas reutilizables).
- Los esquemas de los bodies no se escriben a mano: `esquemaJson.js` los convierte desde las mismas reglas que usa la validacion (`src/validators/schemas.js`). Si cambia un limite de validacion, cambia la documentacion.
- `modelo.js` convierte el documento en una lista de operaciones. De ahi salen la pagina HTML (`html.js`), el Markdown (`markdown.js`) y los ejemplos `curl`.
- `introspeccion.js` lista las rutas que Express tiene registradas, para compararlas con las documentadas.

Documentacion generada:
- `GET /intermedio/ejercicio-27/docs`: pagina HTML autocontenida (sin scripts ni recursos externos, con Content-Security-Policy restrictiva).
- `GET /intermedio/ejercicio-27/docs/openapi.json`: especificacion para importar en Postman, Insomnia o Swagger UI.
- `docs/API.md` y `docs/openapi.json`: copias en archivo. Se regeneran con `npm run docs:generar`.

Reglas del dominio:
- El tag de un equipo son 2 a 5 mayusculas o numeros y no se puede cambiar.
- Un equipo inscrito en algun torneo no se puede eliminar.
- Inscribir o retirar equipos solo es posible mientras el torneo esta en etapa de inscripcion. Ademas se exige que haya cupos y que el equipo no este ya inscrito.

## Estructura

```
src/
  app.js
  server.js
  constants/
  controllers/
  data/
  docs/
    openapi.js
    componentes.js
    paths.sistema.js
    paths.equipos.js
    paths.torneos.js
    esquemaJson.js
    ayudas.js
    modelo.js
    html.js
    markdown.js
    archivos.js
    introspeccion.js
  middlewares/
  repositories/
  routes/
  services/
  utils/
  validators/
scripts/
  generar-docs.js
docs/
  API.md
  openapi.json
soporte/
  cliente.js
  esquema.js
test/
  api.test.js
  contrato.test.js
  esquemaJson.test.js
  especificacion.test.js
  rutas-documentadas.test.js
```

## Como ejecutar

```
npm install
npm run dev
```

Puerto 3000 por defecto (`PORT`). Luego abre `http://localhost:3000/intermedio/ejercicio-27/docs` en el navegador.

Cuando cambies un endpoint, su documentacion o una regla de validacion:

```
npm run docs:generar
```

## Como correr las pruebas

```
npm test
```

Otros scripts: `npm run test:watch` y `npm run test:cobertura`. Para un solo archivo: `node --test test/contrato.test.js`.

Que garantiza cada archivo:
- `rutas-documentadas.test.js`: toda ruta registrada en Express esta documentada y toda ruta documentada existe. Los metodos que no estan documentados responden 405 con el header `Allow` correcto.
- `contrato.test.js`: llama a cada operacion con sus ejemplos y comprueba el status, el Content-Type, los headers documentados y que el body cumple el esquema documentado. Tambien provoca los errores 400, 404, 409, 415 y 422 y comprueba que cada uno esta documentado en esa operacion.
- `especificacion.test.js`: la especificacion es consistente (referencias validas, ids de operacion unicos, parametros de ruta declarados, ejemplos presentes), los renderizadores escapan el contenido y los archivos de `docs/` estan al dia.
- `esquemaJson.test.js`: conversion de reglas de validacion a JSON Schema.
- `api.test.js`: comportamiento de equipos, torneos e inscripciones.

## Respuesta esperada

`GET /intermedio/ejercicio-27`

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "documentacion de endpoints"
}
```

## Endpoints

Base: `/intermedio/ejercicio-27`. El detalle completo de cada uno (parametros, body, respuestas y ejemplos) esta en `docs/API.md` y en `/docs`.

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | / | Ruta principal |
| GET | /docs | Documentacion en HTML |
| GET | /docs/openapi.json | Especificacion OpenAPI |
| GET | /equipos | Lista equipos |
| POST | /equipos | Crea un equipo |
| GET | /equipos/:id | Detalle de un equipo |
| PATCH | /equipos/:id | Cambia nombre o region |
| DELETE | /equipos/:id | Elimina un equipo |
| GET | /torneos | Lista torneos |
| GET | /torneos/:id | Detalle de un torneo |
| GET | /torneos/:id/inscripciones | Equipos inscritos |
| POST | /torneos/:id/inscripciones | Inscribe un equipo |
| DELETE | /torneos/:id/inscripciones/:equipoId | Retira un equipo |

## Campos del body

`POST /equipos`:
- `nombre`: 3 a 30 caracteres, unico sin distinguir mayusculas. Obligatorio.
- `tag`: 2 a 5 caracteres, solo mayusculas y numeros, unico. Obligatorio.
- `region`: na, eu, latam o asia. Obligatorio.

`PATCH /equipos/:id`: `nombre` y/o `region`, al menos uno.

`POST /torneos/:id/inscripciones`: `equipoId`, entero positivo. Obligatorio.

Los requests con body deben enviar `Content-Type: application/json` y no pueden superar 10 KB. Los campos desconocidos se rechazan.

## Parametros de consulta

- `GET /equipos`: `region`, `buscar`, `orden` (id, nombre, victorias), `pagina`, `limite`.
- `GET /torneos`: `estado` (inscripcion, en_curso, finalizado), `formato` (eliminacion, liga, suizo), `orden` (id, inicio, premio), `pagina`, `limite`.

`limite` va de 1 a 50 (10 por defecto). Los parametros desconocidos o repetidos se rechazan con 400.

## Ejemplos

curl:

```
curl http://localhost:3000/intermedio/ejercicio-27/docs/openapi.json
curl "http://localhost:3000/intermedio/ejercicio-27/equipos?region=eu&orden=victorias"
curl -X POST http://localhost:3000/intermedio/ejercicio-27/equipos -H "Content-Type: application/json" -d "{\"nombre\":\"Aurora Nine\",\"tag\":\"AUR\",\"region\":\"latam\"}"
curl -X POST http://localhost:3000/intermedio/ejercicio-27/torneos/1/inscripciones -H "Content-Type: application/json" -d "{\"equipoId\":3}"
curl -X DELETE http://localhost:3000/intermedio/ejercicio-27/torneos/1/inscripciones/2
```

PowerShell:

```
Invoke-RestMethod http://localhost:3000/intermedio/ejercicio-27/torneos?estado=inscripcion
Invoke-RestMethod -Method Post -Uri http://localhost:3000/intermedio/ejercicio-27/equipos -ContentType "application/json" -Body '{"nombre":"Aurora Nine","tag":"AUR","region":"latam"}'
Invoke-RestMethod -Method Post -Uri http://localhost:3000/intermedio/ejercicio-27/torneos/1/inscripciones -ContentType "application/json" -Body '{"equipoId":3}'
```

## Formato de respuesta

Un recurso:

```json
{
  "ok": true,
  "data": {
    "id": 8,
    "nombre": "Aurora Nine",
    "tag": "AUR",
    "region": "latam",
    "victorias": 0,
    "derrotas": 0,
    "creadoEn": "2026-11-04T12:00:00.000Z"
  }
}
```

Un listado incluye `paginacion` y el header `X-Total-Count`:

```json
{
  "ok": true,
  "data": [],
  "paginacion": { "pagina": 1, "limite": 10, "total": 7, "totalPaginas": 1 }
}
```

## Errores

```json
{ "ok": false, "message": "Datos invalidos", "codigo": "VALIDACION", "errores": [{ "campo": "tag", "mensaje": "solo admite mayusculas y numeros" }] }
```

| Status | Cuando | Codigo |
| --- | --- | --- |
| 400 | Datos, id o parametros invalidos, JSON mal formado | VALIDACION, ID_INVALIDO, CONSULTA_INVALIDA, JSON_INVALIDO, BODY_INVALIDO |
| 404 | Ruta o recurso inexistente | RUTA_NO_ENCONTRADA, EQUIPO_NO_ENCONTRADO, TORNEO_NO_ENCONTRADO, INSCRIPCION_NO_ENCONTRADA |
| 405 | Metodo no permitido (con header `Allow`) | METODO_NO_PERMITIDO |
| 409 | Nombre o tag repetido, equipo inscrito, inscripcion cerrada, torneo lleno, equipo ya inscrito | NOMBRE_DUPLICADO, TAG_DUPLICADO, EQUIPO_INSCRITO, INSCRIPCION_CERRADA, TORNEO_LLENO, EQUIPO_YA_INSCRITO |
| 413 | Body mayor a 10 KB | PAYLOAD_GRANDE |
| 415 | Content-Type distinto de application/json | TIPO_NO_SOPORTADO |
| 422 | El equipo a inscribir no existe | REFERENCIA_INVALIDA |
| 500 | Error inesperado | ERROR_INTERNO |
