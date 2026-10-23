# BASICO 11 - Promesas basicas

## 1. Nombre

Promesas básicas con Node.js y Express.

## 2. Objetivo

Crear una pequeña API relacionada con música para practicar el funcionamiento de las Promises de JavaScript.

El ejercicio utiliza una Promise para simular una operación asíncrona que obtiene información de una canción.

## 3. Concepto principal

Una Promise representa el resultado eventual de una operación asíncrona.

Una Promise puede encontrarse conceptualmente en uno de estos estados:

```text
pending
   |
   +----> fulfilled
   |
   +----> rejected
```

### `pending`

La operación todavía no ha terminado.

### `fulfilled`

La operación terminó correctamente.

Se obtiene mediante:

```js
resolve(resultado);
```

### `rejected`

La operación terminó con un error.

Se obtiene mediante:

```js
reject(error);
```

## 4. Manejo de Promises

En este ejercicio se utiliza:

```js
promise
  .then((resultado) => {
    // Operacion exitosa
  })
  .catch((error) => {
    // Error
  });
```

`then()` procesa el resultado cuando la Promise se resuelve.

`catch()` procesa el error cuando la Promise es rechazada.

## 5. Tecnologías

- Node.js 20+
- Express
- JavaScript
- Promises
- HTTP

## 6. Estructura

```text
resoluciones/carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── routes/
    │   └── music.routes.js
    ├── controllers/
    │   └── music.controller.js
    └── services/
        └── music.service.js
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

### Obtener una canción

```http
GET /songs/:id
```

Ejemplo:

```http
GET /songs/1
```

El servicio crea una Promise y simula una operación asíncrona antes de devolver la información.

## 10. Ejemplo de petición

```bash
curl http://localhost:3000/songs/1
```

## 11. Respuesta exitosa

```json
{
  "ok": true,
  "message": "Cancion obtenida correctamente",
  "topic": "promesas basicas",
  "data": {
    "id": 1,
    "title": "Bohemian Rhapsody",
    "artist": "Queen",
    "genre": "Rock",
    "duration": "5:55"
  }
}
```

## 12. Manejo de errores

El servicio rechaza la Promise cuando el identificador no es válido.

Por ejemplo:

```bash
curl http://localhost:3000/songs/abc
```

La API responde:

```json
{
  "ok": false,
  "message": "El identificador de la cancion no es valido"
}
```

con código HTTP:

```text
400 Bad Request
```

También se puede probar con un identificador negativo:

```bash
curl http://localhost:3000/songs/-1
```

## 13. Flujo de ejecución

```text
Cliente
   |
   v
GET /songs/1
   |
   v
Route
   |
   v
Controller
   |
   v
Service
   |
   v
new Promise()
   |
   +---- resolve() ----> .then()
   |                         |
   |                         v
   |                    HTTP 200
   |
   +---- reject() -----> .catch()
                             |
                             v
                         HTTP 400
```

## 14. Diferencia con async/await

Una Promise puede manejarse directamente mediante:

```js
musicService
  .getSong(songId)
  .then((song) => {
    // Resultado
  })
  .catch((error) => {
    // Error
  });
```

Mientras que `async/await` permite escribir una forma más secuencial:

```js
try {
  const song = await musicService.getSong(songId);
} catch (error) {
  // Error
}
```

`async/await` utiliza Promises internamente. Por eso es importante comprender primero qué es una Promise.

## 15. Validación

La entrega puede validarse comprobando:

- `npm install` instala correctamente las dependencias.
- `npm start` inicia el servidor.
- `npm run dev` inicia el servidor en modo desarrollo.
- `GET /health` responde correctamente.
- `GET /songs/1` devuelve una canción.
- El servicio utiliza `new Promise()`.
- Una operación exitosa utiliza `resolve()`.
- Una operación inválida utiliza `reject()`.
- `.then()` procesa el resultado.
- `.catch()` procesa el error.
- Una ruta inexistente devuelve `404`.

## 16. Conceptos practicados

- Promise.
- `resolve()`.
- `reject()`.
- `then()`.
- `catch()`.
- Operaciones asíncronas.
- Express.
- Rutas.
- Controladores.
- Servicios.
- Códigos HTTP.
- Manejo de errores.
- Separación de responsabilidades.