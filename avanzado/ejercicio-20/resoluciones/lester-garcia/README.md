# API Comisiones de Dibujo Digital — Idempotencia con Idempotency-Key

Solución backend profesional en **Node.js** y **Express** para el **Ejercicio Avanzado 20** enfocada en **idempotencia** bajo la temática de **dibujo digital**.

---

## Enfoque Técnico

Almacén de llaves de idempotencia (Idempotency-Key) que garantiza que reintentos de red al pagar una comisión de arte digital devuelvan exactamente el mismo resultado sin duplicar cobros.

---

## Estructura del Proyecto

```text
avanzado/ejercicio-20/resoluciones/lester-garcia/
├── package.json
├── README.md
├── .env.example
├── .gitignore
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   ├── index.routes.js
    │   └── commissions.routes.js
    ├── controllers/
    │   └── commissions.controller.js
    ├── services/
    │   └── commissions.service.js
    ├── repositories/
    │   └── commissions.inMemory.repository.js
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
curl -i http://localhost:3000/avanzado/ejercicio-20
```

### 2. Listar recursos (`GET /api/v1/commissions`)
```bash
curl -i http://localhost:3000/api/v1/commissions
```

### 3. Consultar por ID (`GET /api/v1/commissions/:id`)
```bash
curl -i http://localhost:3000/api/v1/commissions/COM-01
```
