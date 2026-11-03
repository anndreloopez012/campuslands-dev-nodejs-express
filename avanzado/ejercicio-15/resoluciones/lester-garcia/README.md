# API Food Trucks Comida Urbana — Endurecimiento y Seguridad de Headers HTTP

Solución backend profesional en **Node.js** y **Express** para el **Ejercicio Avanzado 15** enfocada en **seguridad de headers** bajo la temática de **comida urbana**.

---

## Enfoque Técnico

Política de cabeceras de seguridad HTTP (X-Content-Type-Options: nosniff, X-Frame-Options: DENY, Content-Security-Policy, Referrer-Policy) aplicada a toda la API.

---

## Estructura del Proyecto

```text
avanzado/ejercicio-15/resoluciones/lester-garcia/
├── package.json
├── README.md
├── .env.example
├── .gitignore
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   ├── index.routes.js
    │   └── street-orders.routes.js
    ├── controllers/
    │   └── street-orders.controller.js
    ├── services/
    │   └── street-orders.service.js
    ├── repositories/
    │   └── street-orders.inMemory.repository.js
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
curl -i http://localhost:3000/avanzado/ejercicio-15
```

### 2. Listar recursos (`GET /api/v1/street-orders`)
```bash
curl -i http://localhost:3000/api/v1/street-orders
```

### 3. Consultar por ID (`GET /api/v1/street-orders/:id`)
```bash
curl -i http://localhost:3000/api/v1/street-orders/ORD-01
```
