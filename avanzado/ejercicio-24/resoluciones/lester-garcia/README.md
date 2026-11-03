# API Laboratorio de Fórmulas Químicas — Especificación OpenAPI 3.0 Manual

Solución backend profesional en **Node.js** y **Express** para el **Ejercicio Avanzado 24** enfocada en **documentacion OpenAPI manual** bajo la temática de **formulas quimicas**.

---

## Enfoque Técnico

Construcción manual de un contrato OpenAPI 3.0.3 completo servido dinámicamente junto con los endpoints del catálogo de compuestos químicos.

---

## Estructura del Proyecto

```text
avanzado/ejercicio-24/resoluciones/lester-garcia/
├── package.json
├── README.md
├── .env.example
├── .gitignore
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   ├── index.routes.js
    │   └── compounds.routes.js
    ├── controllers/
    │   └── compounds.controller.js
    ├── services/
    │   └── compounds.service.js
    ├── repositories/
    │   └── compounds.inMemory.repository.js
    ├── middlewares/
    │   └── errorHandler.middleware.js
    └── utils/
        ├── asyncHandler.js
        └── customErrors.js
```

---

## Ejecución Rápida

```bash
cp .env.example .env
npm install
npm run dev
```

---

## Pruebas con `curl`

### 1. Endpoint de validación del ejercicio
```bash
curl -i http://localhost:3000/avanzado/ejercicio-24
```

### 2. Listar recursos (`GET /api/v1/compounds`)
```bash
curl -i http://localhost:3000/api/v1/compounds
```

### 3. Consultar por ID (`GET /api/v1/compounds/:id`)
```bash
curl -i http://localhost:3000/api/v1/compounds/CHM-01
```
