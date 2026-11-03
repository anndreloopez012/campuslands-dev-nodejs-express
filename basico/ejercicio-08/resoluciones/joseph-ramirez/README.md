# BASICO 08 - Variables de entorno

## Autor

Joseph Ramirez

## Tematica

Hiperdeportivos

## Tema del ejercicio

Variables de entorno en Node.js y Express.

## Objetivo

Crear una pequeña API con Node.js y Express que permita practicar el uso de variables de entorno mediante `process.env` y la librería `dotenv`.

El proyecto utiliza variables de entorno para configurar información como:

* Puerto del servidor.
* Nombre de la aplicación.
* Entorno de ejecución.

El objetivo es comprender cómo separar la configuración del código fuente y cómo evitar almacenar información sensible directamente en los archivos del proyecto.

---

## Tecnologias utilizadas

* Node.js 20 o superior recomendado.
* Express.
* dotenv.
* JavaScript.
* CommonJS.
* Variables de entorno.
* HTTP/REST.

---

## Estructura del proyecto

```text
joseph-ramirez/
├── .env.example
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
└── src/
    ├── app.js
    ├── controllers/
    │   └── config.controller.js
    ├── routes/
    │   └── config.routes.js
    └── services/
        └── config.service.js
```

---

## Descripcion de archivos

### `src/app.js`

Es el punto de entrada de la aplicación.

Sus responsabilidades principales son:

* Cargar las variables de entorno.
* Crear el servidor Express.
* Configurar el middleware JSON.
* Registrar las rutas.
* Configurar el manejo de rutas inexistentes.
* Iniciar el servidor utilizando el puerto definido en `process.env.PORT`.

---

### `src/routes/config.routes.js`

Contiene las rutas HTTP relacionadas con el ejercicio.

Endpoints:

```text
GET /health
GET /config
```

---

### `src/controllers/config.controller.js`

Contiene la lógica relacionada con las respuestas HTTP.

Se encarga de:

* Recibir la petición.
* Solicitar la configuración al servicio.
* Construir la respuesta JSON.
* Utilizar códigos HTTP adecuados.

---

### `src/services/config.service.js`

Contiene la lógica para obtener la configuración desde las variables de entorno.

Utiliza:

```javascript
process.env.APP_NAME
process.env.APP_ENV
process.env.PORT
```

También contiene valores por defecto para evitar errores si alguna variable no está definida.

---

### `.env.example`

Es una plantilla de las variables necesarias para ejecutar el proyecto.

Contenido:

```env
PORT=3000
APP_NAME=HyperDrive API
APP_ENV=development
```

Este archivo puede compartirse en el repositorio.

---

### `.env`

Contiene las variables de entorno utilizadas localmente.

Ejemplo:

```env
PORT=3000
APP_NAME=HyperDrive API
APP_ENV=development
```

Este archivo no debe subirse al repositorio.

Está incluido en `.gitignore`.

---

### `.gitignore`

Evita subir archivos que no deben formar parte del repositorio:

```text
node_modules/
.env
*.log
```

---

## Instalacion

Desde la carpeta del ejercicio ejecutar:

```bash
npm install
```

Esto instalará las dependencias definidas en `package.json`.

---

## Configuracion de variables de entorno

Crear el archivo `.env` a partir del archivo de ejemplo:

```bash
cp .env.example .env
```

El archivo `.env` debe contener:

```env
PORT=3000
APP_NAME=HyperDrive API
APP_ENV=development
```

No se deben colocar secretos reales dentro de este ejercicio.

---

## Ejecucion del proyecto

Para iniciar el servidor normalmente:

```bash
npm start
```

El servidor deberá mostrar un mensaje similar a:

```text
Servidor ejecutandose en http://localhost:3000
Aplicacion: HyperDrive API
Entorno: development
```

---

## Modo desarrollo

Para ejecutar el proyecto utilizando el modo watch de Node.js:

```bash
npm run dev
```

Con este comando Node.js reiniciará el proceso cuando se detecten cambios en los archivos utilizados por la aplicación.

---

## Verificacion de sintaxis

Para comprobar la sintaxis del archivo principal:

```bash
npm run check
```

El comando utiliza:

```text
node --check src/app.js
```

Si no aparece ningún error de sintaxis, el archivo es válido.

---

# Pruebas de la API

El servidor debe estar ejecutándose antes de realizar las siguientes pruebas.

## 1. Probar `/health`

Desde otra terminal:

```bash
curl http://localhost:3000/health
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "variables de entorno",
  "app": "HyperDrive API",
  "environment": "development"
}
```

Este endpoint permite verificar que:

* El servidor está funcionando.
* Las variables de entorno fueron cargadas.
* `APP_NAME` fue leído correctamente.
* `APP_ENV` fue leído correctamente.

---

## 2. Probar `/config`

Ejecutar:

```bash
curl http://localhost:3000/config
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Configuracion obtenida correctamente",
  "data": {
    "appName": "HyperDrive API",
    "environment": "development",
    "port": 3000
  }
}
```

Esta ruta muestra las variables de configuración utilizadas por la aplicación.

---

## 3. Probar una ruta inexistente

Ejecutar:

```bash
curl http://localhost:3000/hypercars
```

Respuesta esperada:

```json
{
  "ok": false,
  "message": "Ruta no encontrada"
}
```

El servidor debe responder con HTTP `404`.

---

# Prueba de una variable de entorno diferente

Para comprobar que la aplicación realmente obtiene la configuración desde el entorno, se puede modificar temporalmente `.env`.

Por ejemplo:

```env
PORT=4000
APP_NAME=HyperDrive Test
APP_ENV=testing
```

Después detener y volver a iniciar el servidor:

```bash
npm start
```

El servidor deberá utilizar el puerto `4000` y mostrar:

```text
Servidor ejecutandose en http://localhost:4000
Aplicacion: HyperDrive Test
Entorno: testing
```

Luego se puede probar:

```bash
curl http://localhost:4000/health
```

La respuesta deberá reflejar los nuevos valores.

Después de la prueba se puede regresar `.env` a:

```env
PORT=3000
APP_NAME=HyperDrive API
APP_ENV=development
```

---

# Concepto principal: process.env

Node.js proporciona `process.env` para acceder a las variables de entorno disponibles para el proceso.

Por ejemplo:

```javascript
process.env.PORT
```

permite obtener el valor de `PORT`.

En este proyecto se utilizan:

```javascript
process.env.PORT
process.env.APP_NAME
process.env.APP_ENV
```

---

# ¿Por que utilizar dotenv?

Node.js puede leer variables de entorno proporcionadas por el sistema operativo.

`dotenv` facilita el desarrollo local permitiendo cargar variables almacenadas en un archivo `.env`.

La carga se realiza mediante:

```javascript
require("dotenv").config();
```

Después de ejecutar esa instrucción, las variables están disponibles mediante:

```javascript
process.env
```

---

# Seguridad

Nunca se deben subir secretos reales al repositorio.

Por ejemplo, no se debe colocar información real como:

```env
DATABASE_PASSWORD=mi_password_real
API_KEY=clave_real
JWT_SECRET=secreto_real
```

Para este ejercicio únicamente se utilizan variables de configuración simples.

El archivo `.env` está incluido en `.gitignore`:

```gitignore
.env
```

Mientras que `.env.example` funciona como plantilla:

```env
PORT=3000
APP_NAME=HyperDrive API
APP_ENV=development
```

---

# Codigos HTTP utilizados

| Codigo | Significado | Uso                              |
| ------ | ----------- | -------------------------------- |
| 200    | OK          | Petición procesada correctamente |
| 404    | Not Found   | Ruta no encontrada               |

---

# Flujo de la aplicacion

```text
Cliente
   |
   | GET /health
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
process.env
   |
   v
Respuesta JSON
```

---

# Caso feliz

Cuando el servidor está correctamente configurado:

```text
.env
 ↓
dotenv
 ↓
process.env
 ↓
service
 ↓
controller
 ↓
route
 ↓
HTTP 200
```

---

# Caso de error

Cuando se solicita una ruta que no existe:

```text
Cliente
 ↓
Ruta inexistente
 ↓
Middleware 404
 ↓
HTTP 404
```

Respuesta:

```json
{
  "ok": false,
  "message": "Ruta no encontrada"
}
```

---

# Checklist de validacion

* [x] El proyecto tiene `package.json`.
* [x] El proyecto utiliza Node.js y Express.
* [x] Se utiliza `dotenv`.
* [x] Se utilizan variables de entorno.
* [x] Existe `.env.example`.
* [x] `.env` está incluido en `.gitignore`.
* [x] Existe una carpeta `src/`.
* [x] Existe separación entre rutas, controladores y servicios.
* [x] Existe un endpoint `/health`.
* [x] Existe un endpoint `/config`.
* [x] Existe manejo de rutas inexistentes.
* [x] Se utilizan códigos HTTP coherentes.
* [x] Se documentaron los comandos de ejecución.
* [x] Se documentaron las pruebas.
* [x] No se utiliza una base de datos externa.
* [x] No se debe subir `node_modules/`.
* [x] La entrega debe permanecer dentro de la carpeta personal.

---

# Entrega

La solución debe encontrarse dentro de:

```text
basico/ejercicio-08/resoluciones/joseph-ramirez/
```

No se deben modificar:

* Archivos base del ejercicio.
* Entregas de otros estudiantes.
* Carpetas pertenecientes a otros estudiantes.

El Pull Request debe dirigirse hacia:

```text
dev
```

No se debe realizar el Pull Request hacia:

```text
main
```
