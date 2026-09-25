#

BASICO 14 - Validacion de entrada

## Tematica

Libros.

## Descripcion

Este ejercicio implementa una pequena API REST utilizando Node.js y Express.

El objetivo principal es practicar la **validacion de entrada**, especialmente los datos recibidos mediante `req.body` en una peticion `POST`.

La API permite:

* Consultar los libros disponibles.
* Crear nuevos libros.
* Validar los datos antes de crear un libro.
* Responder con codigos HTTP adecuados.
* Identificar errores de entrada mediante respuestas claras.

No se utiliza una base de datos externa. Los datos se almacenan temporalmente en memoria mientras el servidor esta ejecutandose.

---

## Objetivo del ejercicio

Practicar:

* Node.js.
* Express.
* Rutas.
* Controladores.
* Servicios.
* `req.body`.
* Validacion de datos.
* Codigos HTTP.
* Respuestas JSON.
* Separacion de responsabilidades.
* Pruebas manuales con `curl`.

---

## Requisitos

* Node.js 20 o superior recomendado.
* npm.
* Express.

---

## Estructura del proyecto

```text
joseph-ramirez/
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
└── src/
    ├── app.js
    ├── controllers/
    │   └── books.controller.js
    ├── routes/
    │   └── books.routes.js
    └── services/
        └── books.service.js
```

---

## Responsabilidad de cada archivo

### `src/app.js`

Es el punto de entrada de la aplicacion.

Se encarga de:

* Crear la aplicacion Express.
* Activar `express.json()`.
* Crear la ruta `/health`.
* Registrar las rutas de libros.
* Manejar rutas inexistentes.
* Iniciar el servidor.

---

### `src/routes/books.routes.js`

Define las rutas relacionadas con los libros.

Actualmente existen:

```text
GET  /books
POST /books
```

Las rutas delegan el trabajo a los controladores.

---

### `src/controllers/books.controller.js`

Se encarga de recibir las peticiones HTTP y validar los datos de entrada.

La validacion del endpoint `POST /books` comprueba:

* `titulo`.
* `autor`.
* `anio`.
* `genero`.
* `paginas`.

Tambien comprueba que los datos tengan el tipo correcto.

---

### `src/services/books.service.js`

Contiene los datos de los libros y la logica relacionada con ellos.

Se encarga de:

* Obtener todos los libros.
* Crear un nuevo libro.
* Generar automaticamente el ID.

---

## Instalacion

Desde la carpeta del ejercicio:

```bash
npm install
```

---

## Ejecutar el proyecto

### Modo normal

```bash
npm start
```

El servidor debe mostrar:

```text
Servidor ejecutandose en http://localhost:3000
```

---

### Modo desarrollo

```bash
npm run dev
```

Este comando utiliza `node --watch` para reiniciar automaticamente el servidor cuando se modifica un archivo.

---

### Comprobar sintaxis

```bash
npm run check
```

Este comando comprueba la sintaxis de `src/app.js`.

---

# Pruebas

## 1. Probar health

Con el servidor ejecutandose:

```bash
curl http://localhost:3000/health
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "validacion de entrada"
}
```

---

## 2. Obtener todos los libros

```bash
curl http://localhost:3000/books
```

Debe devolver una respuesta similar a:

```json
{
  "ok": true,
  "message": "Libros obtenidos correctamente",
  "total": 4,
  "data": [
    {
      "id": 1,
      "titulo": "El Principito",
      "autor": "Antoine de Saint-Exupery",
      "anio": 1943,
      "genero": "Ficcion",
      "paginas": 96
    }
  ]
}
```

La respuesta completa contiene los cuatro libros iniciales.

---

# Pruebas de validacion

## 3. Crear un libro correctamente

```bash
curl -X POST http://localhost:3000/books \
-H "Content-Type: application/json" \
-d '{
  "titulo": "Dune",
  "autor": "Frank Herbert",
  "anio": 1965,
  "genero": "Ciencia ficcion",
  "paginas": 412
}'
```

Debe responder con:

```json
{
  "ok": true,
  "message": "Libro creado correctamente",
  "data": {
    "id": 5,
    "titulo": "Dune",
    "autor": "Frank Herbert",
    "anio": 1965,
    "genero": "Ciencia ficcion",
    "paginas": 412
  }
}
```

El codigo HTTP esperado es:

```text
201 Created
```

---

## 4. Crear un libro sin titulo

```bash
curl -X POST http://localhost:3000/books \
-H "Content-Type: application/json" \
-d '{
  "autor": "Frank Herbert",
  "anio": 1965,
  "genero": "Ciencia ficcion",
  "paginas": 412
}'
```

Respuesta esperada:

```json
{
  "ok": false,
  "message": "El titulo es obligatorio y debe ser texto"
}
```

Codigo esperado:

```text
400 Bad Request
```

---

## 5. Crear un libro sin autor

```bash
curl -X POST http://localhost:3000/books \
-H "Content-Type: application/json" \
-d '{
  "titulo": "Dune",
  "anio": 1965,
  "genero": "Ciencia ficcion",
  "paginas": 412
}'
```

Debe responder con:

```json
{
  "ok": false,
  "message": "El autor es obligatorio y debe ser texto"
}
```

---

## 6. Enviar un anio como texto

```bash
curl -X POST http://localhost:3000/books \
-H "Content-Type: application/json" \
-d '{
  "titulo": "Dune",
  "autor": "Frank Herbert",
  "anio": "1965",
  "genero": "Ciencia ficcion",
  "paginas": 412
}'
```

Debe rechazarse porque `anio` debe ser un numero entero.

Respuesta:

```json
{
  "ok": false,
  "message": "El anio es obligatorio y debe ser un numero entero positivo"
}
```

---

## 7. Enviar paginas como texto

```bash
curl -X POST http://localhost:3000/books \
-H "Content-Type: application/json" \
-d '{
  "titulo": "Dune",
  "autor": "Frank Herbert",
  "anio": 1965,
  "genero": "Ciencia ficcion",
  "paginas": "412"
}'
```

Debe rechazarse porque `paginas` debe ser un numero entero.

---

## 8. Enviar cero paginas

```bash
curl -X POST http://localhost:3000/books \
-H "Content-Type: application/json" \
-d '{
  "titulo": "Dune",
  "autor": "Frank Herbert",
  "anio": 1965,
  "genero": "Ciencia ficcion",
  "paginas": 0
}'
```

Debe responder con:

```json
{
  "ok": false,
  "message": "Las paginas son obligatorias y deben ser un numero entero positivo"
}
```

---

## 9. Enviar paginas negativas

```bash
curl -X POST http://localhost:3000/books \
-H "Content-Type: application/json" \
-d '{
  "titulo": "Dune",
  "autor": "Frank Herbert",
  "anio": 1965,
  "genero": "Ciencia ficcion",
  "paginas": -100
}'
```

Debe rechazarse porque la cantidad de paginas no puede ser negativa.

---

## 10. Enviar genero vacio

```bash
curl -X POST http://localhost:3000/books \
-H "Content-Type: application/json" \
-d '{
  "titulo": "Dune",
  "autor": "Frank Herbert",
  "anio": 1965,
  "genero": "",
  "paginas": 412
}'
```

Respuesta esperada:

```json
{
  "ok": false,
  "message": "El genero es obligatorio y debe ser texto"
}
```

---

## 11. Enviar titulo con espacios

```bash
curl -X POST http://localhost:3000/books \
-H "Content-Type: application/json" \
-d '{
  "titulo": "   ",
  "autor": "Frank Herbert",
  "anio": 1965,
  "genero": "Ciencia ficcion",
  "paginas": 412
}'
```

Debe rechazarse porque el titulo realmente no contiene informacion.

---

## 12. Probar una ruta inexistente

```bash
curl http://localhost:3000/movies
```

Respuesta esperada:

```json
{
  "ok": false,
  "status": 404,
  "message": "Ruta no encontrada"
}
```

---

# Conceptos principales

## ¿Que es la validacion de entrada?

La validacion de entrada consiste en comprobar que los datos recibidos por nuestra aplicacion cumplen las reglas esperadas antes de utilizarlos.

Por ejemplo, si nuestra API necesita:

```json
{
  "titulo": "Dune",
  "autor": "Frank Herbert",
  "anio": 1965,
  "genero": "Ciencia ficcion",
  "paginas": 412
}
```

no deberiamos aceptar automaticamente cualquier informacion enviada por el cliente.

Debemos comprobar que:

* Los campos obligatorios existan.
* Los textos realmente sean textos.
* Los numeros realmente sean numeros.
* Los valores numericos tengan sentido.
* Los valores no esten vacios.

---

## `req.body`

Express permite acceder al cuerpo JSON de una peticion utilizando:

```javascript
req.body
```

Por ejemplo:

```javascript
const { titulo, autor, anio, genero, paginas } = req.body;
```

Esto obtiene los valores enviados por el cliente.

---

## ¿Por que usar `express.json()`?

En `app.js` tenemos:

```javascript
app.use(express.json());
```

Esto permite que Express interprete peticiones cuyo cuerpo contiene JSON.

Sin este middleware, `req.body` no funcionaria como esperamos para este tipo de peticiones.

---

## Codigo HTTP 400

Cuando el cliente envia datos incorrectos utilizamos:

```text
400 Bad Request
```

Por ejemplo:

```json
{
  "ok": false,
  "message": "El autor es obligatorio y debe ser texto"
}
```

Esto significa que el servidor recibio la peticion, pero los datos enviados no cumplen las reglas necesarias.

---

## Codigo HTTP 201

Cuando un recurso se crea correctamente usamos:

```text
201 Created
```

Por eso `POST /books` devuelve:

```javascript
res.status(201).json(...)
```

---

## Codigo HTTP 404

Cuando una ruta no existe utilizamos:

```text
404 Not Found
```

En este ejercicio tambien utilizamos 404 para rutas inexistentes.

---

# Flujo de una peticion

Para crear un libro:

```text
Cliente
   |
   v
POST /books
   |
   v
books.routes.js
   |
   v
books.controller.js
   |
   v
Validacion de req.body
   |
   +---- Datos incorrectos ----> 400
   |
   v
books.service.js
   |
   v
Crear libro
   |
   v
201 Created
```

---

# Separacion de responsabilidades

La aplicacion esta dividida en capas.

### Routes

Se encargan de definir las URLs y los metodos HTTP.

### Controllers

Se encargan de:

* Recibir la peticion.
* Leer los datos.
* Validar la entrada.
* Construir la respuesta HTTP.

### Services

Se encargan de la logica relacionada con los libros.

Esta separacion permite evitar colocar toda la logica dentro de `app.js`.

---

# Datos iniciales

La API comienza con cuatro libros:

1. El Principito.

2. Cien Anos de Soledad.

3.

4.

5. Harry Potter y la piedra filosofal.

Los datos son sinteticos y solamente existen mientras el servidor permanece ejecutandose.

Al reiniciar el servidor se vuelven a cargar los datos originales.

---

# Checklist final

Antes de entregar el ejercicio comprobar:

* [ ] `npm install` funciona.
* [ ] `npm start` inicia el servidor.
* [ ] `npm run dev` funciona.
* [ ] `npm run check` no muestra errores.
* [ ] `GET /health` funciona.
* [ ] `GET /books` funciona.
* [ ] `POST /books` acepta datos validos.
* [ ] `POST /books` rechaza datos invalidos.
* [ ] Se utiliza `400` para errores de validacion.
* [ ] Se utiliza `201` cuando se crea un libro.
* [ ] Se utiliza `404` para rutas inexistentes.
* [ ] No se sube `node_modules/`.
* [ ] No se modifica la estructura base del ejercicio.
* [ ] La entrega esta dentro de `resoluciones/joseph-ramirez/`.
* [ ] El Pull Request apunta a `dev`.
