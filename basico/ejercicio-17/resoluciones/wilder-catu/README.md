# Viajes y Turismo — Promesas Básicas

## Descripción

Este ejercicio implementa un servidor HTTP utilizando **Node.js** y el módulo nativo `http`, orientado al tema de **viajes y turismo**.

La aplicación administra una colección de destinos turísticos y utiliza **Promises** para simular operaciones asíncronas, permitiendo:

* Obtener todos los destinos disponibles.
* Buscar destinos cuyo precio sea menor o igual a un presupuesto máximo.
* Manejar resultados exitosos mediante `resolve`.
* Manejar búsquedas sin resultados mediante `reject`.
* Responder utilizando códigos de estado HTTP.

El objetivo principal es practicar el uso básico de **promesas en JavaScript dentro de un servidor HTTP**.

---

## Tecnologías utilizadas

* Node.js
* JavaScript
* Módulo nativo `http`
* Promises
* `setTimeout`
* JSON
* Métodos de arrays como `filter`

No se utilizan frameworks externos como Express.

---

## Estructura del proyecto

```text
viajes-turismo/
│
├── wilder-catu.jjs
├── package.json
└── README.md
```

### Archivos

| Archivo           | Función                                               |
| ----------------- | ----------------------------------------------------- |
| `wilder-catu.jjs` | Contiene el servidor HTTP y la lógica de las promesas |
| `package.json`    | Configuración del proyecto Node.js                    |
| `README.md`       | Documentación técnica del ejercicio                   |

---

# 1. Configuración del servidor

El servidor utiliza el módulo nativo `http`:

```js
const http = require('http');
```

El puerto utilizado es:

```js
const PORT = 3007;
```

Por lo tanto, la aplicación estará disponible en:

```text
http://localhost:3007
```

---

# 2. Datos de destinos turísticos

La aplicación utiliza un arreglo en memoria llamado `destinos`:

```js
const destinos = [
  { id: 1, ciudad: 'París', pais: 'Francia', precio: 1200, duracion: 7 },
  { id: 2, ciudad: 'Tokio', pais: 'Japón', precio: 1800, duracion: 10 },
  { id: 3, ciudad: 'Nueva York', pais: 'EE.UU.', precio: 1500, duracion: 5 },
  { id: 4, ciudad: 'Cancún', pais: 'México', precio: 900, duracion: 7 }
];
```

Cada destino contiene:

* `id`: identificador único.
* `ciudad`: ciudad turística.
* `pais`: país donde se encuentra el destino.
* `precio`: precio estimado del viaje.
* `duracion`: cantidad de días del viaje.

### Ejemplo

```json
{
  "id": 1,
  "ciudad": "París",
  "pais": "Francia",
  "precio": 1200,
  "duracion": 7
}
```

Los datos se almacenan únicamente en memoria. No existe una base de datos.

---

# 3. Promesas básicas

El concepto principal del ejercicio son las **Promises**.

Una Promise representa una operación que puede terminar posteriormente.

Una promesa puede encontrarse principalmente en tres estados:

```text
           ┌─────────────┐
           │   PENDING   │
           └──────┬──────┘
                  │
          ┌───────┴────────┐
          │                │
          ▼                ▼
    ┌───────────┐    ┌───────────┐
    │ FULFILLED │    │  REJECTED │
    │  resolve  │    │  reject   │
    └───────────┘    └───────────┘
```

En este ejercicio se utilizan:

```js
resolve()
```

para indicar que una operación terminó correctamente y:

```js
reject()
```

para indicar que ocurrió una condición de error.

---

# 4. Función `obtenerDestinos()`

La función:

```js
function obtenerDestinos() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(destinos), 400);
  });
}
```

devuelve una Promise.

Se utiliza `setTimeout()` para simular una operación asíncrona.

El tiempo utilizado es:

```text
400 ms
```

Después de ese tiempo se ejecuta:

```js
resolve(destinos);
```

Esto significa que la promesa se completa correctamente y devuelve todos los destinos.

### Flujo

```text
obtenerDestinos()
       │
       ▼
   Promise
       │
       ▼
 setTimeout(400 ms)
       │
       ▼
resolve(destinos)
       │
       ▼
.then(data)
       │
       ▼
Respuesta HTTP 200
```

---

# 5. Función `buscarPorPrecioMaximo()`

La segunda operación asíncrona es:

```js
function buscarPorPrecioMaximo(max) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const resultado = destinos.filter(
        d => d.precio <= parseInt(max)
      );

      resultado.length > 0
        ? resolve(resultado)
        : reject(new Error(`Sin destinos bajo $${max}`));
    }, 300);
  });
}
```

Esta función recibe un precio máximo.

Por ejemplo:

```text
1000
```

La aplicación buscará destinos cuyo precio sea menor o igual a `1000`.

---

# 6. Conversión del precio

El valor obtenido desde la URL es texto.

Por ejemplo:

```text
1000
```

Para realizar una comparación numérica se utiliza:

```js
parseInt(max)
```

Esto convierte el valor a un número entero.

Ejemplo:

```js
parseInt('1000');
```

Resultado:

```text
1000
```

---

# 7. Filtrado de destinos

La búsqueda utiliza el método:

```js
filter()
```

La condición utilizada es:

```js
d.precio <= parseInt(max)
```

Esto significa:

> Seleccionar únicamente los destinos cuyo precio sea menor o igual al presupuesto máximo.

Por ejemplo, si se solicita:

```text
/destinos/precio/1000
```

el filtro encuentra:

```text
Cancún → $900
```

Por lo tanto, la respuesta contiene ese destino.

---

# 8. `resolve()` y `reject()`

Después de realizar el filtro se verifica si existen resultados:

```js
resultado.length > 0
```

Si existen destinos:

```js
resolve(resultado);
```

Si no existen:

```js
reject(new Error(`Sin destinos bajo $${max}`));
```

Esto permite representar dos caminos diferentes:

```text
                 buscarPorPrecioMaximo()
                          │
                          ▼
                       filter()
                          │
                  ¿Hay resultados?
                    /           \
                  Sí             No
                  │               │
                  ▼               ▼
              resolve()        reject()
                  │               │
                  ▼               ▼
             HTTP 200          HTTP 404
```

---

# 9. Creación del servidor

El servidor se crea mediante:

```js
const server = http.createServer((req, res) => {
```

Cada solicitud HTTP recibe:

* `req`: información de la petición.
* `res`: objeto utilizado para enviar la respuesta.

También se establece:

```js
res.setHeader('Content-Type', 'application/json');
```

Esto indica que las respuestas se enviarán en formato JSON.

---

# 10. Ruta para obtener todos los destinos

La primera ruta es:

```text
GET /destinos
```

Se verifica mediante:

```js
if (req.url === '/destinos' && req.method === 'GET')
```

Después se ejecuta:

```js
obtenerDestinos()
```

La Promise se maneja con:

```js
.then()
```

y:

```js
.catch()
```

Código:

```js
obtenerDestinos()
  .then(data => {
    res.writeHead(200);
    res.end(JSON.stringify(data));
  })
  .catch(err => {
    res.writeHead(500);
    res.end(JSON.stringify({ error: err.message }));
  });
```

### Flujo

```text
GET /destinos
      │
      ▼
obtenerDestinos()
      │
      ▼
  Promise
      │
      ▼
  400 ms
      │
      ▼
  resolve()
      │
      ▼
   .then()
      │
      ▼
 HTTP 200
```

---

# 11. Ruta para buscar por precio

La segunda ruta es:

```text
GET /destinos/precio/:max
```

Por ejemplo:

```text
GET /destinos/precio/1000
```

La aplicación obtiene el valor mediante:

```js
const max = req.url.split('/')[3];
```

Para:

```text
/destinos/precio/1000
```

el resultado será:

```text
1000
```

Después se ejecuta:

```js
buscarPorPrecioMaximo(max)
```

---

# 12. Manejo de la Promise con `.then()` y `.catch()`

Cuando existen resultados:

```js
.then(data => {
  res.writeHead(200);
  res.end(JSON.stringify(data));
})
```

se devuelve:

```text
HTTP 200 OK
```

Cuando no existen destinos que cumplan el presupuesto:

```js
.catch(err => {
  res.writeHead(404);
  res.end(JSON.stringify({ error: err.message }));
})
```

se devuelve:

```text
HTTP 404 Not Found
```

---

# 13. Códigos HTTP utilizados

| Código | Situación                                                         |
| ------ | ----------------------------------------------------------------- |
| `200`  | Operación exitosa                                                 |
| `404`  | No existen destinos para el precio solicitado o la ruta no existe |
| `500`  | Error interno en la obtención general de destinos                 |

### Ejemplo de éxito

```http
HTTP/1.1 200 OK
```

### Ejemplo sin resultados

```http
HTTP/1.1 404 Not Found
```

---

# 14. Conversión de objetos a JSON

Las respuestas se convierten a texto JSON mediante:

```js
JSON.stringify(data)
```

Por ejemplo:

```js
res.end(JSON.stringify(data));
```

Esto permite que el cliente HTTP pueda recibir los objetos JavaScript como JSON.

---

# 15. Rutas disponibles

| Método | Ruta                    | Descripción                                 |
| ------ | ----------------------- | ------------------------------------------- |
| `GET`  | `/destinos`             | Obtiene todos los destinos                  |
| `GET`  | `/destinos/precio/:max` | Obtiene destinos dentro de un precio máximo |

---

# 16. Ejemplos de uso

## Obtener todos los destinos

```bash
curl http://localhost:3007/destinos
```

Respuesta aproximada:

```json
[
  {
    "id": 1,
    "ciudad": "París",
    "pais": "Francia",
    "precio": 1200,
    "duracion": 7
  },
  {
    "id": 2,
    "ciudad": "Tokio",
    "pais": "Japón",
    "precio": 1800,
    "duracion": 10
  }
]
```

---

## Buscar destinos hasta $1000

```bash
curl http://localhost:3007/destinos/precio/1000
```

Resultado:

```json
[
  {
    "id": 4,
    "ciudad": "Cancún",
    "pais": "México",
    "precio": 900,
    "duracion": 7
  }
]
```

---

## Buscar destinos hasta $2000

```bash
curl http://localhost:3007/destinos/precio/2000
```

En este caso se incluyen los cuatro destinos porque todos tienen un precio menor o igual a `$2000`.

---

## Buscar con un presupuesto sin resultados

```bash
curl http://localhost:3007/destinos/precio/500
```

Respuesta:

```json
{
  "error": "Sin destinos bajo $500"
}
```

Código HTTP:

```text
404 Not Found
```

---

# 17. Ruta inexistente

Si se solicita una ruta que no está definida:

```bash
curl http://localhost:3007/otra-ruta
```

La aplicación responde:

```json
{
  "error": "Ruta no encontrada"
}
```

con:

```text
404 Not Found
```

---

# 18. Ejecución del proyecto

Primero se deben instalar las dependencias, si existen:

```bash
npm install
```

En este ejercicio no se utilizan dependencias externas.

Después se inicia el servidor:

```bash
npm start
```

El servidor mostrará:

```text
Servidor viajes en http://localhost:3007
```

---

# 19. Arquitectura del ejercicio

La estructura lógica es:

```text
                 CLIENTE HTTP
                      │
                      ▼
              Node.js HTTP Server
                      │
             ┌────────┴─────────┐
             │                  │
             ▼                  ▼
       GET /destinos     GET /destinos/precio/:max
             │                  │
             ▼                  ▼
     obtenerDestinos()  buscarPorPrecioMaximo()
             │                  │
             ▼                  ▼
          Promise             Promise
             │                  │
             ▼                  ▼
       setTimeout()           filter()
             │                  │
             ▼            ┌─────┴─────┐
          resolve         │           │
             │            ▼           ▼
             ▼          resolve     reject
          HTTP 200       │           │
                          ▼           ▼
                       HTTP 200    HTTP 404
```

---

# 20. Conceptos aprendidos

Este ejercicio permite practicar:

* Creación de un servidor HTTP con Node.js.
* Uso del módulo nativo `http`.
* Definición de rutas.
* Uso de métodos HTTP.
* Creación de Promises.
* Uso de `resolve()`.
* Uso de `reject()`.
* Manejo de Promises con `.then()`.
* Manejo de errores con `.catch()`.
* Simulación de operaciones asíncronas con `setTimeout()`.
* Uso de `filter()`.
* Conversión de texto a número con `parseInt()`.
* Conversión de objetos a JSON con `JSON.stringify()`.
* Uso de códigos de estado HTTP.
* Separación entre lógica de búsqueda y lógica HTTP.

---

# 21. Consideraciones y limitaciones

Este proyecto tiene fines educativos.

### Datos en memoria

Los destinos están almacenados directamente en un arreglo:

```js
const destinos = [];
```

Si el servidor se reinicia, los datos vuelven a cargarse desde el código.

### Sin base de datos

No existe persistencia de información.

### Validación básica

El parámetro `max` se convierte mediante:

```js
parseInt(max)
```

pero no se realiza una validación explícita para comprobar que sea un número válido.

Por ejemplo, una versión más robusta podría validar:

```js
const presupuesto = Number(max);

if (Number.isNaN(presupuesto)) {
  // Manejar parámetro inválido
}
```

### Promise de `obtenerDestinos()`

La función solamente utiliza `resolve()`:

```js
return new Promise((resolve) => {
```

por lo que actualmente no existe una condición explícita que ejecute `reject()`.

El `.catch()` de la ruta funciona como manejo defensivo ante posibles errores futuros.

---

# 22. Flujo completo

```text
Usuario
   │
   │ GET /destinos/precio/1000
   ▼
Servidor Node.js
   │
   ▼
Extrae "1000"
   │
   ▼
buscarPorPrecioMaximo("1000")
   │
   ▼
Promise
   │
   ▼
setTimeout(300 ms)
   │
   ▼
parseInt("1000")
   │
   ▼
filter()
   │
   ▼
¿Hay destinos?
   │
   ├───────────────┐
   │               │
   ▼               ▼
  Sí                No
   │                │
   ▼                ▼
resolve()         reject()
   │                │
   ▼                ▼
.then()           .catch()
   │                │
   ▼                ▼
HTTP 200          HTTP 404
```

---

# 23. Resumen

El proyecto **Viajes y Turismo — Promesas Básicas** implementa una API HTTP sencilla para consultar destinos turísticos.

La aplicación demuestra cómo una operación que podría representar una consulta externa puede modelarse mediante una Promise.

La primera operación obtiene todos los destinos después de una demora simulada de `400 ms`.

La segunda operación recibe un presupuesto máximo, filtra los destinos disponibles y utiliza:

```js
resolve()
```

cuando encuentra resultados y:

```js
reject()
```

cuando no encuentra ningún destino dentro del presupuesto.

Con esto se practican los fundamentos de las **Promises**, el manejo de resultados y errores, y su integración con un servidor HTTP construido directamente con Node.js.
