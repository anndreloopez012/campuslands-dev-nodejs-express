# API Drops de Ropa y Sneakers — Sanitización de Entrada contra XSS e Inyección

Solución backend profesional en **Node.js** y **Express** para el **Ejercicio Avanzado 16** enfocada en **sanitizacion de entrada** bajo la temática de **ropa y sneakers**.

---

## Enfoque Técnico

Limpieza profunda de strings de entrada eliminando etiquetas HTML/scripts maliciosos (<script>), espacios redundantes y claves peligrosas (__proto__).

---

## Estructura del Proyecto

```text
avanzado/ejercicio-16/resoluciones/lester-garcia/
├── package.json
├── README.md
├── .env.example
├── .gitignore
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   ├── index.routes.js
    │   └── sneakers.routes.js
    ├── controllers/
    │   └── sneakers.controller.js
    ├── services/
    │   └── sneakers.service.js
    ├── repositories/
    │   └── sneakers.inMemory.repository.js
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
curl -i http://localhost:3000/avanzado/ejercicio-16
```

### 2. Listar recursos (`GET /api/v1/sneakers`)
```bash
curl -i http://localhost:3000/api/v1/sneakers
```

### 3. Consultar por ID (`GET /api/v1/sneakers/:id`)
```bash
curl -i http://localhost:3000/api/v1/sneakers/SNK-01
```
