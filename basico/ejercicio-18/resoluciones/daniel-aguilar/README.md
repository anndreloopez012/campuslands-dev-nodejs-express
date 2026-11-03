# Ejercicio 18 — Rutas POST

**Temática:** paracaidismo · **Nivel:** Básico inicial

## Objetivo

Crear recursos con `POST`: leer el cuerpo JSON (`req.body`), validarlo, responder `201 Created` con la cabecera `Location` y verificar que el recurso quedó disponible con `GET`.

## Requisitos

- Node.js 20 o superior

## Instalación y ejecución

```bash
npm install
npm start
npm run dev
npm test
```

Servidor en `http://localhost:3000` (configurable con `PORT`). Los datos se guardan en memoria y se pierden al reiniciar.

## Estructura

```text
ejercicio-18/
├── package.json
├── README.md
├── src/
│   ├── app.js                     # incluye express.json()
│   ├── server.js
│   ├── routes/index.js
│   ├── controllers/jumps.controller.js
│   └── services/jumps.service.js
└── test/app.test.js
```

## Endpoints

| Método | Ruta | Descripción | Códigos |
| --- | --- | --- | --- |
| GET | `/health` | Estado del servicio | 200 |
| GET | `/basico/ejercicio-18` | Endpoint principal | 200 |
| GET | `/jumps` | Lista de saltos | 200 |
| GET | `/jumps/:id` | Detalle | 200, 400, 404 |
| POST | `/jumps` | Registra un salto | 201, 400 |

### Cuerpo de `POST /jumps`

| Campo | Regla |
| --- | --- |
| `jumper` | Texto de al menos 2 caracteres |
| `type` | `tandem`, `solo`, `aff` o `wingsuit` |
| `altitudeFt` | Entero entre 3000 y 18000 |

## Ejemplos

```bash
curl -i -X POST http://localhost:3000/jumps \
  -H "Content-Type: application/json" \
  -d '{"jumper":"Diego Paz","type":"solo","altitudeFt":12500}'
```

```text
HTTP/1.1 201 Created
Location: /jumps/2
```

```json
{
  "ok": true,
  "jump": {
    "id": 2,
    "jumper": "Diego Paz",
    "type": "solo",
    "altitudeFt": 12500,
    "createdAt": "2026-10-03T16:20:00.000Z"
  }
}
```

```bash
curl http://localhost:3000/jumps/2

# Datos inválidos -> 400 con la lista de problemas
curl -i -X POST http://localhost:3000/jumps \
  -H "Content-Type: application/json" \
  -d '{"jumper":"D","type":"planeador","altitudeFt":99999}'
```

## Conceptos aplicados

- `express.json()` convierte el cuerpo JSON en `req.body`; sin él, `req.body` no existe.
- El `Content-Type: application/json` es obligatorio al enviar JSON.
- `POST` que crea algo responde **201**, no 200, e incluye `Location` con la URL del nuevo recurso.
- Nunca se confía en el cuerpo: se valida antes de guardar.
- JSON mal formado → `400` (lo maneja el middleware de errores de `app.js`).

## Pruebas

```bash
npm test
```
