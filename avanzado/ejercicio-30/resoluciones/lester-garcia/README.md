# API Centro de Alto Rendimiento Motos y Mecánica — Proyecto Final Avanzado

Solución backend profesional en **Node.js** y **Express** para el **Ejercicio Avanzado 30** enfocada en **proyecto final avanzado** bajo la temática de **motos y mecanica**.

---

## Enfoque Técnico

Proyecto integrador avanzado que combina validación de esquemas, errores de dominio, idempotencia por llave, bitácora de auditoría, métricas operacionales y pruebas automatizadas con node:test.

---

## Estructura del Proyecto

```text
avanzado/ejercicio-30/resoluciones/lester-garcia/
├── package.json
├── README.md
├── .env.example
├── .gitignore
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   ├── index.routes.js
    │   └── dyno-orders.routes.js
    ├── controllers/
    │   └── dyno-orders.controller.js
    ├── services/
    │   └── dyno-orders.service.js
    ├── repositories/
    │   └── dyno-orders.inMemory.repository.js
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
curl -i http://localhost:3000/avanzado/ejercicio-30
```

### 2. Listar recursos (`GET /api/v1/dyno-orders`)
```bash
curl -i http://localhost:3000/api/v1/dyno-orders
```

### 3. Consultar por ID (`GET /api/v1/dyno-orders/:id`)
```bash
curl -i http://localhost:3000/api/v1/dyno-orders/DYN-01
```
