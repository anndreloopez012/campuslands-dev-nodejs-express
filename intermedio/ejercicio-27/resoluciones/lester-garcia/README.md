# API Liga MOBA Esports — Documentación Técnica de Endpoints (OpenAPI 3.0 Contract)

Este repositorio implementa el estándar de **Documentación Técnica de Endpoints y Contratos HTTP (estilo OpenAPI 3.0)** utilizando **Node.js** y **Express** sobre la temática de **torneos profesionales de MOBA Esports (League of Legends, Dota 2, Honor of Kings)**.

---

## Fundamentos de Documentación de Endpoints

Una API profesional es tan útil como la claridad de su contrato técnico:

1. **Especificación Estructurada (`GET /api/v1/tournaments/docs`)**:
   Expone un descriptor JSON compatible con la estructura de **OpenAPI 3.0.3**, detallando `servers`, `paths`, esquemas de `requestBody`, parámetros de ruta y códigos de estado HTTP.
2. **Contratos de Entrada y Salida Predecibles**:
   Cada endpoint documenta su verbo HTTP, ruta exacta, reglas de validación, estructura de éxito (`200`/`201`) y catálogo de errores operacionales (`400`/`404`).

---

## Estructura de Directorios

```text
src/
├── app.js                                       # Configuración global y enlace a /api/v1/tournaments/docs
├── server.js                                    # Arranque del servidor HTTP
├── config/
│   └── openapi.config.js                        # Descriptor OpenAPI 3.0.3 de los endpoints del servicio
├── routes/
│   ├── index.routes.js                          # Montaje centralizado
│   └── tournaments.routes.js                    # Endpoints de documentación y torneos MOBA
├── controllers/
│   └── tournaments.controller.js                # Controladores HTTP limpios
├── services/
│   └── tournaments.service.js                   # Lógica de negocio de torneos y entrega de especificación
├── repositories/
│   └── tournaments.inMemory.repository.js       # Persistencia en memoria de torneos MOBA
├── middlewares/
│   ├── requestId.middleware.js                  # Trazabilidad con UUID v4
│   ├── logger.middleware.js                     # Logger transversal
│   ├── errorHandler.middleware.js               # Captura centralizada de errores
│   └── validators/
│       ├── validate.middleware.js               # Envoltorio de validación
│       └── tournament.validator.js              # Validación de juego MOBA, región y bolsa de premios
└── utils/
    ├── asyncHandler.js                          # Envoltorio asíncrono
    └── customErrors.js                          # Clases de error operacionales
.env                                             # Variables de entorno locales (excluido en Git)
.env.example                                     # Plantilla de variables de entorno
.gitignore                                       # Control de exclusiones
package.json                                     # Scripts y dependencias
```

---

## Configuración e Instalación

### 1. Variables de entorno
```bash
cp .env.example .env
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Modo desarrollo
```bash
npm run dev
```

---

## Referencia de Endpoints

**Base URL:** `/api/v1`

| Recurso | Método | Endpoint | Códigos HTTP | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| **Docs** | **GET** | `/tournaments/docs` | `200` | Devuelve el contrato OpenAPI 3.0.3 completo en JSON |
| **Torneos** | **GET** | `/tournaments` | `200` | Lista todos los torneos de MOBA Esports registrados |
| **Torneos** | **GET** | `/tournaments/:id` | `200`, `404` | Consulta el detalle de un torneo por su ID |
| **Torneos** | **POST** | `/tournaments` | `201`, `400` | Registra un nuevo torneo validando juego, región y premio |

---

## Pruebas con cURL

```bash
# 1. Consultar la especificación OpenAPI 3.0 del servicio
curl -X GET http://localhost:3000/api/v1/tournaments/docs

# 2. Listar todos los torneos MOBA Esports
curl -X GET http://localhost:3000/api/v1/tournaments

# 3. Registrar un nuevo torneo regional LCK
curl -X POST http://localhost:3000/api/v1/tournaments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "LCK Summer Split Finals 2026",
    "gameTitle": "League of Legends",
    "region": "LCK",
    "prizePoolUsd": 300000
  }'

# 4. Probar error 400 Bad Request documentado en el esquema
curl -X POST http://localhost:3000/api/v1/tournaments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "LoL",
    "gameTitle": "JuegoNoSoportado",
    "region": "Marte",
    "prizePoolUsd": 50
  }'
```
