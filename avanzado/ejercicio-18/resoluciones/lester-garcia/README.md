# API Centro de Paracaidismo — Control de Acceso Multirol Avanzado (RBAC)

Solución backend profesional en **Node.js** y **Express** para el **Ejercicio Avanzado 18** enfocada en **multirol avanzado** bajo la temática de **paracaidismo**.

---

## Enfoque Técnico

Matriz de permisos jerárquica multirol (STUDENT, INSTRUCTOR, SAFETY_DIRECTOR) que valida qué tipo de salto de paracaidismo puede autorizar cada rol.

---

## Estructura del Proyecto

```text
avanzado/ejercicio-18/resoluciones/lester-garcia/
├── package.json
├── README.md
├── .env.example
├── .gitignore
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   ├── index.routes.js
    │   └── jumps.routes.js
    ├── controllers/
    │   └── jumps.controller.js
    ├── services/
    │   └── jumps.service.js
    ├── repositories/
    │   └── jumps.inMemory.repository.js
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
curl -i http://localhost:3000/avanzado/ejercicio-18
```

### 2. Listar recursos (`GET /api/v1/jumps`)
```bash
curl -i http://localhost:3000/api/v1/jumps
```

### 3. Consultar por ID (`GET /api/v1/jumps/:id`)
```bash
curl -i http://localhost:3000/api/v1/jumps/JMP-01
```
