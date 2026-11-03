# API Mercado de Fichajes Fútbol y Futsal — Transacciones Simuladas con Rollback

Solución backend profesional en **Node.js** y **Express** para el **Ejercicio Avanzado 05** enfocada en **transacciones simuladas** bajo la temática de **futbol y futbol sala**.

---

## Enfoque Técnico

Simulación de unidad de trabajo atómica (Unit of Work) con snapshot en memoria y rollback automático si el presupuesto del club comprador es insuficiente.

---

## Estructura del Proyecto

```text
avanzado/ejercicio-05/resoluciones/lester-garcia/
├── package.json
├── README.md
├── .env.example
├── .gitignore
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   ├── index.routes.js
    │   └── transfers.routes.js
    ├── controllers/
    │   └── transfers.controller.js
    ├── services/
    │   └── transfers.service.js
    ├── repositories/
    │   └── transfers.inMemory.repository.js
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
curl -i http://localhost:3000/avanzado/ejercicio-05
```

### 2. Listar recursos (`GET /api/v1/transfers`)
```bash
curl -i http://localhost:3000/api/v1/transfers
```

### 3. Consultar por ID (`GET /api/v1/transfers/:id`)
```bash
curl -i http://localhost:3000/api/v1/transfers/TRF-01
```
