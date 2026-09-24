# BASICO 11 - Promesas basicas

## Autor

Joseph Ramirez

## Tematica

Musica

## Tema del ejercicio

Promesas basicas en Node.js.

## Objetivo

Crear una pequeña API con Node.js y Express para practicar el uso de `Promise`.

El proyecto simula operaciones que tardan en responder utilizando `setTimeout()` y devuelve los resultados mediante promesas.

Se busca comprender como crear una Promise, resolverla y posteriormente utilizar `async/await` para consumir su resultado.

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
    │   └── songs.controller.js
    ├── routes/
    │   └── songs.routes.js
    └── services/
        └── songs.service.js
```

---

# Descripcion de archivos

## `src/app.js`

Es el punto de entrada de la aplicación.

Sus responsabilidades son:

* Crear la aplicación Express.
* Configurar `express.json()`.
* Registrar las rutas.
* Crear la ruta `/health`.
* Manejar rutas inexistentes.
* Iniciar el servidor.

---

## `src/routes/songs.routes.js`

Contiene las rutas relacionadas con las canciones.

Endpoints:

```text
GET /songs
GET /songs/:id
GET /songs/genre/:genre
```

Las rutas delegan el procesamiento a los controladores.

---

## `src/controllers/songs.controller.js`

Se encarga de:

* Recibir las peticiones.
* Validar los parámetros.
* Utilizar `await` para esperar las Promises.
* Crear las respuestas HTTP.
* Manejar errores mediante `try/catch`.

---

## `src/services/songs.service.js`

Contiene los datos de ejemplo y la lógica relacionada con las canciones.

Las operaciones utilizan `Promise`:

```javascript
return new Promise((resolve) => {
  setTimeout(() => {
    resolve(data);
  }, 500);
});
```

Esto permite simular una operación que tarda en completarse.

---

# Instalacion

Desde la carpeta del ejercicio ejecutar:

```bash
npm install
```

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

Para utilizar el modo desarrollo:

```bash
npm run dev
```

Este comando utiliza:

```text
node --watch
```

para reiniciar automáticamente el servidor cuando se detectan cambios.

---

# Verificacion de sintaxis

Ejecutar:

```bash
npm run check
```

Este comando comprueba la sintaxis del archivo:

```text
src/app.js
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
  "topic": "promesas basicas"
}
```

Código HTTP:

```text
200 OK
```

---

# GET `/songs`

Obtiene todas las canciones.

Ejecutar:

```bash
curl http://localhost:3000/songs
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Canciones obtenidas correctamente",
  "total": 4,
  "data": [
    {
      "id": 1,
      "titulo": "Midnight Drive",
      "artista": "Neon Waves",
      "genero": "Synthwave",
      "duracion": 214
    },
    {
      "id": 2,
      "titulo": "Ocean Lights",
      "artista": "Blue Horizon",
      "genero": "Pop",
      "duracion": 198
    },
    {
      "id": 3,
      "titulo": "Electric Heart",
      "artista": "Digital Echo",
      "genero": "Electronic",
      "duracion": 225
    },
    {
      "id": 4,
      "titulo": "Golden Road",
      "artista": "The Travelers",
      "genero": "Rock",
      "duracion": 242
    }
  ]
}
```

Código HTTP:

```text
200 OK
```

La respuesta tarda aproximadamente 500 milisegundos porque el servicio utiliza una Promise con `setTimeout()`.

---

# GET `/songs/:id`

Permite buscar una canción mediante su ID.

Ejecutar:

```bash
curl http://localhost:3000/songs/1
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Cancion encontrada correctamente",
  "data": {
    "id": 1,
    "titulo": "Midnight Drive",
    "artista": "Neon Waves",
    "genero": "Synthwave",
    "duracion": 214
  }
}
```

Código HTTP:

```text
200 OK
```

---

# Buscar una canción inexistente

Ejecutar:

```bash
curl http://localhost:3000/songs/999
```

Respuesta esperada:

```json
{
  "ok": false,
  "message": "Cancion no encontrada"
}
```

Código HTTP:

```text
404 Not Found
```

---

# Validar un ID incorrecto

Ejecutar:

```bash
curl http://localhost:3000/songs/abc
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

# GET `/songs/genre/:genre`

Permite buscar canciones por género musical.

Ejecutar:

```bash
curl http://localhost:3000/songs/genre/Rock
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Canciones encontradas correctamente",
  "total": 1,
  "data": [
    {
      "id": 4,
      "titulo": "Golden Road",
      "artista": "The Travelers",
      "genero": "Rock",
      "duracion": 242
    }
  ]
}
```

Código HTTP:

```text
200 OK
```

También se puede probar:

```bash
curl http://localhost:3000/songs/genre/Pop
```

o:

```bash
curl http://localhost:3000/songs/genre/Electronic
```

---

# Buscar un género inexistente

Ejecutar:

```bash
curl http://localhost:3000/songs/genre/Jazz
```

Respuesta esperada:

```json
{
  "ok": false,
  "message": "No se encontraron canciones de ese genero"
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
curl http://localhost:3000/albums
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

# Concepto principal: Promise

Una `Promise` representa el resultado futuro de una operación.

Una Promise puede encontrarse principalmente en tres estados:

```text
Pending
   ↓
Fulfilled
```

o:

```text
Pending
   ↓
Rejected
```

En este ejercicio se utiliza principalmente el estado `fulfilled`, mediante `resolve()`.

---

# Crear una Promise

En el servicio se utiliza:

```javascript
function getSongs() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(songs);
    }, 500);
  });
}
```

La Promise recibe una función que tiene acceso a:

```javascript
resolve
```

Cuando se ejecuta:

```javascript
resolve(songs);
```

la Promise termina correctamente y entrega los datos.

---

# ¿Que hace `resolve()`?

`resolve()` indica que una Promise terminó correctamente.

Ejemplo:

```javascript
const promise = new Promise((resolve) => {
  resolve("Operacion completada");
});
```

El resultado de la Promise será:

```text
Operacion completada
```

---

# `setTimeout()` y Promises

En este ejercicio:

```javascript
setTimeout(() => {
  resolve(songs);
}, 500);
```

se utiliza `setTimeout()` para simular una operación que tarda en responder.

El flujo es:

```text
Crear Promise
     ↓
Esperar 500 ms
     ↓
Ejecutar resolve()
     ↓
Entregar canciones
```

En una aplicación real, ese tiempo podría representar:

* Una consulta a una base de datos.
* Una petición HTTP.
* Lectura de un archivo.
* Comunicación con otro servicio.

---

# Consumir una Promise

Las Promises pueden consumirse utilizando `async/await`.

En el controlador:

```javascript
const songs = await songsService.getSongs();
```

`await` espera hasta que la Promise termine.

Después de resolverse la Promise, el resultado se guarda en:

```javascript
songs
```

---

# `async`

Para poder utilizar `await`, el controlador se declara como función asíncrona:

```javascript
async function getSongs(req, res) {
}
```

Una función declarada con `async` siempre trabaja con Promises.

---

# `await`

`await` permite esperar el resultado de una Promise.

Ejemplo:

```javascript
const songs = await songsService.getSongs();
```

El código continúa cuando la Promise termina.

Esto permite escribir código asíncrono de una manera más sencilla de leer.

---

# `try/catch`

Los controladores utilizan:

```javascript
try {
  const songs = await songsService.getSongs();

  res.status(200).json({
    ok: true,
    data: songs
  });
} catch (error) {
  console.error(error);

  res.status(500).json({
    ok: false,
    message: "Error al obtener las canciones"
  });
}
```

El bloque `try` contiene la operación que puede producir un error.

El bloque `catch` permite manejar el error.

---

# Flujo completo

Cuando se realiza:

```text
GET /songs
```

el flujo es:

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
new Promise()
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

# Diferencia entre Promise y async/await

Una Promise puede manejarse directamente utilizando:

```javascript
getSongs()
  .then((songs) => {
    console.log(songs);
  })
  .catch((error) => {
    console.error(error);
  });
```

También puede utilizarse `async/await`:

```javascript
async function showSongs() {
  try {
    const songs = await getSongs();

    console.log(songs);
  } catch (error) {
    console.error(error);
  }
}
```

Ambas formas trabajan con Promises.

En este ejercicio se utiliza `async/await` porque facilita la lectura del flujo asíncrono.

---

# `resolve()` y `reject()`

Una Promise puede terminar correctamente mediante:

```javascript
resolve(resultado);
```

o puede terminar con un error mediante:

```javascript
reject(error);
```

Ejemplo:

```javascript
function example() {
  return new Promise((resolve, reject) => {
    const success = true;

    if (success) {
      resolve("Operacion exitosa");
    } else {
      reject(new Error("La operacion fallo"));
    }
  });
}
```

En este ejercicio no es necesario generar errores artificialmente en el servicio, pero el controlador ya utiliza `try/catch` para manejar posibles errores.

---

# Codigos HTTP utilizados

| Código | Significado           | Uso                        |
| ------ | --------------------- | -------------------------- |
| 200    | OK                    | Operación exitosa          |
| 400    | Bad Request           | Parámetro inválido         |
| 404    | Not Found             | Recurso o ruta inexistente |
| 500    | Internal Server Error | Error interno              |

---

# Casos de error contemplados

El proyecto maneja:

* ID inválido.
* ID inexistente.
* Género sin canciones.
* Género vacío.
* Ruta inexistente.
* Errores internos mediante `try/catch`.

---

# Checklist de validacion

* [x] Existe `package.json`.
* [x] Existe `package-lock.json`.
* [x] Existe una carpeta `src/`.
* [x] Se utiliza Express.
* [x] Se utilizan `Promise`.
* [x] Se utiliza `resolve()`.
* [x] Se utiliza `async`.
* [x] Se utiliza `await`.
* [x] Se utiliza `setTimeout()`.
* [x] Se utiliza `try/catch`.
* [x] Existe `GET /health`.
* [x] Existe `GET /songs`.
* [x] Existe `GET /songs/:id`.
* [x] Existe `GET /songs/genre/:genre`.
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
basico/ejercicio-11/resoluciones/joseph-ramirez/
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
main
```
