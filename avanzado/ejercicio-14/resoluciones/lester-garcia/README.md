# API Biblioteca Literaria — Recolección de Métricas Simples de Aplicación

Solución backend profesional en **Node.js** y **Express** para el **Ejercicio Avanzado 14** enfocada en **metricas simples** bajo la temática de **libros**.

---

## Enfoque Técnico

Contador de métricas operacionales en tiempo real (lecturas, escrituras, errores de validación y uso de memoria del proceso Node.js).

---

## Estructura del Proyecto

```text
avanzado/ejercicio-14/resoluciones/lester-garcia/
├── package.json
├── README.md
├── .env.example
├── .gitignore
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   ├── index.routes.js
    │   └── books.routes.js
    ├── controllers/
    │   └── books.controller.js
    ├── services/
    │   └── books.service.js
    ├── repositories/
    │   └── books.inMemory.repository.js
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
curl -i http://localhost:3000/avanzado/ejercicio-14
```

### 2. Listar recursos (`GET /api/v1/books`)
```bash
curl -i http://localhost:3000/api/v1/books
```

### 3. Consultar por ID (`GET /api/v1/books/:id`)
```bash
curl -i http://localhost:3000/api/v1/books/BOK-01
```
