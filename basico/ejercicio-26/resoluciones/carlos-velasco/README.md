# BASICO 26 - Códigos de estado

## Autor

**Velasco-c**

## Objetivo

Crear una API HTTP pequeña utilizando Node.js y Express para practicar el uso correcto de diferentes códigos de estado HTTP en un escenario relacionado con shooters competitivos.

La aplicación trabaja con partidas competitivas y permite:

- Listar partidas.
- Consultar una partida por ID.
- Crear partidas.
- Iniciar partidas.
- Eliminar partidas.
- Validar datos de entrada.
- Manejar recursos inexistentes.
- Manejar conflictos de estado.
- Utilizar códigos HTTP diferentes según el resultado de cada operación.

El objetivo principal no es crear una aplicación grande, sino comprender cuándo utilizar diferentes códigos de estado HTTP.

---

## Concepto principal

Los códigos de estado HTTP permiten comunicar al cliente el resultado de una petición.

En este ejercicio se utilizan:

| Código | Nombre | Uso en el proyecto |
|---|---|---|
| `200` | OK | Operación exitosa con contenido |
| `201` | Created | Recurso creado correctamente |
| `204` | No Content | Eliminación exitosa sin contenido |
| `400` | Bad Request | Datos enviados incorrectamente |
| `404` | Not Found | Recurso o ruta inexistente |
| `409` | Conflict | Conflicto con el estado actual del recurso |

La selección del código depende del resultado de la operación.

---

## Temática

La API utiliza como temática los **shooters competitivos**.

El recurso principal es una partida competitiva.

Cada partida contiene:

- `id`: identificador de la partida.
- `name`: nombre de la partida.
- `game`: videojuego.
- `players`: cantidad de jugadores.
- `status`: estado de la partida.

Ejemplo:

```json
{
  "id": 1,
  "name": "Clasificatoria nocturna",
  "game": "Valorant",
  "players": 10,
  "status": "waiting"
}
```

---

## Tecnologías utilizadas

- Node.js 20 o superior recomendado.
- Express.
- JavaScript.
- HTTP.
- JSON.

No se utiliza una base de datos externa.
Los datos se mantienen temporalmente en memoria.

---

## Estructura del proyecto

```text
basico/ejercicio-26/resoluciones/carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── controllers/
    │   └── match.controller.js
    ├── routes/
    │   └── match.routes.js
    └── services/
        └── match.service.js
```

---

## Responsabilidad de cada archivo

### `src/app.js`

Es el punto de entrada de la aplicación.

Se encarga de:

- Crear la aplicación Express.
- Habilitar `express.json()`.
- Registrar `/health`.
- Registrar las rutas de partidas.
- Manejar rutas inexistentes.
- Iniciar el servidor.

---

### `src/routes/match.routes.js`

Define las rutas HTTP relacionadas con las partidas competitivas.

Las rutas delegan el procesamiento al controlador.

---

### `src/controllers/match.controller.js`

Contiene la lógica relacionada con las peticiones HTTP.

Se encarga de:

- Leer parámetros.
- Leer `req.body`.
- Validar datos.
- Invocar servicios.
- Seleccionar códigos de estado HTTP.
- Construir respuestas JSON.

---

### `src/services/match.service.js`

Contiene la lógica de manipulación de las partidas.

Se encarga de:

- Listar partidas.
- Buscar partidas.
- Crear partidas.
- Iniciar partidas.
- Eliminar partidas.

Los datos se almacenan en memoria.

---

# Instalación

Entrar al directorio del ejercicio:

```bash
cd basico/ejercicio-26/resoluciones/carlos-velasco
```

Instalar las dependencias:

```bash
npm install
```

---

# Ejecución

## Modo normal

```bash
npm start
```

## Modo desarrollo

```bash
npm run dev
```

El servidor estará disponible en:

```text
http://localhost:3000
```

---

# Endpoint de salud

## GET `/health`

Permite comprobar que el servidor está funcionando.

Prueba:

```bash
curl http://localhost:3000/health
```

Respuesta:

```json
{
  "ok": true,
  "message": "API de shooters competitivos funcionando correctamente"
}
```

Código HTTP:

```text
200 OK
```

---

# Endpoints

## GET `/api/matches`

Obtiene todas las partidas competitivas.

Prueba:

```bash
curl http://localhost:3000/api/matches
```

Respuesta esperada:

```json
{
  "ok": true,
  "data": [
    {
      "id": 1,
      "name": "Clasificatoria nocturna",
      "game": "Valorant",
      "players": 10,
      "status": "waiting"
    },
    {
      "id": 2,
      "name": "Torneo semanal",
      "game": "Counter-Strike 2",
      "players": 10,
      "status": "started"
    },
    {
      "id": 3,
      "name": "Entrenamiento competitivo",
      "game": "Overwatch 2",
      "players": 10,
      "status": "waiting"
    }
  ]
}
```

Código HTTP:

```text
200 OK
```

---

# GET `/api/matches/:id`

Obtiene una partida específica.

Ejemplo:

```bash
curl http://localhost:3000/api/matches/1
```

Respuesta:

```json
{
  "ok": true,
  "data": {
    "id": 1,
    "name": "Clasificatoria nocturna",
    "game": "Valorant",
    "players": 10,
    "status": "waiting"
  }
}
```

Código HTTP:

```text
200 OK
```

---

# POST `/api/matches`

Crea una nueva partida competitiva.

Los campos obligatorios son:

- `name`
- `game`
- `players`

El campo `players` debe ser un número entero mayor o igual a `2`.

Ejemplo:

```bash
curl -X POST http://localhost:3000/api/matches \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Final del torneo",
    "game": "Valorant",
    "players": 10
  }'
```

Respuesta:

```json
{
  "ok": true,
  "message": "Partida competitiva creada correctamente",
  "data": {
    "id": 4,
    "name": "Final del torneo",
    "game": "Valorant",
    "players": 10,
    "status": "waiting"
  }
}
```

Código HTTP:

```text
201 Created
```

Se utiliza `201` porque se creó un nuevo recurso.

---

# PATCH `/api/matches/:id/start`

Inicia una partida que se encuentra en estado `waiting`.

Ejemplo:

```bash
curl -X PATCH http://localhost:3000/api/matches/1/start
```

Respuesta:

```json
{
  "ok": true,
  "message": "Partida competitiva iniciada correctamente",
  "data": {
    "id": 1,
    "name": "Clasificatoria nocturna",
    "game": "Valorant",
    "players": 10,
    "status": "started"
  }
}
```

Código HTTP:

```text
200 OK
```

Se utiliza `200` porque la operación se completó correctamente y se devuelve el recurso actualizado.

---

# DELETE `/api/matches/:id`

Elimina una partida existente.

Ejemplo:

```bash
curl -X DELETE http://localhost:3000/api/matches/3
```

Respuesta:

```text
204 No Content
```

No se devuelve un cuerpo JSON.

El código `204` indica que la eliminación fue exitosa y que no hay contenido que devolver.

---

# Código 400 - Bad Request

El código `400` se utiliza cuando la petición contiene datos inválidos.

## ID inválido

Ejemplo:

```bash
curl http://localhost:3000/api/matches/abc
```

Respuesta:

```json
{
  "ok": false,
  "message": "El ID debe ser un número entero positivo"
}
```

Código:

```text
400 Bad Request
```

---

## Datos incompletos

Ejemplo:

```bash
curl -X POST http://localhost:3000/api/matches \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Partida incompleta"
  }'
```

Respuesta:

```json
{
  "ok": false,
  "message": "Los campos name, game y players son obligatorios"
}
```

Código:

```text
400 Bad Request
```

---

## Cantidad de jugadores inválida

Una partida debe tener al menos dos jugadores.

Ejemplo:

```bash
curl -X POST http://localhost:3000/api/matches \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Partida inválida",
    "game": "Valorant",
    "players": 1
  }'
```

Respuesta:

```json
{
  "ok": false,
  "message": "Una partida competitiva necesita al menos 2 jugadores"
}
```

Código:

```text
400 Bad Request
```

---

# Código 404 - Not Found

El código `404` se utiliza cuando el recurso solicitado no existe.

Ejemplo:

```bash
curl http://localhost:3000/api/matches/999
```

Respuesta:

```json
{
  "ok": false,
  "message": "Partida competitiva no encontrada"
}
```

Código:

```text
404 Not Found
```

También se utiliza `404` para una ruta inexistente:

```bash
curl http://localhost:3000/api/otra-ruta
```

Respuesta:

```json
{
  "ok": false,
  "message": "Ruta no encontrada"
}
```

Código:

```text
404 Not Found
```

---

# Código 409 - Conflict

El código `409 Conflict` se utiliza cuando la petición no puede completarse porque entra en conflicto con el estado actual del recurso.

En este ejercicio, una partida puede pasar de:

```text
waiting
```

a:

```text
started
```

Una partida que ya está iniciada no puede iniciarse nuevamente.

La partida `2` comienza en estado:

```text
started
```

Por lo tanto, esta petición:

```bash
curl -X PATCH http://localhost:3000/api/matches/2/start
```

produce:

```json
{
  "ok": false,
  "message": "La partida ya se encuentra iniciada"
}
```

Código:

```text
409 Conflict
```

Esto permite diferenciar un conflicto de estado de un recurso inexistente.

---

# Tabla de códigos utilizados

| Situación | Código HTTP |
|---|---|
| Health correcto | `200` |
| Listar partidas | `200` |
| Consultar partida existente | `200` |
| Iniciar partida | `200` |
| Crear partida | `201` |
| Eliminar partida | `204` |
| ID inválido | `400` |
| Datos incompletos | `400` |
| Cantidad de jugadores inválida | `400` |
| Partida inexistente | `404` |
| Ruta inexistente | `404` |
| Partida ya iniciada | `409` |

---

# Diferencia entre 400, 404 y 409

Estos tres códigos representan situaciones diferentes.

## 400 Bad Request

La petición contiene datos que no cumplen las reglas de entrada.

Ejemplo:

```text
players = 1
```

La petición es inválida.

---

## 404 Not Found

El recurso solicitado no existe.

Ejemplo:

```text
GET /api/matches/999
```

No existe una partida con ese ID.

---

## 409 Conflict

El recurso existe, pero la operación entra en conflicto con su estado actual.

Ejemplo:

```text
PATCH /api/matches/2/start
```

La partida existe, pero ya está iniciada.

---

# Flujo de una petición

La aplicación sigue esta estructura:

```text
Cliente
   │
   ▼
Ruta
   │
   ▼
Controlador
   │
   ▼
Servicio
   │
   ▼
Datos en memoria
   │
   ▼
Servicio
   │
   ▼
Controlador
   │
   ▼
Respuesta HTTP
```

El controlador determina qué código HTTP corresponde al resultado de la operación.

---

# Ejemplo de flujo exitoso

Para crear una partida:

```text
POST /api/matches
       │
       ▼
Validación correcta
       │
       ▼
Servicio crea recurso
       │
       ▼
201 Created
```

---

# Ejemplo de error de validación

```text
POST /api/matches
       │
       ▼
Datos inválidos
       │
       ▼
400 Bad Request
```

---

# Ejemplo de recurso inexistente

```text
GET /api/matches/999
       │
       ▼
No existe el recurso
       │
       ▼
404 Not Found
```

---

# Ejemplo de conflicto

```text
PATCH /api/matches/2/start
       │
       ▼
La partida ya está iniciada
       │
       ▼
409 Conflict
```

---

# Pruebas manuales

Las pruebas pueden realizarse con:

- curl.
- Postman.
- Thunder Client.
- Navegador para las peticiones GET.

## 1. Comprobar el servidor

```bash
curl http://localhost:3000/health
```

Esperado:

```text
200 OK
```

---

## 2. Listar partidas

```bash
curl http://localhost:3000/api/matches
```

Esperado:

```text
200 OK
```

---

## 3. Consultar partida existente

```bash
curl http://localhost:3000/api/matches/1
```

Esperado:

```text
200 OK
```

---

## 4. Consultar partida inexistente

```bash
curl http://localhost:3000/api/matches/999
```

Esperado:

```text
404 Not Found
```

---

## 5. Crear partida

```bash
curl -X POST http://localhost:3000/api/matches \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Final competitiva",
    "game": "Valorant",
    "players": 10
  }'
```

Esperado:

```text
201 Created
```

---

## 6. Crear partida con datos inválidos

```bash
curl -X POST http://localhost:3000/api/matches \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Partida inválida",
    "game": "Valorant",
    "players": 1
  }'
```

Esperado:

```text
400 Bad Request
```

---

## 7. Iniciar partida

```bash
curl -X PATCH http://localhost:3000/api/matches/1/start
```

Esperado:

```text
200 OK
```

---

## 8. Intentar iniciar una partida que ya comenzó

```bash
curl -X PATCH http://localhost:3000/api/matches/2/start
```

Esperado:

```text
409 Conflict
```

---

## 9. Eliminar partida

```bash
curl -X DELETE http://localhost:3000/api/matches/3
```

Esperado:

```text
204 No Content
```

---

## 10. Intentar eliminar una partida inexistente

```bash
curl -X DELETE http://localhost:3000/api/matches/999
```

Esperado:

```text
404 Not Found
```

---

# Datos iniciales

La aplicación comienza con tres partidas:

```text
1 - Clasificatoria nocturna - Valorant - 10 jugadores - waiting
2 - Torneo semanal - Counter-Strike 2 - 10 jugadores - started
3 - Entrenamiento competitivo - Overwatch 2 - 10 jugadores - waiting
```

Los datos se encuentran en:

```text
src/services/match.service.js
```

---

# Persistencia

La aplicación utiliza almacenamiento en memoria.

Por lo tanto:

- No utiliza MySQL.
- No utiliza PostgreSQL.
- No utiliza MongoDB.
- No requiere una base de datos externa.
- No requiere Docker.
- Los cambios se pierden cuando se reinicia el servidor.

Esto mantiene el ejercicio enfocado en los códigos de estado HTTP.

---

# Errores comunes evitados

La implementación evita:

- Responder `200` para absolutamente todo.
- Utilizar `201` cuando no se creó ningún recurso.
- Utilizar `404` cuando el recurso sí existe pero la operación entra en conflicto con su estado.
- Ignorar los errores de validación.
- Devolver un cuerpo junto con `204 No Content`.
- No diferenciar entre `400`, `404` y `409`.
- Colocar toda la lógica en `app.js`.
- No documentar los códigos HTTP utilizados.

---

# Resultado esperado

Al finalizar el ejercicio, la API debe demostrar el uso de diferentes códigos HTTP según el resultado de cada operación:

```text
200 → operación exitosa
201 → recurso creado
204 → operación exitosa sin contenido
400 → petición inválida
404 → recurso o ruta inexistente
409 → conflicto con el estado actual
```

El propósito es comprender que el código de estado forma parte importante del contrato entre el servidor y el cliente.

---

# Checklist final

- Proyecto Node.js creado.
- Express configurado.
- `package.json` creado.
- Carpeta `src/` creada.
- Separación entre rutas, controladores y servicios.
- Endpoint `/health`.
- API de partidas competitivas.
- Uso de `200 OK`.
- Uso de `201 Created`.
- Uso de `204 No Content`.
- Uso de `400 Bad Request`.
- Uso de `404 Not Found`.
- Uso de `409 Conflict`.
- Validación de IDs.
- Validación de datos.
- Manejo de recursos inexistentes.
- Manejo de conflictos de estado.
- Ejemplos de peticiones documentados.
- README incluido.
- No se utiliza base de datos externa.
- No se requiere Docker.
- `node_modules/` no debe subirse.
- La solución se encuentra dentro de la carpeta personal.

---

# Resumen

Este ejercicio implementa una API básica de shooters competitivos utilizando Node.js y Express.

El objetivo principal es practicar diferentes códigos de estado HTTP y entender que cada uno comunica una situación diferente.

La arquitectura utilizada es:

```text
routes
  ↓
controllers
  ↓
services
  ↓
datos en memoria
```

Los principales códigos practicados son:

```text
200 → OK
201 → Created
204 → No Content
400 → Bad Request
404 → Not Found
409 → Conflict
```

La aplicación demuestra estos códigos mediante operaciones sobre partidas competitivas y permite observar la diferencia entre una operación exitosa, una petición inválida, un recurso inexistente y un conflicto con el estado actual de un recurso.