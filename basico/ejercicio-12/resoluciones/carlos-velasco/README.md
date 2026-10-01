# BASICO 12 - Async Await

## 1. Nombre

Async/await con Node.js y Express.

## 2. Objetivo

Crear una pequeña API relacionada con películas de miedo para practicar el uso de `async/await` en operaciones asíncronas.

La aplicación utiliza una Promise en el servicio y `async/await` en el controlador para consumir su resultado.

## 3. Concepto principal

`async/await` es una sintaxis de JavaScript que permite trabajar con Promises de una manera más sencilla de leer.

Una función que utiliza `await` debe estar declarada como `async`:

```js
const obtenerDatos = async () => {
  const datos = await operacionAsincrona();

  return datos;
};
```

En este ejercicio:

- `async` permite utilizar `await` dentro del controlador.
- `await` espera el resultado de una Promise.
- `try/catch` permite manejar errores de la operación asíncrona.
- El servicio contiene la lógica de negocio.
- El controlador gestiona la petición y respuesta HTTP.

## 4. Relación entre Promise y async/await

El servicio devuelve una Promise:

```js
return new Promise((resolve, reject) => {
  // operación asíncrona
});
```

El controlador consume esa Promise utilizando:

```js
const movie = await movieService.getMovie(movieId);
```

Por lo tanto, `async/await` no elimina las Promises.

`await` trabaja sobre el resultado de una Promise.

## 5. Tecnologías

- Node.js 20+
- Express
- JavaScript
- Promises
- async/await
- HTTP

## 6. Estructura

```text
resoluciones/carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── routes/
    │   └── movie.routes.js
    ├── controllers/
    │   └── movie.controller.js
    └── services/
        └── movie.service.js
```

## 7. Instalación

Desde la carpeta de la entrega:

```bash
npm install
```

## 8. Ejecución

Modo normal:

```bash
npm start
```

Modo desarrollo:

```bash
npm run dev
```

El servidor utiliza el puerto:

```text
3000
```

## 9. Endpoints

### Health check

```http
GET /health
```

Comprueba que el servidor está funcionando.

### Obtener una película

```http
GET /movies/:id
```

Ejemplo:

```http
GET /movies/1
```

## 10. Ejemplo de petición

```bash
curl http://localhost:3000/movies/1
```

## 11. Respuesta exitosa

```json
{
  "ok": true,
  "message": "Pelicula obtenida correctamente",
  "topic": "async await",
  "data": {
    "id": 1,
    "title": "The Conjuring",
    "year": 2013,
    "genre": "Terror",
    "duration": "1h 52min"
  }
}
```

## 12. Manejo de errores

El servicio rechaza la Promise cuando el identificador no es válido.

Por ejemplo:

```bash
curl http://localhost:3000/movies/abc
```

La API responde:

```json
{
  "ok": false,
  "message": "El identificador de la pelicula no es valido"
}
```

con código HTTP:

```text
400 Bad Request
```

También se puede probar con un identificador negativo:

```bash
curl http://localhost:3000/movies/-1
```

## 13. Ruta inexistente

Si se solicita una ruta que no existe:

```bash
curl http://localhost:3000/otra-ruta
```

la API responde:

```json
{
  "ok": false,
  "message": "Ruta no encontrada"
}
```

con:

```text
404 Not Found
```

## 14. Flujo de ejecución

```text
Cliente
   |
   v
GET /movies/1
   |
   v
Route
   |
   v
Controller
   |
   v
async function
   |
   v
await Promise
   |
   v
Service
   |
   +---- resolve() ----> resultado
   |
   +---- reject() -----> catch
   |
   v
HTTP Response
```

## 15. Comparación con `.then()` y `.catch()`

Una Promise puede consumirse directamente utilizando:

```js
movieService
  .getMovie(movieId)
  .then((movie) => {
    // resultado
  })
  .catch((error) => {
    // error
  });
```

Con `async/await` se puede escribir:

```js
try {
  const movie = await movieService.getMovie(movieId);

  // resultado
} catch (error) {
  // error
}
```

Ambas formas trabajan con Promises.

La diferencia principal es la sintaxis utilizada para consumir la operación asíncrona.

## 16. Validación

La entrega puede validarse comprobando:

- `npm install` instala correctamente las dependencias.
- `npm start` inicia el servidor.
- `npm run dev` inicia el servidor en modo desarrollo.
- `GET /health` responde correctamente.
- `GET /movies/1` devuelve una película.
- El controlador utiliza `async`.
- El controlador utiliza `await`.
- La operación está protegida mediante `try/catch`.
- Una entrada inválida produce un error controlado.
- Una ruta inexistente devuelve `404`.

## 17. Conceptos practicados

- Funciones asíncronas.
- Promises.
- `async`.
- `await`.
- `try/catch`.
- `resolve()`.
- `reject()`.
- Express.
- Rutas.
- Controladores.
- Servicios.
- Manejo de errores.
- Códigos HTTP.
- Separación de responsabilidades.