# Avanzado 06 - colas de tareas conceptuales (Lucas Pajarito)

## Que hace

Tematica **motos y mecanica**. Implementa una cola de tareas en memoria (`diagnostics-queue.service.js`) con patron productor-consumidor:

- `POST /diagnostics/jobs`: encola un diagnostico electronico de motocicleta y responde inmediatamente `202 Accepted` con el estado `queued` y header `Location`.
- Un worker asincrono procesa la cola FIFO cambiando el estado a `processing` y luego a `completed` (o `failed`).
- `GET /diagnostics/jobs` y `GET /diagnostics/jobs/:id`: permiten consultar el progreso y resultado del trabajo.

## Como ejecutar

```bash
npm install
npm start
```

## Como probar

```bash
curl -i -X POST http://localhost:4006/diagnostics/jobs -H "Content-Type: application/json" -d "{\"moto\":\"Yamaha MT-09\",\"system\":\"inyeccion electronica\"}"
curl http://localhost:4006/diagnostics/jobs/1
```

## Como probar el caso de error

```bash
curl -X POST http://localhost:4006/diagnostics/jobs -H "Content-Type: application/json" -d "{\"moto\":\"\"}"
```

Responde `400`.

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/
│   └── jobs.routes.js
├── controllers/
│   └── jobs.controller.js
└── services/
    └── diagnostics-queue.service.js
```
