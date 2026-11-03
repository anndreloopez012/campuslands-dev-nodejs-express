# Avanzado 21 - concurrencia controlada (animacion 3D)

Estudio de animacion 3D con dos problemas de concurrencia:

1. **Renders pesados**: si 50 animadores mandan a renderizar a la vez el servidor se muere. Un limitador (semaforo) deja correr solo `max` renders a la vez, el resto espera en una cola FIFO, y si la cola se llena se responde 503.
2. **Dos personas editan la misma escena**: con bloqueo optimista (version + `If-Match`) el que llega con una version vieja recibe 412 en vez de pisar el trabajo del otro.

## Como ejecutar

```bash
npm install
npm start      # http://localhost:4021 (cada frame tarda 50 ms para que se note)
npm test
```

## Limitador (`src/concurrencia/limitador.js`)

- `ejecutar(tarea)`: si hay lugar corre ya, si no espera en la cola.
- Si la cola esta llena rechaza con `ColaLlena` (la API responde **503 + Retry-After**).
- El lugar se libera en un `finally`, asi una tarea que falla no deja trabado el limitador.
- `estado()`: `activos`, `enCola`, `pico` (maximo visto a la vez), `completadas`, `fallidas`.

Ademas cada animador puede tener como maximo 2 renders pendientes (**429 + Retry-After**), para que uno solo no acapare la cola.

## Bloqueo optimista

- `GET /api/escenas/:id` devuelve la version en el header `ETag` (ej. `"3"`).
- `PATCH` debe mandar `If-Match: "3"`:
  - sin `If-Match` -> **428**
  - version vieja -> **412** con `versionActual`
  - bien -> 200, la version sube y llega el nuevo `ETag`

## Endpoints

| Metodo | Ruta | Descripcion |
| ------ | ---- | ----------- |
| GET | `/health` | estado |
| GET | `/api/escenas/:id` | escena + ETag |
| PATCH | `/api/escenas/:id` | editar (`nombre`, `camara`, `iluminacion`, `frames`) con If-Match |
| POST | `/api/escenas/:id/renders` | encolar render (header `X-Usuario`), responde 202 + Location |
| GET | `/api/renders/:id` | estado y progreso del render |
| GET | `/api/renders-estado` | estado del limitador |

## Ejemplos

```bash
curl -i localhost:4021/api/escenas/1
curl -i -X PATCH localhost:4021/api/escenas/1 -H 'If-Match: "1"' -H "Content-Type: application/json" -d '{"frames":60}'
curl -i -X PATCH localhost:4021/api/escenas/1 -H 'If-Match: "1"' -H "Content-Type: application/json" -d '{"camara":"dron"}'   # 412

curl -i -X POST localhost:4021/api/escenas/2/renders -H "X-Usuario: lucia"
curl localhost:4021/api/renders/1
curl localhost:4021/api/renders-estado
```

## Estructura

```text
src/
├── app.js
├── server.js
├── concurrencia/limitador.js
└── servicios/
    ├── escenas.js    version y bloqueo optimista
    └── renders.js    trabajos en segundo plano usando el limitador
```
