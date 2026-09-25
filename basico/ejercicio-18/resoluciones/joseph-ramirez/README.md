# BASICO 18 - Rutas POST

## Tematica

Paracaidismo.

## Descripcion

Este ejercicio implementa una pequena API utilizando **Node.js y Express** para practicar especificamente las rutas HTTP de tipo `POST`.

El objetivo principal es aprender como recibir informacion enviada por el cliente mediante:

```javascript
req.body
```

y posteriormente validar, procesar y almacenar temporalmente esa informacion.

La API permite:

* Consultar paracaidistas.
* Crear nuevos paracaidistas.
* Recibir informacion mediante JSON.
* Validar los datos recibidos.
* Utilizar codigo HTTP `201 Created`.
* Manejar errores de validacion.
* Separar rutas, controladores y servicios.

No se utiliza una base de datos externa.

Los datos utilizados son sinteticos y permanecen en memoria mientras el servidor esta ejecutandose.

---

# Objetivo

Practicar:

* Node.js.
* Express.
* Rutas `GET`.
* Rutas `POST`.
* `express.json()`.
* `req.body`.
* Validacion de datos.
* Respuestas JSON.
* Codigo HTTP `201`.
* Codigo HTTP `400`.
* Separacion de responsabilidades.
* Pruebas de peticiones HTTP.

---

# Requisitos

* Node.js 20 o superior recomendado.
* npm.
* Express.
* Terminal.
* Postman, Thunder Client o `curl`.

---

# Estructura del proyecto

```text
joseph-ramirez/
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
└── src/
    ├── app.js
    ├── controllers/
    │   └── jumpers.controller.js
    ├── routes/
    │   └── jumpers.routes.js
    └── services/
        └── jumpers.service.js
```

---

# Responsabilidad de cada archivo

## `src/app.js`

Es el punto de entrada de la aplicacion.

Se encarga de:

* Crear la aplicacion Express.
* Activar `express.json()`.
* Crear la ruta `/health`.
* Registrar las rutas de paracaidistas.
* Manejar rutas inexistentes.
* Iniciar el servidor.

---

## `src/routes/jumpers.routes.js`

Contiene las rutas relacionadas con los paracaidistas.

Actualmente existen:

```text
GET /jumpers
POST /jumpers
```

Las rutas delegan el trabajo a los controladores.

---

## `src/controllers/jumpers.controller.js`

Se encarga de:

* Recibir las peticiones.
* Leer `req.body`.
* Validar los datos.
* Llamar al servicio.
* Construir las respuestas HTTP.

---

## `src/services/jumpers.service.js`

Contiene los datos sinteticos y la logica relacionada con:

* Obtener todos los paracaidistas.
* Crear un nuevo paracaidista.

---

# Datos iniciales

La API comienza con tres paracaidistas:

1. Carlos Martinez.
2. Laura Gonzalez.
3. Miguel Herrera.

Cada registro contiene:

```text
id
nombre
edad
experiencia
saltos
apto
```

---

# Instalacion

Desde la carpeta del ejercicio:

```bash
npm install
```

---

# Ejecutar el proyecto

## Modo normal

```bash
npm start
```

Debe aparecer:

```text
Servidor Express ejecutandose en http://localhost:3000
```

---

## Modo desarrollo

```bash
npm run dev
```

Este comando utiliza:

```text
node --watch
```

para reiniciar automaticamente el servidor cuando se modifica el codigo.

---

## Comprobar sintaxis

```bash
npm run check
```

Si no existen errores de sintaxis, Node.js terminara correctamente el comando.

---

# Pruebas de la API

## 1. Probar `/health`

Con el servidor ejecutandose:

```bash
curl http://localhost:3000/health
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "rutas POST"
}
```

Codigo HTTP:

```text
200 OK
```

---

# 2. Obtener los paracaidistas

Aunque el ejercicio se enfoca en `POST`, se mantiene una ruta `GET` para poder comprobar facilmente que los registros creados fueron almacenados.

```bash
curl http://localhost:3000/jumpers
```

Respuesta inicial esperada:

```json
{
  "ok": true,
  "message": "Paracaidistas obtenidos correctamente",
  "total": 3,
  "data": [
    {
      "id": 1,
      "nombre": "Carlos Martinez",
      "edad": 28,
      "experiencia": "Intermedio",
      "saltos": 35,
      "apto": true
    },
    {
      "id": 2,
      "nombre": "Laura Gonzalez",
      "edad": 31,
      "experiencia": "Avanzado",
      "saltos": 120,
      "apto": true
    },
    {
      "id": 3,
      "nombre": "Miguel Herrera",
      "edad": 24,
      "experiencia": "Principiante",
      "saltos": 5,
      "apto": true
    }
  ]
}
```

Codigo HTTP:

```text
200 OK
```

---

# 3. Crear un paracaidista

La ruta principal del ejercicio es:

```text
POST /jumpers
```

Para enviar informacion utilizamos JSON.

Ejemplo:

```json
{
  "nombre": "Andres Lopez",
  "edad": 29,
  "experiencia": "Intermedio",
  "saltos": 42,
  "apto": true
}
```

---

## Prueba con curl

```bash
curl -X POST http://localhost:3000/jumpers \
-H "Content-Type: application/json" \
-d '{
  "nombre": "Andres Lopez",
  "edad": 29,
  "experiencia": "Intermedio",
  "saltos": 42,
  "apto": true
}'
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Paracaidista creado correctamente",
  "data": {
    "id": 4,
    "nombre": "Andres Lopez",
    "edad": 29,
    "experiencia": "Intermedio",
    "saltos": 42,
    "apto": true
  }
}
```

Codigo HTTP:

```text
201 Created
```

---

# 4. Comprobar el nuevo registro

Despues de realizar el `POST`, ejecutar:

```bash
curl http://localhost:3000/jumpers
```

Ahora el total debe ser:

```text
4
```

Y debe aparecer:

```text
Andres Lopez
```

---

# 5. Crear otro paracaidista

```bash
curl -X POST http://localhost:3000/jumpers \
-H "Content-Type: application/json" \
-d '{
  "nombre": "Sofia Ramirez",
  "edad": 26,
  "experiencia": "Principiante",
  "saltos": 8,
  "apto": true
}'
```

Debe crearse un nuevo registro con ID `5`.

---

# Validaciones

La ruta `POST /jumpers` valida todos los campos recibidos.

Los campos obligatorios son:

```text
nombre
edad
experiencia
saltos
apto
```

---

# 6. Error: nombre faltante

Probar:

```bash
curl -X POST http://localhost:3000/jumpers \
-H "Content-Type: application/json" \
-d '{
  "edad": 29,
  "experiencia": "Intermedio",
  "saltos": 42,
  "apto": true
}'
```

Respuesta:

```json
{
  "ok": false,
  "message": "El nombre es obligatorio y debe ser un texto"
}
```

Codigo HTTP:

```text
400 Bad Request
```

---

# 7. Error: nombre vacio

```bash
curl -X POST http://localhost:3000/jumpers \
-H "Content-Type: application/json" \
-d '{
  "nombre": "",
  "edad": 29,
  "experiencia": "Intermedio",
  "saltos": 42,
  "apto": true
}'
```

Debe devolver:

```text
400 Bad Request
```

---

# 8. Error: edad invalida

Probar una edad como texto:

```bash
curl -X POST http://localhost:3000/jumpers \
-H "Content-Type: application/json" \
-d '{
  "nombre": "Pedro Lopez",
  "edad": "veinte",
  "experiencia": "Principiante",
  "saltos": 3,
  "apto": true
}'
```

Respuesta:

```json
{
  "ok": false,
  "message": "La edad debe ser un numero entero positivo"
}
```

Codigo HTTP:

```text
400 Bad Request
```

---

# 9. Error: edad igual a cero

```bash
curl -X POST http://localhost:3000/jumpers \
-H "Content-Type: application/json" \
-d '{
  "nombre": "Pedro Lopez",
  "edad": 0,
  "experiencia": "Principiante",
  "saltos": 3,
  "apto": true
}'
```

Debe devolver:

```text
400 Bad Request
```

---

# 10. Error: experiencia faltante

```bash
curl -X POST http://localhost:3000/jumpers \
-H "Content-Type: application/json" \
-d '{
  "nombre": "Pedro Lopez",
  "edad": 25,
  "saltos": 3,
  "apto": true
}'
```

Respuesta:

```json
{
  "ok": false,
  "message": "La experiencia es obligatoria y debe ser un texto"
}
```

Codigo HTTP:

```text
400 Bad Request
```

---

# 11. Error: cantidad de saltos invalida

```bash
curl -X POST http://localhost:3000/jumpers \
-H "Content-Type: application/json" \
-d '{
  "nombre": "Pedro Lopez",
  "edad": 25,
  "experiencia": "Principiante",
  "saltos": -5,
  "apto": true
}'
```

Respuesta:

```json
{
  "ok": false,
  "message": "La cantidad de saltos debe ser un numero entero mayor o igual a cero"
}
```

Codigo HTTP:

```text
400 Bad Request
```

---

# 12. Error: `apto` invalido

El campo `apto` debe ser booleano.

Incorrecto:

```json
{
  "apto": "true"
}
```

Correcto:

```json
{
  "apto": true
}
```

Probar:

```bash
curl -X POST http://localhost:3000/jumpers \
-H "Content-Type: application/json" \
-d '{
  "nombre": "Pedro Lopez",
  "edad": 25,
  "experiencia": "Principiante",
  "saltos": 3,
  "apto": "true"
}'
```

Respuesta:

```json
{
  "ok": false,
  "message": "El campo apto debe ser booleano"
}
```

Codigo HTTP:

```text
400 Bad Request
```

---

# 13. Probar una ruta inexistente

```bash
curl http://localhost:3000/parachutes
```

Respuesta:

```json
{
  "ok": false,
  "status": 404,
  "message": "Ruta no encontrada"
}
```

Codigo HTTP:

```text
404 Not Found
```

---

# Conceptos principales

## ¿Que es una ruta POST?

Una ruta `POST` permite enviar informacion al servidor para que sea procesada.

Ejemplo:

```javascript
router.post("/", jumpersController.createJumper);
```

Cuando el cliente realiza:

```text
POST /jumpers
```

Express ejecuta:

```javascript
createJumper()
```

---

# `req.body`

Una de las partes mas importantes del ejercicio es:

```javascript
req.body
```

Este objeto contiene los datos enviados por el cliente en el cuerpo de la peticion.

Por ejemplo, si enviamos:

```json
{
  "nombre": "Andres Lopez",
  "edad": 29,
  "experiencia": "Intermedio",
  "saltos": 42,
  "apto": true
}
```

podemos obtenerlos mediante:

```javascript
const {
  nombre,
  edad,
  experiencia,
  saltos,
  apto
} = req.body;
```

---

# ¿Por que necesitamos `express.json()`?

En `app.js` tenemos:

```javascript
app.use(express.json());
```

Este middleware permite que Express pueda interpretar solicitudes cuyo cuerpo contiene JSON.

Sin esta configuracion, `req.body` no funcionaria correctamente para este tipo de peticiones.

---

# GET vs POST

## GET

Se utiliza principalmente para obtener informacion.

Ejemplo:

```text
GET /jumpers
```

No estamos creando un nuevo registro.

---

## POST

Se utiliza para enviar informacion al servidor.

Ejemplo:

```text
POST /jumpers
```

En este ejercicio el servidor recibe los datos y crea un nuevo paracaidista.

---

# ¿Por que utilizamos 201?

Cuando se crea correctamente un nuevo recurso utilizamos:

```text
201 Created
```

Por eso el controlador responde:

```javascript
res.status(201).json({
  ok: true,
  message: "Paracaidista creado correctamente",
  data: newJumper
});
```

---

# ¿Por que utilizamos 400?

El código:

```text
400 Bad Request
```

indica que los datos enviados por el cliente no cumplen las condiciones necesarias.

Por ejemplo:

```text
edad: "veinte"
```

o:

```text
saltos: -5
```

---

# Flujo de una peticion POST

Cuando ejecutamos:

```text
POST /jumpers
```

el flujo es:

```text
Cliente
   |
   v
Express
   |
   v
express.json()
   |
   v
jumpers.routes.js
   |
   v
jumpers.controller.js
   |
   v
req.body
   |
   v
Validacion
   |
   v
jumpers.service.js
   |
   v
Nuevo paracaidista
   |
   v
JSON Response
   |
   v
Cliente
```

---

# Separacion de responsabilidades

## `app.js`

Configura Express y registra las rutas.

## `routes`

Define los endpoints.

## `controllers`

Reciben la peticion, validan los datos y preparan la respuesta HTTP.

## `services`

Manejan los datos y la logica relacionada con los paracaidistas.

Esta separacion permite mantener el proyecto organizado.

---

# Pruebas con Postman o Thunder Client

Tambien se puede probar el endpoint:

```text
POST http://localhost:3000/jumpers
```

Seleccionar:

```text
Body
→ JSON
```

Y enviar:

```json
{
  "nombre": "Andres Lopez",
  "edad": 29,
  "experiencia": "Intermedio",
  "saltos": 42,
  "apto": true
}
```

La respuesta debe tener:

```text
201 Created
```

---

# Prueba final recomendada

Primero consultar los registros:

```bash
curl http://localhost:3000/jumpers
```

Luego crear uno:

```bash
curl -X POST http://localhost:3000/jumpers \
-H "Content-Type: application/json" \
-d '{
  "nombre": "Andres Lopez",
  "edad": 29,
  "experiencia": "Intermedio",
  "saltos": 42,
  "apto": true
}'
```

Finalmente volver a consultar:

```bash
curl http://localhost:3000/jumpers
```

El total debe haber aumentado en uno.

---

# Checklist final

Antes de entregar:

* [ ] `npm install` funciona.
* [ ] `npm start` inicia el servidor.
* [ ] `npm run dev` funciona.
* [ ] `npm run check` no muestra errores.
* [ ] `GET /health` funciona.
* [ ] `GET /jumpers` funciona.
* [ ] `POST /jumpers` funciona.
* [ ] Se utiliza `express.json()`.
* [ ] Se utiliza `req.body`.
* [ ] Los datos del `POST` son validados.
* [ ] Un registro valido devuelve `201`.
* [ ] Datos invalidos devuelven `400`.
* [ ] Una ruta inexistente devuelve `404`.
* [ ] Se utilizan rutas, controladores y servicios.
* [ ] No se utiliza una base de datos externa.
* [ ] No se sube `node_modules/`.
* [ ] La entrega esta dentro de `resoluciones/joseph-ramirez/`.
* [ ] El Pull Request apunta a `dev`.
* [ ] No se modifica la entrega de otro estudiante.

---

# Git

Antes del commit:

```bash
git status
```

Agregar solamente la entrega:

```bash
git add basico/ejercicio-18/resoluciones/joseph-ramirez/
```

Crear el commit:

```bash
git commit -m "feat: resolver basico 18 rutas POST"
```

Subir la rama:

```bash
git push -u origin alumno/joseph-ramirez/ejercicio-18
```

El Pull Request debe ser:

```text
alumno/joseph-ramirez/ejercicio-18 → dev
```

No debe apuntar a `main`.

---

# Despues del Pull Request

Cuando termines el PR y quieras continuar con el siguiente ejercicio:

```bash
git switch dev
git pull origin dev
```
