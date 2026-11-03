# API Taller de Soldadura Industrial — Testing con `node:test` (Native Test Runner)

Este repositorio implementa una arquitectura backend verificada mediante el **ejecutor de pruebas nativo de Node.js (`node:test` y `node:assert/strict`)** junto con **Express** sobre la temática de **soldadura industrial (procesos TIG, MIG, SMAW, SAW), cálculo de aporte térmico (Heat Input) e inspección bajo norma AWS D1.1**.

---

## Fundamentos de Testing con `node:test`

Desde Node.js 18/20+, el runtime incorpora un motor de pruebas nativo sin requerir dependencias pesadas de terceros (como Jest o Mocha):

1. **`describe` e `it` (`node:test`)**:
   Permiten estructurar bloques jerárquicos de pruebas legibles y aislados.
2. **Aserciones Estrictas (`node:assert/strict`)**:
   - `assert.equal(actual, expected)`: Verifica igualdad estricta (`===`) en cálculos matemáticos de aporte térmico.
   - `assert.throws(fn, ErrorClass)`: Comprueba que las funciones lancen las excepciones operacionales esperadas (`BadRequestError`) ante parámetros fuera de rango.
3. **Ejecución Directa**:
   Mediante `npm test` (`node --test tests/*.test.js`), Node ejecuta todos los casos de prueba y emite un reporte TAP/Spec detallado.

---

## Estructura de Directorios

```text
src/
├── app.js                                       # Configuración global de Express y rutas
├── server.js                                    # Arranque del servidor HTTP
├── routes/
│   ├── index.routes.js                          # Montaje centralizado
│   └── welds.routes.js                          # Endpoints de inspecciones de soldadura
├── controllers/
│   └── welds.controller.js                      # Controladores HTTP limpios
├── services/
│   └── welds.service.js                         # Orquestación de cálculo térmico y persistencia
├── repositories/
│   └── welds.inMemory.repository.js             # Persistencia en memoria de cordones de soldadura
├── middlewares/
│   ├── requestId.middleware.js                  # Trazabilidad con UUID v4
│   ├── logger.middleware.js                     # Logger transversal
│   ├── errorHandler.middleware.js               # Captura centralizada de errores
│   └── validators/
│       ├── validate.middleware.js               # Envoltorio de validación
│       └── weld.validator.js                    # Validación de procesos TIG/MIG/SMAW/SAW y amperaje
└── utils/
    ├── asyncHandler.js                          # Envoltorio asíncrono
    ├── weldingCalculator.js                     # Cálculo de Heat Input (kJ/mm) y clasificación AWS D1.1
    └── customErrors.js                          # Clases de error operacionales
tests/
└── welding.test.js                              # Suite de pruebas automatizadas con node:test
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

### 2. Ejecutar la suite de pruebas con `node:test`
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
| **Soldaduras** | **GET** | `/welds` | Lista las inspecciones de cordones de soldadura |
| **Soldaduras** | **GET** | `/welds/:id` | Obtiene el detalle térmico de una soldadura por ID |
| **Soldaduras** | **POST** | `/welds` | Registra una soldadura calculando `heatInputKjMm` y dictamen AWS D1.1 |

---

## Pruebas Manuales con cURL

```bash
# 1. Listar inspecciones registradas
curl -X GET http://localhost:3000/api/v1/welds

# 2. Registrar un nuevo cordón de soldadura MIG (Calcula 1.28 kJ/mm -> Aprobado_AWS_D1_1)
curl -X POST http://localhost:3000/api/v1/welds \
  -H "Content-Type: application/json" \
  -d '{
    "welderName": "Carlos Mendoza",
    "baseMetal": "Acero Estructural ASTM A36",
    "weldingProcess": "MIG",
    "voltage": 24,
    "amperage": 200,
    "travelSpeedMmMin": 180
  }'

# 3. Probar error 400 con proceso de soldadura no válido
curl -X POST http://localhost:3000/api/v1/welds \
  -H "Content-Type: application/json" \
  -d '{
    "welderName": "Carlos Mendoza",
    "baseMetal": "Acero A36",
    "weldingProcess": "PLASMA",
    "voltage": 24,
    "amperage": 200,
    "travelSpeedMmMin": 180
  }'
```
