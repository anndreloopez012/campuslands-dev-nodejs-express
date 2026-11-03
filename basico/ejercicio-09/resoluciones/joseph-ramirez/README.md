# BASICO 09 - JSON y persistencia simple

## Autor

Joseph Ramirez

## Tematica

Kickboxing

## Tema del ejercicio

JSON y persistencia simple.

## Objetivo

Crear una pequeña API con Node.js y Express que permita practicar el almacenamiento y manipulación de información utilizando un archivo JSON como persistencia local.

El proyecto representa un pequeño sistema para administrar peleadores de kickboxing.

La información se almacena en:

```text
data/fighters.json
```

No se utiliza una base de datos externa.

---

# Tecnologias utilizadas

* Node.js 20 o superior recomendado.
* Express.
* JavaScript.
* JSON.
* File System (`fs`).
* CommonJS.
* HTTP/REST.

---

# Estructura del proyecto

```text
joseph-ramirez/
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
├── data/
│   └── fighters.json
└── src/
    ├── app.js
    ├── controllers/
    │   └── fighters.controller.js
    ├── routes/
    │   └── fighters.routes.js
    └── services/
        └── fighters.service.js
```

---

# Descripcion de archivos

## `src/app.js`

Es el punto de entrada de la aplicación.

Sus responsabilidades son:

* Crear la aplicación Express.
* Configurar `express.json()`.
* Registrar las rutas.
* Crear la ruta `/health`.
* Manejar rutas inexistentes.
* Iniciar el servidor.

---

## `src/routes/fighters.routes.js`

Define las rutas relacionadas con los peleadores.

Endpoints:

```text
GET /fighters
GET /fighters/:id
POST /fighters
PUT /fighters/:id
DELETE /fighters/:id
```

Las rutas delegan la lógica a los controladores.

---

## `src/controllers/fighters.controller.js`

Se encarga de manejar las peticiones HTTP.

Sus responsabilidades son:

* Obtener los datos de la petición.
* Validar los datos recibidos.
* Llamar a los servicios.
* Determinar los códigos HTTP.
* Construir las respuestas JSON.
* Manejar errores.

---

## `src/services/fighters.service.js`

Contiene la lógica relacionada con la persistencia.

Utiliza:

```javascript
const fs = require("fs").promises;
```

Para leer el archivo:

```javascript
fs.readFile()
```

Para guardar cambios:

```javascript
fs.writeFile()
```

También utiliza:

```javascript
JSON.parse()
```

para convertir el contenido JSON en objetos JavaScript.

Y:

```javascript
JSON.stringify()
```

para convertir los objetos nuevamente a JSON antes de guardarlos.

---

## `data/fighters.json`

Es el archivo utilizado como almacenamiento local.

Contiene los peleadores iniciales:

```json
[
  {
    "id": 1,
    "nombre": "Alex Morales",
    "edad": 24,
    "categoria": "Welter",
    "victorias": 12,
    "derrotas": 2
  }
]
```

Cuando se crea, actualiza o elimina un peleador, el archivo se modifica.

---

# Instalacion

Desde la carpeta del ejercicio ejecutar:

```bash
npm install
```

Esto instala las dependencias indicadas en `package.json`.

---

# Ejecucion

Para iniciar el servidor:

```bash
npm start
```

El servidor se ejecutará en:

```text
http://localhost:3000
```

También se puede utilizar el modo desarrollo:

```bash
npm run dev
```

Este comando utiliza `node --watch` para reiniciar automáticamente el servidor cuando se detecten cambios.

---

# Verificacion de sintaxis

Para verificar la sintaxis del archivo principal:

```bash
npm run check
```

El comando ejecuta:

```text
node --check src/app.js
```

---

# API

## GET `/health`

Permite comprobar que el servidor funciona correctamente.

Ejecutar:

```bash
curl http://localhost:3000/health
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "JSON y persistencia simple"
}
```

Código HTTP:

```text
200 OK
```

---

# GET `/fighters`

Obtiene todos los peleadores almacenados en el archivo JSON.

Ejecutar:

```bash
curl http://localhost:3000/fighters
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Peleadores obtenidos correctamente",
  "total": 3,
  "data": [
    {
      "id": 1,
      "nombre": "Alex Morales",
      "edad": 24,
      "categoria": "Welter",
      "victorias": 12,
      "derrotas": 2
    },
    {
      "id": 2,
      "nombre": "Diego Castillo",
      "edad": 27,
      "categoria": "Middleweight",
      "victorias": 15,
      "derrotas": 3
    },
    {
      "id": 3,
      "nombre": "Marco Ramirez",
      "edad": 22,
      "categoria": "Lightweight",
      "victorias": 9,
      "derrotas": 1
    }
  ]
}
```

Código HTTP:

```text
200 OK
```

---

# GET `/fighters/:id`

Permite buscar un peleador por su ID.

Ejecutar:

```bash
curl http://localhost:3000/fighters/1
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Peleador encontrado correctamente",
  "data": {
    "id": 1,
    "nombre": "Alex Morales",
    "edad": 24,
    "categoria": "Welter",
    "victorias": 12,
    "derrotas": 2
  }
}
```

Código HTTP:

```text
200 OK
```

---

# Buscar un ID inexistente

Ejecutar:

```bash
curl http://localhost:3000/fighters/999
```

Respuesta esperada:

```json
{
  "ok": false,
  "message": "Peleador no encontrado"
}
```

Código HTTP:

```text
404 Not Found
```

---

# Validacion de ID

Ejecutar:

```bash
curl http://localhost:3000/fighters/abc
```

Respuesta esperada:

```json
{
  "ok": false,
  "message": "El ID debe ser un numero entero positivo"
}
```

Código HTTP:

```text
400 Bad Request
```

---

# POST `/fighters`

Permite crear un nuevo peleador.

Ejecutar:

```bash
curl -X POST http://localhost:3000/fighters \
-H "Content-Type: application/json" \
-d '{
  "nombre": "Carlos Vega",
  "edad": 25,
  "categoria": "Lightweight",
  "victorias": 10,
  "derrotas": 2
}'
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Peleador creado correctamente",
  "data": {
    "id": 4,
    "nombre": "Carlos Vega",
    "edad": 25,
    "categoria": "Lightweight",
    "victorias": 10,
    "derrotas": 2
  }
}
```

Código HTTP:

```text
201 Created
```

Después de ejecutar esta petición, el nuevo peleador quedará guardado en:

```text
data/fighters.json
```

---

# Comprobar la persistencia

Después de crear el peleador, ejecutar:

```bash
curl http://localhost:3000/fighters
```

El nuevo peleador deberá aparecer en la respuesta.

También se puede abrir:

```text
data/fighters.json
```

para comprobar que el archivo fue modificado.

---

# Validacion de POST

Para probar un error por campos faltantes:

```bash
curl -X POST http://localhost:3000/fighters \
-H "Content-Type: application/json" \
-d '{
  "nombre": "Peleador Incompleto"
}'
```

Respuesta esperada:

```json
{
  "ok": false,
  "message": "Todos los campos son obligatorios"
}
```

Código HTTP:

```text
400 Bad Request
```

---

# PUT `/fighters/:id`

Permite actualizar un peleador existente.

Por ejemplo:

```bash
curl -X PUT http://localhost:3000/fighters/1 \
-H "Content-Type: application/json" \
-d '{
  "victorias": 14,
  "derrotas": 2
}'
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Peleador actualizado correctamente",
  "data": {
    "id": 1,
    "nombre": "Alex Morales",
    "edad": 24,
    "categoria": "Welter",
    "victorias": 14,
    "derrotas": 2
  }
}
```

Código HTTP:

```text
200 OK
```

El cambio queda guardado en:

```text
data/fighters.json
```

---

# PUT de un peleador inexistente

Ejecutar:

```bash
curl -X PUT http://localhost:3000/fighters/999 \
-H "Content-Type: application/json" \
-d '{
  "victorias": 20
}'
```

Respuesta esperada:

```json
{
  "ok": false,
  "message": "Peleador no encontrado"
}
```

Código HTTP:

```text
404 Not Found
```

---

# DELETE `/fighters/:id`

Permite eliminar un peleador.

Ejecutar:

```bash
curl -X DELETE http://localhost:3000/fighters/3
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Peleador eliminado correctamente",
  "data": {
    "id": 3,
    "nombre": "Marco Ramirez",
    "edad": 22,
    "categoria": "Lightweight",
    "victorias": 9,
    "derrotas": 1
  }
}
```

Código HTTP:

```text
200 OK
```

El registro también será eliminado de:

```text
data/fighters.json
```

---

# DELETE de un peleador inexistente

Ejecutar:

```bash
curl -X DELETE http://localhost:3000/fighters/999
```

Respuesta esperada:

```json
{
  "ok": false,
  "message": "Peleador no encontrado"
}
```

Código HTTP:

```text
404 Not Found
```

---

# Ruta inexistente

Ejecutar:

```bash
curl http://localhost:3000/kickboxing
```

Respuesta esperada:

```json
{
  "ok": false,
  "message": "Ruta no encontrada"
}
```

Código HTTP:

```text
404 Not Found
```

---

# Concepto principal: persistencia con JSON

En este ejercicio no utilizamos una base de datos.

Los datos se almacenan en:

```text
data/fighters.json
```

El proceso para leer los datos es:

```text
fighters.json
      ↓
 fs.readFile()
      ↓
 JSON.parse()
      ↓
Objeto JavaScript
```

Para guardar los datos:

```text
Objeto JavaScript
      ↓
JSON.stringify()
      ↓
 fs.writeFile()
      ↓
fighters.json
```

---

# ¿Por que esto es persistencia?

Los datos permanecen almacenados después de que termina la ejecución del servidor.

Por ejemplo:

```text
POST /fighters
      ↓
Nuevo peleador
      ↓
fighters.json
```

Si se detiene el servidor:

```text
Ctrl + C
```

y después se vuelve a ejecutar:

```bash
npm start
```

los datos previamente guardados continúan disponibles porque fueron escritos en el archivo JSON.

---

# Separacion de responsabilidades

El proyecto utiliza tres capas principales.

## Routes

Define las rutas:

```text
/fighters
```

## Controllers

Maneja:

* Petición HTTP.
* Validaciones.
* Código de respuesta.
* Respuesta JSON.

## Services

Maneja:

* Lectura del JSON.
* Escritura del JSON.
* Búsqueda.
* Creación.
* Actualización.
* Eliminación.

La idea es evitar colocar toda la lógica dentro de `app.js`.

---

# Codigos HTTP utilizados

| Código | Significado           | Uso                        |
| ------ | --------------------- | -------------------------- |
| 200    | OK                    | Operación exitosa          |
| 201    | Created               | Recurso creado             |
| 400    | Bad Request           | Datos inválidos            |
| 404    | Not Found             | Recurso o ruta inexistente |
| 500    | Internal Server Error | Error interno              |

---

# Flujo de una peticion GET

```text
Cliente
   |
   | GET /fighters
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
fighters.json
   |
   v
JSON.parse()
   |
   v
Controller
   |
   v
Respuesta JSON
```

---

# Flujo de una peticion POST

```text
Cliente
   |
   | POST /fighters
   v
Route
   |
   v
Controller
   |
   | Validacion
   v
Service
   |
   | JSON.stringify()
   v
fighters.json
   |
   v
Respuesta 201
```

---

# Casos de error contemplados

El proyecto valida:

* ID inválido.
* ID inexistente.
* Campos obligatorios faltantes.
* Nombre con tipo incorrecto.
* Categoría con tipo incorrecto.
* Edad inválida.
* Victorias inválidas.
* Derrotas inválidas.
* Rutas inexistentes.
* Errores durante lectura o escritura del archivo.

---

# Importante sobre las pruebas

Las pruebas de `POST`, `PUT` y `DELETE` modifican realmente:

```text
data/fighters.json
```

Por eso, después de realizar todas las pruebas CRUD, el contenido del archivo puede ser diferente al contenido inicial.

Si se desea volver al estado inicial del ejercicio, se puede restaurar manualmente `data/fighters.json` con los siguientes datos:

```json
[
  {
    "id": 1,
    "nombre": "Alex Morales",
    "edad": 24,
    "categoria": "Welter",
    "victorias": 12,
    "derrotas": 2
  },
  {
    "id": 2,
    "nombre": "Diego Castillo",
    "edad": 27,
    "categoria": "Middleweight",
    "victorias": 15,
    "derrotas": 3
  },
  {
    "id": 3,
    "nombre": "Marco Ramirez",
    "edad": 22,
    "categoria": "Lightweight",
    "victorias": 9,
    "derrotas": 1
  }
]
```

---

# Checklist de validacion

* [x] Existe `package.json`.
* [x] Existe `package-lock.json`.
* [x] Existe una carpeta `src/`.
* [x] Existe una carpeta `data/`.
* [x] Se utiliza Express.
* [x] Se utiliza JSON.
* [x] Se utiliza `fs`.
* [x] Se utiliza persistencia local.
* [x] Existe `GET /health`.
* [x] Existe `GET /fighters`.
* [x] Existe `GET /fighters/:id`.
* [x] Existe `POST /fighters`.
* [x] Existe `PUT /fighters/:id`.
* [x] Existe `DELETE /fighters/:id`.
* [x] Se validan datos de entrada.
* [x] Se manejan recursos inexistentes.
* [x] Se manejan rutas inexistentes.
* [x] Se utilizan códigos HTTP coherentes.
* [x] Se separan rutas, controladores y servicios.
* [x] `node_modules/` está excluido.
* [x] No se utiliza una base de datos externa.
* [x] El ejercicio está dentro de la carpeta personal.

---

# Entrega

La solución debe encontrarse dentro de:

```text
basico/ejercicio-09/resoluciones/joseph-ramirez/
```

No se deben modificar:

* Archivos base del ejercicio.
* Entregas de otros estudiantes.
* Carpetas de otros estudiantes.

El Pull Request debe dirigirse hacia:

```text
dev
```

No debe dirigirse hacia:

```text
main
```
