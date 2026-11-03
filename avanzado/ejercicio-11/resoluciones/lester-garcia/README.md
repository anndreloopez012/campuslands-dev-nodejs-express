# API Catálogo Musical — Importación Masiva (Bulk Import) con Reporte Parcial

Solución backend profesional en **Node.js** y **Express** para el **Ejercicio Avanzado 11** enfocada en **importacion masiva** bajo la temática de **musica**.

---

## Enfoque Técnico

Procesador de importación masiva (batch) que valida múltiples pistas musicales, evita duplicados por código ISRC y reporta insertados vs rechazados.

---

## Estructura del Proyecto

```text
avanzado/ejercicio-11/resoluciones/lester-garcia/
├── package.json
├── README.md
├── .env.example
├── .gitignore
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   ├── index.routes.js
    │   └── tracks.routes.js
    ├── controllers/
    │   └── tracks.controller.js
    ├── services/
    │   └── tracks.service.js
    ├── repositories/
    │   └── tracks.inMemory.repository.js
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
curl -i http://localhost:3000/avanzado/ejercicio-11
```

### 2. Listar recursos (`GET /api/v1/tracks`)
```bash
curl -i http://localhost:3000/api/v1/tracks
```

### 3. Consultar por ID (`GET /api/v1/tracks/:id`)
```bash
curl -i http://localhost:3000/api/v1/tracks/TRK-01
```
