# BASICO 29 - README Técnico

## Información del proyecto

* **Ejercicio:** BASICO 29
* **Tema:** README técnico
* **Temática:** Fútbol y fútbol sala
* **Alumno:** Joseph Ramirez
* **Tecnología:** Node.js + Express
* **Puerto:** 3000

---

# Descripción

Este proyecto consiste en una pequeña API REST desarrollada con Node.js y Express.

La aplicación permite consultar información de jugadores relacionados con fútbol y fútbol sala.

El objetivo principal del ejercicio es practicar la creación de un **README técnico**, proporcionando información suficiente para que otro desarrollador pueda:

* Entender el proyecto.
* Instalar sus dependencias.
* Ejecutarlo.
* Conocer su estructura.
* Consultar los endpoints disponibles.
* Comprender las respuestas HTTP.
* Probar los casos correctos y los errores esperados.

---

# Objetivo

El proyecto busca demostrar una estructura básica y ordenada de una aplicación backend.

Se utilizan tres capas principales:

```text
Routes
   ↓
Controllers
   ↓
Services
```

Cada capa tiene una responsabilidad específica.

---

# Tecnologías utilizadas

* Node.js 20 o superior recomendado.
* Express 5.
* JavaScript.
* npm.
* JSON para las respuestas HTTP.
* Datos almacenados temporalmente en memoria.

No se utiliza una base de datos externa.

---

# Requisitos previos

Antes de ejecutar el proyecto se recomienda tener instalado:

```text
Node.js 20+
npm
```

Para comprobar las versiones:

```bash
node -v
npm -v
```

---

# Instalación

Clonar o tener disponible el repositorio del proyecto y entrar a la carpeta:

```bash
cd basico/ejercicio-29/resoluciones/joseph-ramirez
```

Instalar las dependencias:

```bash
npm install
```

Esto instalará Express y las dependencias necesarias del proyecto.

---

# Scripts disponibles

## `npm start`

Inicia el servidor normalmente:

```bash
npm start
```

El servidor estará disponible en:

```text
http://localhost:3000
```

---

## `npm run dev`

Inicia el servidor utilizando `node --watch`:

```bash
npm run dev
```

Este modo permite reiniciar automáticamente la aplicación cuando se detectan cambios en los archivos.

---

## `npm run check`

Comprueba la sintaxis de `src/app.js`:

```bash
npm run check
```

Si no existen errores de sintaxis, el comando termina correctamente.

---

# Estructura del proyecto

```text
basico/ejercicio-29/resoluciones/joseph-ramirez/
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
└── src/
    ├── app.js
    ├── controllers/
    │   └── players.controller.js
    ├── routes/
    │   └── players.routes.js
    └── services/
        └── players.service.js
```

---

# Responsabilidad de cada archivo

## `src/app.js`

Es el punto de entrada de la aplicación.

Se encarga de:

* Crear la aplicación Express.
* Configurar `express.json()`.
* Definir `/health`.
* Registrar las rutas de jugadores.
* Manejar rutas inexistentes.
* Iniciar el servidor.

---

## `src/routes/players.routes.js`

Contiene las rutas relacionadas con jugadores.

Actualmente existen:

```text
GET /
GET /:id
```

Estas rutas se encuentran montadas en:

```text
/players
```

Por lo tanto, las rutas completas son:

```text
GET /players
GET /players/:id
```

---

## `src/controllers/players.controller.js`

Los controladores reciben la petición HTTP y construyen la respuesta.

También realizan la validación básica del ID recibido.

Responsabilidades:

* Obtener todos los jugadores.
* Obtener un jugador por ID.
* Validar IDs.
* Devolver códigos HTTP apropiados.
* Formatear las respuestas JSON.

---

## `src/services/players.service.js`

Contiene los datos de los jugadores y las funciones para consultarlos.

Responsabilidades:

* Mantener los datos en memoria.
* Obtener todos los jugadores.
* Buscar un jugador por ID.

La lógica de acceso a los datos no se coloca directamente dentro del controlador.

---

# Datos iniciales

La API comienza con cuatro jugadores:

| ID | Jugador         | Equipo        | Modalidad   | Posición  | Goles |
| -: | --------------- | ------------- | ----------- | --------- | ----: |
|  1 | Carlos Martinez | Guatemala FC  | Futbol      | Delantero |    12 |
|  2 | Luis Gonzalez   | Futsal United | Futbol Sala | Ala       |     8 |
|  3 | Miguel Herrera  | Real Capital  | Futbol      | Defensa   |     3 |
|  4 | Diego Lopez     | Sala Stars    | Futbol Sala | Pivot     |    15 |

Los datos están almacenados en memoria.

Por esta razón, cualquier modificación que se hiciera durante la ejecución se perdería al reiniciar el servidor.

---

# API

## GET `/health`

Comprueba que el servidor está funcionando.

### Petición

```http
GET /health
```

### curl

```bash
curl http://localhost:3000/health
```

### Respuesta

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "README tecnico"
}
```

### Código HTTP

```text
200 OK
```

---

# GET `/players`

Obtiene todos los jugadores.

### Petición

```http
GET /players
```

### curl

```bash
curl http://localhost:3000/players
```

### Respuesta esperada

```json
{
  "ok": true,
  "data": [
    {
      "id": 1,
      "nombre": "Carlos Martinez",
      "equipo": "Guatemala FC",
      "modalidad": "Futbol",
      "posicion": "Delantero",
      "goles": 12
    }
  ]
}
```

La respuesta completa contiene los cuatro jugadores.

### Código HTTP

```text
200 OK
```

---

# GET `/players/:id`

Obtiene un jugador específico mediante su ID.

### Ejemplo

```http
GET /players/1
```

### curl

```bash
curl http://localhost:3000/players/1
```

### Respuesta

```json
{
  "ok": true,
  "data": {
    "id": 1,
    "nombre": "Carlos Martinez",
    "equipo": "Guatemala FC",
    "modalidad": "Futbol",
    "posicion": "Delantero",
    "goles": 12
  }
}
```

### Código HTTP

```text
200 OK
```

---

# GET `/players/2`

Otra prueba válida:

```bash
curl http://localhost:3000/players/2
```

Debe devolver a:

```text
Luis Gonzalez
```

---

# Error: jugador inexistente

Se puede probar un ID que no existe:

```bash
curl http://localhost:3000/players/999
```

### Respuesta

```json
{
  "ok": false,
  "status": 404,
  "message": "Jugador no encontrado"
}
```

### Código HTTP

```text
404 Not Found
```

---

# Error: ID inválido

Se puede enviar texto en lugar de un número:

```bash
curl http://localhost:3000/players/abc
```

### Respuesta

```json
{
  "ok": false,
  "status": 400,
  "message": "El ID debe ser un numero entero positivo"
}
```

### Código HTTP

```text
400 Bad Request
```

---

# Error: ID igual a cero

Probar:

```bash
curl http://localhost:3000/players/0
```

La API debe responder:

```json
{
  "ok": false,
  "status": 400,
  "message": "El ID debe ser un numero entero positivo"
}
```

---

# Error: ruta inexistente

Probar una ruta que no existe:

```bash
curl http://localhost:3000/teams
```

### Respuesta

```json
{
  "ok": false,
  "status": 404,
  "message": "Ruta no encontrada"
}
```

---

# Códigos HTTP utilizados

| Código | Significado | Uso                              |
| -----: | ----------- | -------------------------------- |
|    200 | OK          | Petición procesada correctamente |
|    400 | Bad Request | ID inválido                      |
|    404 | Not Found   | Jugador o ruta inexistente       |

---

# Flujo de una petición

Para:

```text
GET /players/1
```

el flujo de la aplicación es:

```text
Cliente
   ↓
Express
   ↓
players.routes.js
   ↓
players.controller.js
   ↓
players.service.js
   ↓
Datos en memoria
   ↓
Controller
   ↓
Respuesta JSON
```

Esto permite mantener responsabilidades separadas.

---

# Validación

El controlador verifica que el ID recibido sea:

1. Un número.
2. Un número entero.
3. Mayor que cero.

La validación utiliza:

```javascript
Number.isInteger(id)
```

y:

```javascript
id <= 0
```

Si la validación falla se devuelve:

```text
400 Bad Request
```

Si el ID es válido pero no existe:

```text
404 Not Found
```

Si existe:

```text
200 OK
```

---

# Ejecución completa

Desde la carpeta del ejercicio:

```bash
npm install
npm run check
npm run dev
```

Cuando aparezca el mensaje del servidor:

```text
Servidor Express ejecutandose en http://localhost:3000
```

se puede comenzar a realizar las pruebas.

---

# Pruebas rápidas

## Health

```bash
curl http://localhost:3000/health
```

## Todos los jugadores

```bash
curl http://localhost:3000/players
```

## Jugador existente

```bash
curl http://localhost:3000/players/1
```

## Otro jugador

```bash
curl http://localhost:3000/players/4
```

## Jugador inexistente

```bash
curl http://localhost:3000/players/999
```

## ID inválido

```bash
curl http://localhost:3000/players/abc
```

## ID cero

```bash
curl http://localhost:3000/players/0
```

## Ruta inexistente

```bash
curl http://localhost:3000/teams
```

---

# Pruebas con navegador

Las siguientes rutas GET también pueden probarse directamente desde un navegador:

```text
http://localhost:3000/health
```

```text
http://localhost:3000/players
```

```text
http://localhost:3000/players/1
```

```text
http://localhost:3000/players/4
```

---

# Pruebas con Postman o Thunder Client

También se pueden crear solicitudes GET utilizando Postman o Thunder Client.

### Solicitud 1

```text
GET http://localhost:3000/health
```

Esperado:

```text
200
```

### Solicitud 2

```text
GET http://localhost:3000/players
```

Esperado:

```text
200
```

### Solicitud 3

```text
GET http://localhost:3000/players/1
```

Esperado:

```text
200
```

### Solicitud 4

```text
GET http://localhost:3000/players/999
```

Esperado:

```text
404
```

### Solicitud 5

```text
GET http://localhost:3000/players/abc
```

Esperado:

```text
400
```

---

# Manejo de errores

La API contempla errores esperados relacionados con las peticiones.

### ID inválido

```text
400 Bad Request
```

### Jugador inexistente

```text
404 Not Found
```

### Ruta inexistente

```text
404 Not Found
```

Esto permite diferenciar entre:

```text
La petición tiene datos incorrectos
```

y:

```text
La petición es válida pero el recurso no existe
```

---

# Decisiones técnicas

## ¿Por qué separar rutas, controladores y servicios?

La separación permite que cada archivo tenga una responsabilidad clara.

En lugar de colocar toda la lógica dentro de `app.js`, se divide de esta forma:

```text
routes       → Define las rutas
controllers  → Maneja HTTP y validaciones
services     → Maneja los datos y lógica
app.js       → Configura e inicia Express
```

Esto facilita el mantenimiento y permite ampliar el proyecto posteriormente.

---

# ¿Por qué usar datos en memoria?

El ejercicio no requiere una base de datos externa.

Por eso se utiliza un arreglo dentro del servicio:

```javascript
const players = [];
```

Esta solución es suficiente para practicar:

* Rutas.
* Controladores.
* Servicios.
* Parámetros.
* Respuestas HTTP.
* Documentación técnica.

En una aplicación real, el servicio podría comunicarse posteriormente con una base de datos.

---

# ¿Por qué utilizar HTTP 400?

El código `400` indica que la petición enviada por el cliente no cumple con lo esperado.

En este proyecto ocurre cuando:

```text
GET /players/abc
```

porque el ID no es válido.

---

# ¿Por qué utilizar HTTP 404?

El código `404` se utiliza cuando el recurso solicitado no existe.

Ejemplo:

```text
GET /players/999
```

Si no existe un jugador con ese ID, se devuelve `404`.

También se utiliza para rutas que la aplicación no conoce.

---

# Buenas prácticas utilizadas

* Nombres de archivos en minúsculas.
* Separación de responsabilidades.
* Uso de rutas independientes.
* Controladores independientes.
* Servicios independientes.
* Validación básica.
* Códigos HTTP coherentes.
* Respuestas JSON consistentes.
* `node_modules/` excluido de Git.
* README con instrucciones de instalación.
* README con ejemplos de pruebas.
* README con descripción de la arquitectura.
* No se utilizan secretos ni configuraciones sensibles.

---

# Errores comunes al ejecutar

## `Cannot find module 'express'`

Ejecutar:

```bash
npm install
```

---

## El puerto 3000 está ocupado

Puede aparecer un error indicando que el puerto ya está siendo utilizado.

En ese caso, detener el proceso que está utilizando el puerto o ejecutar el proyecto cuando el puerto esté disponible.

---

## El servidor no responde

Comprobar que esté ejecutándose:

```bash
npm run dev
```

Después probar:

```bash
curl http://localhost:3000/health
```

---

# Checklist de entrega

* [ ] Existe `package.json`.
* [ ] Existe `README.md`.
* [ ] Existe `src/app.js`.
* [ ] Existen rutas.
* [ ] Existen controladores.
* [ ] Existe un servicio.
* [ ] `npm install` funciona.
* [ ] `npm run check` funciona.
* [ ] `npm start` funciona.
* [ ] `npm run dev` funciona.
* [ ] `/health` responde correctamente.
* [ ] `/players` responde correctamente.
* [ ] `/players/:id` responde correctamente.
* [ ] Se valida el ID.
* [ ] Se maneja `404`.
* [ ] Se documentaron los endpoints.
* [ ] Se documentaron los comandos de prueba.
* [ ] No se sube `node_modules/`.
* [ ] No se modifican archivos base.
* [ ] No se eliminan entregas de otros estudiantes.
* [ ] El Pull Request apunta a `dev`.

---

# Git

Verificar los cambios:

```bash
git status
```

Agregar únicamente la entrega:

```bash
git add basico/ejercicio-29/resoluciones/joseph-ramirez/
```

Crear el commit:

```bash
git commit -m "feat: resolver basico 29 readme tecnico"
```

Subir la rama:

```bash
git push -u origin alumno/joseph-ramirez/ejercicio-29
```

Crear el Pull Request:

```text
alumno/joseph-ramirez/ejercicio-29 → dev
```

No crear el Pull Request hacia `main`.

---

# Después del Pull Request

Cuando corresponda regresar a la rama `dev`:

```bash
git switch dev
git pull origin dev
```

---

# Resultado esperado

La aplicación debe permitir consultar jugadores de fútbol y fútbol sala mediante una API Express organizada y documentada.

El objetivo principal del ejercicio es que otro desarrollador pueda leer este README y comprender:

```text
Qué hace el proyecto
       ↓
Cómo instalarlo
       ↓
Cómo ejecutarlo
       ↓
Cómo está organizado
       ↓
Qué endpoints existen
       ↓
Cómo probarlos
       ↓
Qué errores puede devolver
```
