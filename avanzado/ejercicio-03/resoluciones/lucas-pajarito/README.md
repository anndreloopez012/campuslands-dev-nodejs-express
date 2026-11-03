# Avanzado 03 - validacion con schemas (Lucas Pajarito)

## Que hace

Tematica **MOBA esports**. Implementa un motor declarativo de validacion por schemas (`src/schemas/validator.js`) y un middleware reutilizable `validateBody(schema)` que valida tipos, rangos y enums antes de llegar al controlador, respondiendo `422 Unprocessable Entity` con el listado completo de errores por campo.

## Como ejecutar

```bash
npm install
npm start
```

## Como probar

```bash
curl http://localhost:4003/registrations
curl -X POST http://localhost:4003/registrations -H "Content-Type: application/json" -d "{\"teamName\":\"T1 Esports\",\"region\":\"KR\",\"averageMmr\":6500,\"captainRole\":\"Mid\"}"
```

## Como probar el caso de error

```bash
curl -X POST http://localhost:4003/registrations -H "Content-Type: application/json" -d "{\"teamName\":\"A\",\"region\":\"MARS\",\"averageMmr\":500,\"captainRole\":\"Coach\"}"
```

Responde `422` con todos los errores detectados por el schema.

## Estructura

```text
src/
├── app.js
├── server.js
├── schemas/
│   ├── validator.js
│   └── registration.schema.js
├── routes/
│   └── registrations.routes.js
├── controllers/
│   └── registrations.controller.js
└── services/
    └── registrations.service.js
```
