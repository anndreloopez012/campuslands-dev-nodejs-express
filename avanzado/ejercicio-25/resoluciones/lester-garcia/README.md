# API Calabozos y Raids RPG — Testing de Integración HTTP End-to-End

Solución backend profesional en **Node.js** y **Express** para el **Ejercicio Avanzado 25** enfocada en **testing de integracion** bajo la temática de **videojuegos RPG**.

---

## Enfoque Técnico

Arquitectura preparada para pruebas de integración HTTP reales levantando la aplicación Express en un puerto efímero y verificando códigos de estado y contratos JSON.

---

## Estructura del Proyecto

```text
avanzado/ejercicio-25/resoluciones/lester-garcia/
├── package.json
├── README.md
├── .env.example
├── .gitignore
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   ├── index.routes.js
    │   └── raids.routes.js
    ├── controllers/
    │   └── raids.controller.js
    ├── services/
    │   └── raids.service.js
    ├── repositories/
    │   └── raids.inMemory.repository.js
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
curl -i http://localhost:3000/avanzado/ejercicio-25
```

### 2. Listar recursos (`GET /api/v1/raids`)
```bash
curl -i http://localhost:3000/api/v1/raids
```

### 3. Consultar por ID (`GET /api/v1/raids/:id`)
```bash
curl -i http://localhost:3000/api/v1/raids/RAID-01
```
