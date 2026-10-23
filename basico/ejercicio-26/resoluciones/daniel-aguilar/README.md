# Ejercicio 26 — Códigos de estado

**Temática:** shooters competitivos · **Nivel:** Básico guiado

## Objetivo

Elegir el código de estado HTTP **correcto** en cada situación, incluyendo los que más se confunden: `400` vs `422`, `401` vs `403` y `404` vs `409`.

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
ejercicio-26/
├── package.json
├── README.md
├── src/
│   ├── app.js                         # 415, 404 y manejador de errores
│   ├── server.js
│   ├── middlewares/auth.js            # 401 y 403
│   ├── routes/index.js
│   ├── controllers/loadouts.controller.js
│   └── services/loadouts.service.js   # 400 / 422 / 409
└── test/app.test.js
```

## Mapa de códigos

| Código | Cuándo se usa aquí |
| --- | --- |
| `200 OK` | Lectura correcta |
| `201 Created` | Loadout creado (con `Location`) |
| `204 No Content` | Loadout borrado |
| `400 Bad Request` | Petición **mal formada**: JSON roto, tipos incorrectos, id inválido |
| `401 Unauthorized` | **No sabemos quién eres**: falta `x-api-key` o es incorrecta |
| `403 Forbidden` | **Sabemos quién eres**, pero no tienes permiso (falta `x-role: admin`) |
| `404 Not Found` | El recurso o la ruta no existen |
| `409 Conflict` | El nombre del loadout ya existe |
| `415 Unsupported Media Type` | El cuerpo no es `application/json` |
| `422 Unprocessable Content` | **Bien formada, pero rompe reglas**: arma desconocida o presupuesto excedido |
| `500 Internal Server Error` | Bug inesperado, sin filtrar detalles |
| `503 Service Unavailable` | Mantenimiento, con cabecera `Retry-After` |

La lista también está disponible en `GET /status-guide`.

### Distinciones clave

- **400 vs 422:** `{"name": 5}` está mal formado (400). `{"primary":"sniper","secondary":"revolver"}` tiene los tipos correctos pero cuesta 9 puntos y el presupuesto es 8 (422).
- **401 vs 403:** sin API key → 401 (se envía `WWW-Authenticate`). Con API key pero sin rol admin → 403.
- **409:** la petición es válida, pero choca con el estado actual (nombre repetido).

> La autenticación por cabeceras fijas es **solo demostrativa** para practicar 401/403. No es un mecanismo de seguridad real.

## Endpoints

| Método | Ruta | Requiere | Códigos |
| --- | --- | --- | --- |
| GET | `/health` | — | 200 |
| GET | `/basico/ejercicio-26` | — | 200 |
| GET | `/status-guide` | — | 200 |
| GET | `/loadouts` | — | 200 |
| GET | `/loadouts/:id` | — | 200, 400, 404 |
| POST | `/loadouts` | `x-api-key` | 201, 400, 401, 409, 415, 422 |
| DELETE | `/loadouts/:id` | `x-api-key` + `x-role: admin` | 204, 400, 401, 403, 404 |
| GET | `/admin/stats` | `x-api-key` + `x-role: admin` | 200, 401, 403 |
| GET | `/matchmaking` | — | 200, 503 |
| GET | `/debug/error` | — | 500 |

La API key de demostración es `shooter-secret` (se puede cambiar con la variable `API_KEY`).

### Presupuesto de armas (máximo 8 puntos)

| Primaria | Costo | Secundaria | Costo |
| --- | --- | --- | --- |
| `assault` | 5 | `pistol` | 2 |
| `sniper` | 6 | `revolver` | 3 |
| `smg` | 4 | `machine-pistol` | 2 |
| `shotgun` | 4 | | |

## Ejemplos

```bash
# 201
curl -i -X POST http://localhost:3000/loadouts \
  -H "Content-Type: application/json" -H "x-api-key: shooter-secret" \
  -d '{"name":"Entry Pack","primary":"assault","secondary":"pistol"}'

# 401 (sin API key)
curl -i -X POST http://localhost:3000/loadouts -H "Content-Type: application/json" -d '{}'

# 422 (presupuesto excedido: 6 + 3 = 9)
curl -i -X POST http://localhost:3000/loadouts \
  -H "Content-Type: application/json" -H "x-api-key: shooter-secret" \
  -d '{"name":"Caro","primary":"sniper","secondary":"revolver"}'

# 403 y luego 204
curl -i -X DELETE http://localhost:3000/loadouts/1 -H "x-api-key: shooter-secret"
curl -i -X DELETE http://localhost:3000/loadouts/1 -H "x-api-key: shooter-secret" -H "x-role: admin"

# 503 (arrancar con la variable de mantenimiento)
MAINTENANCE=true npm start
curl -i http://localhost:3000/matchmaking
```

## Pruebas

```bash
npm test
```
