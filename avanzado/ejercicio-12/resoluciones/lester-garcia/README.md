# API Archivo de Películas de Terror — Exportación JSON Descargable con Metadatos

Solución backend profesional en **Node.js** y **Express** para el **Ejercicio Avanzado 12** enfocada en **exportacion JSON** bajo la temática de **peliculas de miedo**.

---

## Enfoque Técnico

Generación de paquetes de exportación JSON estructurados con metadatos de integridad, filtros por subgénero y soporte de descarga limpia.

---

## Estructura del Proyecto

```text
avanzado/ejercicio-12/resoluciones/lester-garcia/
├── package.json
├── README.md
├── .env.example
├── .gitignore
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   ├── index.routes.js
    │   └── horror-movies.routes.js
    ├── controllers/
    │   └── horror-movies.controller.js
    ├── services/
    │   └── horror-movies.service.js
    ├── repositories/
    │   └── horror-movies.inMemory.repository.js
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
curl -i http://localhost:3000/avanzado/ejercicio-12
```

### 2. Listar recursos (`GET /api/v1/horror-movies`)
```bash
curl -i http://localhost:3000/api/v1/horror-movies
```

### 3. Consultar por ID (`GET /api/v1/horror-movies/:id`)
```bash
curl -i http://localhost:3000/api/v1/horror-movies/HOR-01
```
