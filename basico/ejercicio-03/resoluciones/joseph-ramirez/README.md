# BASICO 03 - Modulos CommonJS

## Estudiante

Joseph Ramirez

## Ejercicio

BASICO 03

## Tema

Módulos CommonJS

## Contexto

Este ejercicio representa una aproximación al uso de módulos en Node.js utilizando el sistema CommonJS.

El objetivo principal es comprender cómo dividir una aplicación en diferentes archivos y cómo compartir funciones, objetos y rutas utilizando `require()` y `module.exports`.

El ejercicio utiliza un escenario relacionado con MOBA esports.

La aplicación permite consultar una lista básica de equipos y utiliza diferentes módulos para separar las responsabilidades de la aplicación.

## Objetivos

* Comprender el sistema de módulos CommonJS.
* Utilizar `require()` para importar módulos.
* Utilizar `module.exports` para exportar módulos.
* Separar la aplicación en diferentes archivos.
* Crear módulos propios.
* Comprender la comunicación entre módulos.
* Crear un servidor básico con Express.
* Crear rutas utilizando Express.
* Separar rutas, controladores y servicios.
* Crear un módulo de utilidades.
* Devolver respuestas JSON.
* Manejar una ruta inexistente.
* Practicar la lectura de errores.
* Documentar la ejecución del proyecto.

## Tecnologías

* Node.js
* Express
* JavaScript
* CommonJS
* npm

## Requisitos

* Node.js 20 o superior recomendado.
* npm.

## Instalación

Desde la carpeta del proyecto ejecutar:

```bash
npm install
```

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
    │   └── teams.controller.js
    ├── routes/
    │   └── teams.routes.js
    ├── services/
    │   └── teams.service.js
    └── utils/
        └── response.js
```

## Descripción de los archivos

### package.json

Contiene la configuración del proyecto, las dependencias y los scripts utilizados para ejecutar la aplicación.

### src/app.js

Es el punto de entrada de la aplicación.

Configura Express, importa las rutas mediante `require()` y registra las rutas dentro de la aplicación.

### src/routes/teams.routes.js

Define las rutas relacionadas con los equipos.

Importa el controlador utilizando CommonJS.

### src/controllers/teams.controller.js

Recibe las peticiones HTTP y utiliza el servicio correspondiente para obtener los datos.

También importa el módulo de respuestas.

### src/services/teams.service.js

Contiene los datos sintéticos de los equipos y la función encargada de obtenerlos.

### src/utils/response.js

Contiene funciones reutilizables para generar respuestas HTTP exitosas o respuestas de error.

### .gitignore

Evita subir archivos que no deben formar parte del repositorio, principalmente `node_modules`.

### package-lock.json

Registra las versiones concretas de las dependencias instaladas.

### README.md

Contiene la documentación del ejercicio, instalación, estructura, ejecución y pruebas.

## Módulos CommonJS

El proyecto utiliza CommonJS en todos los módulos propios.

La importación se realiza utilizando:

```javascript
const modulo = require("./ruta-del-modulo");
```

La exportación se realiza utilizando:

```javascript
module.exports = {
  funcion
};
```

## Ejemplo de importación

En `src/app.js` se utiliza:

```javascript
const teamsRoutes = require("./routes/teams.routes");
```

Esto permite utilizar el módulo de rutas dentro de la aplicación principal.

## Ejemplo de exportación

En `src/routes/teams.routes.js` se utiliza:

```javascript
module.exports = router;
```

Esto permite que el archivo `app.js` pueda importar el router.

## Flujo de módulos

La aplicación tiene el siguiente flujo:

```text
app.js
  │
  └── require()
        ↓
teams.routes.js
        │
        └── require()
              ↓
        teams.controller.js
              │
              ├── require()
              ↓
        teams.service.js
              │
              └── require()
              ↓
           response.js
```

Cada archivo tiene una responsabilidad específica.

## Ejecución

Para ejecutar el proyecto normalmente:

```bash
npm start
```

Para ejecutarlo en modo desarrollo:

```bash
npm run dev
```

Para comprobar la sintaxis del archivo principal:

```bash
npm run check
```

La aplicación estará disponible en:

```text
http://localhost:3000
```

## Cómo probar el ejercicio

### Prueba 1 - Verificar el inicio del servidor

Ejecutar:

```bash
npm start
```

La terminal debe mostrar información similar a:

```text
=================================
BASICO 03 - Modulos CommonJS
Node.js: vXX.XX.X
=================================
Servidor ejecutándose en http://localhost:3000
```

La versión exacta de Node.js puede variar.

Esta prueba permite verificar que el archivo `app.js` se está ejecutando correctamente y que los módulos necesarios pueden ser cargados mediante `require()`.

### Prueba 2 - Verificar el modo desarrollo

Ejecutar:

```bash
npm run dev
```

El servidor debe iniciar correctamente.

El comando utiliza:

```text
node --watch src/app.js
```

Esto permite trabajar durante el desarrollo y reiniciar la aplicación cuando se realizan cambios.

### Prueba 3 - Verificar la sintaxis

Ejecutar:

```bash
npm run check
```

El comando debe finalizar correctamente si no existen errores de sintaxis en `src/app.js`.

Esta prueba permite comprobar que el archivo principal puede ser interpretado correctamente por Node.js.

### Prueba 4 - Consultar los equipos

Con el servidor ejecutándose, realizar una petición:

```text
GET http://localhost:3000/teams
```

La petición puede realizarse utilizando navegador, Thunder Client, Postman o cualquier otra herramienta HTTP.

La respuesta esperada es:

```json
{
  "ok": true,
  "message": "Equipos obtenidos correctamente",
  "topic": "modulos CommonJS",
  "data": [
    {
      "id": 1,
      "name": "Dragon Core",
      "game": "League of Legends",
      "region": "LATAM",
      "players": 5,
      "status": "active"
    },
    {
      "id": 2,
      "name": "Storm Legends",
      "game": "Dota 2",
      "region": "North America",
      "players": 5,
      "status": "active"
    },
    {
      "id": 3,
      "name": "Titan Squad",
      "game": "League of Legends",
      "region": "Europe",
      "players": 5,
      "status": "inactive"
    }
  ]
}
```

### Prueba 5 - Verificar una ruta inexistente

Con el servidor ejecutándose, realizar una petición:

```text
GET http://localhost:3000/players
```

La ruta `/players` no está definida.

La respuesta esperada es:

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

### Prueba 6 - Verificar la separación de módulos

La aplicación debe mantener la siguiente relación:

```text
GET /teams
     ↓
teams.routes.js
     ↓
teams.controller.js
     ↓
teams.service.js
     ↓
response.js
     ↓
Respuesta JSON
```

Esto permite comprobar que la lógica no está concentrada en un único archivo.

### Prueba 7 - Verificar CommonJS

Los archivos deben utilizar el sistema CommonJS.

Para importar un módulo debe utilizarse:

```javascript
require()
```

Por ejemplo:

```javascript
const teamsService = require("../services/teams.service");
```

Para exportar funciones u objetos debe utilizarse:

```javascript
module.exports
```

Por ejemplo:

```javascript
module.exports = {
  getTeams
};
```

No se deben utilizar:

```javascript
import
```

ni:

```javascript
export
```

porque este ejercicio está enfocado específicamente en CommonJS.

## Datos utilizados

Los datos utilizados son sintéticos y representan equipos de diferentes videojuegos MOBA.

### Equipo 1

```text
Nombre: Dragon Core
Juego: League of Legends
Región: LATAM
Jugadores: 5
Estado: active
```

### Equipo 2

```text
Nombre: Storm Legends
Juego: Dota 2
Región: North America
Jugadores: 5
Estado: active
```

### Equipo 3

```text
Nombre: Titan Squad
Juego: League of Legends
Región: Europe
Jugadores: 5
Estado: inactive
```

Los datos se encuentran en:

```text
src/services/teams.service.js
```

No se utiliza una base de datos externa.

## Manejo de errores

La aplicación contempla el caso de rutas inexistentes.

Cuando se solicita una ruta que no está definida, se devuelve:

```text
HTTP 404
```

También se utiliza `try/catch` en el controlador para manejar errores inesperados.

## Resultado esperado

El ejercicio debe permitir:

* Instalar las dependencias mediante `npm install`.
* Ejecutar el servidor mediante `npm start`.
* Ejecutar el servidor en modo desarrollo mediante `npm run dev`.
* Comprobar la sintaxis mediante `npm run check`.
* Consultar los equipos mediante `GET /teams`.
* Recibir una respuesta `404` al consultar una ruta inexistente.
* Utilizar `require()` para importar módulos.
* Utilizar `module.exports` para exportar módulos.
* Separar rutas, controladores, servicios y utilidades.
* Utilizar datos sintéticos.
* No utilizar una base de datos externa.

## Autor

Joseph Ramirez
