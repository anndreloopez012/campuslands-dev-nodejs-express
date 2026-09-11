# RPG Node.js Básico

## Descripción

Este proyecto consiste en una pequeña aplicación de consola desarrollada utilizando Node.js.

La temática utilizada son los videojuegos RPG.

El objetivo es practicar los conceptos básicos de Node.js sin utilizar Express, navegador, base de datos ni otras herramientas externas.

Toda la interacción con el programa se realiza directamente desde la terminal.

## Requisitos

* Node.js 20 o superior.
* Terminal o consola.
* Editor de código.

No es necesario instalar ninguna dependencia externa.

## Estructura

```text
rpg-node-basico/
│
├── app.js
├── package.json
├── .gitignore
└── README.md
```

## Ejecución

Primero se verifica que Node.js esté instalado:

```bash
node --version
```

Se recomienda tener Node.js 20 o superior.

Después se puede ejecutar directamente:

```bash
node app.js
```

También se puede ejecutar utilizando el script definido en `package.json`:

```bash
npm start
```

Para trabajar en modo desarrollo se puede utilizar:

```bash
npm run dev
```

Este comando utiliza `node --watch`, por lo que Node.js vuelve a ejecutar el programa cuando detecta cambios.

Para comprobar la sintaxis:

```bash
npm run check
```

## Funcionamiento

Al ejecutar el programa aparece un menú en la terminal:

```text
=================================
       SISTEMA RPG - NODE.JS
=================================
1. Mostrar personajes
2. Buscar personaje
3. Crear personaje
4. Mostrar estadísticas
5. Salir
=================================
```

El usuario puede seleccionar una de las opciones escribiendo el número correspondiente.

## Opción 1: Mostrar personajes

Muestra todos los personajes almacenados.

Ejemplo:

```text
ID: 1 | Nombre: Arthas | Clase: Guerrero | Nivel: 10 | Vida: 150
ID: 2 | Nombre: Luna | Clase: Maga | Nivel: 8 | Vida: 100
ID: 3 | Nombre: Ragnar | Clase: Arquero | Nivel: 7 | Vida: 90
```

Los personajes están almacenados en un arreglo dentro del archivo `app.js`.

## Opción 2: Buscar personaje

Permite buscar un personaje utilizando su ID.

El programa solicita:

```text
Ingrese el ID del personaje:
```

Si se introduce:

```text
1
```

se muestran los datos del personaje correspondiente.

También se realiza una validación para comprobar que el ID sea numérico.

## Opción 3: Crear personaje

Permite crear un nuevo personaje desde la terminal.

El programa solicita:

```text
Nombre:
Clase:
Nivel:
Vida:
```

Después de recibir los datos se crea un nuevo objeto y se agrega al arreglo de personajes.

Ejemplo:

```text
Nombre: Thorin
Clase: Guerrero
Nivel: 12
Vida: 180
```

El programa genera automáticamente el ID del nuevo personaje.

## Opción 4: Mostrar estadísticas

Esta opción calcula información general de los personajes.

Se muestra:

* Cantidad de personajes.
* Nivel promedio.
* Vida promedio.

Para realizar estos cálculos se utilizan métodos de JavaScript como `reduce()`.

## Opción 5: Salir

Finaliza la ejecución del programa y cierra la entrada de datos de la terminal.

## Explicación de `app.js`

Todo el funcionamiento del programa está contenido en un único archivo:

```text
app.js
```

Esto se hizo intencionalmente porque el objetivo del ejercicio es aprender los conceptos básicos de Node.js antes de dividir una aplicación en muchas capas o archivos.

### `readline`

Se utiliza el módulo `readline` incluido en Node.js.

Permite recibir información escrita por el usuario directamente desde la terminal.

```javascript
const readline = require("readline");
```

No es necesario instalarlo porque forma parte de Node.js.

### Arreglo de personajes

Los personajes se almacenan en un arreglo:

```javascript
const personajes = [];
```

Cada personaje es un objeto con diferentes propiedades:

```javascript
{
    id: 1,
    nombre: "Arthas",
    clase: "Guerrero",
    nivel: 10,
    vida: 150
}
```

### Funciones

El programa está dividido en funciones para que cada parte tenga una responsabilidad.

Por ejemplo:

```javascript
mostrarPersonajes()
```

se encarga de mostrar los personajes.

```javascript
buscarPersonaje()
```

se encarga de realizar búsquedas.

```javascript
crearPersonaje()
```

se encarga de registrar nuevos personajes.

```javascript
mostrarEstadisticas()
```

calcula las estadísticas.

Esta organización facilita entender el código y posteriormente modificarlo.

## Validaciones

Se realizaron validaciones básicas.

Por ejemplo, el nivel debe ser un número mayor que cero:

```javascript
if (Number.isNaN(nivel) || nivel <= 0) {
    console.log("Error: el nivel debe ser un número mayor que cero.");
}
```

También se valida que el nombre y la clase no estén vacíos.

Estas validaciones permiten evitar que el usuario introduzca información incorrecta.

## Uso de la consola

Durante el programa se utiliza `console.log()` para mostrar información al usuario.

Por ejemplo:

```javascript
console.log("Personaje creado correctamente.");
```

También se utiliza para mostrar mensajes de error y resultados.

## Uso de `package.json`

El archivo `package.json` contiene información básica del proyecto y permite definir comandos para ejecutarlo.

Los comandos utilizados son:

### Iniciar

```bash
npm start
```

Ejecuta:

```bash
node app.js
```

### Desarrollo

```bash
npm run dev
```

Ejecuta:

```bash
node --watch app.js
```

### Comprobar sintaxis

```bash
npm run check
```

Ejecuta:

```bash
node --check app.js
```

## Conceptos aprendidos

Este ejercicio permite practicar:

* Node.js como runtime.
* Ejecución de archivos JavaScript desde la terminal.
* `package.json`.
* Scripts de npm.
* `console.log()`.
* Módulo `readline`.
* Entrada de datos desde la terminal.
* Funciones.
* Objetos.
* Arrays.
* `find()`.
* `map()`.
* `reduce()`.
* `push()`.
* Condicionales.
* `switch`.
* Validaciones.
* Manejo básico del flujo de un programa.

## ¿Por qué no se utiliza Express?

Este ejercicio está enfocado en los fundamentos de Node.js y el funcionamiento del programa desde la terminal.

Por esa razón no se utiliza Express ni ningún framework externo.

Primero se busca comprender cómo funciona Node.js directamente. Posteriormente, cuando estos conceptos estén claros, se puede aprender cómo funcionan los servidores HTTP y los frameworks.

## ¿Por qué no se utiliza un navegador?

La aplicación no necesita navegador.

El usuario interactúa directamente con el programa mediante:

```text
Terminal → Node.js → Programa → Terminal
```

De esta manera se puede concentrar el aprendizaje en Node.js, la consola, las funciones, los datos y las validaciones.

## Conclusión

La solución implementa un pequeño sistema RPG completamente ejecutado desde la terminal.

El proyecto mantiene una estructura sencilla porque se encuentra en una etapa inicial de aprendizaje.

El código está concentrado en `app.js` para facilitar su lectura y comprensión, mientras que `package.json` contiene los comandos necesarios para ejecutar y comprobar el programa.
