# API Estaciones de Soldadura Industrial — Planificador de Jobs Programados

Solución backend profesional en **Node.js** y **Express** para el **Ejercicio Avanzado 23** enfocada en **jobs programados** bajo la temática de **soldadura**.

---

## Enfoque Técnico

Planificador de tareas programadas (Scheduled Jobs) que ejecuta auditorías preventivas de presión de gas argón/CO2 en celdas de soldadura TIG/MIG.

---

## Estructura del Proyecto

```text
avanzado/ejercicio-23/resoluciones/lester-garcia/
├── package.json
├── README.md
├── .env.example
├── .gitignore
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   ├── index.routes.js
    │   └── welding-tasks.routes.js
    ├── controllers/
    │   └── welding-tasks.controller.js
    ├── services/
    │   └── welding-tasks.service.js
    ├── repositories/
    │   └── welding-tasks.inMemory.repository.js
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
curl -i http://localhost:3000/avanzado/ejercicio-23
```

### 2. Listar recursos (`GET /api/v1/welding-tasks`)
```bash
curl -i http://localhost:3000/api/v1/welding-tasks
```

### 3. Consultar por ID (`GET /api/v1/welding-tasks/:id`)
```bash
curl -i http://localhost:3000/api/v1/welding-tasks/WLD-01
```
