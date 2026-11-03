# API Shooters Competitivos y Esports — Códigos de Estado HTTP Avanzados

Este proyecto es una API REST modular construida con Node.js y Express sobre la temática de **esports, torneos de shooters competitivos (Valorant, CS2, Apex Legends) y registro de partidas**. El objetivo principal de este ejercicio es dominar y refinar el uso de los códigos de estado HTTP, incluyendo validaciones de autenticación (`401`) y autorización de roles (`403`).

---

## Tecnologías y Códigos HTTP Aplicados

* **Node.js & Express**: Entorno de ejecución y framework para el desarrollo del backend.
* **Códigos de Estado HTTP Estrictos**:
  * `200 OK`: Lecturas y consultas de listados o partidas por ID exitosas.
  * `201 Created`: Creación exitosa de una nueva partida o registro de torneo.
  * `204 No Content`: Eliminación exitosa de un registro (sin cuerpo de respuesta).
  * `400 Bad Request`: Errores de validación de entradas, formatos o campos obligatorios.
  * `401 Unauthorized`: Falta de credenciales de autenticación en los headers.
  * `403 Forbidden`: Credenciales válidas pero sin privilegios suficientes (requiere rol de administrador).
  * `404 Not Found`: Partida o recurso no encontrado.
  * `409 Conflict`: Intentos de registrar un código de lobby duplicado.
* **Arquitectura N-Capas**:
  * `routes/`: Declaración de endpoints.
  * `controllers/`: Manejo de headers (`Authorization`), validación y asignación de códigos HTTP.
  * `services/`: Lógica de negocio y persistencia en archivo JSON.
  * `middlewares/`: Middleware global de errores.

---

## Estructura del Proyecto

```text
src/
├── app.js                          # Configuración de Express y middlewares
├── server.js                       # Arranque del servidor HTTP
├── routes/
│   └── matches.routes.js           # Enrutamiento modular de partidas
├── controllers/
│   └── matches.controller.js       # Controladores HTTP y validación de permisos
├── services/
│   └── matches.service.js          # Lógica de negocio y lectura/escritura JSON
├── middlewares/
│   └── errorHandler.js             # Manejador global de excepciones y sintaxis JSON
├── utils/
│   ├── asyncHandler.js             # Envoltorio asíncrono
│   └── customErrors.js             # Clases de error (400, 401, 403, 404, 409)
└── data/
    └── matches.json                # Almacenamiento local en JSON
.gitignore                          # Control de archivos excluidos
package.json                        # Configuración de scripts y dependencias
```

---

## Configuración e Instalación

1. Instalación de dependencias:
```bash
npm install
```

2. Iniciar el servidor en modo desarrollo:
```bash
npm run dev
```

Servidor listo en: `http://localhost:3000`.

---

## Documentación de Endpoints

**Base URL:** `/api/v1`

### 1. Obtener listado de partidas

* **Método:** `GET`
* **Ruta:** `/api/v1/matches`
* **Código de Respuesta:** `200 OK`
* **Query Params Opcionales:** `gameMode`, `isTournamentMatch`, `mapName`.

### 2. Obtener una partida por ID

* **Método:** `GET`
* **Ruta:** `/api/v1/matches/:id`
* **Código de Respuesta:** `200 OK` (o `404 Not Found`).

### 3. Registrar una nueva partida (Protegido por Admin)

* **Método:** `POST`
* **Ruta:** `/api/v1/matches`
* **Headers Requeridos:**
  * `Content-Type: application/json`
  * `Authorization: Bearer secret-admin-token-2026`
* **Códigos de Respuesta:**
  * `201 Created`: Partida registrada exitosamente.
  * `400 Bad Request`: Datos de entrada inválidos.
  * `401 Unauthorized`: Falta el header Authorization.
  * `403 Forbidden`: Token incorrecto o sin privilegios de administrador.
  * `409 Conflict`: El código de lobby ya existe.

**Cuerpo de Petición Válido (JSON):**
```json
{
  "matchCode": "FPS-VAL-999",
  "mapName": "Bind",
  "gameMode": "Competitive",
  "winningTeam": "Fnatic",
  "score": "13-11",
  "durationMinutes": 40,
  "mvpPlayer": "Boaster",
  "isTournamentMatch": true
}
```

### 4. Eliminar una partida (Protegido por Admin)

* **Método:** `DELETE`
* **Ruta:** `/api/v1/matches/:id`
* **Headers Requeridos:** `Authorization: Bearer secret-admin-token-2026`
* **Códigos de Respuesta:** `204 No Content`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`.

---

## Pruebas con cURL

```bash
# 1. Obtener todas las partidas (200 OK)
curl -X GET http://localhost:3000/api/v1/matches

# 2. Intentar registrar sin token (401 Unauthorized)
curl -X POST http://localhost:3000/api/v1/matches \
  -H "Content-Type: application/json" \
  -d '{"matchCode": "FPS-VAL-999", "mapName": "Bind", "gameMode": "Competitive", "winningTeam": "Fnatic", "score": "13-11", "durationMinutes": 40, "mvpPlayer": "Boaster"}'

# 3. Intentar registrar con rol inválido (403 Forbidden)
curl -X POST http://localhost:3000/api/v1/matches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token-normal" \
  -d '{"matchCode": "FPS-VAL-999", "mapName": "Bind", "gameMode": "Competitive", "winningTeam": "Fnatic", "score": "13-11", "durationMinutes": 40, "mvpPlayer": "Boaster"}'

# 4. Registrar partida exitosamente como administrador (201 Created)
curl -X POST http://localhost:3000/api/v1/matches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer secret-admin-token-2026" \
  -d '{
    "matchCode": "FPS-VAL-999",
    "mapName": "Bind",
    "gameMode": "Competitive",
    "winningTeam": "Fnatic",
    "score": "13-11",
    "durationMinutes": 40,
    "mvpPlayer": "Boaster",
    "isTournamentMatch": true
  }'
```
