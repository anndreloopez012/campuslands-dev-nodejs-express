# API Servidores de Torneo MOBA Esports — Manejo de Configuración Avanzada e Inmutable

Solución backend profesional en **Node.js** y **Express** para el **Ejercicio Avanzado 27** enfocada en **manejo de configuracion avanzada** bajo la temática de **MOBA esports**.

---

## Enfoque Técnico

Cargador de configuración multi-entorno validado al arranque, con coerción de tipos booleanos/numéricos, feature flags y congelamiento profundo (deepFreeze).

---

## Estructura del Proyecto

```text
avanzado/ejercicio-27/resoluciones/lester-garcia/
├── package.json
├── README.md
├── .env.example
├── .gitignore
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   ├── index.routes.js
    │   └── tournament-configs.routes.js
    ├── controllers/
    │   └── tournament-configs.controller.js
    ├── services/
    │   └── tournament-configs.service.js
    ├── repositories/
    │   └── tournament-configs.inMemory.repository.js
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
curl -i http://localhost:3000/avanzado/ejercicio-27
```

### 2. Listar recursos (`GET /api/v1/tournament-configs`)
```bash
curl -i http://localhost:3000/api/v1/tournament-configs
```

### 3. Consultar por ID (`GET /api/v1/tournament-configs/:id`)
```bash
curl -i http://localhost:3000/api/v1/tournament-configs/CFG-01
```
