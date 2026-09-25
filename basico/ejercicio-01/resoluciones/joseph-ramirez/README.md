# BASICO 01 - Node Runtime y Consola

## Estudiante

Joseph Ramirez

## Ejercicio

BASICO 01

## Tema

Node runtime y consola

## Contexto

Este ejercicio representa una primera aproximación al desarrollo backend utilizando Node.js y Express.

El objetivo principal es comprender cómo se ejecuta una aplicación Node.js, cómo utilizar la consola para observar información del runtime y cómo crear una ruta HTTP sencilla.

El ejercicio utiliza un escenario relacionado con videojuegos RPG.

## Objetivos

* Comprender el concepto de Node.js runtime.
* Utilizar `console.log()` para mostrar información.
* Obtener información del entorno mediante `process`.
* Crear un servidor básico con Express.
* Crear una ruta HTTP.
* Separar rutas, controladores y servicios.
* Devolver respuestas JSON.
* Manejar una ruta inexistente.
* Practicar la lectura de errores.
* Documentar la ejecución del proyecto.

## Tecnologías

* Node.js
* Express
* JavaScript
* npm

## Requisitos

* Node.js 20 o superior recomendado.
* npm.

## Instalación

Desde la carpeta del ejercicio ejecutar:

```bash
npm install
```

## Ejecución

Para iniciar el proyecto normalmente:

```bash
npm start
```

Para iniciar el proyecto en modo desarrollo:

```bash
npm run dev
```

El proyecto utiliza `node --watch`, por lo que se reinicia automáticamente cuando se modifica un archivo.

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
    │   └── health.controller.js
    ├── routes/
    │   └── health.routes.js
    └── services/
        └── health.service.js
```

### Descripción de los archivos

* `src/app.js`: punto de entrada de la aplicación y configuración del servidor.
* `src/routes/health.routes.js`: define la ruta `/health`.
* `src/controllers/health.controller.js`: recibe la petición y devuelve la respuesta HTTP.
* `src/services/health.service.js`: contiene la información que devuelve el ejercicio.
* `README.md`: documentación del ejercicio.
* `package.json`: configuración del proyecto y scripts de ejecución.
* `.gitignore`: evita subir archivos como `node_modules`.

## Cómo probar el ejercicio

### 1. Iniciar el servidor

Desde la carpeta del proyecto:

```bash
npm run dev
```

El servidor debe mostrar un mensaje similar a:

```text
Node.js Runtime iniciado
Servidor ejecutándose en http://localhost:3000
```

### 2. Probar la ruta principal

Abrir en el navegador:

```text
http://localhost:3000/health
```

También se puede probar desde la terminal utilizando:

```bash
curl http://localhost:3000/health
```

La respuesta esperada es:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "Node runtime y consola",
  "runtime": "Node.js",
  "status": "running"
}
```

### 3. Probar una ruta inexistente

Para comprobar el manejo de errores, ejecutar:

```bash
curl http://localhost:3000/otra-ruta
```

La respuesta esperada es:

```json
{
  "ok": false,
  "message": "Ruta no encontrada",
  "path": "/otra-ruta"
}
```

El código HTTP esperado es:

```text
404
```

### 4. Comprobar la consola

Al iniciar el servidor se muestran datos del runtime de Node.js mediante `console.log()`.

Entre ellos:

* Versión de Node.js.
* Sistema operativo.
* Puerto utilizado.
* URL del servidor.

Al realizar una petición a `/health`, también se muestra en la terminal:

```text
Solicitud recibida: GET /health
```

## Comandos principales

Instalar dependencias:

```bash
npm install
```

Ejecutar el proyecto:

```bash
npm start
```

Ejecutar en desarrollo:

```bash
npm run dev
```

Probar el endpoint:

```bash
curl http://localhost:3000/health
```

Probar una ruta inexistente:

```bash
curl http://localhost:3000/otra-ruta
```

## Resultado esperado

El ejercicio debe iniciar correctamente y permitir probar:

* El runtime de Node.js.
* El uso de `console.log()`.
* La información proporcionada por `process`.
* La ruta `GET /health`.
* Una respuesta JSON.
* El manejo de una ruta inexistente mediante `404`.
* La separación entre
