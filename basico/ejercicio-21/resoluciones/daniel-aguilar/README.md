# Ejercicio 21 — Estructura `src/routes/controllers`

**Temática:** animación 3D · **Nivel:** Básico guiado

## Objetivo

Organizar una API en capas separadas en lugar de poner todo en un solo archivo:

- **routes**: *qué URL y método* llegan a *qué controlador*.
- **controllers**: leen la petición (`req`), validan y construyen la respuesta (`res`).
- **data**: la información (en este ejercicio, arreglos en memoria).

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
ejercicio-21/
├── package.json
├── README.md
├── src/
│   ├── server.js                      # arranca el servidor
│   ├── app.js                         # configura Express y monta las rutas
│   ├── routes/
│   │   ├── index.js                   # registro único de rutas
│   │   ├── animations.routes.js
│   │   └── characters.routes.js
│   ├── controllers/
│   │   ├── system.controller.js
│   │   ├── animations.controller.js
│   │   └── characters.controller.js
│   └── data/
│       ├── animations.js
│       └── characters.js
└── test/app.test.js
```

Flujo de una petición: `server.js` → `app.js` → `routes/index.js` → `*.routes.js` → `*.controller.js` → `data`.

## Endpoints

| Método | Ruta | Descripción | Códigos |
| --- | --- | --- | --- |
| GET | `/health` | Estado del servicio | 200 |
| GET | `/basico/ejercicio-21` | Endpoint principal | 200 |
| GET | `/animations` | Lista de animaciones | 200 |
| GET | `/animations/:id` | Detalle | 200, 400, 404 |
| POST | `/animations` | Crea una animación | 201, 400 |
| GET | `/characters` | Lista de personajes | 200 |
| GET | `/characters/:id` | Detalle | 200, 400, 404 |

Cuerpo de `POST /animations`: `name` (texto), `characterId` (debe existir), `durationSec` (0–600) y `fps` (24, 25, 30 o 60).

## Ejemplos

```bash
curl http://localhost:3000/animations
curl http://localhost:3000/characters/3

curl -i -X POST http://localhost:3000/animations \
  -H "Content-Type: application/json" \
  -d '{"name":"Giro de espada","characterId":2,"durationSec":1.5,"fps":60}'
```

## Reglas de la estructura

- Cada archivo de rutas **solo** conecta URL con controlador; no contiene lógica.
- Un controlador por recurso; nombres en minúsculas y con el sufijo `.routes.js` / `.controller.js`.
- Las rutas de cada recurso se montan con un prefijo en `routes/index.js` (`router.use('/animations', ...)`).
- La lógica de negocio todavía vive en el controlador; en el ejercicio 22 pasa a una capa de **servicios**.

## Pruebas

```bash
npm test
```
