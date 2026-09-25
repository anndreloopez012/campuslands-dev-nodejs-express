# API de Música — Promesas Básicas

## 1. Descripción

Este proyecto implementa una API HTTP básica utilizando únicamente módulos nativos de **Node.js**.

La aplicación simula una pequeña base de datos de canciones almacenada en memoria y expone dos endpoints para consultar información.

El objetivo principal del ejercicio es demostrar el funcionamiento de las **Promises (Promesas)** en Node.js mediante operaciones asíncronas simuladas con `setTimeout()`.

### Tecnologías utilizadas

* Node.js
* Módulo nativo `http`
* JavaScript
* Promises
* `setTimeout()`
* Métodos de arrays
* JSON
* API HTTP

No se utilizan frameworks externos como Express.

---

# 2. Estructura del proyecto

El proyecto puede contener:

```text
proyecto/
│
├── wilder-catu.jjs
├── package.json
└── README.md
```

El archivo principal contiene toda la lógica de la API.

---

# 3. Módulo HTTP

El proyecto comienza importando el módulo `http`:

```js
const http = require('http');
```

`http` es un módulo nativo de Node.js que permite crear servidores HTTP sin instalar dependencias externas.

Posteriormente se utiliza:

```js
const server = http.createServer((req, res) => {
```

`createServer()` recibe una función callback que se ejecuta cada vez que llega una petición HTTP.

La función recibe dos objetos:

```text
req → Request
res → Response
```

### `req`

Contiene información sobre la petición realizada por el cliente.

En este ejercicio se utilizan:

```js
req.url
req.method
```

### `res`

Permite construir y enviar la respuesta al cliente.

Se utilizan:

```js
res.setHeader()
res.writeHead()
res.end()
```

---

# 4. Puerto del servidor

El servidor utiliza el puerto:

```js
const PORT = 3001;
```

Al iniciar correctamente aparece:

```text
Servidor de música corriendo en http://localhost:3001
```

Por lo tanto, la API estará disponible en:

```text
http://localhost:3001
```

---

# 5. Base de datos simulada

El proyecto no utiliza una base de datos real.

En su lugar, se utiliza un array:

```js
const canciones = [
  {
    id: 1,
    titulo: 'Bohemian Rhapsody',
    artista: 'Queen',
    genero: 'Rock',
    duracion: 354
  },
  ...
];
```

Este array funciona como una base de datos temporal en memoria.

Cada canción contiene:

| Campo      | Tipo   | Descripción          |
| ---------- | ------ | -------------------- |
| `id`       | Number | Identificador único  |
| `titulo`   | String | Nombre de la canción |
| `artista`  | String | Artista o grupo      |
| `genero`   | String | Género musical       |
| `duracion` | Number | Duración en segundos |

Ejemplo:

```js
{
  id: 1,
  titulo: 'Bohemian Rhapsody',
  artista: 'Queen',
  genero: 'Rock',
  duracion: 354
}
```

---

# 6. Promesas

El concepto principal del ejercicio son las **Promises**.

Una Promise representa el resultado futuro de una operación que puede:

```text
PENDING
   │
   ├──→ FULFILLED
   │
   └──→ REJECTED
```

En este proyecto se utilizan para simular consultas que tardan cierto tiempo.

---

# 7. Función `obtenerCanciones()`

La función:

```js
function obtenerCanciones() {
```

devuelve una Promise:

```js
return new Promise((resolve, reject) => {
```

La Promise tiene dos funciones importantes:

```text
resolve()
reject()
```

### `resolve()`

Se utiliza cuando la operación termina correctamente.

```js
resolve(canciones);
```

### `reject()`

Se utiliza cuando ocurre un problema:

```js
reject(new Error('No hay canciones disponibles'));
```

---

# 8. Simulación de una operación asíncrona

Dentro de la Promise se utiliza:

```js
setTimeout(() => {
```

con un tiempo de:

```js
500
```

milisegundos.

Esto simula una operación que tarda medio segundo.

El flujo es:

```text
obtenerCanciones()
        │
        ▼
new Promise()
        │
        ▼
setTimeout(500ms)
        │
        ▼
¿Hay canciones?
     /       \
   Sí         No
   │           │
   ▼           ▼
resolve()    reject()
```

La comprobación realizada es:

```js
if (canciones.length > 0)
```

Si existen canciones:

```js
resolve(canciones);
```

Si no existen:

```js
reject(new Error('No hay canciones disponibles'));
```

---

# 9. Función `buscarCancionPorId()`

La segunda función basada en Promises es:

```js
function buscarCancionPorId(id) {
```

También devuelve una Promise:

```js
return new Promise((resolve, reject) => {
```

Esta función busca una canción específica utilizando su ID.

---

# 10. Búsqueda mediante `find()`

La búsqueda se realiza con:

```js
const cancion = canciones.find(
  c => c.id === parseInt(id)
);
```

`find()` recorre el array y devuelve el primer elemento que cumple la condición.

El parámetro recibido inicialmente desde la URL es un texto.

Por ejemplo:

```text
/canciones/2
```

produce:

```js
id = "2"
```

Por eso se utiliza:

```js
parseInt(id)
```

para convertirlo en:

```js
2
```

Así puede compararse con:

```js
c.id
```

---

# 11. Resultado de la búsqueda

Si encuentra la canción:

```js
if (cancion) {
  resolve(cancion);
}
```

La Promise se resuelve correctamente.

Si no encuentra ninguna:

```js
reject(
  new Error(`Canción con ID ${id} no encontrada`)
);
```

La Promise queda rechazada.

---

# 12. Tiempo de la búsqueda

La búsqueda utiliza:

```js
setTimeout(() => {
```

con:

```js
300
```

milisegundos.

Por lo tanto:

```text
GET /canciones
       │
       └── espera simulada de 500 ms

GET /canciones/2
       │
       └── espera simulada de 300 ms
```

Estos tiempos no representan una base de datos real.

Su objetivo es demostrar cómo una operación asíncrona puede devolver posteriormente un resultado mediante una Promise.

---

# 13. Creación del servidor

El servidor se crea mediante:

```js
const server = http.createServer((req, res) => {
```

Cada petición pasa por esta función.

Primero se establece el tipo de contenido:

```js
res.setHeader(
  'Content-Type',
  'application/json'
);
```

Esto indica que las respuestas serán JSON.

---

# 14. Endpoint `GET /canciones`

La primera ruta es:

```text
GET /canciones
```

Se detecta mediante:

```js
if (
  req.url === '/canciones' &&
  req.method === 'GET'
)
```

Cuando se encuentra esta ruta se ejecuta:

```js
obtenerCanciones()
```

Como la función devuelve una Promise, se utiliza:

```js
.then(data => {
```

para recibir el resultado cuando la operación termina correctamente.

Después se responde:

```js
res.writeHead(200);
res.end(JSON.stringify(data));
```

El código HTTP:

```text
200 OK
```

indica que la petición fue procesada correctamente.

---

# 15. Manejo de errores en `GET /canciones`

La Promise también utiliza:

```js
.catch(error => {
```

Si `obtenerCanciones()` ejecuta:

```js
reject(...)
```

el error llega al `catch()`.

La respuesta será:

```js
res.writeHead(500);
```

Código:

```text
500 Internal Server Error
```

Y el cliente recibe:

```json
{
  "error": "No hay canciones disponibles"
}
```

---

# 16. Endpoint `GET /canciones/:id`

La segunda ruta permite obtener una canción específica.

Ejemplo:

```text
GET /canciones/2
```

La condición utilizada es:

```js
req.url.startsWith('/canciones/')
```

Esto permite detectar URLs como:

```text
/canciones/1
/canciones/2
/canciones/3
/canciones/4
```

---

# 17. Extracción del ID

Para obtener el ID se utiliza:

```js
const id = req.url.split('/')[2];
```

Por ejemplo:

```text
/canciones/3
```

se divide en:

```js
[
  '',
  'canciones',
  '3'
]
```

Por eso:

```js
req.url.split('/')[2]
```

devuelve:

```text
3
```

---

# 18. Consulta por ID

Después se ejecuta:

```js
buscarCancionPorId(id)
```

La Promise puede resolverse o rechazarse.

### Resultado correcto

Si existe la canción:

```js
.then(data => {
  res.writeHead(200);
  res.end(JSON.stringify(data));
})
```

Respuesta:

```text
200 OK
```

Ejemplo:

```json
{
  "id": 2,
  "titulo": "Billie Jean",
  "artista": "Michael Jackson",
  "genero": "Pop",
  "duracion": 294
}
```

---

# 19. Canción no encontrada

Si el ID no existe:

```js
.catch(error => {
```

captura el error producido por:

```js
reject(
  new Error(`Canción con ID ${id} no encontrada`)
);
```

La API devuelve:

```text
404 Not Found
```

Ejemplo:

```text
GET /canciones/99
```

Respuesta:

```json
{
  "error": "Canción con ID 99 no encontrada"
}
```

---

# 20. Ruta inexistente

Si el cliente solicita una ruta que no existe:

```js
else {
  res.writeHead(404);
  res.end(
    JSON.stringify({
      error: 'Ruta no encontrada'
    })
  );
}
```

Por ejemplo:

```text
GET /artistas
```

no está implementada.

La respuesta será:

```json
{
  "error": "Ruta no encontrada"
}
```

con código HTTP:

```text
404 Not Found
```

---

# 21. Códigos HTTP utilizados

La API utiliza tres códigos principales:

| Código | Significado           | Uso                           |
| ------ | --------------------- | ----------------------------- |
| `200`  | OK                    | Consulta exitosa              |
| `404`  | Not Found             | Canción o ruta inexistente    |
| `500`  | Internal Server Error | Error interno de la operación |

---

# 22. Flujo completo de una petición

Para:

```text
GET /canciones
```

el flujo es:

```text
Cliente
   │
   ▼
Servidor HTTP
   │
   ▼
Verificar URL y método
   │
   ▼
obtenerCanciones()
   │
   ▼
new Promise()
   │
   ▼
setTimeout(500 ms)
   │
   ▼
Comprobar canciones
   │
   ├───────────────┐
   │               │
   ▼               ▼
resolve()        reject()
   │               │
   ▼               ▼
.then()          .catch()
   │               │
   ▼               ▼
200 OK           500 Error
```

Para:

```text
GET /canciones/2
```

el flujo es:

```text
Cliente
   │
   ▼
Servidor HTTP
   │
   ▼
Extraer ID
   │
   ▼
buscarCancionPorId()
   │
   ▼
new Promise()
   │
   ▼
setTimeout(300 ms)
   │
   ▼
find()
   │
   ├───────────────┐
   │               │
   ▼               ▼
Canción          No existe
   │               │
   ▼               ▼
resolve()        reject()
   │               │
   ▼               ▼
.then()          .catch()
   │
```
