# BASICO 10 - Funciones asincronas

## Autor

Joseph Ramirez

## Tematica

Pingpong

## Tema del ejercicio

Funciones asincronas en Node.js.

## Objetivo

Crear una pequeña API con Node.js y Express para practicar el uso de funciones asíncronas utilizando:

* `Promise`
* `async`
* `await`
* `setTimeout`
* `try/catch`

El proyecto simula operaciones que tardan en responder para comprender cómo Node.js puede trabajar con operaciones asíncronas sin bloquear la ejecución del programa.

---

# Tecnologias utilizadas

* Node.js 20 o superior recomendado.
* Express.
* JavaScript.
* Promise.
* async/await.
* setTimeout.
* HTTP/REST.
* CommonJS.

---

# Estructura del proyecto

```text
joseph-ramirez/
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
└── src/
    ├── app.js
    ├── controllers/
    │   └── players.controller.js
    ├── routes/
    │   └── players.routes.js
    └── services/
        └── players.service.js
```

---

# Descripcion de archivos

## `src/app.js`

Es el punto de entrada de la aplicación.

Sus responsabilidades son:

* Crear la aplicación Express.
* Configurar `express.json()`.
* Registrar las rutas.
* Crear `/health`.
* Manejar rutas inexistentes.
* Iniciar el servidor.

---

## `src/routes/players.routes.js`

Contiene las rutas relacionadas con los jugadores de pingpong.

Endpoints:

```text
GET /players
GET /players/:id
GET /players/country/:country
```

Las rutas delegan el procesamiento a los controladores.

---

## `src/controllers/players.controller.js`

Se encarga de:

* Recibir las peticiones.
* Validar parámetros.
* Esperar las operaciones asíncronas.
* Crear las respuestas HTTP.
* Manejar errores.

Los controladores utilizan:

```javascript
async function
```

y:

```javascript
await
```

para esperar los resultados de los servicios.

---

## `src/services/players.service.js`

Contiene los datos y las operaciones asíncronas.

La función:

```javascript
simulateAsyncOperation()
```

crea una `Promise` y utiliza `setTimeout()` para simular una operación que tarda en responder.

Después, los métodos:

```javascript
getAllPlayers()
getPlayerById()
getPlayersByCountry()
```

utilizan `async/await`.

---

# Instalacion

Desde la carpeta del ejercicio ejecutar:

```bash
npm install
```

Esto instalará las dependencias indicadas en `package.json`.

---

# Ejecucion

Para iniciar el servidor:

```bash
npm start
```

El servidor se ejecutará en:

```text
http://localhost:3000
```

También se puede utilizar el modo desarrollo:

```bash
npm run dev
```

Este comando utiliza:

```text
node --watch
```

para reiniciar el servidor cuando se detectan cambios.

---

# Verificacion de sintaxis

Ejecutar:

```bash
npm run check
```

Este comando comprueba la sintaxis del archivo principal:

```text
node --check src/app.js
```

---

# Pruebas de la API

El servidor debe estar ejecutándose antes de realizar las siguientes pruebas.

---

# GET `/health`

Permite comprobar que el servidor funciona correctamente.

Ejecutar:

```bash
curl http://localhost:3000/health
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "funciones asincronas"
}
```

Código HTTP:

```text
200 OK
```

---

# GET `/players`

Obtiene todos los jugadores.

Ejecutar:

```bash
curl http://localhost:3000/players
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Jugadores obtenidos correctamente",
  "total": 4,
  "data": [
    {
      "id": 1,
      "nombre": "Carlos Mendoza",
      "edad": 24,
      "ranking": 8,
      "pais": "Guatemala"
    },
    {
      "id": 2,
      "nombre": "Daniel Lopez",
      "edad": 27,
      "ranking": 15,
      "pais": "Mexico"
    },
    {
      "id": 3,
      "nombre": "Andres Castillo",
      "edad": 22,
      "ranking": 21,
      "pais": "Costa Rica"
    },
    {
      "id": 4,
      "nombre": "Miguel Torres",
      "edad": 29,
      "ranking": 5,
      "pais": "El Salvador"
    }
  ]
}
```

Código HTTP:

```text
200 OK
```

La respuesta tarda aproximadamente medio segundo porque el servicio utiliza una `Promise` con `setTimeout()`.

---

# GET `/players/:id`

Permite buscar un jugador por ID.

Ejecutar:

```bash
curl http://localhost:3000/players/1
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Jugador encontrado correctamente",
  "data": {
    "id": 1,
    "nombre": "Carlos Mendoza",
    "edad": 24,
    "ranking": 8,
    "pais": "Guatemala"
  }
}
```

Código HTTP:

```text
200 OK
```

---

# Buscar jugador inexistente

Ejecutar:

```bash
curl http://localhost:3000/players/999
```

Respuesta esperada:

```json
{
  "ok": false,
  "message": "Jugador no encontrado"
}
```

Código HTTP:

```text
404 Not Found
```

---

# Validar ID incorrecto

Ejecutar:

```bash
curl http://localhost:3000/players/abc
```

Respuesta esperada:

```json
{
  "ok": false,
  "message": "El ID debe ser un numero entero positivo"
}
```

Código HTTP:

```text
400 Bad Request
```

---

# GET `/players/country/:country`

Permite obtener jugadores de un país específico.

Ejecutar:

```bash
curl http://localhost:3000/players/country/Guatemala
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Jugadores encontrados correctamente",
  "total": 1,
  "data": [
    {
      "id": 1,
      "nombre": "Carlos Mendoza",
      "edad": 24,
      "ranking": 8,
      "pais": "Guatemala"
    }
  ]
}
```

Código HTTP:

```text
200 OK
```

También se puede probar con:

```bash
curl http://localhost:3000/players/country/Mexico
```

---

# Buscar país sin jugadores

Ejecutar:

```bash
curl http://localhost:3000/players/country/Argentina
```

Respuesta esperada:

```json
{
  "ok": false,
  "message": "No se encontraron jugadores de ese pais"
}
```

Código HTTP:

```text
404 Not Found
```

---

# Ruta inexistente

Ejecutar:

```bash
curl http://localhost:3000/pingpong
```

Respuesta esperada:

```json
{
  "ok": false,
  "message": "Ruta no encontrada"
}
```

Código HTTP:

```text
404 Not Found
```

---

# Concepto principal: funciones asincronas

Una función asíncrona se puede declarar utilizando:

```javascript
async function nombreFuncion() {
}
```

Una función `async` siempre devuelve una `Promise`.

Por ejemplo:

```javascript
async function getPlayers() {
  return players;
}
```

El resultado de esta función puede ser esperado utilizando:

```javascript
const result = await getPlayers();
```

---

# Promise

Una `Promise` representa una operación que terminará en algún momento.

En este ejercicio se utiliza:

```javascript
function simulateAsyncOperation(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, 500);
  });
}
```

La Promise se resuelve después de 500 milisegundos.

El flujo es:

```text
Promise creada
     ↓
setTimeout()
     ↓
500 ms
     ↓
resolve()
     ↓
resultado disponible
```

---

# async

La palabra `async` permite declarar una función asíncrona.

Ejemplo:

```javascript
async function getAllPlayers() {
  const result = await simulateAsyncOperation(players);

  return result;
}
```

La función puede utilizar `await` porque fue declarada como `async`.

---

# await

`await` espera el resultado de una `Promise`.

Ejemplo:

```javascript
const result = await simulateAsyncOperation(players);
```

Esto permite escribir código asíncrono de una forma más fácil de leer.

---

# try/catch

Las operaciones asíncronas pueden generar errores.

Por eso los controladores utilizan:

```javascript
try {
  const players = await playersService.getAllPlayers();

  res.status(200).json({
    ok: true,
    data: players
  });
} catch (error) {
  console.error(error);

  res.status(500).json({
    ok: false,
    message: "Error al obtener los jugadores"
  });
}
```

El bloque `try` contiene la operación que puede fallar.

El bloque `catch` permite manejar el error.

---

# Flujo de una peticion

Cuando se realiza:

```text
GET /players
```

ocurre lo siguiente:

```text
Cliente
   |
   v
Route
   |
   v
Controller
   |
   | await
   v
Service
   |
   v
Promise
   |
   v
setTimeout()
   |
   v
resolve()
   |
   v
Controller
   |
   v
HTTP 200
```

---

# ¿Por que usamos una operacion simulada?

En este ejercicio no necesitamos una base de datos ni una API externa.

El objetivo es practicar el comportamiento asíncrono.

Por eso se utiliza:

```javascript
setTimeout()
```

para simular una operación que tarda en completarse.

En una aplicación real, una operación asíncrona podría representar:

* Consulta a una base de datos.
* Lectura de un archivo.
* Petición a una API externa.
* Comunicación con otro servicio.
* Consulta a un sistema externo.

---

# Diferencia entre codigo sincrono y asincrono

Código síncrono:

```javascript
const player = players[0];

console.log(player);
```

La siguiente instrucción espera a que termine la anterior.

Código asíncrono:

```javascript
const player = await getPlayerById(1);

console.log(player);
```

La operación puede esperar una Promise antes de continuar.

En Node.js esto es especialmente importante porque muchas operaciones de entrada y salida son asíncronas.

---

# Codigos HTTP utilizados

| Código | Significado           | Uso                        |
| ------ | --------------------- | -------------------------- |
| 200    | OK                    | Operación exitosa          |
| 400    | Bad Request           | Parámetro inválido         |
| 404    | Not Found             | Jugador o ruta inexistente |
| 500    | Internal Server Error | Error interno              |

---

# Casos de error contemplados

El proyecto maneja:

* ID inválido.
* ID inexistente.
* País sin jugadores.
* País vacío.
* Ruta inexistente.
* Errores internos mediante `try/catch`.

---

# Checklist de validacion

* [x] Existe `package.json`.
* [x] Existe `package-lock.json`.
* [x] Existe una carpeta `src/`.
* [x] Se utiliza Express.
* [x] Se utilizan `Promise`.
* [x] Se utilizan funciones `async`.
* [x] Se utiliza `await`.
* [x] Se utiliza `setTimeout()` para simular una operación asíncrona.
* [x] Se utiliza `try/catch`.
* [x] Existe `GET /health`.
* [x] Existe `GET /players`.
* [x] Existe `GET /players/:id`.
* [x] Existe `GET /players/country/:country`.
* [x] Se validan parámetros.
* [x] Se manejan recursos inexistentes.
* [x] Se manejan rutas inexistentes.
* [x] Se utilizan códigos HTTP coherentes.
* [x] Existe separación entre rutas, controladores y servicios.
* [x] No se utiliza una base de datos externa.
* [x] `node_modules/` está excluido.

---

# Entrega

La solución debe encontrarse dentro de:

```text
basico/ejercicio-10/resoluciones/joseph-ramirez/
```

No se deben modificar:

* Archivos base del ejercicio.
* Entregas de otros estudiantes.
* Carpetas de otros estudiantes.

El Pull Request debe dirigirse hacia:

```text
dev
```

No debe dirigirse hacia:

```text
mainbasico-08
  basico-09
  basico-10
```
