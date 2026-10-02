# API de Equipos de Futbol y Futbol Sala

API REST hecha con Node.js y Express para consultar y registrar equipos de futbol y futbol sala. Es el ejercicio 29 del nivel basico y su objetivo principal es practicar la escritura de un README tecnico.

## Tecnologias

- Node.js 20 o superior
- Express 4
- ES Modules

## Requisitos

- Node.js 20 o superior
- npm

Para revisar la version instalada:

```bash
node -v
npm -v
```

## Instalacion

```bash
npm install
```

## Ejecucion

Modo desarrollo (se reinicia solo al guardar cambios):

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

El servidor queda disponible en `http://localhost:3000`.

## Scripts

| Script | Comando | Descripcion |
| --- | --- | --- |
| dev | `npm run dev` | Inicia el servidor con `node --watch` |
| start | `npm start` | Inicia el servidor normal |

## Estructura del proyecto

```text
src/
├── app.js
├── server.js
├── routes/
│   └── equipos.routes.js
├── controllers/
│   └── equipos.controller.js
└── services/
    └── equipos.service.js
```

- `server.js`: levanta el servidor en el puerto 3000.
- `app.js`: configura Express, el middleware `express.json()` y las rutas.
- `routes/`: define las rutas y las conecta con los controladores.
- `controllers/`: recibe la peticion, valida los datos y responde.
- `services/`: guarda y busca los datos en memoria.

## Endpoints

Ruta base: `/basico/ejercicio-29`

| Metodo | Ruta | Descripcion | Codigos |
| --- | --- | --- | --- |
| GET | `/` | Informacion del ejercicio | 200 |
| GET | `/equipos` | Lista todos los equipos | 200 |
| GET | `/equipos/:id` | Busca un equipo por id | 200, 400, 404 |
| POST | `/equipos` | Crea un equipo nuevo | 201, 400 |
| GET | `/health` | Verifica que el servidor esta activo | 200 |

### GET /basico/ejercicio-29/equipos

Respuesta 200:

```json
{
  "ok": true,
  "data": [
    { "id": 1, "nombre": "Aguilas FC", "ciudad": "Guatemala", "jugadores": 18 },
    { "id": 2, "nombre": "Futsal Pro", "ciudad": "Antigua", "jugadores": 10 }
  ]
}
```

### GET /basico/ejercicio-29/equipos/:id

Ejemplo: `GET /basico/ejercicio-29/equipos/1`

Respuesta 200:

```json
{
  "ok": true,
  "data": { "id": 1, "nombre": "Aguilas FC", "ciudad": "Guatemala", "jugadores": 18 }
}
```

Respuesta 404:

```json
{ "ok": false, "message": "Equipo no encontrado" }
```

### POST /basico/ejercicio-29/equipos

Body (JSON):

| Campo | Tipo | Regla |
| --- | --- | --- |
| nombre | string | obligatorio, no vacio |
| ciudad | string | obligatorio, no vacia |
| jugadores | number | entero, minimo 5 |

Ejemplo de body:

```json
{
  "nombre": "Tigres FC",
  "ciudad": "Escuintla",
  "jugadores": 15
}
```

Respuesta 201:

```json
{
  "ok": true,
  "data": { "id": 4, "nombre": "Tigres FC", "ciudad": "Escuintla", "jugadores": 15 }
}
```

Respuesta 400:

```json
{ "ok": false, "message": "El nombre es obligatorio" }
```

## Manejo de errores

| Codigo | Cuando ocurre |
| --- | --- |
| 400 | Faltan datos, el id no es un numero o el body no cumple las reglas |
| 404 | El equipo o la ruta no existen |

## Ejemplos de uso

```bash
curl http://localhost:3000/basico/ejercicio-29/equipos
curl http://localhost:3000/basico/ejercicio-29/equipos/1
curl http://localhost:3000/basico/ejercicio-29/equipos/99
curl -X POST http://localhost:3000/basico/ejercicio-29/equipos -H "Content-Type: application/json" -d "{\"nombre\":\"Tigres FC\",\"ciudad\":\"Escuintla\",\"jugadores\":15}"
```

## Limitaciones

- Los datos se guardan en memoria. Al reiniciar el servidor se pierden los equipos agregados.
- No hay autenticacion.
- No hay base de datos.
