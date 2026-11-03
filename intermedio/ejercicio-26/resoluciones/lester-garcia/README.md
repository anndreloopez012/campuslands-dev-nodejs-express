# API Shooters Competitivos — Mock de Dependencias (`node:test` Mocks & Dependency Injection)

Este repositorio implementa el patrón de **Inyección de Dependencias y Simulación de Módulos Externos (Dependency Mocking)** utilizando **`mock.fn()` de `node:test`** y **Express** sobre la temática de **shooters tácticos competitivos (Valorant / CS2), cálculo de K/D Ratio y verificación externa de integridad Anticheat**.

---

## Fundamentos de Mock de Dependencias

Cuando un servicio de negocio depende de sistemas externos (como una API de Anticheat o una base de datos), las pruebas unitarias no deben realizar llamadas de red reales ni mutar datos reales:

1. **Inyección de Dependencias (`deps = { repo, anticheat }`)**:
   El servicio `registerCompetitiveMatchService` recibe sus colaboradores por parámetro con valores por defecto de producción, permitiendo sustituirlos limpiamente en los tests.
2. **Espías y Funciones Simuladas (`mock.fn()`)**:
   Con `mock.fn()` del módulo nativo `node:test` se controla la respuesta exacta del cliente Anticheat (`isClean: true/false`) y se inspecciona cuántas veces fue invocado cada método (`mock.callCount()`).
3. **Verificación de Cortocircuito**:
   Se comprueba que cuando el mock de Anticheat reporta `isClean: false`, el servicio lanza `ForbiddenError` (`403`) y `fakeRepo.save.mock.callCount()` permanece en `0`.

---

## Estructura de Directorios

```text
src/
├── app.js                                       # Configuración global de Express y rutas
├── server.js                                    # Arranque del servidor HTTP
├── routes/
│   ├── index.routes.js                          # Montaje centralizado
│   └── matches.routes.js                        # Endpoints de partidas competitivas
├── controllers/
│   └── matches.controller.js                    # Controladores HTTP limpios
├── services/
│   └── matches.service.js                       # Servicio con inyección de dependencias (repo + anticheat)
├── repositories/
│   └── matches.inMemory.repository.js           # Repositorio en memoria de partidas
├── middlewares/
│   ├── requestId.middleware.js                  # Trazabilidad con UUID v4
│   ├── logger.middleware.js                     # Logger transversal
│   ├── errorHandler.middleware.js               # Captura centralizada de errores
│   └── validators/
│       ├── validate.middleware.js               # Envoltorio de validación
│       └── match.validator.js                   # Validación de playerTag, mapas y porcentajes de headshot
└── utils/
    ├── asyncHandler.js                          # Envoltorio asíncrono
    ├── anticheatClient.js                       # Cliente externo simulado de telemetría Anticheat
    └── customErrors.js                          # Clases de error (ForbiddenError 403, etc.)
tests/
└── matches.mock.test.js                         # Suite de pruebas con mock.fn() para aislar dependencias
.env                                             # Variables de entorno locales (excluido en Git)
.env.example                                     # Plantilla de variables de entorno
.gitignore                                       # Control de exclusiones
package.json                                     # Scripts (dev, start, test) y dependencias
```

---

## Configuración, Ejecución y Pruebas

### 1. Variables de entorno e instalación
```bash
cp .env.example .env
npm install
```

### 2. Ejecutar pruebas con Mocks (`node:test`)
```bash
npm test
```

### 3. Iniciar servidor en modo desarrollo
```bash
npm run dev
```

---

## Referencia de Endpoints

**Base URL:** `/api/v1`

| Recurso | Método | Endpoint | Descripción |
| :--- | :--- | :--- | :--- |
| **Partidas** | **GET** | `/matches` | Lista las partidas competitivas verificadas |
| **Partidas** | **GET** | `/matches/:id` | Obtiene las estadísticas de una partida por su ID |
| **Partidas** | **POST** | `/matches` | Verifica al jugador en Anticheat, calcula su `kdRatio` y guarda la partida |

---

## Pruebas Manuales con cURL

```bash
# 1. Listar partidas competitivas
curl -X GET http://localhost:3000/api/v1/matches

# 2. Registrar partida de un jugador legítimo (Calcula K/D Ratio y aprueba Anticheat)
curl -X POST http://localhost:3000/api/v1/matches \
  -H "Content-Type: application/json" \
  -d '{
    "playerTag": "TenZ#NA1",
    "mapName": "Ascent",
    "kills": 30,
    "deaths": 10,
    "headshotPercentage": 38
  }'

# 3. Probar bloqueo 403 Forbidden con un jugador marcado en la lista negra de Anticheat
curl -X POST http://localhost:3000/api/v1/matches \
  -H "Content-Type: application/json" \
  -d '{
    "playerTag": "aimbot_user#999",
    "mapName": "Mirage",
    "kills": 45,
    "deaths": 1,
    "headshotPercentage": 99
  }'
```
