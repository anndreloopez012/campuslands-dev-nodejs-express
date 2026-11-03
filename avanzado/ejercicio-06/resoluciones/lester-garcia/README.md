# API Banco Dinamométrico de Motos — Colas de Tareas Conceptuales en Memoria

Solución backend profesional en **Node.js** y **Express** para el **Ejercicio Avanzado 06** enfocada en **colas de tareas conceptuales** bajo la temática de **motos y mecanica**.

---

## Enfoque Técnico

Cola FIFO asíncrona en memoria que encola diagnósticos de telemetría mecánica en estado PENDING y los procesa en segundo plano sin bloquear el request HTTP.

---

## Estructura del Proyecto

```text
avanzado/ejercicio-06/resoluciones/lester-garcia/
├── package.json
├── README.md
├── .env.example
├── .gitignore
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   ├── index.routes.js
    │   └── jobs.routes.js
    ├── controllers/
    │   └── jobs.controller.js
    ├── services/
    │   └── jobs.service.js
    ├── repositories/
    │   └── jobs.inMemory.repository.js
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
curl -i http://localhost:3000/avanzado/ejercicio-06
```

### 2. Listar recursos (`GET /api/v1/jobs`)
```bash
curl -i http://localhost:3000/api/v1/jobs
```

### 3. Consultar por ID (`GET /api/v1/jobs/:id`)
```bash
curl -i http://localhost:3000/api/v1/jobs/JOB-01
```
