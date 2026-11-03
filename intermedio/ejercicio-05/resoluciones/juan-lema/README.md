# Ejercicio 05 - repositorios en memoria (Juan Lema)

## Que hace

Tematica futbol y futbol sala. `repositories/teams.repository.js` es el unico que toca el arreglo en memoria (`findAll`, `findById`, `insert`). `teams.service.js` valida y aplica reglas de negocio usando el repositorio, sin acceder nunca al arreglo directamente. `teams.controller.js` solo traduce req/res.

## Como ejecutar

```bash
npm install
npm start
```

## Como probar

```bash
curl http://localhost:4005/teams
curl http://localhost:4005/teams/1
curl -X POST http://localhost:4005/teams -H "Content-Type: application/json" -d "{\"name\":\"Panteras FS\",\"modality\":\"futbol sala\",\"points\":15}"
```

## Como probar los casos de error

```bash
curl http://localhost:4005/teams/99
curl http://localhost:4005/teams/abc
curl -X POST http://localhost:4005/teams -H "Content-Type: application/json" -d "{\"name\":\"Sin modalidad\"}"
```

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/teams.routes.js
├── controllers/teams.controller.js
├── services/teams.service.js
└── repositories/teams.repository.js
```
