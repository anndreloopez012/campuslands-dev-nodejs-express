# Ejercicio 12 — async / await

**Temática:** películas de miedo · **Nivel:** Básico inicial

## Objetivo

Escribir código asíncrono legible con `async/await`, manejar errores con `try/catch` y decidir cuándo esperar de forma **secuencial** y cuándo en **paralelo** con `Promise.all`.

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
ejercicio-12/
├── package.json
├── README.md
├── src/
│   ├── app.js
│   ├── server.js
│   ├── utils/async-handler.js
│   ├── routes/index.js
│   ├── controllers/movies.controller.js
│   └── services/movies.service.js
└── test/app.test.js
```

## Endpoints

| Método | Ruta | Descripción | Códigos |
| --- | --- | --- | --- |
| GET | `/health` | Estado del servicio | 200 |
| GET | `/basico/ejercicio-12` | Endpoint principal | 200 |
| GET | `/movies/:id` | Película con director, reseñas y promedio | 200, 400, 404 |
| GET | `/movies/:id/benchmark` | Compara tiempo secuencial vs paralelo | 200, 400, 404 |

## Ejemplos

```bash
curl http://localhost:3000/movies/1
curl http://localhost:3000/movies/1/benchmark
curl -i http://localhost:3000/movies/99    # 404
```

```json
{ "ok": true, "sequentialMs": 122, "parallelMs": 82 }
```

## Conceptos aplicados

- **Paso dependiente:** se necesita la película antes de saber qué director buscar → `await` secuencial.
- **Pasos independientes:** director y reseñas no dependen entre sí → `await Promise.all([...])`, tardan lo que tarda el más lento.
- **Errores:** un `throw` dentro de una función `async` rechaza la promesa; el controlador lo captura.
- **`asyncHandler`:** envoltorio que envía cualquier error a `next(error)`, evitando repetir `try/catch`. El endpoint `benchmark` usa `try/catch` explícito para comparar ambos estilos.
- Express 4 no captura por sí solo las promesas rechazadas de un controlador `async`; por eso se necesita uno de los dos enfoques.

## Errores manejados

- `400` si el id no es un entero positivo.
- `404` si la película no existe.
- `500` genérico ante errores inesperados.

## Pruebas

```bash
npm test
```
