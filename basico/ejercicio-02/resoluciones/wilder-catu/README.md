# Shooter Node.js Básico

## Descripción

Este proyecto consiste en una pequeña aplicación desarrollada con Node.js utilizando como temática los shooters competitivos.

El ejercicio está enfocado principalmente en aprender a utilizar `npm`, los scripts de `package.json` y la ejecución de programas mediante Node.js.

La aplicación permite registrar y consultar jugadores desde la terminal.

El proyecto se mantiene sencillo porque el objetivo no es crear una aplicación grande, sino comprender los conceptos básicos antes de pasar a estructuras más avanzadas.

## Requisitos

* Node.js 20 o superior.
* npm.
* Terminal.
* Editor de código.

## Tecnologías utilizadas

* Node.js.
* JavaScript.
* npm.
* Módulo `readline`.

No se utilizan frameworks externos.

No se utiliza Express.

No se utiliza navegador.

Toda la aplicación funciona directamente desde la terminal.

## Estructura del proyecto

```text
shooter-node-basico/
│
├── app.js
├── package.json
├── .gitignore
└── README.md
```

## Instalación

Primero se puede comprobar la versión instalada de Node.js:

```bash
node --version
```

Se recomienda utilizar Node.js 20 o superior.

También se puede comprobar la versión de npm:

```bash
npm --version
```

Como el proyecto utiliza solamente funcionalidades incluidas en Node.js, no es necesario instalar paquetes externos.

## Ejecución

El programa puede ejecutarse directamente con:

```bash
node app.js
```

También se puede utilizar el script principal:

```bash
npm start
```

Al ejecutar el programa aparece un menú:

```text
====================================
       SHOOTER COMPETITIVO
====================================
1. Mostrar jugadores
2. Buscar jugador
3. Registrar jugador
4. Mostrar estadísticas
5. Salir
====================================
```

Todas las opciones se manejan desde la terminal.

# Funcionalidades

## 1. Mostrar jugadores

Muestra los jugadores registrados.

Los datos iniciales son:

```text
Shadow - Diamante - 24 victorias - 8 derrotas
Ghost - Platino - 18 victorias - 10 derrotas
Blaze - Oro - 15 victorias - 12 derrotas
```

Cada jugador tiene:

* ID.
* Nombre.
* Rango.
* Victorias.
* Derrotas.

## 2. Buscar jugador

Permite buscar un jugador utilizando su ID.

Ejemplo:

```text
Ingrese el ID del jugador: 1
```

El programa busca el jugador utilizando `find()`.

Si el jugador existe, muestra sus datos.

Si el ID no es numérico:

```text
Error: el ID debe ser un número.
```

Si el jugador no existe:

```text
No se encontró un jugador con ese ID.
```

## 3. Registrar jugador

Permite agregar un nuevo jugador desde la terminal.

El programa solicita:

```text
Nombre:
Rango:
```

Las victorias y derrotas comienzan en cero.

Por ejemplo:

```text
Nombre: Viper
Rango: Plata
```

El programa genera automáticamente un ID para el nuevo jugador.

También se valida que el nombre y el rango no estén vacíos.

## 4. Mostrar estadísticas

Esta opción calcula estadísticas generales.

Se muestran:

```text
Jugadores registrados
Victorias totales
Derrotas totales
Partidas jugadas
Porcentaje de victorias
```

Para realizar los cálculos de victorias y derrotas se utiliza `reduce()`.

El porcentaje de victorias se calcula mediante:

```text
victorias / partidas totales * 100
```

## 5. Salir

Finaliza el programa y cierra la conexión con la terminal.

# Explicación de `app.js`

Todo el código de Node.js se encuentra dentro del archivo:

```text
app.js
```

Esto se hizo para mantener el ejercicio sencillo y fácil de entender.

No se separó el código en controladores, servicios, rutas o modelos porque el objetivo actual es aprender Node.js y npm.

## `readline`

Se utiliza el módulo `readline` de Node.js:

```javascript
const readline = require("readline");
```

Este módulo permite recibir información escrita por el usuario en la terminal.

Por ejemplo:

```javascript
terminal.question("Seleccione una opción: ", (opcion) => {
    procesarOpcion(opcion);
});
```

El programa espera la respuesta del usuario y después continúa ejecutando la función correspondiente.

## Arreglo de jugadores

Los jugadores se almacenan en un arreglo:

```javascript
const jugadores = [];
```

Cada jugador se representa mediante un objeto:

```javascript
{
    id: 1,
    nombre: "Shadow",
    rango: "Diamante",
    victorias: 24,
    derrotas: 8
}
```

Esto permite guardar la información de cada jugador de una manera organizada.

## Funciones

El programa está dividido en funciones.

### `mostrarMenu()`

Muestra las opciones disponibles.

### `mostrarJugadores()`

Recorre el arreglo y muestra todos los jugadores.

Para esto se utiliza:

```javascript
forEach()
```

### `buscarJugador()`

Busca un jugador mediante su ID.

Se utiliza:

```javascript
find()
```

### `registrarJugador()`

Solicita los datos de un nuevo jugador y lo agrega al arreglo mediante:

```javascript
push()
```

### `obtenerNuevoId()`

Calcula el ID que tendrá el nuevo jugador.

### `mostrarEstadisticas()`

Calcula las estadísticas generales utilizando principalmente:

```javascript
reduce()
```

### `procesarOpcion()`

Utiliza `switch` para determinar qué función debe ejecutarse según la opción seleccionada.

# Validaciones

Se agregaron validaciones básicas para evitar algunos errores.

Por ejemplo, cuando se busca un jugador:

```javascript
const id = Number(entrada);

if (Number.isNaN(id)) {
    console.log("Error: el ID debe ser un número.");
}
```

También se comprueba que el nombre y el rango no estén vacíos al registrar un jugador.

Estas validaciones son básicas porque el ejercicio está pensado para comenzar a comprender cómo se validan los datos.

# `package.json`

El archivo `package.json` es la parte principal del ejercicio.

Este archivo contiene información del proyecto y permite crear comandos personalizados.

La sección más importante es:

```json
"scripts": {
    "start": "node app.js",
    "dev": "node --watch app.js",
    "check": "node --check app.js",
    "run": "node app.js"
}
```

## Script `start`

Se ejecuta:

```bash
npm start
```

Internamente ejecuta:

```bash
node app.js
```

Este es el comando principal para iniciar la aplicación.

## Script `dev`

Se ejecuta:

```bash
npm run dev
```

Internamente ejecuta:

```bash
node --watch app.js
```

La opción `--watch` permite que Node.js detecte cambios en `app.js` y vuelva a ejecutar el programa.

Este script es útil mientras se está desarrollando.

## Script `check`

Se ejecuta:

```bash
npm run check
```

Internamente ejecuta:

```bash
node --check app.js
```

Sirve para comprobar la sintaxis de JavaScript sin ejecutar el programa.

Es recomendable utilizarlo antes de iniciar la aplicación.

## Script `run`

Se ejecuta:

```bash
npm run run
```

Internamente ejecuta:

```bash
node app.js
```

Tiene un funcionamiento similar a `npm start`.

Se incluye para practicar la creación de scripts personalizados dentro de `package.json`.

## Mostrar los scripts

También podemos ejecutar:

```bash
npm run
```

Esto permite visualizar los scripts configurados en el proyecto.

# Flujo de trabajo recomendado

Para trabajar con el proyecto se puede seguir este orden:

### 1. Comprobar Node.js

```bash
node --version
```

### 2. Comprobar la sintaxis

```bash
npm run check
```

### 3. Ejecutar el programa

```bash
npm start
```

### 4. Durante el desarrollo

```bash
npm run dev
```

De esta manera los scripts de npm ayudan a organizar las tareas frecuentes.

# Conceptos aprendidos

Con este ejercicio se practican:

* Node.js como runtime.
* npm.
* `package.json`.
* npm scripts.
* `npm start`.
* `npm run`.
* `node --watch`.
* `node --check`.
* Módulo `readline`.
* Entrada de datos desde terminal.
* `console.log()`.
* Arrays.
* Objetos.
* Funciones.
* `forEach()`.
* `find()`.
* `push()`.
* `reduce()`.
* Condicionales.
* `switch`.
* Validaciones básicas.

# ¿Por qué no se utiliza Express?

Aunque el contexto original menciona Node.js y Express, este ejercicio está enfocado específicamente en `npm scripts` y `package.json`.

Por eso se decidió trabajar directamente con Node.js.

No se necesita Express para aprender:

* cómo ejecutar un archivo Node.js;
* cómo utilizar npm;
* cómo crear scripts;
* cómo utilizar `package.json`;
* cómo recibir información desde la terminal;
* cómo organizar una aplicación pequeña.

Express puede estudiarse posteriormente cuando se llegue al tema de servidores y APIs HTTP.

# ¿Por qué no se utiliza navegador?

El programa no necesita una interfaz gráfica.

Toda la interacción se realiza mediante:

```text
Usuario
   ↓
Terminal
   ↓
Node.js
   ↓
app.js
   ↓
Resultado en terminal
```

Esto permite concentrarse en el funcionamiento de Node.js y npm sin agregar elementos que no son necesarios para este ejercicio.

# Conclusión

La solución implementa un pequeño sistema para administrar jugadores de un shooter competitivo.

El código se encuentra en un único archivo `app.js` para facilitar el aprendizaje.

El archivo `package.json` contiene scripts para ejecutar, comprobar y trabajar con el proyecto.

La aplicación funciona completamente desde la terminal y no requiere Express, navegador ni dependencias externas.
