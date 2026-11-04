# API Liga Profesional Fútbol y Futsal — Preparación para Despliegue (Deploy Readiness)

Solución backend profesional en **Node.js** y **Express** para el **Ejercicio Avanzado 29** enfocada en **deploy readiness** bajo la temática de **futbol y futbol sala**.

---

## Enfoque Técnico

Sondas de producción Liveness (/health/live) y Readiness (/health/ready), verificación de dependencias de memoria y metadatos de versión listos para contenedores y balanceadores.

---

## Estructura del Proyecto

```text
avanzado/ejercicio-29/resoluciones/lester-garcia/
├── package.json
├── README.md
├── .env.example
├── .gitignore
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   ├── index.routes.js
    │   └── matches.routes.js
    ├── controllers/
    │   └── matches.controller.js
    ├── services/
    │   └── matches.service.js
    ├── repositories/
    │   └── matches.inMemory.repository.js
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
curl -i http://localhost:3000/avanzado/ejercicio-29
```

### 2. Listar recursos (`GET /api/v1/matches`)
```bash
curl -i http://localhost:3000/api/v1/matches
```

### 3. Consultar por ID (`GET /api/v1/matches/:id`)
```bash
curl -i http://localhost:3000/api/v1/matches/MTC-01
```
