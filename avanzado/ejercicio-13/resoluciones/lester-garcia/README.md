# API Flota Interestelar Ciencia Ficción — Observabilidad y Logs Estructurados

Solución backend profesional en **Node.js** y **Express** para el **Ejercicio Avanzado 13** enfocada en **observabilidad y logs** bajo la temática de **ciencia ficcion**.

---

## Enfoque Técnico

Registro estructurado JSON con trazabilidad de operaciones interestelares, nivel de severidad, marca de tiempo ISO y bitácora consultable en memoria.

---

## Estructura del Proyecto

```text
avanzado/ejercicio-13/resoluciones/lester-garcia/
├── package.json
├── README.md
├── .env.example
├── .gitignore
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   ├── index.routes.js
    │   └── missions.routes.js
    ├── controllers/
    │   └── missions.controller.js
    ├── services/
    │   └── missions.service.js
    ├── repositories/
    │   └── missions.inMemory.repository.js
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
curl -i http://localhost:3000/avanzado/ejercicio-13
```

### 2. Listar recursos (`GET /api/v1/missions`)
```bash
curl -i http://localhost:3000/api/v1/missions
```

### 3. Consultar por ID (`GET /api/v1/missions/:id`)
```bash
curl -i http://localhost:3000/api/v1/missions/MSN-01
```
