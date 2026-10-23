# BASICO 02 - npm scripts y package.json

## Estudiante

Joseph Ramirez

## Ejercicio

BASICO 02

## Tema

npm scripts y package.json

## Contexto

Este ejercicio representa una segunda aproximación al desarrollo backend utilizando Node.js y Express.

El objetivo principal es comprender cómo utilizar `package.json` para configurar y ejecutar diferentes comandos mediante `npm scripts`.

El ejercicio utiliza un escenario relacionado con shooters competitivos.

La aplicación permite consultar una lista básica de partidas y utiliza diferentes scripts para ejecutar, verificar y consultar información del proyecto.

## Objetivos

* Comprender la función de `package.json`.
* Comprender qué son los npm scripts.
* Crear scripts personalizados.
* Ejecutar una aplicación mediante `npm`.
* Utilizar `node --watch` durante el desarrollo.
* Realizar una comprobación básica de sintaxis.
* Utilizar argumentos de Node.js mediante `process.argv`.
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

Desde la carpeta del proyecto ejecutar:

```bash
npm install
```

Este comando instala las dependencias definidas en `package.json`.

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
    │   └── matches.controller.js
    ├── routes/
    │   └── matches.routes.js
    └── services/
        └── matches.service.js
```

## Descripción de los archivos

### package.json

Contiene la información y configuración principal del proyecto.

En este ejercicio también contiene los scripts utilizados para ejecutar y comprobar la aplicación.

Los scripts configurados son:

```json
"scripts": {
  "start": "node src/app.js",
  "dev": "node --watch src/app.js",
  "check": "node --check src/app.js",
  "info": "node src/app.js --info"
}
```

### src/app.js

Es el punto de entrada de la aplicación.

Configura Express, registra las rutas y levanta el servidor.

También contiene la lectura del argumento:

```javascript
process.argv.includes("--info")
```

que permite utilizar el script `npm run info`.

### src/routes/matches.routes.js

Define las rutas relacionadas con las partidas.

### src/controllers/matches.controller.js

Recibe las peticiones HTTP, utiliza el servicio correspondiente y genera las respuestas.

### src/services/matches.service.js

Contiene los datos y la lógica relacionada con las partidas.

### .gitignore

Evita subir archivos que no deben formar parte del repositorio, como `node_modules`.

### package-lock.json

Registra las versiones concretas de las dependencias instaladas.

### README.md

Contiene la documentación del ejercicio, instalación, ejecución, estructura y pruebas.

## npm scripts

El archivo `package.json` contiene cuatro scripts principales.

### Script start

```bash
npm start
```

Ejecuta:

```text
node src/app.js
```

Este es el comando utilizado para iniciar la aplicación normalmente.

### Script dev

```bash
npm run dev
```

Ejecuta:

```text
node --watch src/app.js
```

Este modo está pensado para desarrollo.

Cuando se modifica un archivo utilizado por la aplicación, Node.js puede reiniciar automáticamente el proceso.

### Script check

```bash
npm run check
```

Ejecuta:

```text
node --check src/app.js
```

Este comando permite comprobar la sintaxis de JavaScript del archivo principal sin iniciar el servidor.

Si existe un error de sintaxis, Node.js lo mostrará en la terminal.

### Script info

```bash
npm run info
```

Ejecuta:

```text
node src/app.js --info
```

El argumento `--info` es detectado mediante:

```javascript
process.argv.includes("--info")
```

Cuando se ejecuta este script, se muestra información del proyecto y del runtime de Node.js.

## Ejecución

Para iniciar la aplicación normalmente:

```bash
npm start
```

La aplicación debe quedar disponible en:

```text
http://localhost:3000
```

También se puede utilizar el modo de desarrollo:

```bash
npm run dev
```

## Cómo probar el ejercicio

### Prueba 1 - Comprobar los npm scripts

Ejecutar individualmente:

```bash
npm start
```

```bash
npm run dev
```

```bash
npm run check
```

```bash
npm run info
```

Cada comando debe ejecutar la acción definida en la sección `scripts` del archivo `package.json`.

La finalidad de esta prueba es comprobar que los scripts están correctamente configurados y que se puede ejecutar el proyecto utilizando `npm`.

### Prueba 2 - Comprobar el script check

Ejecutar:

```bash
npm run check
```

Si el archivo `src/app.js` no tiene errores de sintaxis, el comando debe finalizar correctamente sin mostrar errores de sintaxis.

Este comando no inicia el servidor.

### Prueba 3 - Comprobar el script info

Ejecutar:

```bash
npm run info
```

Debe aparecer información similar a:

```text
=================================
Información del proyecto
Ejercicio: BASICO 02
Tema: npm scripts y package.json
Node.js: vXX.XX.X
Sistema operativo: linux
=================================
```

La versión exacta de Node.js puede ser diferente.

### Prueba 4 - Comprobar el endpoint de partidas

Iniciar primero el servidor mediante:

```bash
npm run dev
```

Después realizar una petición:

```text
GET http://localhost:3000/matches
```

La respuesta esperada es:

```json
{
  "ok": true,
  "message": "Partidas obtenidas correctamente",
  "topic": "npm scripts y package.json",
  "data": [
    {
      "id": 1,
      "game": "Valorant",
      "teamA": "Phoenix",
      "teamB": "Shadow",
      "status": "scheduled"
    },
    {
      "id": 2,
      "game": "Counter-Strike 2",
      "teamA": "Falcons",
      "teamB": "Titans",
      "status": "in_progress"
    },
    {
      "id": 3,
      "game": "Apex Legends",
      "teamA": "Hunters",
      "teamB": "Storm",
      "status": "finished"
    }
  ]
}
```

La petición puede realizarse utilizando navegador, Thunder Client, Postman o cualquier herramienta HTTP.

### Prueba 5 - Comprobar una ruta inexistente

Con el servidor ejecutándose, realizar una petición a:

```text
GET http://localhost:3000/players
```

Como esta ruta no está definida, la aplicación debe responder con:

```json
{
  "ok": false,
  "message": "Ruta no encontrada",
  "path": "/players"
}
```

El código HTTP esperado es:

```text
404
```

### Prueba 6 - Comprobar la estructura

Verificar que la entrega contiene:

```text
joseph-ramirez/
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
└── src/
    ├── app.js
    ├── controllers/
    │   └── matches.controller.js
    ├── routes/
    │   └── matches.routes.js
    └── services/
        └── matches.service.js
```

No debe existir una carpeta `node_modules` dentro de la entrega que se vaya a subir al repositorio.

## Flujo de la aplicación

La petición HTTP sigue el siguiente flujo:

```text
GET /matches
      ↓
matches.routes.js
      ↓
matches.controller.js
      ↓
matches.service.js
      ↓
Respuesta JSON
```

Los npm scripts funcionan como punto de entrada para diferentes tareas:

```text
package.json
     │
     ├── npm start
     │       ↓
     │   src/app.js
     │
     ├── npm run dev
     │       ↓
     │   node --watch
     │
     ├── npm run check
     │       ↓
     │   comprobación de sintaxis
     │
     └── npm run info
             ↓
         src/app.js --info
```

## Datos utilizados

Las partidas utilizadas para este ejercicio son datos sintéticos.

```text
1. Valorant
   Phoenix vs Shadow
   Estado: scheduled

2. Counter-Strike 2
   Falcons vs Titans
   Estado: in_progress

3. Apex Legends
   Hunters vs Storm
   Estado: finished
```

Estos datos se encuentran en:

```text
src/services/matches.service.js
```

No se utiliza una base de datos externa.

## Manejo de errores

La aplicación contempla una respuesta `404` para rutas que no existen.

También se utiliza `try/catch` en el controlador para manejar errores inesperados.

La respuesta para una ruta inexistente utiliza:

```text
HTTP 404
```

en lugar de responder siempre con `200`.

## Resultado esperado

El ejercicio debe permitir:

* Instalar las dependencias mediante `npm install`.
* Ejecutar el servidor mediante `npm start`.
* Ejecutar el servidor en modo desarrollo mediante `npm run dev`.
* Comprobar la sintaxis mediante `npm run check`.
* Mostrar información del proyecto mediante `npm run info`.
* Consultar las partidas mediante `GET /matches`.
* Recibir una respuesta `404` al consultar una ruta inexistente.
* Mantener separadas las rutas, controladores y servicios.
* Utilizar correctamente `package.json`.
* Utilizar datos sintéticos sin una base de datos externa.

## Autor

Joseph Ramirez
