# API Telemetría de Hiperdeportivos — Arquitectura Orientada a Eventos (EventEmitter)

Solución backend profesional en **Node.js** y **Express** para el **Ejercicio Avanzado 08** enfocada en **event emitter** bajo la temática de **hiperdeportivos**.

---

## Enfoque Técnico

Uso de EventEmitter nativo de Node.js para emitir eventos de récord de velocidad ('hypercar:speed-record') y activar alerones activos de forma desacoplada.

---

## Estructura del Proyecto

```text
avanzado/ejercicio-08/resoluciones/lester-garcia/
├── package.json
├── README.md
├── .env.example
├── .gitignore
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   ├── index.routes.js
    │   └── telemetry.routes.js
    ├── controllers/
    │   └── telemetry.controller.js
    ├── services/
    │   └── telemetry.service.js
    ├── repositories/
    │   └── telemetry.inMemory.repository.js
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
curl -i http://localhost:3000/avanzado/ejercicio-08
```

### 2. Listar recursos (`GET /api/v1/telemetry`)
```bash
curl -i http://localhost:3000/api/v1/telemetry
```

### 3. Consultar por ID (`GET /api/v1/telemetry/:id`)
```bash
curl -i http://localhost:3000/api/v1/telemetry/TEL-01
```
