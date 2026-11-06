# API de Equipos - Futbol y Futbol Sala (Juan Lema)

API REST simple para registrar equipos de futbol y futbol sala. Ejercicio 29: el objetivo es la calidad de esta documentacion tecnica, no la complejidad del codigo.

## Requisitos

- Node.js 20 o superior.
- npm.

## Instalacion

```bash
npm install
```

## Ejecucion

```bash
npm start
```

Con recarga automatica en desarrollo:

```bash
npm run dev
```

## Variables de entorno

| Variable | Obligatoria | Default | Descripcion |
|---|---|---|---|
| `PORT` | No | `3029` | Puerto donde escucha el servidor. |

## Endpoints

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/health` | Estado de la API. |
| GET | `/teams` | Lista todos los equipos. |
| GET | `/teams/:id` | Obtiene un equipo por id. |
| POST | `/teams` | Crea un equipo nuevo. |

### GET /teams

Respuesta `200`:

```json
{
  "ok": true,
  "data": [
    { "id": 1, "name": "Halcones FC", "modality": "futbol" },
    { "id": 2, "name": "Rayo Sala", "modality": "futbol sala" }
  ]
}
```

### GET /teams/:id

Respuesta `200`:

```json
{ "ok": true, "data": { "id": 1, "name": "Halcones FC", "modality": "futbol" } }
```

Respuesta `404` (id no existe):

```json
{ "ok": false, "message": "Equipo con id 99 no encontrado" }
```

Respuesta `400` (id no numerico):

```json
{ "ok": false, "message": "id debe ser numerico" }
```

### POST /teams

Body esperado:

```json
{ "name": "Aguilas Sala", "modality": "futbol sala" }
```

- `name`: string, obligatorio.
- `modality`: string, obligatorio, debe ser `"futbol"` o `"futbol sala"`.

Respuesta `201`:

```json
{ "ok": true, "data": { "id": 3, "name": "Aguilas Sala", "modality": "futbol sala" } }
```

Respuesta `400` (modality invalida):

```json
{ "ok": false, "message": "modality debe ser 'futbol' o 'futbol sala'" }
```

## Formato de error

Todos los errores devuelven el mismo formato:

```json
{ "ok": false, "message": "descripcion del error" }
```

## Como probar manualmente

```bash
curl http://localhost:3029/teams
curl http://localhost:3029/teams/1
curl -X POST http://localhost:3029/teams -H "Content-Type: application/json" -d "{\"name\":\"Aguilas Sala\",\"modality\":\"futbol sala\"}"
```

## Estructura del proyecto

```text
src/
├── app.js              # configuracion de Express y middlewares
├── server.js            # arranque del servidor
├── routes/
│   └── teams.routes.js
├── controllers/
│   └── teams.controller.js
└── services/
    └── teams.service.js   # datos en memoria y logica de negocio
```

## Notas

- Los datos viven en memoria: se reinician al reiniciar el servidor.
- No requiere base de datos externa.
