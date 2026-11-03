# API Liga de Fútbol y Fútbol Sala — Refactorización de API (Clean Layered Architecture & DTO Mappers)

Este repositorio implementa una **Refactorización Estructural de API** utilizando **Node.js** y **Express** sobre la temática de **clubes de fútbol y fútbol sala, cálculo de tabla de posiciones, diferencia de goles y rendimiento porcentual**.

---

## Fundamentos de la Refactorización Realizada

En código legado o monolítico es común encontrar validaciones, cálculos matemáticos, transformación de objetos y acceso a datos mezclados dentro de `app.post("/clubs", ...)`. Esta refactorización aplica **Separación de Responsabilidades (SoC)**:

1. **Extracción de DTO / Mapper Puro (`src/utils/standingsMapper.js`)**:
   Aísla el cálculo derivado (`matchesPlayed`, `points`, `goalDifference`, `efficiencyPercentage`) en una función pura `toClubStandingDTO(club)` fácil de probar y mantener.
2. **Desacoplamiento de Validaciones (`src/middlewares/validators/club.validator.js`)**:
   Elimina condicionales anidados del controlador mediante el middleware declarativo `validate(createClubValidator)`.
3. **Ordenamiento de Negocio en Capa de Servicios (`src/services/clubs.service.js`)**:
   Ordena automáticamente la clasificación por puntos y diferencia de goles (`goalDifference` como criterio de desempate oficial FIFA).

---

## Estructura de Directorios

```text
src/
├── app.js                                       # Configuración global de Express y rutas
├── server.js                                    # Arranque del servidor HTTP
├── routes/
│   ├── index.routes.js                          # Montaje centralizado
│   └── clubs.routes.js                          # Endpoints limpios de clubes y clasificación
├── controllers/
│   └── clubs.controller.js                      # Controladores delgados sin lógica de negocio
├── services/
│   └── clubs.service.js                         # Reglas de clasificación FIFA y desempate por diferencia de gol
├── repositories/
│   └── clubs.inMemory.repository.js             # Persistencia en memoria de clubes
├── middlewares/
│   ├── requestId.middleware.js                  # Trazabilidad con UUID v4
│   ├── logger.middleware.js                     # Logger transversal
│   ├── errorHandler.middleware.js               # Captura centralizada de errores
│   └── validators/
│       ├── validate.middleware.js               # Envoltorio de validación
│       └── club.validator.js                    # Validación de modalidades y estadísticas no negativas
└── utils/
    ├── asyncHandler.js                          # Envoltorio asíncrono
    ├── standingsMapper.js                       # Transformador DTO (puntos, DG y % de rendimiento)
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

| Recurso | Método | Endpoint | Query Params | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| **Clubes** | **GET** | `/clubs` | `modality` (opcional) | Tabla de posiciones ordenada por puntos y diferencia de gol |
| **Clubes** | **GET** | `/clubs/:id` | Ninguno | Obtiene el resumen estadístico (DTO) de un club por su ID |
| **Clubes** | **POST** | `/clubs` | Ninguno | Inscribe un nuevo club y calcula su DTO de clasificación |

---

## Pruebas con cURL

```bash
# 1. Consultar la tabla de posiciones ordenada por puntos y diferencia de goles
curl -X GET http://localhost:3000/api/v1/clubs

# 2. Inscribir un nuevo club de Fútbol Sala (Calcula automáticamente puntos, PJ, DG y eficiencia)
curl -X POST http://localhost:3000/api/v1/clubs \
  -H "Content-Type: application/json" \
  -d '{
    "clubName": "Sporting Clube Futsal",
    "modality": "Futbol_Sala_FIFA",
    "wins": 15,
    "draws": 1,
    "losses": 2,
    "goalsFor": 72,
    "goalsAgainst": 25
  }'

# 3. Probar error 409 Conflict intentando duplicar un club existente
curl -X POST http://localhost:3000/api/v1/clubs \
  -H "Content-Type: application/json" \
  -d '{
    "clubName": "Inter Movistar Futsal",
    "modality": "Futbol_Sala_FIFA",
    "wins": 10,
    "draws": 0,
    "losses": 0,
    "goalsFor": 40,
    "goalsAgainst": 10
  }'
```
