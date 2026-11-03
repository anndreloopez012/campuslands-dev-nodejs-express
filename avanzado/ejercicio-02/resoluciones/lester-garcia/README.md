# API Shooters Competitivos — Arquitectura Escalable por Capas e Inyección

Solución backend profesional en **Node.js** y **Express** para el **Ejercicio Avanzado 02** enfocada en **arquitectura escalable** bajo la temática de **shooters competitivos**.

---

## Enfoque Técnico

Desacoplamiento estricto Controlador -> Servicio (con contenedor de dependencias inyectable) -> Repositorio -> Mapper DTO para partidas competitivas.

---

## Estructura del Proyecto

```text
avanzado/ejercicio-02/resoluciones/lester-garcia/
├── package.json
├── README.md
├── .env.example
├── .gitignore
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   ├── index.routes.js
    │   └── lobbies.routes.js
    ├── controllers/
    │   └── lobbies.controller.js
    ├── services/
    │   └── lobbies.service.js
    ├── repositories/
    │   └── lobbies.inMemory.repository.js
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
curl -i http://localhost:3000/avanzado/ejercicio-02
```

### 2. Listar recursos (`GET /api/v1/lobbies`)
```bash
curl -i http://localhost:3000/api/v1/lobbies
```

### 3. Consultar por ID (`GET /api/v1/lobbies/:id`)
```bash
curl -i http://localhost:3000/api/v1/lobbies/LOB-01
```
