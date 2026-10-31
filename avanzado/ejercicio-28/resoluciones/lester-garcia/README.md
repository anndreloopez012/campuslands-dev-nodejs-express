# API Matchmaking Battle Royale — Separación Estricta entre App y Server HTTP

Solución backend profesional en **Node.js** y **Express** para el **Ejercicio Avanzado 28** enfocada en **separacion app server** bajo la temática de **battle royale**.

---

## Enfoque Técnico

Desacoplamiento total entre la definición de la aplicación Express (app.js exportable sin efectos secundarios de red) y el ciclo de vida del servidor HTTP (server.js con apagado controlado).

---

## Estructura del Proyecto

```text
avanzado/ejercicio-28/resoluciones/lester-garcia/
├── package.json
├── README.md
├── .env.example
├── .gitignore
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   ├── index.routes.js
    │   └── arenas.routes.js
    ├── controllers/
    │   └── arenas.controller.js
    ├── services/
    │   └── arenas.service.js
    ├── repositories/
    │   └── arenas.inMemory.repository.js
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
curl -i http://localhost:3000/avanzado/ejercicio-28
```

### 2. Listar recursos (`GET /api/v1/arenas`)
```bash
curl -i http://localhost:3000/api/v1/arenas
```

### 3. Consultar por ID (`GET /api/v1/arenas/:id`)
```bash
curl -i http://localhost:3000/api/v1/arenas/ARN-01
```
