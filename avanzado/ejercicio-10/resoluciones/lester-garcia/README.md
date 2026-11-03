# API Ranking de Pingpong — Lectura y Parseo Estructurado de CSV

Solución backend profesional en **Node.js** y **Express** para el **Ejercicio Avanzado 10** enfocada en **lectura de CSV** bajo la temática de **pingpong**.

---

## Enfoque Técnico

Motor de lectura y parseo de texto CSV línea por línea para importar marcadores de tenis de mesa (pingpong) y convertirlos en objetos validados.

---

## Estructura del Proyecto

```text
avanzado/ejercicio-10/resoluciones/lester-garcia/
├── package.json
├── README.md
├── .env.example
├── .gitignore
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   ├── index.routes.js
    │   └── matches-csv.routes.js
    ├── controllers/
    │   └── matches-csv.controller.js
    ├── services/
    │   └── matches-csv.service.js
    ├── repositories/
    │   └── matches-csv.inMemory.repository.js
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
curl -i http://localhost:3000/avanzado/ejercicio-10
```

### 2. Listar recursos (`GET /api/v1/matches-csv`)
```bash
curl -i http://localhost:3000/api/v1/matches-csv
```

### 3. Consultar por ID (`GET /api/v1/matches-csv/:id`)
```bash
curl -i http://localhost:3000/api/v1/matches-csv/PPG-01
```
