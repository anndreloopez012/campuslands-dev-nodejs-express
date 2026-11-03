# API Supervivencia Battle Royale — Jerarquía de Errores de Dominio

Solución backend profesional en **Node.js** y **Express** para el **Ejercicio Avanzado 04** enfocada en **errores de dominio** bajo la temática de **battle royale**.

---

## Enfoque Técnico

Modelado de errores de dominio expresivos (StormZoneClosedError, CrateAlreadyLootedError, InvalidDropSectorError) con códigos de negocio y traducción HTTP.

---

## Estructura del Proyecto

```text
avanzado/ejercicio-04/resoluciones/lester-garcia/
├── package.json
├── README.md
├── .env.example
├── .gitignore
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   ├── index.routes.js
    │   └── drops.routes.js
    ├── controllers/
    │   └── drops.controller.js
    ├── services/
    │   └── drops.service.js
    ├── repositories/
    │   └── drops.inMemory.repository.js
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
curl -i http://localhost:3000/avanzado/ejercicio-04
```

### 2. Listar recursos (`GET /api/v1/drops`)
```bash
curl -i http://localhost:3000/api/v1/drops
```

### 3. Consultar por ID (`GET /api/v1/drops/:id`)
```bash
curl -i http://localhost:3000/api/v1/drops/DRP-01
```
