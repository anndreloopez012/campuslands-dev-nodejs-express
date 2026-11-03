# API Torneos MOBA Esports — Validación Estricta con Schemas Declarativos

Solución backend profesional en **Node.js** y **Express** para el **Ejercicio Avanzado 03** enfocada en **validacion con schemas** bajo la temática de **MOBA esports**.

---

## Enfoque Técnico

Motor de validación basado en esquemas declarativos (tipos, longitudes, arreglos de picks/bans y reglas de composición MOBA) ejecutado por middleware.

---

## Estructura del Proyecto

```text
avanzado/ejercicio-03/resoluciones/lester-garcia/
├── package.json
├── README.md
├── .env.example
├── .gitignore
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   ├── index.routes.js
    │   └── drafts.routes.js
    ├── controllers/
    │   └── drafts.controller.js
    ├── services/
    │   └── drafts.service.js
    ├── repositories/
    │   └── drafts.inMemory.repository.js
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
curl -i http://localhost:3000/avanzado/ejercicio-03
```

### 2. Listar recursos (`GET /api/v1/drafts`)
```bash
curl -i http://localhost:3000/api/v1/drafts
```

### 3. Consultar por ID (`GET /api/v1/drafts/:id`)
```bash
curl -i http://localhost:3000/api/v1/drafts/DRF-01
```
