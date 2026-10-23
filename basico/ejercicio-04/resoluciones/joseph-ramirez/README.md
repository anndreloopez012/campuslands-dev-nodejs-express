# BASICO 04 - Modulos ES Modules

## Estudiante

Joseph Ramirez

## Ejercicio

BASICO 04

## Tema

Módulos ES Modules

## Contexto

Este ejercicio representa una aproximación al uso de módulos en Node.js utilizando el sistema ES Modules.

El objetivo principal es comprender cómo dividir una aplicación en diferentes archivos y cómo compartir funciones, objetos y rutas utilizando `import` y `export`.

El ejercicio utiliza un escenario relacionado con Battle Royale.

La aplicación permite consultar una lista básica de escuadrones y utiliza diferentes módulos para separar las responsabilidades de la aplicación.

## Objetivos

* Comprender el sistema de módulos ES Modules.
* Utilizar `import` para importar módulos.
* Utilizar `export` para exportar módulos.
* Utilizar `export default`.
* Utilizar exportaciones nombradas.
* Configurar `"type": "module"` en `package.json`.
* Separar la aplicación en diferentes archivos.
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
* ES Modules
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
    │   └── squads.controller.js
    ├── routes/
    │   └── squads.routes.js
    ├── services/
    │   └── squads.service.js
    └── utils/
        └── response.js
```

## Descripción de los archivos

### package.json

Contiene la configuración principal del proyecto, las dependencias y los scripts de ejecución.

También contiene:

```json
"type": "module"
```

Esta configuración permite utilizar ES Modules en los archivos JavaScript del proyecto.

### src/app.js

Es el punto de entrada de la aplicación.

Configura Express, importa las rutas mediante `import` y registra las rutas dentro de la aplicación.

### src/routes/squads.routes.js

Define las rutas relacionadas con los escuadrones.

Importa el controlador utilizando una exportación nombrada y exporta el router utilizando `export default`.

### src/controllers/squads.controller.js

Recibe las peticiones HTTP y utiliza el servicio correspondiente para obtener los datos.

También utiliza el módulo de respuestas.

### src/services/squads.service.js

Contiene los datos sintéticos de los escuadrones y la función encargada de obtenerlos.

### src/utils/response.js

Contiene funciones reutilizables para generar respuestas HTTP exitosas y respuestas de error.

### .gitignore

Evita subir archivos que no deben formar parte del repositorio, principalmente `node_modules`.

### package-lock.json

Registra las versiones concretas de las dependencias instaladas.

### README.md

Contiene la documentación del ejercicio, instalación, estructura, ejecución y pruebas.

## Configuración ES Modules

El proyecto utiliza ES Modules.

Para habilitar este sistema se configura en `package.json`:

```json
"type": "module"
```

Con esta configuración Node.js interpreta los archivos `.js` como módulos ES.

## Importaciones

Los módulos se importan utilizando:

```javascript
import modulo from "./ruta-del-modulo.js";
```

También se pueden importar exportaciones nombradas:

```javascript
import { funcion } from "./ruta-del-modulo.js";
```

## Exportaciones

El proyecto utiliza dos formas principales de exportación.

### Exportación default

En las rutas:

```javascript
export default router;
```

Esto permite importar el módulo de esta forma:

```javascript
import squadsRoutes from "./routes/squads.routes.js";
```

### Exportación nombrada

En los controladores:

```javascript
export const getSquads = (req, res) => {
  // ...
};
```

Esto permite importar la función mediante:

```javascript
import { getSquads } from "../controllers/squads.controller.js";
```

## Diferencia con CommonJS

Este ejercicio utiliza ES Modules y no CommonJS.

### CommonJS

```javascript
const modulo = require("./modulo");
```

```javascript
module.exports = modulo;
```

### ES Modules

```javascript
import modulo from "./modulo.js";
```

```javascript
export default modulo;
```

También se pueden utilizar exportaciones nombradas:

```javascript
export const funcion = () => {
  // ...
};
```

## Flujo de módulos

La aplicación tiene el siguiente flujo:

```text
app.js
  │
  └── import
        ↓
squads.routes.js
        │
        └── import
              ↓
      squads.controller.js
              │
              ├── import
              ↓
      squads.service.js
              │
              └── import
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

### Prueba 1 - Verificar la instalación

Después de ejecutar:

```bash
npm install
```

debe existir el archivo:

```text
package-lock.json
```

y deben instalarse las dependencias definidas en `package.json`.

La aplicación debe reconocer Express correctamente.

### Prueba 2 - Verificar ES Modules

Revisar `package.json` y comprobar que contiene:

```json
"type": "module"
```

Después ejecutar:

```bash
npm start
```

El servidor debe iniciar sin errores relacionados con `require`, `module.exports`, `import` o `export`.

La terminal debe mostrar información similar a:

```text
=================================
BASICO 04 - Modulos ES Modules
Node.js: vXX.XX.X
Sistema de módulos: ES Modules
=================================
Servidor ejecutándose en http://localhost:3000
```

La versión exacta de Node.js puede variar.

### Prueba 3 - Verificar el script de desarrollo

Ejecutar:

```bash
npm run dev
```

El servidor debe iniciar correctamente.

El comando utiliza:

```text
node --watch src/app.js
```

Esto permite trabajar en modo desarrollo y reiniciar la aplicación cuando se modifican archivos.

### Prueba 4 - Verificar la sintaxis

Ejecutar:

```bash
npm run check
```

El comando debe finalizar correctamente si no existen errores de sintaxis en `src/app.js`.

Esta prueba no inicia el servidor.

### Prueba 5 - Consultar los escuadrones

Con el servidor ejecutándose, realizar una petición:

```text
GET http://localhost:3000/squads
```

La petición puede realizarse utilizando navegador, Thunder Client, Postman o cualquier otra herramienta HTTP.

La respuesta esperada es:

```json
{
  "ok": true,
  "message": "Escuadrones obtenidos correctamente",
  "topic": "modulos ES Modules",
  "data": [
    {
      "id": 1,
      "name": "Storm Hunters",
      "game": "Fortnite",
      "region": "LATAM",
      "players": 4,
      "status": "ready"
    },
    {
      "id": 2,
      "name": "Night Raiders",
      "game": "Apex Legends",
      "region": "North America",
      "players": 3,
      "status": "in_match"
    },
    {
      "id": 3,
      "name": "Royal Wolves",
      "game": "PUBG",
      "region": "Europe",
      "players": 4,
      "status": "eliminated"
    }
  ]
}
```

### Prueba 6 - Verificar una ruta inexistente

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

### Prueba 7 - Verificar la separación de módulos

La aplicación debe mantener la siguiente relación:

```text
GET /squads
     ↓
squads.routes.js
     ↓
squads.controller.js
     ↓
squads.service.js
     ↓
response.js
     ↓
Respuesta JSON
```

Esto permite comprobar que la lógica no está concentrada en un único archivo.

### Prueba 8 - Verificar el uso de import

Los módulos propios deben utilizar `import`.

Por ejemplo:

```javascript
import { getSquadsData } from "../services/squads.service.js";
```

No se debe utilizar:

```javascript
const service = require("../services/squads.service");
```

### Prueba 9 - Verificar el uso de export

Los módulos propios deben utilizar `export`.

Por ejemplo:

```javascript
export const getSquadsData = () => {
  return squads;
};
```

También se utiliza:

```javascript
export default router;
```

No se debe utilizar:

```javascript
module.exports = router;
```

porque ese sistema corresponde a CommonJS.

### Prueba 10 - Verificar las extensiones de los imports

Los imports de módulos locales deben incluir la extensión `.js`.

Correcto:

```javascript
import squadsRoutes from "./routes/squads.routes.js";
```

Correcto:

```javascript
import { getSquadsData } from "../services/squads.service.js";
```

Incorrecto:

```javascript
import squadsRoutes from "./routes/squads.routes";
```

## Datos utilizados

Los datos utilizados son sintéticos y representan escuadrones de diferentes videojuegos Battle Royale.

### Escuadrón 1

```text
Nombre: Storm Hunters
Juego: Fortnite
Región: LATAM
Jugadores: 4
Estado: ready
```

### Escuadrón 2

```text
Nombre: Night Raiders
Juego: Apex Legends
Región: North America
Jugadores: 3
Estado: in_match
```

### Escuadrón 3

```text
Nombre: Royal Wolves
Juego: PUBG
Región: Europe
Jugadores: 4
Estado: eliminated
```

Los datos se encuentran en:

```text
src/services/squads.service.js
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
* Utilizar `"type": "module"` en `package.json`.
* Utilizar `import` para importar módulos.
* Utilizar `export` para exportar módulos.
* Utilizar `export default`.
* Utilizar exportaciones nombradas.
* Consultar los escuadrones mediante `GET /squads`.
* Recibir una respuesta `404` al consultar una ruta inexistente.
* Separar rutas, controladores, servicios y utilidades.
* Utilizar datos sintéticos.
* No utilizar una base de datos externa.

## Autor

Joseph Ramirez
