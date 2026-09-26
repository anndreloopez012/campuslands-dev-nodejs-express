# API de Películas de Miedo — Promesas Básicas

## 1. Descripción

Este proyecto implementa una API HTTP básica utilizando exclusivamente módulos nativos de **Node.js**.

La aplicación simula una pequeña base de datos de películas de miedo almacenada en memoria y proporciona endpoints para:

* Obtener todas las películas.
* Buscar películas por año.
* Manejar errores mediante Promises.

El objetivo principal es practicar el uso de **Promises**, `.then()` y `.catch()` dentro de una API HTTP.

No se utiliza Express ni ninguna dependencia externa.

---

# 2. Tecnologías utilizadas

* Node.js
* JavaScript
* Módulo nativo `http`
* Promises
* `setTimeout()`
* Arrays
* `filter()`
* `parseInt()`
* JSON
* HTTP

---

# 3. Puerto

El servidor utiliza el puerto:

```js
const PORT = 3002;
```

Por lo tanto, la aplicación estará disponible en:

```text
http://localhost:3002
```

Al iniciar correctamente se muestra:

```text
Servidor de películas de miedo corriendo en http://localhost:3002
```

---

# 4. Base de datos simulada

El proyecto utiliza un array de JavaScript como una base de datos temporal:

```js
const peliculas = [
  {
    id: 1,
    titulo: 'El Exorcista',
    anio: 1973,
    director: 'William Friedkin',
    rating: 8.0
  },
  ...
];
```

No existe una base de datos externa.

Los datos permanecen únicamente en la memoria del proceso de Node.js.

Si el servidor se detiene, los datos vuelven a los valores definidos directamente en el código.

---

# 5. Estructura de una película

Cada objeto contiene cinco propiedades:

| Propiedad  | Tipo   | Descripción                  |
| ---------- | ------ | ---------------------------- |
| `id`       | Number | Identificador de la película |
| `titulo`   | String | Nombre de la película        |
| `anio`     | Number | Año de estreno               |
| `director` | String | Director                     |
| `rating`   | Number | Calificación                 |

Ejemplo:

```js
{
  id: 1,
  titulo: 'El Exorcista',
  anio: 1973,
  director: 'William Friedkin',
  rating: 8.0
}
```

---

# 6. Concepto principal: Promises

El concepto principal de este ejercicio son las **Promises**.

Una Promise representa el resultado futuro de una operación.

Una Promise puede encontrarse en diferentes estados:

```text
PENDING
   │
   ├─── FULFILLED
   │
   └─── REJECTED
```

En este proyecto las Promises se utilizan para simular operaciones asíncronas.

---

# 7. Función `obtenerPeliculas()`

La función:

```js
function obtenerPeliculas() {
```

devuelve una Promise:

```js
return new Promise((resolve, reject) => {
```

La operación utiliza:

```js
setTimeout(() => {
  resolve(peliculas);
}, 500);
```

El `setTimeout()` introduce una espera artificial de:

```text
500 milisegundos
```

Esto permite simular una operación que podría representar una consulta a una base de datos o un servicio externo.

---

# 8. `resolve()`

Cuando la operación termina correctamente se utiliza:

```js
resolve(peliculas);
```

Esto significa que la Promise se completó correctamente y entrega como resultado el array completo de películas.

Posteriormente ese resultado puede recibirse mediante:

```js
.then(data => {
```

---

# 9. Función `buscarPorAnio()`

La segunda función importante es:

```js
function buscarPorAnio(anio) {
```

Esta función recibe un año y busca todas las películas que pertenecen a ese año.

También devuelve una Promise:

```js
return new Promise((resolve, reject) => {
```

La operación espera:

```text
300 milisegundos
```

mediante:

```js
setTimeout(() => {
```

---

# 10. Conversión del año

El parámetro recibido desde la URL inicialmente es un texto.

Por ejemplo:

```text
/peliculas/anio/1980
```

produce:

```js
anio = "1980";
```

Por eso se utiliza:

```js
parseInt(anio)
```

para convertirlo a un número:

```text
"1980" → 1980
```

---

# 11. Filtrado con `filter()`

La búsqueda se realiza utilizando:

```js
const resultado = peliculas.filter(
  p => p.anio === parseInt(anio)
);
```

`filter()` recorre todas las películas y devuelve un nuevo array con los elementos que cumplen la condición.

Por ejemplo:

```text
películas:

1973
1980
1984
1980
```

Si se solicita:

```text
1980
```

el resultado será:

```text
El Resplandor
Viernes 13
```

---

# 12. Resultado encontrado

Después de ejecutar el filtro se comprueba:

```js
if (resultado.length > 0)
```

Si existe al menos una película:

```js
resolve(resultado);
```

La Promise se resuelve correctamente.

---

# 13. Resultado no encontrado

Si no existen películas para el año solicitado:

```js
reject(
  new Error(`No se encontraron películas del año ${anio}`)
);
```

La Promise se rechaza.

Posteriormente el error será manejado mediante:

```js
.catch(error => {
```

---

# 14. Creación del servidor HTTP

El servidor se crea con:

```js
const server = http.createServer((req, res) => {
```

El módulo `http` pertenece a Node.js y permite crear servidores sin utilizar frameworks externos.

El callback recibe:

```text
req → información de la petición
res → objeto utilizado para responder
```

---

# 15. Content-Type

Todas las respuestas utilizan:

```js
res.setHeader(
  'Content-Type',
  'application/json'
);
```

Esto indica al cliente que la respuesta contiene información en formato JSON.

---

# 16. Endpoint `GET /peliculas`

La primera ruta disponible es:

```text
GET /peliculas
```

Se detecta mediante:

```js
if (
  req.url === '/peliculas' &&
  req.method === 'GET'
)
```

Cuando se recibe esta petición se ejecuta:

```js
obtenerPeliculas()
```

Como devuelve una Promise, se utiliza:

```js
.then(data => {
```

Cuando la Promise se resuelve, `data` contiene todas las películas.

---

# 17. Respuesta exitosa

Cuando la operación termina correctamente:

```js
res.writeHead(200);

res.end(JSON.stringify(data));
```

El servidor devuelve:

```text
200 OK
```

Ejemplo de respuesta:

```json
[
  {
    "id": 1,
    "titulo": "El Exorcista",
    "anio": 1973,
    "director": "William Friedkin",
    "rating": 8
  },
  {
    "id": 2,
    "titulo": "El Resplandor",
    "anio": 1980,
    "director": "Stanley Kubrick",
    "rating": 8.4
  }
]
```

---

# 18. Manejo de errores de `/peliculas`

La operación también incluye:

```js
.catch(error => {
```

Si la Promise fuese rechazada, se ejecutaría este bloque.

La respuesta sería:

```js
res.writeHead(500);
```

y:

```js
res.end(
  JSON.stringify({
    error: error.message
  })
);
```

El código HTTP utilizado sería:

```text
500 Internal Server Error
```

---

# 19. Endpoint `GET /peliculas/anio/:anio`

La segunda ruta permite buscar películas por año.

Ejemplo:

```text
GET /peliculas/anio/1980
```

La ruta se identifica mediante:

```js
req.url.startsWith('/peliculas/anio/')
```

y además se verifica:

```js
req.method === 'GET'
```

---

# 20. Obtención del año desde la URL

El año se extrae mediante:

```js
const anio = req.url.split('/')[3];
```

Por ejemplo:

```text
/peliculas/anio/1980
```

se divide en:

```text
[
  '',
  'peliculas',
  'anio',
  '1980'
]
```

Por lo tanto:

```js
req.url.split('/')[3]
```

devuelve:

```text
1980
```

---

# 21. Búsqueda por año

Una vez obtenido el año se ejecuta:

```js
buscarPorAnio(anio)
```

Esta función devuelve una Promise.

El resultado se procesa mediante:

```js
.then(data => {
```

Si existen películas:

```js
res.writeHead(200);

res.end(JSON.stringify(data));
```

---

# 22. Ejemplo de búsqueda

Petición:

```text
GET /peliculas/anio/1980
```

La función:

```js
peliculas.filter(
  p => p.anio === parseInt(anio)
);
```

encuentra:

```text
El Resplandor
Viernes 13
```

La respuesta será:

```json
[
  {
    "id": 2,
    "titulo": "El Resplandor",
    "anio": 1980,
    "director": "Stanley Kubrick",
    "rating": 8.4
  },
  {
    "id": 4,
    "titulo": "Viernes 13",
    "anio": 1980,
    "director": "Sean S. Cunningham",
    "rating": 6.5
  }
]
```

---

# 23. Año sin películas

Si se solicita un año que no existe:

```text
GET /peliculas/anio/2000
```

El método `filter()` devuelve:

```js
[]
```

Por lo tanto:

```js
resultado.length > 0
```

será:

```text
false
```

La función ejecutará:

```js
reject(
  new Error(`No se encontraron películas del año ${anio}`)
);
```

El error llegará al:

```js
.catch(error => {
```

y la API responderá:

```text
404 Not Found
```

con:

```json
{
  "error": "No se encontraron películas del año 2000"
}
```

---

# 24. Ruta inexistente

Si el cliente solicita una ruta que no está definida:

```text
GET /actores
```

ninguna de las condiciones anteriores será verdadera.

Por lo tanto se ejecutará:

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

Respuesta:

```json
{
  "error": "Ruta no encontrada"
}
```

Código HTTP:

```text
404 Not Found
```

---

# 25. Códigos HTTP utilizados

| Código | Significado           | Situación                             |
| ------ | --------------------- | ------------------------------------- |
| `200`  | OK                    | Consulta realizada correctamente      |
| `404`  | Not Found             | Año sin resultados o ruta inexistente |
| `500`  | Internal Server Error | Error interno de la operación         |

---

# 26. Flujo de `GET /peliculas`

```text
Cliente
   │
   ▼
GET /peliculas
   │
   ▼
Servidor HTTP
   │
   ▼
obtenerPeliculas()
   │
   ▼
new Promise()
   │
   ▼
setTimeout(500 ms)
   │
   ▼
resolve(peliculas)
   │
   ▼
.then()
   │
   ▼
JSON.stringify()
   │
   ▼
HTTP 200
   │
   ▼
Cliente
```

---

# 27. Flujo de `GET /peliculas/anio/:anio`

```text
Cliente
   │
   ▼
GET /peliculas/anio/1980
   │
   ▼
Extraer año
   │
   ▼
buscarPorAnio(1980)
   │
   ▼
new Promise()
   │
   ▼
setTimeout(300 ms)
   │
   ▼
filter()
   │
   ├──────────────┐
   │              │
   ▼              ▼
Resultados       Sin resultados
   │              │
   ▼              ▼
resolve()        reject()
   │              │
   ▼              ▼
.then()          .catch()
   │              │
   ▼              ▼
HTTP 200         HTTP 404
```

---

# 28. Rutas disponibles

| Método | Ruta                    | Función                     |
| ------ | ----------------------- | --------------------------- |
| `GET`  | `/peliculas`            | Obtener todas las películas |
| `GET`  | `/peliculas/anio/:anio` | Buscar películas por año    |
| `GET`  | Cualquier otra ruta     | Error de ruta               |

Ejemplos:

```text
GET /peliculas
GET /peliculas/anio/1973
GET /peliculas/anio/1980
GET /peliculas/anio/1984
```

---

# 29. Pruebas con `curl`

## Obtener todas las películas

```bash
curl http://localhost:3002/peliculas
```

---

## Buscar películas de 1980

```bash
curl http://localhost:3002/peliculas/anio/1980
```

Resultado esperado:

```text
El Resplandor
Viernes 13
```

---

## Buscar películas de 1973

```bash
curl http://localhost:3002/peliculas/anio/1973
```

Resultado esperado:

```text
El Exorcista
```

---

## Buscar películas de 2000

```bash
curl http://localhost:3002/peliculas/anio/2000
```

Resultado esperado:

```json
{
  "error": "No se encontraron películas del año 2000"
}
```

---

## Probar una ruta inexistente

```bash
curl http://localhost:3002/directores
```

Resultado:

```json
{
  "error": "Ruta no encontrada"
}
```

---

# 30. Ejecución

Si el archivo se llama:

```text
wilder-catu.jjs
```

se puede iniciar con:

```bash
node wilder-catu.jjs
```

Después aparecerá:

```text
Servidor de películas de miedo corriendo en http://localhost:3002
```

La API estará disponible en:

```text
http://localhost:3002
```

---

# 31. Conceptos aprendidos

Este ejercicio permite practicar:

## `http.createServer()`

Creación de un servidor HTTP utilizando Node.js.

## `Promise`

Representación de una operación que finalizará posteriormente.

## `resolve()`

Indica que una operación terminó correctamente.

## `reject()`

Indica que una operación terminó con un error.

## `.then()`

Procesa el resultado exitoso de una Promise.

## `.catch()`

Procesa el error de una Promise.

## `setTimeout()`

Simula una operación que tarda un determinado tiempo.

## `filter()`

Permite obtener todas las películas que cumplen una condición.

## `parseInt()`

Convierte el año recibido como texto en un número entero.

## `JSON.stringify()`

Convierte los objetos JavaScript en una cadena JSON para enviarla al cliente.

---

# 32. Arquitectura simplificada

```text
                 CLIENTE
                    │
                    ▼
              HTTP REQUEST
                    │
                    ▼
          ┌──────────────────┐
          │  Node.js HTTP    │
          │     Server       │
          └────────┬─────────┘
                   │
          ┌────────┴─────────┐
          │                  │
          ▼                  ▼
    /peliculas       /peliculas/anio/:anio
          │                  │
          ▼                  ▼
obtenerPeliculas()    buscarPorAnio()
          │                  │
          ▼                  ▼
      Promise            Promise
          │                  │
          ▼                  ▼
     resolve()           filter()
          │                  │
          ▼             ┌────┴────┐
        .then()         │         │
          │             ▼         ▼
          │          resolve    reject
          │             │         │
          ▼             ▼         ▼
       HTTP 200      .then()   .catch()
                                  │
                                  ▼
                               HTTP 404
```

---

# 33. Limitaciones

Este proyecto está diseñado para fines educativos.

No utiliza:

* Express
* MongoDB
* MySQL
* PostgreSQL
* Base de datos externa
* Middleware
* Autenticación
* Variables de entorno
* Persistencia de datos
* Validación avanzada
* Arquitectura MVC

La información se encuentra directamente en:

```js
const peliculas = [];
```

Por lo tanto, no existe persistencia.

---

# 34. Importancia de las Promises en este ejercicio

El objetivo principal es comprender cómo una función puede devolver una operación que todavía no ha terminado.

Por ejemplo:

```js
buscarPorAnio(anio)
```

no devuelve directamente el array de películas.

Devuelve:

```js
Promise
```

Después podemos esperar su resultado mediante:

```js
buscarPorAnio(anio)
  .then(data => {
    // resultado exitoso
  })
  .catch(error => {
    // resultado con error
  });
```

Este patrón es fundamental para comprender posteriormente conceptos como:

```text
Promises
    ↓
async / await
    ↓
fs/promises
    ↓
consultas a bases de datos
    ↓
APIs externas
    ↓
backend profesional
```

---

# 35. Resumen técnico

La aplicación es una API HTTP sencilla desarrollada con Node.js que utiliza un array en memoria como fuente de datos.

La API proporciona dos operaciones principales:

```text
GET /peliculas
```

para obtener todas las películas.

Y:

```text
GET /peliculas/anio/:anio
```

para filtrar películas según su año de estreno.

Ambas operaciones utilizan **Promises** y `setTimeout()` para simular procesos asíncronos.

La resolución correcta de una Promise se procesa mediante:

```js
.then()
```

mientras que los errores se controlan mediante:

```js
.catch()
```

El ejercicio permite comprender el flujo fundamental:

```text
Petición HTTP
      ↓
Función asíncrona
      ↓
Promise
      ↓
resolve / reject
      ↓
then / catch
      ↓
Respuesta HTTP
```

Este patrón constituye una base importante para continuar aprendiendo desarrollo backend con Node.js.

```
```
