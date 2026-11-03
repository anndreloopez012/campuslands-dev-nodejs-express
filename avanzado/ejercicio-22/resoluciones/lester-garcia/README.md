# API Modelado BIM Arquitectura 3D — Despachador de Webhooks Simulados con Firma HMAC

Solución backend profesional en **Node.js** y **Express** para el **Ejercicio Avanzado 22** enfocada en **webhooks simulados** bajo la temática de **arquitectura 3D**.

---

## Enfoque Técnico

Simulador de entrega de Webhooks salientes firmados criptográficamente con HMAC-SHA256 cada vez que se aprueba un plano arquitectónico 3D.

---

## Estructura del Proyecto

```text
avanzado/ejercicio-22/resoluciones/lester-garcia/
├── package.json
├── README.md
├── .env.example
├── .gitignore
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   ├── index.routes.js
    │   └── blueprints.routes.js
    ├── controllers/
    │   └── blueprints.controller.js
    ├── services/
    │   └── blueprints.service.js
    ├── repositories/
    │   └── blueprints.inMemory.repository.js
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
curl -i http://localhost:3000/avanzado/ejercicio-22
```

### 2. Listar recursos (`GET /api/v1/blueprints`)
```bash
curl -i http://localhost:3000/api/v1/blueprints
```

### 3. Consultar por ID (`GET /api/v1/blueprints/:id`)
```bash
curl -i http://localhost:3000/api/v1/blueprints/BIM-01
```
