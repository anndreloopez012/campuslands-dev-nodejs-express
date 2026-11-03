# API Armería Shooters Competitivos — Fixtures Deterministas y Factories Dinámicos

Solución backend profesional en **Node.js** y **Express** para el **Ejercicio Avanzado 26** enfocada en **fixtures y factories** bajo la temática de **shooters competitivos**.

---

## Enfoque Técnico

Implementación de Factories parametrizables (buildLoadoutFactory) y Fixtures estáticos para poblar entornos de pruebas y desarrollo en shooters tácticos.

---

## Estructura del Proyecto

```text
avanzado/ejercicio-26/resoluciones/lester-garcia/
├── package.json
├── README.md
├── .env.example
├── .gitignore
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   ├── index.routes.js
    │   └── loadouts.routes.js
    ├── controllers/
    │   └── loadouts.controller.js
    ├── services/
    │   └── loadouts.service.js
    ├── repositories/
    │   └── loadouts.inMemory.repository.js
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
curl -i http://localhost:3000/avanzado/ejercicio-26
```

### 2. Listar recursos (`GET /api/v1/loadouts`)
```bash
curl -i http://localhost:3000/api/v1/loadouts
```

### 3. Consultar por ID (`GET /api/v1/loadouts/:id`)
```bash
curl -i http://localhost:3000/api/v1/loadouts/LDT-01
```
