# API de Ropa y Sneakers con Promesas Básicas

## 1. Descripción

Este proyecto implementa una API HTTP básica utilizando **Node.js** para gestionar productos relacionados con ropa y sneakers.

La aplicación trabaja con una colección de productos almacenada en memoria y permite:

* Obtener todos los productos.
* Buscar productos por tipo.
* Diferenciar entre `Sneakers` y `Ropa`.
* Simular operaciones asíncronas mediante `setTimeout()`.
* Crear y resolver Promesas.
* Rechazar Promesas cuando no existen resultados.
* Procesar resultados mediante `.then()`.
* Manejar errores mediante `.catch()`.
* Utilizar parámetros dentro de las rutas HTTP.
* Devolver información en formato JSON.

El objetivo principal del ejercicio es practicar **Promesas básicas en Node.js** dentro de un servidor HTTP sin utilizar frameworks externos.

---

# 2. Tecnologías utilizadas

* Node.js
* JavaScript
* Módulo nativo `http`
* `Promise`
* `setTimeout()`
* `filter()`
* `toLowerCase()`
* `decodeURIComponent()`
* JSON
* HTTP

No se utilizan dependencias externas.

---

# 3. Estructura del proyecto

```text
ropa-sneakers/
│
├── wilder-catu.jjs
├── package.json
└── README.md
```

### `wilder-catu.jjs`

Contiene los datos, las funciones asíncronas, el servidor y las rutas.

### `package.json`

Contiene la configuración del proyecto y el comando de ejecución.

### `README.md`

Contiene la documentación técnica del ejercicio.

---

# 4. Creación del servidor

El proyecto utiliza el módulo nativo:

```js
const http = require('http');
```

Este módulo permite crear un servidor HTTP sin instalar Express u otro framework.

El puerto configurado es:

```js
const PORT = 3006;
```

Por lo tanto, el servidor estará disponible en:

```text
http://localhost:3006
```

---

# 5. Colección de productos

Los productos se almacenan en el arreglo:

```js
const productos = [
  { id: 1, nombre: 'Air Jordan 1', tipo: 'Sneakers', talla: 42, precio: 180 },
  { id: 2, nombre: 'Yeezy Boost 350', tipo: 'Sneakers', talla: 43, precio: 230 },
  { id: 3, nombre: 'Camiseta Oversize', tipo: 'Ropa', talla: 'L', precio: 35 },
  { id: 4, nombre: 'Hoodie Streetwear', tipo: 'Ropa', talla: 'M', precio: 65 }
];
```

Cada producto contiene:

| Propiedad | Descripción                |
| --------- | -------------------------- |
| `id`      | Identificador del producto |
| `nombre`  | Nombre comercial           |
| `tipo`    | Categoría del producto     |
| `talla`   | Talla disponible           |
| `precio`  | Precio del producto        |

Existen dos tipos principales:

```text
Sneakers
Ropa
```

---

# 6. Datos almacenados en memoria

El arreglo `productos` funciona como una fuente de datos simulada.

No se utiliza una base de datos.

Por lo tanto:

```text
Servidor
   │
   ▼
Array productos
   │
   ├── Sneakers
   └── Ropa
```

Los datos se mantienen únicamente mientras el proceso de Node.js está ejecutándose.

Al reiniciar el servidor, los datos vuelven a cargarse desde el código.

---

# 7. Promesas básicas

El concepto central del ejercicio es `Promise`.

Una Promesa representa una operación cuyo resultado puede estar disponible posteriormente.

Los estados principales son:

```text
             PENDING
                │
          ┌─────┴─────┐
          ▼           ▼
      FULFILLED    REJECTED
```

En este proyecto las Promesas se utilizan para simular operaciones asíncronas.

---

# 8. Función `obtenerProductos()`

La primera función es:

```js
function obtenerProductos() {

  return new Promise((resolve) => {

    setTimeout(() => resolve(productos), 400);

  });

}
```

La función devuelve una Promesa.

Dentro de ella se utiliza:

```js
setTimeout()
```

para simular una operación que tarda `400 ms`.

Después del tiempo establecido se ejecuta:

```js
resolve(productos);
```

La Promesa se resuelve con todos los productos.

---

# 9. Flujo de `obtenerProductos()`

```text
obtenerProductos()
       │
       ▼
 new Promise()
       │
       ▼
setTimeout(400)
       │
       ▼
resolve(productos)
       │
       ▼
   .then()
       │
       ▼
 HTTP 200
```

El resultado contiene los cuatro productos.

---

# 10. Función `buscarPorTipo()`

La segunda función es:

```js
function buscarPorTipo(tipo) {

  return new Promise((resolve, reject) => {

    setTimeout(() => {

      const resultado = productos.filter(
        p => p.tipo.toLowerCase() === tipo.toLowerCase()
      );

      resultado.length > 0
        ? resolve(resultado)
        : reject(new Error(`Tipo '${tipo}' no encontrado`));

    }, 300);

  });

}
```

Esta función recibe como parámetro:

```text
tipo
```

y busca productos que pertenezcan exactamente a ese tipo.

---

# 11. Comparación sin distinguir mayúsculas

La búsqueda utiliza:

```js
p.tipo.toLowerCase() === tipo.toLowerCase()
```

Esto permite comparar los valores sin depender de mayúsculas o minúsculas.

Por ejemplo, las siguientes solicitudes representan el mismo tipo:

```text
Sneakers
sneakers
SNEAKERS
SneAkErS
```

La conversión mediante `toLowerCase()` hace que todas puedan compararse como:

```text
sneakers
```

---

# 12. Uso de `filter()`

La búsqueda utiliza:

```js
productos.filter(
  p => p.tipo.toLowerCase() === tipo.toLowerCase()
);
```

`filter()` recorre todos los productos y crea un nuevo arreglo con aquellos que cumplen la condición.

Por ejemplo:

```text
Air Jordan 1       → Sneakers
Yeezy Boost 350    → Sneakers
Camiseta Oversize  → Ropa
Hoodie Streetwear  → Ropa
```

Una búsqueda de:

```text
Sneakers
```

devuelve:

```text
Air Jordan 1
Yeezy Boost 350
```

Mientras que:

```text
Ropa
```

devuelve:

```text
Camiseta Oversize
Hoodie Streetwear
```

---

# 13. Resolución de la Promesa

Después del filtrado se comprueba:

```js
resultado.length > 0
```

Si existen productos:

```js
resolve(resultado);
```

La Promesa se completa correctamente.

El flujo es:

```text
buscarPorTipo()
      │
      ▼
   filter()
      │
      ▼
¿Hay resultados?
      │
   ┌──┴──┐
   │     │
  Sí    No
   │     │
   ▼     ▼
resolve reject
```

---

# 14. Rechazo de la Promesa

Si no existen productos para el tipo solicitado:

```js
reject(
  new Error(`Tipo '${tipo}' no encontrado`)
);
```

La Promesa pasa al estado `REJECTED`.

Por ejemplo:

```text
GET /productos/tipo/Accesorios
```

no encuentra ningún producto porque `Accesorios` no existe en la colección.

La respuesta será:

```json
{
  "error": "Tipo 'Accesorios' no encontrado"
}
```

con código HTTP `404`.

---

# 15. Creación del servidor

El servidor se crea mediante:

```js
const server = http.createServer((req, res) => {
```

El callback recibe:

### `req`

Representa la solicitud HTTP.

En este ejercicio se utilizan:

```js
req.url
req.method
```

### `res`

Representa la respuesta que será enviada al cliente.

Se utilizan:

```js
res.writeHead()
res.end()
```

---

# 16. Content-Type

Todas las respuestas establecen:

```js
res.setHeader('Content-Type', 'application/json');
```

Esto informa al cliente que el contenido está en formato JSON.

---

# 17. Ruta `GET /productos`

La primera ruta es:

```js
if (req.url === '/productos' && req.method === 'GET')
```

Permite obtener todos los productos.

La solicitud:

```text
GET /productos
```

ejecuta:

```js
obtenerProductos()
```

El resultado se procesa mediante:

```js
.then(data => {
  res.writeHead(200);
  res.end(JSON.stringify(data));
})
```

---

# 18. Flujo de `GET /productos`

```text
Cliente
   │
   │ GET /productos
   ▼
Servidor HTTP
   │
   ▼
obtenerProductos()
   │
   ▼
Promise
   │
   ▼
setTimeout(400)
   │
   ▼
resolve(productos)
   │
   ▼
.then(data)
   │
   ▼
JSON.stringify()
   │
   ▼
HTTP 200
```

---

# 19. Ruta `GET /productos/tipo/:tipo`

La segunda ruta permite realizar una búsqueda por tipo:

```js
else if (
  req.url.startsWith('/productos/tipo/')
  && req.method === 'GET'
)
```

Algunos ejemplos son:

```text
GET /productos/tipo/Sneakers
GET /productos/tipo/Ropa
```

También pueden utilizarse diferentes combinaciones de mayúsculas y minúsculas debido al uso de `toLowerCase()`.

---

# 20. Extracción del parámetro `tipo`

El tipo se obtiene mediante:

```js
const tipo = decodeURIComponent(req.url.split('/')[3]);
```

Por ejemplo:

```text
/productos/tipo/Sneakers
```

se divide mediante:

```js
req.url.split('/')
```

produciendo conceptualmente:

```js
[
  '',
  'productos',
  'tipo',
  'Sneakers'
]
```

Por lo tanto:

```js
req.url.split('/')[3]
```

produce:

```text
Sneakers
```

---

# 21. Uso de `decodeURIComponent()`

Se utiliza:

```js
decodeURIComponent(...)
```

para decodificar el parámetro obtenido desde la URL.

Esto resulta útil cuando un parámetro contiene caracteres codificados.

Por ejemplo, una URL puede contener valores codificados mediante el estándar de URL.

En este ejercicio el parámetro principal son categorías simples como:

```text
Sneakers
Ropa
```

pero el uso de `decodeURIComponent()` deja preparada la extracción para valores que necesiten decodificación.

---

# 22. Flujo de búsqueda por tipo

```text
GET /productos/tipo/Sneakers
              │
              ▼
       extraer parámetro
              │
              ▼
      decodeURIComponent()
              │
              ▼
       buscarPorTipo()
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
        ┌─────┴─────┐
        ▼           ▼
    resultados    sin resultados
        │              │
        ▼              ▼
     resolve         reject
        │              │
        ▼              ▼
    HTTP 200        HTTP 404
```

---

# 23. Uso de `.then()`

Cuando la Promesa se resuelve:

```js
.then(data => {
  res.writeHead(200);
  res.end(JSON.stringify(data));
})
```

`data` contiene los productos encontrados.

Por ejemplo:

```text
GET /productos/tipo/Ropa
```

produce un arreglo con:

```text
Camiseta Oversize
Hoodie Streetwear
```

---

# 24. Uso de `.catch()`

Cuando `buscarPorTipo()` ejecuta:

```js
reject(new Error(...))
```

la ejecución continúa en:

```js
.catch(err => {
  res.writeHead(404);
  res.end(JSON.stringify({ error: err.message }));
});
```

De esta manera, la aplicación convierte el rechazo de la Promesa en una respuesta HTTP `404`.

Esto representa correctamente el caso donde no existen productos para el tipo solicitado.

---

# 25. Códigos HTTP utilizados

| Código | Significado           | Uso                                               |
| ------ | --------------------- | ------------------------------------------------- |
| `200`  | OK                    | Productos encontrados o consulta general correcta |
| `404`  | Not Found             | Tipo inexistente o ruta no encontrada             |
| `500`  | Internal Server Error | Error capturado durante `GET /productos`          |

---

# 26. Ruta inexistente

Si se solicita una ruta que no coincide con las rutas definidas:

```js
else {
  res.writeHead(404);

  res.end(JSON.stringify({
    error: 'Ruta no encontrada'
  }));
}
```

se devuelve:

```json
{
  "error": "Ruta no encontrada"
}
```

con código:

```text
404
```

Por ejemplo:

```text
GET /categorias
```

no está definida en la API.

---

# 27. Conversión de respuestas a JSON

Para enviar los resultados se utiliza:

```js
JSON.stringify(data)
```

Por ejemplo, un producto:

```js
{
  id: 1,
  nombre: 'Air Jordan 1',
  tipo: 'Sneakers',
  talla: 42,
  precio: 180
}
```

se convierte a una representación JSON antes de enviarse al cliente.

---

# 28. Ejemplos de respuestas

## Obtener todos los productos

```text
GET /productos
```

Respuesta:

```json
[
  {
    "id": 1,
    "nombre": "Air Jordan 1",
    "tipo": "Sneakers",
    "talla": 42,
    "precio": 180
  },
  {
    "id": 2,
    "nombre": "Yeezy Boost 350",
    "tipo": "Sneakers",
    "talla": 43,
    "precio": 230
  },
  {
    "id": 3,
    "nombre": "Camiseta Oversize",
    "tipo": "Ropa",
    "talla": "L",
    "precio": 35
  },
  {
    "id": 4,
    "nombre": "Hoodie Streetwear",
    "tipo": "Ropa",
    "talla": "M",
    "precio": 65
  }
]
```

---

## Buscar productos de tipo `Sneakers`

```text
GET /productos/tipo/Sneakers
```

Resultado:

```json
[
  {
    "id": 1,
    "nombre": "Air Jordan 1",
    "tipo": "Sneakers",
    "talla": 42,
    "precio": 180
  },
  {
    "id": 2,
    "nombre": "Yeezy Boost 350",
    "tipo": "Sneakers",
    "talla": 43,
    "precio": 230
  }
]
```

---

## Buscar productos de tipo `Ropa`

```text
GET /productos/tipo/Ropa
```

Resultado:

```json
[
  {
    "id": 3,
    "nombre": "Camiseta Oversize",
    "tipo": "Ropa",
    "talla": "L",
    "precio": 35
  },
  {
    "id": 4,
    "nombre": "Hoodie Streetwear",
    "tipo": "Ropa",
    "talla": "M",
    "precio": 65
  }
]
```

---

## Buscar un tipo inexistente

```text
GET /productos/tipo/Accesorios
```

Resultado:

```json
{
  "error": "Tipo 'Accesorios' no encontrado"
}
```

Código:

```text
404
```

---

# 29. Pruebas con `curl`

Después de iniciar el servidor:

```bash
npm start
```

se pueden realizar las siguientes pruebas.

### Obtener todos los productos

```bash
curl http://localhost:3006/productos
```

### Buscar sneakers

```bash
curl http://localhost:3006/productos/tipo/Sneakers
```

### Buscar ropa

```bash
curl http://localhost:3006/productos/tipo/Ropa
```

### Probar una búsqueda inexistente

```bash
curl http://localhost:3006/productos/tipo/Accesorios
```

### Probar una ruta inexistente

```bash
curl http://localhost:3006/categorias
```

---

# 30. Ejecución del proyecto

Instalar las dependencias declaradas:

```bash
npm install
```

El ejercicio utiliza únicamente el módulo nativo `http`, por lo que no necesita paquetes externos.

Para iniciar:

```bash
npm start
```

También puede ejecutarse directamente:

```bash
node wilder-catu.jjs
```

Al iniciar correctamente se muestra:

```text
Servidor ropa y sneakers en http://localhost:3006
```

---

# 31. Arquitectura

El flujo general de la aplicación es:

```text
                    CLIENTE
                       │
                       ▼
              ┌─────────────────┐
              │ Servidor Node.js│
              │    Puerto 3006  │
              └────────┬────────┘
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
        GET /productos    GET /productos/tipo/:tipo
              │                 │
              ▼                 ▼
     obtenerProductos()   buscarPorTipo()
              │                 │
              ▼                 ▼
        Promise 400ms      Promise 300ms
              │                 │
              ▼                 ▼
         resolve()       filter() + comparación
              │                 │
              │           ┌─────┴─────┐
              │           ▼           ▼
              │        resolve      reject
              │           │           │
              └─────┬─────┘           │
                    ▼                 ▼
                 HTTP 200          HTTP 404
```

---

# 32. Limitaciones

El proyecto está diseñado como ejercicio educativo y actualmente presenta estas limitaciones:

1. Los productos están almacenados en memoria.
2. No existe una base de datos.
3. No existe persistencia.
4. No existen operaciones `POST`, `PUT` o `DELETE`.
5. No existe creación, actualización o eliminación de productos mediante HTTP.
6. No existe validación avanzada de los parámetros.
7. `setTimeout()` únicamente simula una operación asíncrona.
8. La búsqueda por tipo requiere coincidencia exacta después de convertir ambos valores a minúsculas.
9. La extracción del parámetro se realiza manualmente mediante `split('/')`.

---

# 33. Conceptos aprendidos

## Node.js

* Uso del módulo `http`.
* Creación de servidores.
* Manejo de solicitudes y respuestas.

## JavaScript

* Arrays.
* Objetos.
* Funciones.
* Arrow functions.
* `filter()`.
* `toLowerCase()`.
* Operador ternario.
* `decodeURIComponent()`.
* `setTimeout()`.

## Promesas

* `new Promise()`.
* `resolve()`.
* `reject()`.
* `.then()`.
* `.catch()`.
* Estados `pending`, `fulfilled` y `rejected`.

## HTTP

* Método `GET`.
* Rutas.
* Parámetros en URL.
* Código `200`.
* Código `404`.
* Código `500`.
* `Content-Type`.

## JSON

* `JSON.stringify()`.
* Serialización de objetos y arreglos.

---

# 34. Resumen

La API de ropa y sneakers demuestra cómo utilizar Promesas para encapsular operaciones asíncronas.

La primera operación obtiene todos los productos:

```text
GET /productos
       │
       ▼
obtenerProductos()
       │
       ▼
resolve(productos)
       │
       ▼
HTTP 200
```

La segunda realiza una búsqueda por categoría:

```text
GET /productos/tipo/:tipo
       │
       ▼
buscarPorTipo(tipo)
       │
       ▼
filter()
       │
       ├──► resultados → resolve() → HTTP 200
       │
       └──► sin resultados → reject() → HTTP 404
```

El ejercicio permite relacionar **Promesas, filtros de arrays, parámetros de URL y respuestas HTTP**, preparando la estructura para trabajar posteriormente con APIs más completas, bases de datos y frameworks de backend.
