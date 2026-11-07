# AVANZADO 01 - diseno API versionada (Resolucion de Carlos Velasco)

Backend en Node.js + Express que demuestra **diseno API versionada** con tematica de **videojuegos RPG**: el gremio expone el mismo dominio de personajes en dos versiones coexistentes (`/api/v1` y `/api/v2`).

## Idea clave

El modelo de dominio (servicios y datos) es uno solo. El versionado vive en la capa de presentacion: cada version tiene su **adaptador** que transforma el modelo en la forma de respuesta que le corresponde:

- **v1**: campos en espanol, forma plana.
- **v2**: respuesta enriquecida con `powerScore`, objeto `guild`, metadatos HATEOAS (`_links`) y `lastUpdated`.

La estrategia elegida es **versionado por URI** (`/api/v1`, `/api/v2`), la mas predecible para clientes.

## Como ejecutar

```bash
cd avanzado/ejercicio-01/resoluciones/carlos-velasco
npm install
npm run dev
```

## Endpoints

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/health` | Estado de la aplicacion |
| GET | `/api` | Documentacion de las versiones disponibles |
| GET | `/api/v1/characters` | Listado v1 (forma plana, espanol) |
| GET | `/api/v1/characters/:id` | Detalle v1 |
| GET | `/api/v2/characters` | Listado v2 (enriquecido, HATEOAS) |
| GET | `/api/v2/characters/:id` | Detalle v2 |

## Ejemplos con curl

```bash
curl http://localhost:3001/health
curl http://localhost:3001/api
curl http://localhost:3001/api/v1/characters
curl http://localhost:3001/api/v2/characters/3
curl -i http://localhost:3001/api/v1/characters/999   # 404 con apiVersion en el cuerpo del error
```

## Casos de error manejados

- `400` si el `id` no es un entero positivo.
- `404` si el personaje no existe (incluye `apiVersion` en la respuesta de error).

## Estructura

```text
src/
├── adapters/character.adapter.js   # toV1 / toV2
├── controllers/character.controller.js
├── data/characters.data.js
├── errors/app.error.js
├── middlewares/error.handler.js
├── routes/index.routes.js
├── routes/character.routes.js
├── services/character.service.js
└── app.js
```

## Notas de diseno

- La logica de negocio (servicio) nunca sabe que version llego la peticion; esa decision queda en rutas/controladores/adaptadores.
- `GET /api` sirve como punto de descubrimiento de versiones: estado (`estable`/`actual`), endpoints y estilo de respuesta.
- Registrar version en un middleware del router (`req.apiVersion`) permite que el error handler reporte la version en los errores.
