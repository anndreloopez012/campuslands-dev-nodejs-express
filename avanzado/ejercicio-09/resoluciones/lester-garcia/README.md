# API Combates de Kickboxing — Procesamiento con Streams Básicos (Readable)

Solución backend profesional en **Node.js** y **Express** para el **Ejercicio Avanzado 09** enfocada en **streams basicos** bajo la temática de **kickboxing**.

---

## Enfoque Técnico

Generación y lectura por chunks mediante Readable.from() de Node.js para transmitir bitácoras de golpes de kickboxing sin saturar el buffer de memoria.

---

## Estructura del Proyecto

```text
avanzado/ejercicio-09/resoluciones/lester-garcia/
├── package.json
├── README.md
├── .env.example
├── .gitignore
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   ├── index.routes.js
    │   └── fights.routes.js
    ├── controllers/
    │   └── fights.controller.js
    ├── services/
    │   └── fights.service.js
    ├── repositories/
    │   └── fights.inMemory.repository.js
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
curl -i http://localhost:3000/avanzado/ejercicio-09
```

### 2. Listar recursos (`GET /api/v1/fights`)
```bash
curl -i http://localhost:3000/api/v1/fights
```

### 3. Consultar por ID (`GET /api/v1/fights/:id`)
```bash
curl -i http://localhost:3000/api/v1/fights/FGT-01
```
