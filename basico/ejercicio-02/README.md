# Shooter Node.js Básico

## Descripción

Este proyecto es una pequeña aplicación de consola desarrollada con Node.js utilizando como temática los shooters competitivos.

El objetivo principal es aprender a utilizar `npm`, `package.json` y los scripts de npm.

La aplicación permite administrar jugadores desde la terminal y realizar algunas operaciones básicas.

El proyecto se mantiene pequeño para poder entender cada parte del código sin agregar tecnologías innecesarias.

## Requisitos

* Node.js 20 o superior.
* npm.
* Terminal.
* Editor de código.

No se utiliza Express ni ningún framework externo.

Tampoco se utiliza navegador.

Toda la aplicación funciona directamente desde la terminal.

## Estructura

```text
shooter-node-basico/
│
├── app.js
├── package.json
├── .gitignore
└── README.md
```

## Instalación

Como el proyecto utiliza únicamente funcionalidades propias de Node.js, no es necesario instalar paquetes externos.

Primero podemos comprobar la versión de Node.js:

```bash
node --version
```

Se recomienda utilizar Node.js 20 o superior.

También podemos comprobar npm:

```bash
npm --version
```

## Ejecutar el programa

La forma principal de ejecutar el proyecto es:

```bash
npm start
```

También podemos ejecutarlo directamente con Node.js:

```bash
node app.js
```

Al ejecutarlo aparecerá un menú similar a:

```text
====================================
     SHOOTER COMPETITIVO - NODE
====================================
1. Mostrar jugadores
2. Buscar jugador
3. Registrar jugador
4. Mostrar estadísticas
5. Salir
====================================
```

## Funcionalidades

### 1. Mostrar jugadores

Muestra los jugadores registrados actualmente.

Ejemplo:

```text
ID: 1 | Jugador: Shadow | Rango: Diamante | Victorias: 24 | Derrotas: 8
ID: 2 | Jugador: Ghost | Rango: Platino | Victorias: 18 | Derrotas: 10
ID: 3 | Jugador: Blaze | Rango: Oro | Victorias: 15 | Derrotas: 12
```

### 2. Buscar jugador

Permite buscar un jugador utilizando su ID.

El programa solicita:

```text
Ingrese el ID del jugador:
```

Si se introduce:

```text
1
```

se muestran los datos del jugador correspondiente.

También se valida que el ID sea un número.

### 3. Registrar jugador

Permite agregar un nuevo jugador.

El programa solicita:

```text
Nombre del jugador:
Rango inicial:
```

Las victorias y derrotas comienzan en cero.

Por ejemplo:

```text
Nombre del jugador: Viper
Rango inicial: Plata
```

El programa crea automáticamente un nuevo ID.

### 4. Mostrar estadísticas

Calcula las estadísticas generales de los jugadores registrados.

Se muestran:

* Cantidad de jugadores.
* Victorias totales.
* Derrotas totales.
* Partidas jugadas.
* Porcentaje de victorias.

Para realizar algunos cálculos se utiliza el método `reduce()` de JavaScript.

### 5. Salir

Finaliza el programa y cierra la entrada de datos de la terminal.

# Explicación de `app.js`

Todo el código de Node.js se encuentra dentro de:

```text
app.js
```

Se decidió utilizar un solo archivo porque el objetivo es aprender primero los fundamentos de Node.js y npm.

## Módulo `readline`

Se utiliza el módulo `readline`:

```javascript
const readline = require("readline");
```

Este módulo viene incluido en Node.js.

Permite recibir información escrita por el usuario desde la terminal.

Por ejemplo:

```javascript
terminal.question("Seleccione una opción: ", (opcion) => {
    procesarOpcion(opcion);
});
```

El programa espera que el usuario escriba una respuesta.

## Arreglo de jugadores

Los jugadores se almacenan en un arreglo:

```javascript
const jugadores = [
    {
        id: 1,
        nombre: "Shadow",
        rango: "Diamante",
        victorias: 24,
        derrotas: 8
    }
];
```

Cada jugador es un objeto con diferentes propiedades.

## Funciones

El código se divide en funciones para que cada parte tenga una responsabilidad.

Por ejemplo:

```javascript
mostrarMenu()
```

muestra las opciones disponibles.

```javascript
mostrarJugadores()
```

muestra los jugadores registrados.

```javascript
buscarJugador()
```

permite buscar un jugador.

```javascript
registrarJugador()
```

permite agregar un nuevo jugador.

```javascript
mostrarEstadisticas()
```

calcula las estadísticas generales.

Esta separación permite que el código sea más fácil de leer y mantener.

# Validaciones

Se realizan algunas validaciones básicas.

Por ejemplo, al buscar un jugador:

```javascript
const id = Number(entrada);

if (Number.isNaN(id)) {
    console.log("Error: el ID debe ser un número.");
}
```

Esto evita trabajar con un ID que no sea numérico.

También se comprueba que el nombre y el rango no estén vacíos al registrar un jugador.

# Uso de `package.json`

El archivo `package.json` es una parte importante del ejercicio.

Contiene información del proyecto y permite definir comandos personalizados para trabajar con la aplicación.

La sección principal del ejercicio es:

```json
"scripts": {
    "start": "node app.js",
    "dev": "node --watch app.js",
    "check": "node --check app.js",
    "run": "node app.js"
}
```

## Script `start`

Se ejecuta mediante:

```bash
npm start
```

Internamente ejecuta:

```bash
node app.js
```

Se utiliza para iniciar normalmente el programa.

## Script `dev`

Se ejecuta mediante:

```bash
npm run dev
```

Internamente ejecuta:

```bash
node --watch app.js
```

Este modo es útil durante el desarrollo porque Node.js puede detectar modificaciones en el archivo.

## Script `check`

Se ejecuta mediante:

```bash
npm run check
```

Internamente ejecuta:

```bash
node --check app.js
```

Sirve para comprobar la sintaxis de JavaScript.

## Script `run`

Se ejecuta mediante:

```bash
npm run run
```

Internamente ejecuta:

```bash
node app.js
```

Tiene prácticamente el mismo resultado que `npm start`.

Se agregó como ejemplo para comprender que podemos crear nuestros propios nombres de scripts.

## Ver los scripts disponibles

También podemos ejecutar:

```bash
npm run
```

Esto muestra los scripts definidos en `package.json`.

# Pruebas

Antes de ejecutar la aplicación podemos comprobar la sintaxis:

```bash
npm run check
```

Si no existen errores de sintaxis, podemos iniciar:

```bash
npm start
```

También podemos utilizar:

```bash
npm run dev
```

para trabajar durante el desarrollo.

# Conceptos aprendidos

Con este ejercicio se practican principalmente:

* Node.js.
* npm.
* `package.json`.
* `npm start`.
* `npm run`.
* npm scripts personalizados.
* `node --watch`.
* `node --check`.
* Módulo `readline`.
* Entrada de datos desde la terminal.
* `console.log()`.
* Funciones.
* Objetos.
* Arrays.
* `find()`.
* `map()`.
* `reduce()`.
* `push()`.
* Condicionales.
* `switch`.
* Validaciones básicas.

# ¿Por qué se utiliza un solo archivo?

El ejercicio está pensado para una persona que está aprendiendo Node.js.

Por esta razón no se divide todavía el proyecto en controladores, servicios, rutas, modelos o diferentes carpetas.

Todo el código está en:

```text
app.js
```

Esto permite concentrarse en el funcionamiento de Node.js y, principalmente, en cómo se utiliza `package.json` para crear comandos que faciliten el trabajo.

En proyectos posteriores se puede aprender a separar el código en diferentes archivos.

# ¿Por qué no se utiliza Express?

No se utiliza Express porque este ejercicio está enfocado específicamente en Node.js y npm.

No necesitamos un framework para practicar:

* ejecución de Node.js;
* scripts de npm;
* `package.json`;
* entrada desde terminal;
* funciones;
* validaciones;
* organización básica del código.

Primero se busca comprender estos conceptos y posteriormente se pueden incorporar herramientas más avanzadas.

# Conclusión

La aplicación representa un pequeño sistema de gestión de jugadores de un shooter competitivo.

El proyecto permite practicar Node.js desde la terminal y, principalmente, comprender cómo `package.json` puede utilizarse para crear comandos que faciliten el desarrollo.

La solución se mantiene sencilla porque el objetivo no es crear una aplicación grande, sino comprender una pieza concreta del desarrollo backend: el uso de npm y sus scripts.
