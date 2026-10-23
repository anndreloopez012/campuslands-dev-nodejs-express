# BASICO 12 - Async Await

## Autor

Joseph Ramirez

## Tematica

Peliculas de miedo

## Tema del ejercicio

Uso de `async` y `await` en Node.js.

## Objetivo

Crear una pequeña API con Node.js y Express para practicar el uso de funciones asíncronas mediante:

* `async`
* `await`
* `Promise`
* `setTimeout`
* `try/catch`

El proyecto utiliza datos de películas de miedo y simula operaciones que tardan en responder.

El objetivo principal es comprender cómo una función asíncrona puede esperar el resultado de una Promise utilizando `await`.

---

# Tecnologias utilizadas

* Node.js 20 o superior recomendado.
* Express.
* JavaScript.
* Promise.
* async.
* await.
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
    │   └── movies.controller.js
    ├── routes/
    │   └── movies.routes.js
    └── services/
        └── movies.service.js
```

---

# Descripcion de archivos

## `src/app.js`

Es el punto de entrada de la aplicación.

Sus responsabilidades son:

* Crear la aplicación Express.
* Configurar `express.json()`.
* Registrar las rutas.
* Crear el endpoint `/health`.
* Manejar rutas inexistentes.
* Iniciar el servidor.

---

## `src/routes/movies.routes.js`

Contiene las rutas relacionadas con las películas.

Endpoints:

```text
GET /movies
GET /movies/:id
GET /movies/genre/:genre
GET /movies/top-rated
```

Las rutas delegan el procesamiento a los controladores.

---

## `src/controllers/movies.controller.js`

Se encarga de:

* Recibir las peticiones.
* Validar parámetros.
* Utilizar `await`.
* Crear las respuestas HTTP.
* Manejar errores con `try/catch`.

Los controladores están declarados utilizando:

```javascript
async function
```

---

## `src/services/movies.service.js`

Contiene los datos y la lógica de negocio.

Las funciones del servicio son asíncronas:

```javascript
async function getAllMovies()
```

```javascript
async function getMovieById(id)
```

```javascript
async function getMoviesByGenre(genre)
```

```javascript
async function getHighestRatedMovie()
```

Cada función utiliza `await` para esperar una operación simulada.

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
  "topic": "async await"
}
```

Código HTTP:

```text
200 OK
```

---

# GET `/movies`

Obtiene todas las películas.

Ejecutar:

```bash
curl http://localhost:3000/movies
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Peliculas obtenidas correctamente",
  "total": 4,
  "data": [
    {
      "id": 1,
      "titulo": "La Casa de las Sombras",
      "director": "Daniel Morgan",
      "anio": 2022,
      "genero": "Terror",
      "calificacion": 8.1
    },
    {
      "id": 2,
      "titulo": "El Ultimo Susurro",
      "director": "Laura Bennett",
      "anio": 2023,
      "genero": "Terror Psicologico",
      "calificacion": 8.5
    },
    {
      "id": 3,
      "titulo": "Noche en el Bosque",
      "director": "Michael Stone",
      "anio": 2021,
      "genero": "Slasher",
      "calificacion": 7.6
    },
    {
      "id": 4,
      "titulo": "La Habitacion 13",
      "director": "Sarah Collins",
      "anio": 2024,
      "genero": "Terror Sobrenatural",
      "calificacion": 8.8
    }
  ]
}
```

Código HTTP:

```text
200 OK
```

La respuesta tarda aproximadamente 500 milisegundos debido a la operación asíncrona simulada.

---

# GET `/movies/:id`

Permite buscar una película mediante su ID.

Ejecutar:

```bash
curl http://localhost:3000/movies/1
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Pelicula encontrada correctamente",
  "data": {
    "id": 1,
    "titulo": "La Casa de las Sombras",
    "director": "Daniel Morgan",
    "anio": 2022,
    "genero": "Terror",
    "calificacion": 8.1
  }
}
```

Código HTTP:

```text
200 OK
```

---

# Buscar una pelicula inexistente

Ejecutar:

```bash
curl http://localhost:3000/movies/999
```

Respuesta esperada:

```json
{
  "ok": false,
  "message": "Pelicula no encontrada"
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
curl http://localhost:3000/movies/abc
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

# GET `/movies/genre/:genre`

Permite buscar películas por género.

Ejecutar:

```bash
curl http://localhost:3000/movies/genre/Rock
```

En este ejercicio no existe el género `Rock`, por lo que se obtiene:

```json
{
  "ok": false,
  "message": "No se encontraron peliculas de ese genero"
}
```

Para obtener un resultado exitoso se puede ejecutar:

```bash
curl http://localhost:3000/movies/genre/Terror
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Peliculas encontradas correctamente",
  "total": 1,
  "data": [
    {
      "id": 1,
      "titulo": "La Casa de las Sombras",
      "director": "Daniel Morgan",
      "anio": 2022,
      "genero": "Terror",
      "calificacion": 8.1
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
curl http://localhost:3000/movies/genre/Slasher
```

---

# GET `/movies/top-rated`

Obtiene la película con la calificación más alta.

Ejecutar:

```bash
curl http://localhost:3000/movies/top-rated
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Pelicula mejor calificada obtenida correctamente",
  "data": {
    "id": 4,
    "titulo": "La Habitacion 13",
    "director": "Sarah Collins",
    "anio": 2024,
    "genero": "Terror Sobrenatural",
    "calificacion": 8.8
  }
}
```

Código HTTP:

```text
200 OK
```

---

# Ruta inexistente

Ejecutar:

```bash
curl http://localhost:3000/horror
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

# Concepto principal: async/await

`async/await` permite trabajar con operaciones asíncronas utilizando una sintaxis más sencilla de leer.

Una función puede declararse como:

```javascript
async function getMovies() {
}
```

Al utilizar `async`, la función trabaja de forma asíncrona y devuelve una Promise.

---

# ¿Que hace await?

`await` permite esperar el resultado de una Promise.

Por ejemplo:

```javascript
const movies = await moviesService.getAllMovies();
```

La ejecución de esa función continúa cuando la Promise termina.

---

# Ejemplo utilizado en el proyecto

En el servicio:

```javascript
async function getAllMovies() {
  const result = await simulateAsyncOperation(movies);

  return result;
}
```

Primero se llama:

```javascript
simulateAsyncOperation(movies)
```

Esta función devuelve una Promise.

Después:

```javascript
await
```

espera el resultado.

Finalmente:

```javascript
return result;
```

devuelve las películas.

---

# Funcion asincrona simulada

El proyecto utiliza:

```javascript
function simulateAsyncOperation(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, 500);
  });
}
```

Esto simula una operación que tarda en responder.

El flujo es:

```text
Crear Promise
     ↓
Esperar 500 ms
     ↓
resolve(data)
     ↓
await recibe el resultado
     ↓
Continuar ejecución
```

---

# async en el controlador

El controlador utiliza:

```javascript
async function getMovies(req, res) {
```

Esto permite utilizar:

```javascript
await moviesService.getAllMovies();
```

Ejemplo:

```javascript
async function getMovies(req, res) {
  try {
    const movies = await moviesService.getAllMovies();

    res.status(200).json({
      ok: true,
      data: movies
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener las peliculas"
    });
  }
}
```

---

# try/catch con async/await

Una operación asíncrona puede generar errores.

Por eso se utiliza:

```javascript
try {
  const movies = await moviesService.getAllMovies();

  res.status(200).json({
    ok: true,
    data: movies
  });
} catch (error) {
  console.error(error);

  res.status(500).json({
    ok: false,
    message: "Error al obtener las peliculas"
  });
}
```

El flujo es:

```text
try
 ↓
await
 ↓
Promise
 ↓
resultado
 ↓
respuesta HTTP
```

Si ocurre un error:

```text
try
 ↓
await
 ↓
error
 ↓
catch
 ↓
HTTP 500
```

---

# async/await frente a then/catch

Una Promise puede manejarse utilizando `.then()`:

```javascript
getAllMovies()
  .then((movies) => {
    console.log(movies);
  })
  .catch((error) => {
    console.error(error);
  });
```

También puede manejarse utilizando `async/await`:

```javascript
async function showMovies() {
  try {
    const movies = await getAllMovies();

    console.log(movies);
  } catch (error) {
    console.error(error);
  }
}
```

Ambas formas trabajan con Promises.

En este ejercicio se utiliza `async/await` para practicar específicamente este concepto.

---

# Diferencia entre async y await

## `async`

Declara una función asíncrona:

```javascript
async function getMovies() {
}
```

## `await`

Espera el resultado de una Promise:

```javascript
const movies = await getMovies();
```

Se utilizan normalmente juntos:

```javascript
async function example() {
  const result = await somePromise();
}
```

---

# Flujo completo de una peticion

Cuando el cliente realiza:

```text
GET /movies
```

ocurre:

```text
Cliente
   |
   v
Route
   |
   v
Controller
   |
   | async
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
await recibe resultado
   |
   v
Controller
   |
   v
HTTP 200
```

---

# Ventajas de async/await

`async/await` permite:

* Escribir código asíncrono más legible.
* Evitar cadenas extensas de `.then()`.
* Manejar errores con `try/catch`.
* Separar mejor la lógica de negocio.
* Facilitar la lectura del flujo de una operación.

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
* Género sin películas.
* Género vacío.
* Ruta inexistente.
* Errores internos mediante `try/catch`.

---

# Checklist de validacion

* [x] Existe `package.json`.
* [x] Existe `package-lock.json`.
* [x] Existe una carpeta `src/`.
* [x] Se utiliza Express.
* [x] Se utilizan funciones `async`.
* [x] Se utiliza `await`.
* [x] Se utilizan Promises.
* [x] Se utiliza `setTimeout()`.
* [x] Se utiliza `try/catch`.
* [x] Existe `GET /health`.
* [x] Existe `GET /movies`.
* [x] Existe `GET /movies/:id`.
* [x] Existe `GET /movies/genre/:genre`.
* [x] Existe `GET /movies/top-rated`.
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
basico/ejercicio-12/resoluciones/joseph-ramirez/
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
