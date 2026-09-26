# Paracaidismo — Promesas Básicas

## Descripción

Este ejercicio implementa un servidor HTTP utilizando **Node.js** y el módulo nativo `http`, orientado al tema de **paracaidismo**.

La aplicación administra información sobre diferentes experiencias de salto y utiliza **Promises** para simular operaciones asíncronas.

El servidor permite:

* Obtener todos los saltos disponibles.
* Buscar saltos a partir de una altura mínima.
* Utilizar `resolve()` para operaciones exitosas.
* Utilizar `reject()` cuando no existen resultados.
* Manejar las Promises mediante `.then()` y `.catch()`.
* Responder utilizando códigos de estado HTTP.

El objetivo principal es practicar el funcionamiento básico de las **Promises en JavaScript dentro de un servidor HTTP**.

---

## Tecnologías utilizadas

* Node.js
* JavaScript
* Módulo nativo `http`
* Promises
* `setTimeout()`
* JSON
* `filter()`
* `parseInt()`

No se utilizan frameworks externos como Express.

---

## Estructura del proyecto

```text
paracaidismo/
│
├── wilder-catu.jjs
├── package.json
└── README.md
```

### Archivos

| Archivo           | Función                                |
| ----------------- | -------------------------------------- |
| `wilder-catu.jjs` | Servidor HTTP y lógica de las Promises |
| `package.json`    | Configuración del proyecto Node.js     |
| `README.md`       | Documentación técnica                  |

---

# 1. Configuración del servidor

El servidor utiliza el módulo nativo:

```js
const http = require('http');
```

El puerto configurado es:

```js
const PORT = 3008;
```

Por lo tanto, el servidor estará disponible en:

```text
http://localhost:3008
```

---

# 2. Datos de los saltos

La información se almacena en un arreglo llamado `saltos`:

```js
const saltos = [
  { id: 1, zona: 'Dubai', altura: 4000, precio: 350, incluyeVideo: true },
  { id: 2, zona: 'Interlaken', altura: 4500, precio: 280, incluyeVideo: false },
  { id: 3, zona: 'Queenstown', altura: 5000, precio: 400, incluyeVideo: true },
  { id: 4, zona: 'Madrid', altura: 3000, precio: 200, incluyeVideo: false }
];
```

Cada registro contiene:

| Propiedad      | Descripción                          |
| -------------- | ------------------------------------ |
| `id`           | Identificador del salto              |
| `zona`         | Lugar donde se realiza               |
| `altura`       | Altura del salto en metros           |
| `precio`       | Precio de la experiencia             |
| `incluyeVideo` | Indica si incluye grabación en video |

Los datos se encuentran almacenados **en memoria**, por lo que no existe una base de datos.

---

# 3. Concepto principal: Promises

El concepto trabajado en este ejercicio son las **Promises básicas de JavaScript**.

Una Promise representa una operación cuyo resultado puede estar disponible posteriormente.

Sus estados principales son:

```text
              ┌─────────────┐
              │   PENDING   │
              └──────┬──────┘
                     │
              ┌──────┴──────┐
              │             │
              ▼             ▼
       ┌────────────┐ ┌────────────┐
       │ FULFILLED  │ │  REJECTED  │
       │  resolve   │ │   reject   │
       └────────────┘ └────────────┘
```

En este ejercicio:

* `resolve()` representa una operación exitosa.
* `reject()` representa una búsqueda sin resultados.

---

# 4. Función `obtenerSaltos()`

La función:

```js
function obtenerSaltos() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(saltos), 400);
  });
}
```

devuelve una Promise.

Se utiliza:

```js
setTimeout()
```

para simular una operación asíncrona.

El tiempo de espera es:

```text
400 ms
```

Después de ese tiempo se ejecuta:

```js
resolve(saltos);
```

Esto significa que la Promise termina correctamente y entrega todos los saltos disponibles.

### Flujo

```text
obtenerSaltos()
       │
       ▼
    Promise
       │
       ▼
setTimeout(400 ms)
       │
       ▼
resolve(saltos)
       │
       ▼
     .then()
       │
       ▼
   HTTP 200
```

---

# 5. Función `buscarPorAlturaMinima()`

La segunda operación asíncrona es:

```js
function buscarPorAlturaMinima(min) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const resultado = saltos.filter(
        s => s.altura >= parseInt(min)
      );

      resultado.length > 0
        ? resolve(resultado)
        : reject(new Error(`Sin saltos sobre ${min}m`));
    }, 300);
  });
}
```

Esta función recibe una altura mínima.

Por ejemplo:

```text
4000
```

La aplicación buscará todos los saltos cuya altura sea mayor o igual a `4000` metros.

---

# 6. Conversión de la altura

Los valores obtenidos desde una URL llegan inicialmente como texto.

Por ejemplo:

```text
4000
```

Para realizar una comparación numérica se utiliza:

```js
parseInt(min)
```

Ejemplo:

```js
parseInt('4000');
```

Resultado:

```text
4000
```

Esto permite comparar correctamente:

```js
s.altura >= parseInt(min)
```

---

# 7. Filtrado mediante `filter()`

La búsqueda utiliza el método:

```js
filter()
```

La condición aplicada es:

```js
s.altura >= parseInt(min)
```

Esto significa:

> Seleccionar los saltos cuya altura sea mayor o igual a la altura mínima solicitada.

Por ejemplo, si se solicita:

```text
/saltos/altura/4000
```

se obtienen:

* Dubai — 4000 m
* Interlaken — 4500 m
* Queenstown — 5000 m

Madrid, con 3000 metros, queda fuera del resultado.

---

# 8. Uso de `resolve()` y `reject()`

Después de realizar el filtro se comprueba:

```js
resultado.length > 0
```

Si existen resultados:

```js
resolve(resultado);
```

Si no existen:

```js
reject(new Error(`Sin saltos sobre ${min}m`));
```

El flujo es:

```text
             buscarPorAlturaMinima()
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
             HTTP 200        HTTP 404
```

---

# 9. Creación del servidor

El servidor se crea mediante:

```js
const server = http.createServer((req, res) => {
```

Los parámetros representan:

* `req`: solicitud HTTP recibida.
* `res`: respuesta HTTP que se enviará al cliente.

El servidor también define:

```js
res.setHeader('Content-Type', 'application/json');
```

Esto indica que las respuestas utilizan formato JSON.

---

# 10. Ruta `/saltos`

La primera ruta disponible es:

```text
GET /saltos
```

Se identifica mediante:

```js
if (req.url === '/saltos' && req.method === 'GET')
```

Cuando se recibe esta petición se ejecuta:

```js
obtenerSaltos()
```

Después se procesa la Promise:

```js
obtenerSaltos()
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
GET /saltos
     │
     ▼
obtenerSaltos()
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

# 11. Ruta `/saltos/altura/:min`

La segunda ruta es:

```text
GET /saltos/altura/:min
```

Por ejemplo:

```text
GET /saltos/altura/4000
```

La aplicación obtiene el valor mediante:

```js
const min = req.url.split('/')[3];
```

Para la URL:

```text
/saltos/altura/4000
```

el resultado será:

```text
4000
```

Posteriormente se ejecuta:

```js
buscarPorAlturaMinima(min)
```

---

# 12. Manejo de `.then()` y `.catch()`

Cuando la búsqueda encuentra resultados, se ejecuta:

```js
.then(data => {
  res.writeHead(200);
  res.end(JSON.stringify(data));
})
```

La respuesta será:

```text
HTTP 200 OK
```

Cuando no existen saltos que cumplan la altura mínima:

```js
.catch(err => {
  res.writeHead(404);
  res.end(JSON.stringify({ error: err.message }));
})
```

La respuesta será:

```text
HTTP 404 Not Found
```

---

# 13. Códigos HTTP utilizados

| Código | Situación                                                      |
| ------ | -------------------------------------------------------------- |
| `200`  | Solicitud procesada correctamente                              |
| `404`  | No existen saltos que cumplan la condición o la ruta no existe |
| `500`  | Error interno al obtener los saltos                            |

---

# 14. Conversión a JSON

Los datos JavaScript deben convertirse a JSON antes de enviarlos:

```js
JSON.stringify(data)
```

Por ejemplo:

```js
res.end(JSON.stringify(data));
```

Esto permite que el cliente reciba los objetos en formato JSON.

---

# 15. Rutas disponibles

| Método | Ruta                  | Descripción                          |
| ------ | --------------------- | ------------------------------------ |
| `GET`  | `/saltos`             | Obtiene todos los saltos             |
| `GET`  | `/saltos/altura/:min` | Busca saltos desde una altura mínima |

---

# 16. Pruebas con `curl`

## Obtener todos los saltos

```bash
curl http://localhost:3008/saltos
```

La respuesta contiene los cuatro saltos disponibles.

---

## Buscar saltos desde 4000 metros

```bash
curl http://localhost:3008/saltos/altura/4000
```

El resultado esperado contiene:

```json
[
  {
    "id": 1,
    "zona": "Dubai",
    "altura": 4000,
    "precio": 350,
    "incluyeVideo": true
  },
  {
    "id": 2,
    "zona": "Interlaken",
    "altura": 4500,
    "precio": 280,
    "incluyeVideo": false
  },
  {
    "id": 3,
    "zona": "Queenstown",
    "altura": 5000,
    "precio": 400,
    "incluyeVideo": true
  }
]
```

---

## Buscar saltos desde 5000 metros

```bash
curl http://localhost:3008/saltos/altura/5000
```

El resultado será únicamente:

```json
[
  {
    "id": 3,
    "zona": "Queenstown",
    "altura": 5000,
    "precio": 400,
    "incluyeVideo": true
  }
]
```

---

## Buscar una altura sin resultados

```bash
curl http://localhost:3008/saltos/altura/6000
```

Respuesta:

```json
{
  "error": "Sin saltos sobre 6000m"
}
```

Código:

```text
404 Not Found
```

---

# 17. Ruta inexistente

Si se solicita una ruta que no está definida:

```bash
curl http://localhost:3008/otra-ruta
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

Desde la carpeta del proyecto se puede iniciar el servidor con:

```bash
npm install
```

y posteriormente:

```bash
npm start
```

El servidor mostrará:

```text
Servidor paracaidismo en http://localhost:3008
```

También puede ejecutarse directamente con Node.js:

```bash
node wilder-catu.jjs
```

---

# 19. Arquitectura del ejercicio

El flujo general de la aplicación es:

```text
                    CLIENTE HTTP
                         │
                         ▼
                 Node.js HTTP Server
                         │
                ┌────────┴─────────┐
                │                  │
                ▼                  ▼
          GET /saltos      GET /saltos/altura/:min
                │                  │
                ▼                  ▼
        obtenerSaltos()   buscarPorAlturaMinima()
                │                  │
                ▼                  ▼
             Promise             Promise
                │                  │
                ▼                  ▼
        setTimeout(400)     setTimeout(300)
                │                  │
                ▼                  ▼
            resolve()           filter()
                │                  │
                │            ┌─────┴─────┐
                │            │           │
                │            ▼           ▼
                │         resolve()    reject()
                │            │           │
                └──────┐     │           │
                       ▼     ▼           ▼
                    HTTP 200         HTTP 404
```

---

# 20. Conceptos aprendidos

Este ejercicio permite practicar:

* Creación de un servidor HTTP con Node.js.
* Uso del módulo nativo `http`.
* Definición de endpoints.
* Uso del método HTTP `GET`.
* Creación de Promises.
* Uso de `resolve()`.
* Uso de `reject()`.
* Manejo de resultados mediante `.then()`.
* Manejo de errores mediante `.catch()`.
* Simulación de operaciones asíncronas con `setTimeout()`.
* Filtrado de arreglos mediante `filter()`.
* Conversión de parámetros con `parseInt()`.
* Conversión de datos a JSON.
* Uso de códigos de estado HTTP.
* Extracción de parámetros directamente desde la URL.

---

# 21. Consideraciones y limitaciones

Este ejercicio tiene fines educativos.

## Datos en memoria

Los saltos están almacenados directamente en un arreglo:

```js
const saltos = [];
```

No existe persistencia de datos.

Si el servidor se reinicia, los datos vuelven a cargarse desde el código fuente.

## Sin base de datos

No se utiliza MySQL, MongoDB, PostgreSQL ni ningún otro sistema de almacenamiento externo.

## Validación básica del parámetro

Actualmente se utiliza:

```js
parseInt(min)
```

para convertir la altura recibida.

No existe una validación explícita para comprobar que el usuario haya enviado un número válido.

Una implementación más robusta podría comprobar:

```js
const altura = Number(min);

if (Number.isNaN(altura)) {
  // Manejar parámetro inválido
}
```

También podría comprobarse que la altura sea un valor positivo.

## `obtenerSaltos()` solamente resuelve

La función:

```js
function obtenerSaltos() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(saltos), 400);
  });
}
```

no tiene una condición que ejecute `reject()`.

Por esta razón, el `.catch()` asociado a esta operación funciona principalmente como manejo defensivo ante posibles errores futuros.

---

# 22. Flujo completo de búsqueda

Para una petición como:

```text
GET /saltos/altura/4000
```

el flujo es:

```text
Cliente
   │
   ▼
GET /saltos/altura/4000
   │
   ▼
Servidor HTTP
   │
   ▼
Extraer "4000"
   │
   ▼
buscarPorAlturaMinima("4000")
   │
   ▼
Crear Promise
   │
   ▼
setTimeout(300 ms)
   │
   ▼
parseInt("4000")
   │
   ▼
filter()
   │
   ▼
¿Existen resultados?
   │
   ├───────────────┐
   │               │
  Sí               No
   │               │
   ▼               ▼
resolve()        reject()
   │               │
   ▼               ▼
.then()          .catch()
   │               │
   ▼               ▼
HTTP 200         HTTP 404
```

---

# 23. Resumen

El proyecto **Paracaidismo — Promesas Básicas** implementa una API HTTP sencilla para consultar experiencias de salto.

La aplicación utiliza dos operaciones principales:

```text
GET /saltos
```

para obtener todos los saltos y:

```text
GET /saltos/altura/:min
```

para buscar experiencias que cumplan una altura mínima.

La función `buscarPorAlturaMinima()` utiliza `filter()` para comparar la altura de cada salto con el valor recibido y emplea:

```js
resolve(resultado)
```

cuando existen resultados y:

```js
reject(new Error(...))
```

cuando no se encuentra ningún salto.

De esta manera, el ejercicio permite comprender cómo las **Promises básicas** pueden utilizarse para representar operaciones asíncronas y cómo sus resultados pueden integrarse con las respuestas de un servidor HTTP de Node.js.
