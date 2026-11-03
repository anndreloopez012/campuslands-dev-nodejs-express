# API Granja de Render Animación 3D — Concurrencia Controlada (Semáforo GPU)

Solución backend profesional en **Node.js** y **Express** para el **Ejercicio Avanzado 21** enfocada en **concurrencia controlada** bajo la temática de **animacion 3D**.

---

## Enfoque Técnico

Controlador de concurrencia (semáforo en memoria) que limita el número máximo de escenas 3D renderizándose simultáneamente en nodos GPU.

---

## Estructura del Proyecto

```text
avanzado/ejercicio-21/resoluciones/lester-garcia/
├── package.json
├── README.md
├── .env.example
├── .gitignore
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   ├── index.routes.js
    │   └── renders.routes.js
    ├── controllers/
    │   └── renders.controller.js
    ├── services/
    │   └── renders.service.js
    ├── repositories/
    │   └── renders.inMemory.repository.js
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
curl -i http://localhost:3000/avanzado/ejercicio-21
```

### 2. Listar recursos (`GET /api/v1/renders`)
```bash
curl -i http://localhost:3000/api/v1/renders
```

### 3. Consultar por ID (`GET /api/v1/renders/:id`)
```bash
curl -i http://localhost:3000/api/v1/renders/RND-01
```
