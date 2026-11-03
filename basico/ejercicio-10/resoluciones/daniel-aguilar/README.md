# Ejercicio 10 — Funciones asíncronas

**Temática:** pingpong · **Nivel:** Básico inicial

## Objetivo

Entender qué es una función asíncrona, por qué siempre devuelve una promesa y cómo `await` espera un resultado sin bloquear el servidor.

## Requisitos

- Node.js 20 o superior

## Instalación y ejecución

```bash
npm install
npm start
npm run dev
npm test
```

Servidor en `http://localhost:3000` (configurable con `PORT`).

## Estructura

```text
ejercicio-10/
├── package.json
├── README.md
├── src/
│   ├── app.js
│   ├── server.js
│   ├── utils/delay.js
│   ├── routes/index.js
│   ├── controllers/players.controller.js
│   └── services/players.service.js
└── test/app.test.js
```

## Endpoints

| Método | Ruta | Descripción | Códigos |
| --- | --- | --- | --- |
| GET | `/health` | Estado del servicio | 200 |
| GET | `/basico/ejercicio-10` | Endpoint principal | 200 |
| GET | `/players/:id` | Jugador (consulta asíncrona simulada) | 200, 400, 404 |
| GET | `/ranking` | Ranking ordenado por puntos, con el tiempo que tardó | 200 |
| GET | `/event-loop` | Orden de ejecución: síncrono, microtarea, macrotarea | 200 |

## Ejemplos

```bash
curl http://localhost:3000/players/2
curl http://localhost:3000/ranking
curl http://localhost:3000/event-loop
```

```json
{
  "ok": true,
  "order": [
    "codigo sincrono",
    "Promise.then (microtarea)",
    "setTimeout 0 (macrotarea)"
  ]
}
```

## Conceptos

- `async function` siempre devuelve una `Promise`; `return x` equivale a `Promise.resolve(x)`.
- `await` pausa **esa función**, no el servidor: Node sigue atendiendo otras peticiones.
- `utils/delay.js` envuelve `setTimeout` en una promesa para poder usar `await`.
- Los errores dentro de una función `async` se convierten en promesas rechazadas; en el controlador se capturan con `try/catch` y se envían a `next(error)`.

## Errores manejados

- `400` si el `id` no es un entero positivo.
- `404` si el jugador no existe.
- `500` genérico ante errores inesperados.

## Pruebas

```bash
npm test
```
