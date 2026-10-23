# Ejercicio 16 — Primer servidor Express

**Temática:** ropa y sneakers · **Nivel:** Básico inicial

## Objetivo

Crear el primer servidor con Express: instanciar la aplicación, definir rutas, responder texto y JSON, y manejar rutas inexistentes. Es intencionalmente simple: todo cabe en `app.js`; las capas (rutas, controladores, servicios) llegan en el ejercicio 21.

## Requisitos

- Node.js 20 o superior

## Instalación y ejecución

```bash
npm install
npm start
npm run dev      # reinicia al guardar cambios
npm test
```

Servidor en `http://localhost:3000` (configurable con `PORT`, por ejemplo `PORT=4000 npm start`).

## Estructura

```text
ejercicio-16/
├── package.json
├── README.md
├── src/
│   ├── app.js            # crea la app y define las rutas
│   ├── server.js         # arranca el servidor (listen)
│   └── data/sneakers.js
└── test/app.test.js
```

`app.js` exporta la aplicación y `server.js` la hace escuchar: así las pruebas pueden usar la app sin ocupar el puerto 3000.

## Endpoints

| Método | Ruta | Descripción | Respuesta |
| --- | --- | --- | --- |
| GET | `/` | Bienvenida | Texto (`res.send`) |
| GET | `/health` | Estado del servicio | JSON |
| GET | `/basico/ejercicio-16` | Endpoint principal | JSON |
| GET | `/sneakers` | Catálogo de sneakers | JSON |
| cualquier otra | — | Ruta inexistente | 404 JSON |

## Ejemplos

```bash
curl http://localhost:3000/
curl http://localhost:3000/sneakers
curl -i http://localhost:3000/zapatos      # 404
```

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "primer servidor Express"
}
```

## Conceptos aplicados

- `express()` crea la aplicación; `app.get(ruta, manejador)` define una ruta.
- `res.send()` para texto y `res.json()` para JSON; `res.status(404)` para el código HTTP.
- El manejador `app.use(...)` **al final** captura todo lo que ninguna ruta atendió.
- `process.env.PORT` permite cambiar el puerto sin tocar el código.

## Pruebas

```bash
npm test
```
