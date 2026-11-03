# API Catálogo de Autos de Lujo — Caché en Memoria con TTL e Invalidación

Solución backend profesional en **Node.js** y **Express** para el **Ejercicio Avanzado 07** enfocada en **cache en memoria** bajo la temática de **autos de lujo**.

---

## Enfoque Técnico

Almacén de caché en memoria con expiración TTL, métricas de hits/misses e invalidación automática al registrar un nuevo vehículo de lujo.

---

## Estructura del Proyecto

```text
avanzado/ejercicio-07/resoluciones/lester-garcia/
├── package.json
├── README.md
├── .env.example
├── .gitignore
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   ├── index.routes.js
    │   └── luxury-cars.routes.js
    ├── controllers/
    │   └── luxury-cars.controller.js
    ├── services/
    │   └── luxury-cars.service.js
    ├── repositories/
    │   └── luxury-cars.inMemory.repository.js
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
curl -i http://localhost:3000/avanzado/ejercicio-07
```

### 2. Listar recursos (`GET /api/v1/luxury-cars`)
```bash
curl -i http://localhost:3000/api/v1/luxury-cars
```

### 3. Consultar por ID (`GET /api/v1/luxury-cars/:id`)
```bash
curl -i http://localhost:3000/api/v1/luxury-cars/LUX-01
```
