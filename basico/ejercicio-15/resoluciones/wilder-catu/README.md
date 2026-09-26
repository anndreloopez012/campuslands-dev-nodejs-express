# API de Comida Urbana — Promesas Básicas

## 1. Descripción del proyecto

Este ejercicio implementa una API HTTP básica utilizando **Node.js** y el módulo nativo `http`.

La temática utilizada es **comida urbana**, representada mediante una colección de platos almacenada en memoria.

El objetivo técnico es practicar:

* Creación de servidores HTTP.
* Definición de rutas `GET`.
* Uso de Promesas mediante `new Promise()`.
* Resolución de Promesas con `resolve()`.
* Manejo de resultados con `.then()`.
* Manejo de errores con `.catch()`.
* Simulación de operaciones asíncronas mediante `setTimeout()`.
* Filtrado de información utilizando `filter()`.
* Conversión de datos a JSON.
* Uso de códigos de estado HTTP.

El proyecto no utiliza Express ni una base de datos externa.

---

## 2. Tecnologías utilizadas

* Node.js
* JavaScript
* Módulo nativo `http`
* Promesas
* `setTimeout()`
* Arrays
* Objetos
* `filter()`
* JSON
* HTTP

---

## 3. Estructura del proyecto

La temática está organizada en tres archivos independientes:

```text
comida-urbana/
│
├── wilder-catu.jjs
├── package.json
└── README.md
```

### `wilder-catu.jjs`

Contiene toda la lógica del servidor y las operaciones con los platos.

### `package.json`

Contiene la configuración del proyecto y el comando para ejecutar el servidor.

### `README.md`

Contiene la documentación técnica del ejercicio.

---

# 4. Servidor HTTP

El servidor utiliza el módulo nativo de Node.js:

```js
const http = require('http');
```

No es necesario instalar ninguna librería adicional para crear el servidor.

El puerto configurado es:

```js
const PORT = 3005;
```

Por lo tanto, la aplicación queda disponible en:

```text
http://localhost:3005
```

---

# 5. Colección de platos

La información se encuentra almacenada en el arreglo:

```js
const platos = [
  { id: 1, nombre: 'Hamburguesa Smash', tipo: 'Hamburguesa', precio: 8.50, picante: false },
  { id: 2, nombre: 'Tacos al Pastor', tipo: 'Mexicana', precio: 6.00, picante: true },
  { id: 3, nombre: 'Pizza Pepperoni', tipo: 'Italiana', precio: 12.00, picante: false },
  { id: 4, nombre: 'Hot Dog NY', tipo: 'Street Food', precio: 5.50, picante: false }
];
```

Cada elemento representa un plato y contiene:

| Propiedad | Descripción                   |
| --------- | ----------------------------- |
| `id`      | Identificador único           |
| `nombre`  | Nombre del plato              |
| `tipo`    | Categoría del plato           |
| `precio`  | Precio                        |
| `picante` | Indica si el plato es picante |

La propiedad `picante` utiliza un valor booleano:

```text
true
false
```

En la colección solamente `Tacos al Pastor` tiene:

```js
picante: true
```

---

# 6. Almacenamiento en memoria

El arreglo `platos` funciona como una fuente de datos simulada.

No se utiliza una base de datos real.

Por lo tanto:

```text
Servidor iniciado
       │
       ▼
Array de platos
       │
       ▼
Operaciones HTTP
```

Los datos existen únicamente mientras el proceso de Node.js está ejecutándose.

Si el servidor se detiene, la información vuelve a cargarse desde el código al iniciar nuevamente la aplicación.

---

# 7. Promesas básicas

El concepto principal del ejercicio es el uso de **Promesas**.

Una Promesa permite representar una operación cuyo resultado estará disponible posteriormente.

Sus estados son:

```text
PENDING
   │
   ├──────────────► FULFILLED
   │
   └──────────────► REJECTED
```

En este ejercicio se utilizan Promesas para simular operaciones asíncronas.

---

# 8. Función `obtenerPlatos()`

La función:

```js
function obtenerPlatos() {

  return new Promise((resolve) => {

    setTimeout(() => resolve(platos), 400);

  });

}
```

crea y devuelve una Promesa.

La operación espera aproximadamente `400 ms` antes de entregar los datos.

La línea:

```js
setTimeout(() => resolve(platos), 400);
```

simula una operación que tarda cierto tiempo en completarse.

Después de los 400 milisegundos:

```js
resolve(platos);
```

resuelve la Promesa con el arreglo completo.

---

# 9. Flujo de `obtenerPlatos()`

El funcionamiento puede representarse así:

```text
obtenerPlatos()
      │
      ▼
new Promise()
      │
      ▼
setTimeout(400)
      │
      ▼
resolve(platos)
      │
      ▼
.then(data)
      │
      ▼
HTTP 200
```

El resultado contiene los cuatro platos.

---

# 10. Función `filtrarPicantes()`

La segunda función es:

```js
function filtrarPicantes() {

  return new Promise((resolve) => {

    setTimeout(() => resolve(platos.filter(p => p.picante)), 300);

  });

}
```

Esta función realiza dos operaciones:

1. Espera 300 milisegundos.
2. Filtra los platos que tienen `picante === true`.

---

# 11. Método `filter()`

La expresión:

```js
platos.filter(p => p.picante)
```

recorre el arreglo y conserva únicamente los elementos que cumplen la condición.

Los datos son:

```text
Hamburguesa Smash → false
Tacos al Pastor   → true
Pizza Pepperoni   → false
Hot Dog NY        → false
```

Por lo tanto, el resultado contiene:

```text
Tacos al Pastor
```

El método `filter()` genera un nuevo arreglo y no modifica directamente la colección original.

---

# 12. Flujo de `filtrarPicantes()`

```text
filtrarPicantes()
       │
       ▼
  new Promise()
       │
       ▼
 setTimeout(300)
       │
       ▼
    filter()
       │
       ▼
resolve(resultado)
       │
       ▼
   .then(data)
       │
       ▼
   HTTP 200
```

---

# 13. Creación del servidor

El servidor se crea mediante:

```js
const server = http.createServer((req, res) => {
```

El callback recibe:

### `req`

Representa la solicitud HTTP.

En este ejercicio se consultan:

```js
req.url
req.method
```

### `res`

Representa la respuesta HTTP.

Se utiliza para establecer:

* Código de estado.
* Contenido de respuesta.

---

# 14. Content-Type

Todas las respuestas utilizan:

```js
res.setHeader('Content-Type', 'application/json');
```

Esto indica que el contenido enviado al cliente está en formato JSON.

---

# 15. Ruta `GET /platos`

La primera ruta es:

```js
if (req.url === '/platos' && req.method === 'GET')
```

Permite obtener todos los platos.

La solicitud:

```text
GET /platos
```

ejecuta:

```js
obtenerPlatos()
```

El resultado se procesa mediante:

```js
.then(data => {
  res.writeHead(200);
  res.end(JSON.stringify(data));
})
```

---

# 16. Flujo de `GET /platos`

```text
Cliente
   │
   │ GET /platos
   ▼
Servidor
   │
   ▼
obtenerPlatos()
   │
   ▼
Promise
   │
   ▼
setTimeout(400)
   │
   ▼
resolve(platos)
   │
   ▼
.then()
   │
   ▼
JSON.stringify()
   │
   ▼
HTTP 200
```

---

# 17. Ruta `GET /platos/picantes`

La segunda ruta es:

```js
else if (req.url === '/platos/picantes' && req.method === 'GET')
```

Permite consultar solamente los platos marcados como picantes.

La solicitud:

```text
GET /platos/picantes
```

ejecuta:

```js
filtrarPicantes()
```

---

# 18. Flujo de `GET /platos/picantes`

```text
Cliente
   │
   │ GET /platos/picantes
   ▼
Servidor
   │
   ▼
filtrarPicantes()
   │
   ▼
Promise
   │
   ▼
setTimeout(300)
   │
   ▼
filter()
   │
   ▼
resolve(resultado)
   │
   ▼
.then()
   │
   ▼
JSON.stringify()
   │
   ▼
HTTP 200
```

---

# 19. Uso de `.then()`

Las dos rutas utilizan `.then()`:

```js
.then(data => {
  res.writeHead(200);
  res.end(JSON.stringify(data));
})
```

`data` representa el resultado de la Promesa.

Por ejemplo:

```js
resolve(platos);
```

hace que `data` contenga todos los platos.

En la segunda función:

```js
resolve(platos.filter(p => p.picante));
```

hace que `data` contenga únicamente los platos picantes.

---

# 20. Uso de `.catch()`

Las dos rutas también utilizan:

```js
.catch(err => {
  res.writeHead(500);
  res.end(JSON.stringify({ error: err.message }));
});
```

El propósito es capturar un posible rechazo o error asociado con la operación asíncrona.

Actualmente las funciones utilizan únicamente `resolve()` y no reciben un parámetro `reject`:

```js
new Promise((resolve) => {
```

Por esa razón, no existe un rechazo explícito mediante `reject()` en la implementación actual.

El `.catch()` mantiene preparado el manejo de errores para posibles modificaciones posteriores.

---

# 21. Código HTTP `200`

Cuando la operación finaliza correctamente:

```js
res.writeHead(200);
```

el servidor devuelve:

```text
HTTP 200 OK
```

Este código indica que la solicitud fue procesada correctamente.

---

# 22. Código HTTP `404`

Cuando se solicita una ruta no definida, se ejecuta:

```js
res.writeHead(404);
```

La respuesta es:

```json
{
  "error": "Ruta no encontrada"
}
```

Por ejemplo:

```text
GET /bebidas
```

produce:

```text
HTTP 404 Not Found
```

---

# 23. Código HTTP `500`

Si se produce un error capturado por `.catch()`, el servidor responde:

```js
res.writeHead(500);
```

La respuesta tiene el formato:

```json
{
  "error": "mensaje del error"
}
```

`500` representa un error interno del servidor.

---

# 24. Conversión a JSON

Los resultados se convierten mediante:

```js
JSON.stringify(data)
```

Por ejemplo, un objeto JavaScript:

```js
{
  id: 2,
  nombre: 'Tacos al Pastor',
  tipo: 'Mexicana',
  precio: 6.00,
  picante: true
}
```

se convierte en una cadena JSON que puede enviarse como respuesta HTTP.

---

# 25. Respuesta de `GET /platos`

La respuesta contiene todos los elementos:

```json
[
  {
    "id": 1,
    "nombre": "Hamburguesa Smash",
    "tipo": "Hamburguesa",
    "precio": 8.5,
    "picante": false
  },
  {
    "id": 2,
    "nombre": "Tacos al Pastor",
    "tipo": "Mexicana",
    "precio": 6,
    "picante": true
  },
  {
    "id": 3,
    "nombre": "Pizza Pepperoni",
    "tipo": "Italiana",
    "precio": 12,
    "picante": false
  },
  {
    "id": 4,
    "nombre": "Hot Dog NY",
    "tipo": "Street Food",
    "precio": 5.5,
    "picante": false
  }
]
```

---

# 26. Respuesta de `GET /platos/picantes`

El resultado esperado es:

```json
[
  {
    "id": 2,
    "nombre": "Tacos al Pastor",
    "tipo": "Mexicana",
    "precio": 6,
    "picante": true
  }
]
```

---

# 27. Pruebas de la API

Después de iniciar el servidor:

```bash
npm start
```

se pueden realizar las siguientes pruebas.

### Obtener todos los platos

```bash
curl http://localhost:3005/platos
```

### Obtener únicamente platos picantes

```bash
curl http://localhost:3005/platos/picantes
```

### Probar una ruta inexistente

```bash
curl http://localhost:3005/bebidas
```

La última petición debe devolver:

```json
{
  "error": "Ruta no encontrada"
}
```

con código HTTP `404`.

---

# 28. Ejecución

Instalar las dependencias declaradas:

```bash
npm install
```

En este ejercicio no existen dependencias externas.

Iniciar el servidor:

```bash
npm start
```

También puede ejecutarse directamente:

```bash
node wilder-catu.jjs
```

Al iniciar correctamente aparece:

```text
Servidor comida urbana en http://localhost:3005
```

---

# 29. Arquitectura

La arquitectura del ejercicio puede representarse así:

```text
                  CLIENTE
                     │
                     ▼
             ┌───────────────┐
             │ Node.js HTTP  │
             │   Puerto 3005 │
             └───────┬───────┘
                     │
              ┌──────┴──────┐
              │             │
              ▼             ▼
        /platos       /platos/picantes
              │             │
              ▼             ▼
      obtenerPlatos()  filtrarPicantes()
              │             │
              ▼             ▼
         Promise 400ms  Promise 300ms
              │             │
              ▼             ▼
           resolve()    filter()
              │             │
              └──────┬──────┘
                     ▼
                 JSON/HTTP
```

---

# 30. Limitaciones

Este ejercicio está diseñado para aprendizaje y presenta las siguientes limitaciones:

1. Los datos se almacenan únicamente en memoria.
2. No existe una base de datos.
3. No existe persistencia.
4. No existen rutas `POST`, `PUT` ni `DELETE`.
5. No se pueden crear nuevos platos mediante HTTP.
6. No existe validación avanzada de los datos.
7. `setTimeout()` solamente simula una operación asíncrona.
8. Las funciones actuales no implementan `reject()` explícitamente.
9. El servidor utiliza el módulo nativo `http` en lugar de Express.

---

# 31. Conceptos aprendidos

Este ejercicio permite practicar:

## Node.js

* Módulo `http`.
* Servidor HTTP.
* Solicitudes y respuestas.

## JavaScript

* Arrays.
* Objetos.
* Funciones.
* Arrow functions.
* `filter()`.
* Propiedades booleanas.
* `setTimeout()`.

## Promesas

* `new Promise()`.
* `resolve()`.
* `.then()`.
* `.catch()`.
* Operaciones asíncronas simuladas.

## HTTP

* Método `GET`.
* Rutas.
* Código `200`.
* Código `404`.
* Código `500`.
* `Content-Type`.

## JSON

* `JSON.stringify()`.
* Envío de estructuras JavaScript como JSON.

---

# 32. Resumen

La API de comida urbana implementa dos operaciones asíncronas mediante Promesas:

```text
GET /platos
      │
      ▼
obtenerPlatos()
      │
      ▼
resolve(platos)
```

y:

```text
GET /platos/picantes
      │
      ▼
filtrarPicantes()
      │
      ▼
filter(p => p.picante)
      │
      ▼
resolve(resultado)
```

El ejercicio permite comprender la relación entre **Promesas, operaciones asíncronas, rutas HTTP y procesamiento de arrays**.

Esta estructura sirve como base para ejercicios posteriores donde las Promesas pueden utilizarse con bases de datos, archivos, APIs externas o frameworks como Express.
