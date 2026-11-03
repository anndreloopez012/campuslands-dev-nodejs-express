# API Laboratorio de Fórmulas Químicas — Testing de Servicios (Service Layer Testing)

Este repositorio implementa una arquitectura enfocada en **Pruebas Unitarias de la Capa de Servicios (`src/services/formulas.service.js`)** utilizando **Node.js (`node:test`)** y **Express** sobre la temática de **fórmulas químicas, cálculo de molaridad estequiométrica (`mol/L`) y clasificación en la escala de pH**.

---

## Fundamentos de Testing de Servicios

La capa de servicios concentra las reglas de negocio puras y las invariantes del dominio. Probarla directamente sin levantar un servidor HTTP aporta:

1. **Velocidad y Determinismo**:
   Los tests invocan directamente `createFormulaService`, `getFormulaByIdService`, `calculateMolarity` y `classifyPhLevel`, ejecutándose en pocos milisegundos.
2. **Aislamiento de Estado (`beforeEach`)**:
   Antes de cada caso de prueba se restablece el almacén en memoria (`resetFormulasStore`) para garantizar que un test no contamine el resultado del siguiente.
3. **Verificación de Excepciones Asíncronas (`assert.rejects`)**:
   Permite comprobar que las promesas de la capa de negocio rechacen exactamente con `ConflictError` (`409`) ante fórmulas duplicadas o `NotFoundError` (`404`) ante identificadores inexistentes.

---

## Estructura de Directorios

```text
src/
├── app.js                                       # Configuración global de Express y rutas
├── server.js                                    # Arranque del servidor HTTP
├── routes/
│   ├── index.routes.js                          # Montaje centralizado
│   └── formulas.routes.js                       # Endpoints de fórmulas químicas
├── controllers/
│   └── formulas.controller.js                   # Controladores HTTP limpios
├── services/
│   └── formulas.service.js                      # Lógica estequiométrica (molaridad, pH y unicidad)
├── repositories/
│   └── formulas.inMemory.repository.js          # Persistencia en memoria con resetFormulasStore para tests
├── middlewares/
│   ├── requestId.middleware.js                  # Trazabilidad con UUID v4
│   ├── logger.middleware.js                     # Logger transversal
│   ├── errorHandler.middleware.js               # Captura centralizada de errores
│   └── validators/
│       ├── validate.middleware.js               # Envoltorio de validación
│       └── formula.validator.js                 # Validación de masa molar, gramos, litros y pH
└── utils/
    ├── asyncHandler.js                          # Envoltorio asíncrono
    └── customErrors.js                          # ConflictError, NotFoundError, BadRequestError
tests/
└── formulas.service.test.js                     # Pruebas unitarias exhaustivas del servicio
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

### 2. Ejecutar pruebas de la capa de servicios
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
| **Fórmulas** | **GET** | `/formulas` | Lista todas las fórmulas químicas con su molaridad y acidez |
| **Fórmulas** | **GET** | `/formulas/:id` | Consulta una fórmula química específica por ID |
| **Fórmulas** | **POST** | `/formulas` | Registra una nueva fórmula calculando `molarityMolL` y `acidityCategory` |

---

## Pruebas Manuales con cURL

```bash
# 1. Listar catálogo de fórmulas químicas
curl -X GET http://localhost:3000/api/v1/formulas

# 2. Registrar una disolución de Ácido Clorhídrico (HCl)
curl -X POST http://localhost:3000/api/v1/formulas \
  -H "Content-Type: application/json" \
  -d '{
    "commonName": "Ácido Clorhídrico",
    "molecularFormula": "HCl",
    "molarMassGmol": 36.46,
    "phLevel": 1.1,
    "soluteGrams": 72.92,
    "solutionVolumeLiters": 2
  }'

# 3. Probar error 409 Conflict intentando duplicar H2SO4
curl -X POST http://localhost:3000/api/v1/formulas \
  -H "Content-Type: application/json" \
  -d '{
    "commonName": "Ácido Sulfúrico",
    "molecularFormula": "H2SO4",
    "molarMassGmol": 98.079,
    "phLevel": 1.2,
    "soluteGrams": 98.079,
    "solutionVolumeLiters": 1
  }'
```
