# API Estudio de Tatuajes — Bitácora Inmutable de Auditoría de Acciones

Solución backend profesional en **Node.js** y **Express** para el **Ejercicio Avanzado 19** enfocada en **auditoria de acciones** bajo la temática de **tatuajes**.

---

## Enfoque Técnico

Registro automático e inmutable de auditoría (quién, qué acción, estado previo/nuevo y marca de tiempo) para trazabilidad sanitaria de citas de tatuaje.

---

## Estructura del Proyecto

```text
avanzado/ejercicio-19/resoluciones/lester-garcia/
├── package.json
├── README.md
├── .env.example
├── .gitignore
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   ├── index.routes.js
    │   └── appointments.routes.js
    ├── controllers/
    │   └── appointments.controller.js
    ├── services/
    │   └── appointments.service.js
    ├── repositories/
    │   └── appointments.inMemory.repository.js
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
curl -i http://localhost:3000/avanzado/ejercicio-19
```

### 2. Listar recursos (`GET /api/v1/appointments`)
```bash
curl -i http://localhost:3000/api/v1/appointments
```

### 3. Consultar por ID (`GET /api/v1/appointments/:id`)
```bash
curl -i http://localhost:3000/api/v1/appointments/TAT-01
```
