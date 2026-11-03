# Avanzado 04 - errores de dominio (Lucas Pajarito)

## Que hace

Tematica **battle royale**. Desacopla los errores de negocio del protocolo HTTP mediante una jerarquia de **errores de dominio** (`DomainError`, `SquadNotFoundError`, `SquadFullError`, `InvalidDropZoneError`) en `src/domain/errors.js`. El middleware `domain-error-handler.js` traduce cada clase de dominio al codigo HTTP y formato JSON correspondiente.

## Como ejecutar

```bash
npm install
npm start
```

## Como probar

```bash
curl http://localhost:4004/squads
curl -X POST http://localhost:4004/squads/1/deploy -H "Content-Type: application/json" -d "{\"player\":\"Lucas\",\"dropZone\":\"Miramar\"}"
```

## Como probar los casos de error de dominio

Escuadron inexistente (`404 SQUAD_NOT_FOUND`):

```bash
curl -X POST http://localhost:4004/squads/99/deploy -H "Content-Type: application/json" -d "{\"player\":\"Lucas\",\"dropZone\":\"Miramar\"}"
```

Zona de salto invalida (`422 INVALID_DROP_ZONE`):

```bash
curl -X POST http://localhost:4004/squads/1/deploy -H "Content-Type: application/json" -d "{\"player\":\"Lucas\",\"dropZone\":\"VolcanActivo\"}"
```

## Estructura

```text
src/
├── app.js
├── server.js
├── domain/
│   └── errors.js
├── middlewares/
│   └── domain-error-handler.js
├── routes/
│   └── squads.routes.js
├── controllers/
│   └── squads.controller.js
└── services/
    └── squads.service.js
```
