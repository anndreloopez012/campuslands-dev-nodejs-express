# BASICO 05 - fs para leer archivos

## Autor

Joseph Ramirez

## Temática

Fútbol y fútbol sala.

## Objetivo

Crear una API básica con Node.js y Express que utilice el módulo `fs` para leer información almacenada en un archivo JSON.

El ejercicio busca practicar la separación entre rutas, controladores y servicios, utilizando `fs.readFile()` para obtener datos desde un archivo local.

---

## Tecnologías utilizadas

* Node.js
* Express
* JavaScript
* CommonJS
* Módulo nativo `fs`
* Módulo nativo `path`
* JSON

Se recomienda utilizar Node.js 20 o superior.

---

## Estructura del proyecto

```text
joseph-ramirez/
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
├── data/
│   └── teams.json
└── src/
    ├── app.js
    ├── routes/
    │   └── teams.routes.js
    ├── controllers/
    │   └── teams.controller.js
    └── services/
        └── teams.service.js
```

---

## Responsabilidad de cada archivo

### `src/app.js`

Es el punto de entrada de la aplicación.

Se encarga de:

* Crear el servidor Express.
* Configurar `express.json()`.
* Registrar las rutas.
* Crear la ruta `/health`.
* Manejar rutas inexistentes.
* Iniciar el servidor en el puerto `3000`.

### `src/routes/teams.routes.js`

Define las rutas relacionadas con los equipos.

Actualmente contiene:

```text
GET /
```

Esta ruta se encuentra disponible mediante:

```text
GET /teams
```

### `src/controllers/teams.controller.js`

Recibe la petición HTTP y construye la respuesta.

También maneja los errores producidos durante la lectura del archivo.

### `src/services/teams.service.js`

Contiene la lógica principal del ejercicio.

Utiliza:

```javascript
const fs = require("fs/promises");
```

y:

```javascript
fs.readFile()
```

para leer el archivo `data/teams.json`.

Después convierte el contenido JSON de texto a un arreglo de objetos mediante:

```javascript
JSON.parse()
```

### `data/teams.json`

Contiene los datos sintéticos de equipos de fútbol y fútbol sala.

No se utiliza una base de datos externa.

---

## Datos utilizados

El archivo `data/teams.json` contiene cuatro equipos:

| ID | Equipo          | Deporte     | País      | Jugadores | Estado   |
| -: | --------------- | ----------- | --------- | --------: | -------- |
|  1 | Guatemala FC    | fútbol      | Guatemala |        11 | activo   |
|  2 | Barcelona Sala  | fútbol sala | España    |         5 | activo   |
|  3 | Lobos del Campo | fútbol      | México    |        11 | activo   |
|  4 | Titanes Futsal  | fútbol sala | Argentina |         5 | inactivo |

Los datos son únicamente sintéticos y fueron creados para realizar las pruebas del ejercicio.

---

# Instalación

Desde esta carpeta:

```text
basico/ejercicio-05/resoluciones/joseph-ramirez/
```

instalar las dependencias con:

```bash
npm install
```

Esto instalará Express y generará las dependencias necesarias.

No se debe subir la carpeta:

```text
node_modules/
```

al repositorio.

---

# Ejecución

## Modo normal

Ejecutar:

```bash
npm start
```

La aplicación debe mostrar un mensaje similar a:

```text
Servidor ejecutándose en http://localhost:3000
```

---

## Modo desarrollo

Ejecutar:

```bash
npm run dev
```

Este comando utiliza:

```text
node --watch
```

para reiniciar automáticamente la aplicación cuando se modifica un archivo.

---

# Verificación de sintaxis

Para comprobar la sintaxis básica del archivo principal:

```bash
npm run check
```

Si no existen errores de sintaxis, Node.js finalizará el comando correctamente.

---

# Pruebas de la API

Las pruebas pueden realizarse utilizando navegador, Thunder Client, Postman o `curl`.

---

## Prueba 1 - Health check

Realizar una petición:

```http
GET http://localhost:3000/health
```

También se puede probar desde una terminal con:

```bash
curl http://localhost:3000/health
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "fs para leer archivos"
}
```

Esta ruta confirma que el servidor está funcionando.

---

## Prueba 2 - Leer los equipos

Realizar:

```http
GET http://localhost:3000/teams
```

O mediante:

```bash
curl http://localhost:3000/teams
```

La API debe leer `data/teams.json` utilizando `fs.readFile()` y devolver los datos.

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Equipos obtenidos correctamente",
  "total": 4,
  "data": [
    {
      "id": 1,
      "nombre": "Guatemala FC",
      "deporte": "futbol",
      "pais": "Guatemala",
      "jugadores": 11,
      "estado": "activo"
    },
    {
      "id": 2,
      "nombre": "Barcelona Sala",
      "deporte": "futbol-sala",
      "pais": "España",
      "jugadores": 5,
      "estado": "activo"
    },
    {
      "id": 3,
      "nombre": "Lobos del Campo",
      "deporte": "futbol",
      "pais": "México",
      "jugadores": 11,
      "estado": "activo"
    },
    {
      "id": 4,
      "nombre": "Titanes Futsal",
      "deporte": "futbol-sala",
      "pais": "Argentina",
      "jugadores": 5,
      "estado": "inactivo"
    }
  ]
}
```

---

# Prueba 3 - Ruta inexistente

Realizar una petición:

```http
GET http://localhost:3000/players
```

O:

```bash
curl http://localhost:3000/players
```

La respuesta debe tener código HTTP:

```text
404
```

Y devolver:

```json
{
  "ok": false,
  "message": "Ruta no encontrada"
}
```

Esta prueba confirma que existe un manejo básico de rutas inexistentes.

---

# Prueba 4 - Comprobar que los datos vienen del archivo

Con el servidor ejecutándose, modificar temporalmente el archivo:

```text
data/teams.json
```

Por ejemplo, cambiar:

```json
"nombre": "Guatemala FC"
```

por:

```json
"nombre": "Guatemala Stars"
```

Guardar el archivo y volver a realizar:

```bash
curl http://localhost:3000/teams
```

La respuesta debe mostrar:

```text
Guatemala Stars
```

Esto demuestra que la información está siendo leída desde `teams.json` y no está escrita directamente dentro del controlador.

Después de la prueba, se puede devolver el nombre original si se desea conservar los datos iniciales.

---

# Prueba 5 - Comprobar el manejo de errores

La API tiene un bloque `try/catch` en el controlador para manejar problemas al leer el archivo.

Para comprobar este comportamiento de forma controlada, detener el servidor y cambiar temporalmente el nombre del archivo:

```text
data/teams.json
```

por:

```text
data/teams-backup.json
```

Después iniciar nuevamente:

```bash
npm start
```

y realizar:

```bash
curl http://localhost:3000/teams
```

La API debe responder con código:

```text
500
```

y:

```json
{
  "ok": false,
  "message": "No fue posible leer el archivo de equipos"
}
```

Después de la prueba, restaurar el nombre:

```text
data/teams.json
```

y reiniciar el servidor.

---

# Flujo de la petición

Cuando se realiza:

```http
GET /teams
```

el flujo es:

```text
Cliente
   │
   ▼
GET /teams
   │
   ▼
teams.routes.js
   │
   ▼
teams.controller.js
   │
   ▼
teams.service.js
   │
   ▼
fs.readFile()
   │
   ▼
data/teams.json
   │
   ▼
JSON.parse()
   │
   ▼
Respuesta JSON
```

---

# Concepto principal: fs

`fs` significa **File System** y es un módulo nativo de Node.js utilizado para trabajar con archivos y directorios.

En este ejercicio se utiliza:

```javascript
const fs = require("fs/promises");
```

para trabajar con las funciones de archivos utilizando `async/await`.

La lectura principal es:

```javascript
const fileContent = await fs.readFile(filePath, "utf-8");
```

El resultado de `readFile()` es texto.

Por eso posteriormente se utiliza:

```javascript
const teams = JSON.parse(fileContent);
```

para convertir ese texto JSON en un arreglo de JavaScript.

---

# ¿Por qué utilizar un servicio?

La lectura del archivo está dentro de:

```text
services/teams.service.js
```

y no directamente dentro de la ruta.

Esto permite separar responsabilidades:

```text
routes
→ define las rutas

controllers
→ maneja la petición y respuesta HTTP

services
→ contiene la lógica para obtener los datos

data
→ almacena los datos
```

Esta organización facilita que el proyecto pueda crecer posteriormente.

---

# Códigos HTTP utilizados

| Código | Situación                        |
| -----: | -------------------------------- |
|    200 | Consulta realizada correctamente |
|    404 | Ruta inexistente                 |
|    500 | Error al leer el archivo         |

---

# Checklist de validación

La entrega cumple el ejercicio si:

* [x] Tiene `package.json`.
* [x] Tiene `README.md`.
* [x] Tiene carpeta `src/`.
* [x] Utiliza Express.
* [x] Utiliza el módulo `fs`.
* [x] Utiliza `fs.readFile()`.
* [x] Lee información desde un archivo JSON.
* [x] Utiliza `JSON.parse()`.
* [x] Separa rutas, controladores y servicios.
* [x] Tiene datos sintéticos.
* [x] Tiene una ruta `/health`.
* [x] Tiene un endpoint principal `/teams`.
* [x] Maneja rutas inexistentes.
* [x] Maneja errores de lectura del archivo.
* [x] Tiene scripts `start`, `dev` y `check`.
* [x] No requiere una base de datos externa.
* [x] No requiere variables secretas.
* [x] No debe incluir `node_modules/`.

---

# Reglas de entrega

La solución debe permanecer dentro de:

```text
basico/ejercicio-05/resoluciones/joseph-ramirez/
```

No modificar:

* Archivos base del ejercicio.
* Entregas de otros estudiantes.
* Carpetas pertenecientes a otros estudiantes.

No subir:

```text
node_modules/
```

No subir archivos `.env` que contengan secretos reales.

Si se realiza un Pull Request, debe dirigirse a:

```text
dev
```

y no a:

```text
main
```

---

# Resultado esperado

Al completar el ejercicio se debe tener una API capaz de:

1. Iniciar un servidor Express.
2. Recibir una petición `GET /teams`.
3. Leer `data/teams.json` mediante `fs`.
4. Convertir el contenido JSON en datos JavaScript.
5. Devolver los equipos mediante una respuesta HTTP.
6. Manejar errores de lectura.
7. Mantener separadas las responsabilidades del proyecto.

El concepto principal demostrado es:

```text
fs.readFile()
```

para leer archivos desde Node.js.
