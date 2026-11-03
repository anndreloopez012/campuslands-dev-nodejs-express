# API Reservas de Viajes y Turismo — Rotación Conceptual de Refresh Tokens

Solución backend profesional en **Node.js** y **Express** para el **Ejercicio Avanzado 17** enfocada en **refresh tokens conceptual** bajo la temática de **viajes y turismo**.

---

## Enfoque Técnico

Flujo conceptual de emisión y rotación de Refresh Tokens con invalidación del token anterior para proteger sesiones de agencias de viajes.

---

## Estructura del Proyecto

```text
avanzado/ejercicio-17/resoluciones/lester-garcia/
├── package.json
├── README.md
├── .env.example
├── .gitignore
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   ├── index.routes.js
    │   └── sessions.routes.js
    ├── controllers/
    │   └── sessions.controller.js
    ├── services/
    │   └── sessions.service.js
    ├── repositories/
    │   └── sessions.inMemory.repository.js
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
curl -i http://localhost:3000/avanzado/ejercicio-17
```

### 2. Listar recursos (`GET /api/v1/sessions`)
```bash
curl -i http://localhost:3000/api/v1/sessions
```

### 3. Consultar por ID (`GET /api/v1/sessions/:id`)
```bash
curl -i http://localhost:3000/api/v1/sessions/SES-01
```
