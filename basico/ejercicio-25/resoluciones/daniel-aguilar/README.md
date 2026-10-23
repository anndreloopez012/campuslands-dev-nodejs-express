# Ejercicio 25 — Respuestas HTTP correctas

**Temática:** videojuegos RPG · **Nivel:** Básico guiado

## Objetivo

Que cada respuesta de la API sea **predecible y correcta**: el código de estado adecuado, las cabeceras necesarias (`Location`, `Content-Type`, `X-Total-Count`) y un formato único para éxitos y errores.

## Requisitos

- Node.js 20 o superior

## Instalación y ejecución

```bash
npm install
npm start
npm run dev
npm test
```

Servidor en `http://localhost:3000` (configurable con `PORT`).

## Estructura

```text
ejercicio-25/
├── package.json
├── README.md
├── src/
│   ├── app.js                         # 404 y manejador de errores con el formato común
│   ├── server.js
│   ├── utils/response.js              # ok, created, noContent, fail
│   ├── routes/index.js
│   ├── controllers/quests.controller.js
│   └── services/quests.service.js
└── test/app.test.js
```

## Formato de respuestas

Éxito:

```json
{ "ok": true, "data": { "id": 4, "title": "Cazador de sombras", "level": 10, "reward": 400, "status": "abierta" } }
```

Listas incluyen `meta`:

```json
{ "ok": true, "data": [ "..." ], "meta": { "total": 3 } }
```

Error:

```json
{ "ok": false, "error": { "code": "VALIDATION_ERROR", "message": "Datos invalidos", "details": ["..."] } }
```

## Endpoints y códigos

| Método | Ruta | Éxito | Errores |
| --- | --- | --- | --- |
| GET | `/quests?status=abierta` | `200` + `X-Total-Count` | 400 |
| GET | `/quests/:id` | `200` | 400, 404 |
| POST | `/quests` | `201` + `Location: /quests/:id` | 400 |
| PATCH | `/quests/:id/complete` | `200` con la misión actualizada | 400, 404, 409 |
| DELETE | `/quests/:id` | `204` sin cuerpo | 400, 404 |

Además: `GET /health` y `GET /basico/ejercicio-25`.

Estados válidos (`status`): `abierta`, `en_progreso`, `completada`.

## Ejemplos

```bash
curl -i http://localhost:3000/quests

curl -i -X POST http://localhost:3000/quests \
  -H "Content-Type: application/json" \
  -d '{"title":"Cazador de sombras","level":10,"reward":400}'

curl -i -X PATCH http://localhost:3000/quests/1/complete
curl -i -X PATCH http://localhost:3000/quests/1/complete    # 409: ya completada
curl -i -X DELETE http://localhost:3000/quests/1             # 204
curl -i http://localhost:3000/quests/999                     # 404
```

## Criterios aplicados

| Situación | Respuesta |
| --- | --- |
| Lectura correcta | `200` con `data` |
| Recurso creado | `201` + `Location` (nunca `200`) |
| Borrado correcto | `204`, sin cuerpo |
| Dato mal formado o inválido | `400` con `details` |
| Recurso inexistente | `404` |
| Acción que contradice el estado actual | `409` (`ALREADY_COMPLETED`) |
| Bug inesperado | `500` genérico, sin filtrar detalles |

Cada error lleva un `code` estable (`NOT_FOUND`, `VALIDATION_ERROR`, `INVALID_JSON`...) para que un cliente pueda reaccionar sin depender del texto del mensaje.

## Pruebas

```bash
npm test
```
