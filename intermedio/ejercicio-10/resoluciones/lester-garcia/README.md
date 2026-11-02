# API Tenis de Mesa / Ping-Pong — Ordenamiento Dinámico de Resultados (Sorting Pattern)

Este repositorio implementa el estándar de Ordenamiento Dinámico con Lista Blanca (Sort Whitelist) construido con Node.js y Express sobre la temática de tenis de mesa profesional, rankings de la federación y estadísticas de jugadores.

---

## Como funciona el Ordenamiento

Para garantizar seguridad y predictibilidad:

1. **Lista Blanca (Whitelist):** Solo se permite ordenar por los atributos autorizados:
   * `rankingPoints` (Puntos de ranking federativo)
   * `winRatio` (Porcentaje de efectividad)
   * `matchesWon` (Partidos ganados)
   * `name` (Nombre alfabético con `localeCompare`)
   * `age` (Edad del jugador)

2. **Dirección:** `asc` (ascendente) o `desc` (descendente). Por defecto: `desc`.

3. **Respuesta Enriquecida:**

```json
{
  "status": "success",
  "requestId": "50c76ef3-a178-43d9-9524-7df815482329",
  "sort": {
    "field": "rankingPoints",
    "direction": "desc"
  },
  "pagination": {
    "currentPage": 1,
    "perPage": 5,
    "totalItems": 7,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "data": [ ... ]
}
```

---

## Estructura de Directorios

```plaintext
src/
├── app.js                                       # Configuración global de Express y rutas
├── server.js                                    # Arranque del servidor HTTP
├── routes/
│   └── players.routes.js                        # Rutas con validación de sort y pagination
├── controllers/
│   └── players.controller.js                    # Controladores delgados
├── services/
│   └── players.service.js                       # Algoritmo de ordenamiento (string vs number)
├── repositories/
│   └── players.inMemory.repository.js           # Repositorio en memoria
├── middlewares/
│   ├── requestId.middleware.js                  # Trazabilidad con UUID v4
│   ├── logger.middleware.js                     # Logger con request ID
│   ├── errorHandler.middleware.js               # Captura centralizada de errores
│   └── validators/
│       ├── validate.middleware.js               # Envoltorio de validación
│       └── query.validator.js                   # Whitelist de campos de ordenamiento
├── utils/
│   ├── asyncHandler.js                          # Envoltorio asíncrono
│   └── customErrors.js                          # Clases de error personalizadas
.env                                             # Variables de entorno
.env.example                                     # Plantilla de variables
.gitignore                                       # Control de exclusiones
package.json                                     # Scripts y dependencias
```

---

## Configuración e Instalación

### 1. Variables de entorno
```bash
cp .env.example .env
```

### 2. Dependencias
```bash
npm install
```

### 3. Modo desarrollo
```bash
npm run dev
```

---

## Referencia de Endpoints

**Base URL:** `/api/v1/table-tennis`

| Método | Endpoint | Query Params Soportados | Descripción |
| :--- | :--- | :--- | :--- |
| **GET** | `/players` | `sortBy`, `order`, `gripStyle`, `country`, `hand`, `search`, `page`, `limit` | Consultar jugadores ordenados, filtrados y paginados |
| **GET** | `/players/:id` | Ninguno | Obtener perfil de jugador por ID |
