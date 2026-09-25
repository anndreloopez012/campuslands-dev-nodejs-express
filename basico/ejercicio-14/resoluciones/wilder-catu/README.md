# API de Libros con Promesas Básicas

## Descripción

Este ejercicio implementa un servidor HTTP básico con Node.js para gestionar una colección de libros.

El objetivo principal es practicar el uso de **Promesas (`Promise`)** para representar operaciones asíncronas dentro de una API HTTP sencilla, sin utilizar frameworks externos como Express.

La aplicación permite:

* Obtener todos los libros.
* Buscar un libro mediante su ID.
* Simular operaciones asíncronas utilizando `setTimeout`.
* Resolver Promesas correctamente con `resolve`.
* Rechazar Promesas cuando un libro no existe mediante `reject`.
* Procesar resultados con `.then()`.
* Manejar errores con `.catch()`.
* Responder utilizando códigos de estado HTTP.
* Convertir los resultados a formato JSON.

---

## Tecnologías utilizadas

* **Node.js**
* Módulo nativo `http`
* JavaScript
* Promesas (`Promise`)
* `setTimeout`
* JSON
* HTTP

No se utilizan dependencias externas.

---

## Estructura del proyecto

```text
libros/
│
├── wilder-catu.jjs
├── package.json
└── README.md
```

### `wilder-catu.jjs`

Contiene el servidor HTTP, los datos de los libros, las funciones asíncronas y las rutas de la API.

### `package.json`

Define la configuración del proyecto y el comando para iniciar el servidor.

### `README.md`

Documenta técnicamente el funcionamiento del ejercicio.

---

# 1. Creación del servidor HTTP

Se importa el módulo nativo `http`:

```js
const http = require('http');
```

Node.js proporciona este módulo para crear servidores HTTP sin necesidad de instalar frameworks.

El servidor se ejecuta en el puerto:

```js
const PORT = 3004;
```

Por lo tanto, la aplicación queda disponible en:

```text
http://localhost:3004
```

---

# 2. Colección de libros

Los datos se almacenan en un arreglo llamado `libros`:

```js
const libros = [
  { id: 1, titulo: '1984', autor: 'George Orwell', paginas: 328, genero: 'Distopía' },
  { id: 2, titulo: 'Cien años de soledad', autor: 'G. García Márquez', paginas: 471, genero: 'Realismo mágico' },
  { id: 3, titulo: 'Don Quijote', autor: 'Cervantes', paginas: 863, genero: 'Clásico' },
  { id: 4, titulo: 'Fahrenheit 451', autor: 'Ray Bradbury', paginas: 194, genero: 'Distopía' }
];
```

Cada libro contiene cinco propiedades:

| Propiedad | Descripción                   |
| --------- | ----------------------------- |
| `id`      | Identificador único del libro |
| `titulo`  | Nombre de la obra             |
| `autor`   | Autor del libro               |
| `paginas` | Cantidad de páginas           |
| `genero`  | Género literario              |

Esta colección funciona como una **base de datos simulada en memoria**.

No existe persistencia en archivos ni una base de datos externa.

---

# 3. Promesas en JavaScript

El concepto principal del ejercicio son las **Promesas**.

Una Promesa representa el resultado futuro de una operación que puede estar:

```text
PENDING
   │
   ├──► FULFILLED
   │
   └──► REJECTED
```

### Estados

* **Pending:** la operación todavía está ejecutándose.
* **Fulfilled:** la operación terminó correctamente.
* **Rejected:** ocurrió un error.

En este ejercicio las Promesas permiten simular operaciones que normalmente podrían realizarse contra una base de datos o servicio externo.

---

# 4. Función `obtenerLibros()`

La función:

```js
function obtenerLibros() {

  return new Promise((resolve) => {

    setTimeout(() => resolve(libros), 400);

  });

}
```

devuelve una Promesa.

La operación utiliza:

```js
setTimeout()
```

para simular una operación asíncrona que tarda aproximadamente **400 milisegundos**.

Después del tiempo establecido se ejecuta:

```js
resolve(libros);
```

Esto cambia la Promesa al estado:

```text
PENDING
   │
   │ 400 ms
   ▼
FULFILLED
```

El resultado de la Promesa es el arreglo completo de libros.

### Importante

Esta función solamente recibe `resolve` porque actualmente no contempla un rechazo explícito.

El `.catch()` utilizado posteriormente permite mantener una estructura preparada para manejar errores futuros, aunque en la implementación actual no existe un `reject()` explícito dentro de `obtenerLibros()`.

---

# 5. Función `buscarPorId()`

La segunda operación asíncrona es:

```js
function buscarPorId(id) {

  return new Promise((resolve, reject) => {

    setTimeout(() => {

      const libro = libros.find(l => l.id === parseInt(id));

      libro
        ? resolve(libro)
        : reject(new Error(`Libro con ID ${id} no encontrado`));

    }, 300);

  });

}
```

Esta función busca un libro utilizando su identificador.

La operación tarda aproximadamente:

```text
300 ms
```

---

## Conversión del ID

El parámetro recibido desde la URL es texto.

Por ejemplo:

```text
"2"
```

Mientras que los IDs almacenados son números:

```js
2
```

Por eso se utiliza:

```js
parseInt(id)
```

para convertir el valor recibido a un número entero.

---

## Búsqueda con `find()`

La búsqueda se realiza mediante:

```js
libros.find(l => l.id === parseInt(id));
```

`find()` devuelve:

* El primer libro que coincide.
* `undefined` si no encuentra ninguno.

---

## Resolución exitosa

Si existe el libro:

```js
resolve(libro);
```

La Promesa termina correctamente.

Ejemplo:

```text
GET /libros/2

        │
        ▼
buscarPorId(2)
        │
        ▼
find()
        │
        ▼
Libro encontrado
        │
        ▼
resolve(libro)
        │
        ▼
HTTP 200
```

---

## Rechazo de la Promesa

Si no existe:

```js
reject(new Error(`Libro con ID ${id} no encontrado`));
```

La Promesa pasa al estado `REJECTED`.

Posteriormente el `.catch()` procesa el error y devuelve HTTP `404`.

---

# 6. Creación del servidor

El servidor se crea mediante:

```js
const server = http.createServer((req, res) => {
```

Cada solicitud HTTP recibe dos objetos:

### `req`

Representa la solicitud realizada por el cliente.

Contiene información como:

* URL.
* Método HTTP.
* Headers.

### `res`

Representa la respuesta que el servidor enviará al cliente.

Permite establecer:

* Código HTTP.
* Headers.
* Contenido de respuesta.

---

# 7. Header de respuesta

El servidor establece:

```js
res.setHeader('Content-Type', 'application/json');
```

Esto indica que las respuestas serán enviadas en formato JSON.

Por ejemplo:

```json
{
  "id": 1,
  "titulo": "1984"
}
```

---

# 8. Ruta GET `/libros`

La primera ruta es:

```js
if (req.url === '/libros' && req.method === 'GET')
```

Esta ruta permite obtener todos los libros.

La ejecución es:

```text
Cliente
  │
  │ GET /libros
  ▼
Servidor HTTP
  │
  ▼
obtenerLibros()
  │
  ▼
Promise
  │
  │ 400 ms
  ▼
resolve(libros)
  │
  ▼
.then()
  │
  ▼
HTTP 200
  │
  ▼
JSON
```

La Promesa se procesa mediante:

```js
obtenerLibros()
  .then(data => {
    res.writeHead(200);
    res.end(JSON.stringify(data));
  })
```

El resultado se convierte a JSON utilizando:

```js
JSON.stringify(data)
```

---

# 9. Ruta GET `/libros/:id`

La segunda ruta permite buscar un libro específico:

```text
GET /libros/1
GET /libros/2
GET /libros/3
GET /libros/4
```

La condición utilizada es:

```js
req.url.startsWith('/libros/')
```

Esto permite detectar URLs que comienzan con:

```text
/libros/
```

---

# 10. Extracción del ID

El ID se obtiene mediante:

```js
const id = req.url.split('/')[2];
```

Por ejemplo:

```text
/libros/3
```

Después de ejecutar:

```js
split('/')
```

se obtiene conceptualmente:

```js
[
  '',
  'libros',
  '3'
]
```

Por lo tanto:

```js
req.url.split('/')[2]
```

produce:

```text
3
```

Ese valor posteriormente se envía a:

```js
buscarPorId(id)
```

---

# 11. Manejo de resultados con `.then()`

Cuando `buscarPorId()` encuentra el libro:

```js
resolve(libro);
```

se ejecuta:

```js
.then(data => {
  res.writeHead(200);
  res.end(JSON.stringify(data));
})
```

El servidor responde:

```text
HTTP 200 OK
```

y entrega el libro solicitado.

Ejemplo:

```json
{
  "id": 1,
  "titulo": "1984",
  "autor": "George Orwell",
  "paginas": 328,
  "genero": "Distopía"
}
```

---

# 12. Manejo de errores con `.catch()`

Cuando `buscarPorId()` no encuentra el libro:

```js
reject(new Error(`Libro con ID ${id} no encontrado`));
```

el error pasa al:

```js
.catch(err => {
  res.writeHead(404);
  res.end(JSON.stringify({ error: err.message }));
});
```

El servidor responde:

```text
HTTP 404 Not Found
```

Ejemplo:

```json
{
  "error": "Libro con ID 99 no encontrado"
}
```

---

# 13. Ruta inexistente

Si el cliente solicita una ruta que no está definida:

```js
else {
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
}
```

se devuelve:

```text
HTTP 404 Not Found
```

Ejemplo:

```text
GET /autores
```

Respuesta:

```json
{
  "error": "Ruta no encontrada"
}
```

---

# 14. Códigos HTTP utilizados

| Código | Significado           | Situación                                       |
| ------ | --------------------- | ----------------------------------------------- |
| `200`  | OK                    | Solicitud procesada correctamente               |
| `404`  | Not Found             | Libro o ruta no encontrada                      |
| `500`  | Internal Server Error | Error asociado a la obtención general de libros |

En el caso de `/libros`, el `catch()` responde con `500` si esa Promesa llegara a rechazarse.

---

# 1
