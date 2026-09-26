# API Futbol y Futbol Sala

## Descripcion

Este proyecto consiste en una pequena API desarrollada con Node.js para consultar informacion de equipos de futbol y futbol sala.

El objetivo principal es practicar el uso del modulo nativo `fs` de Node.js para leer informacion almacenada en un archivo JSON.

El proyecto no utiliza Express ni dependencias externas.

## Objetivos

Con este ejercicio se practica:

- Node.js.
- Modulo `fs`.
- Lectura de archivos.
- Archivos JSON.
- Servidor HTTP.
- Rutas.
- Metodos HTTP.
- Validacion basica.
- Respuestas HTTP.
- Manejo de errores.
- npm scripts.

## Estructura

```text
futbol-futsal-node/
├── app.js
├── equipos.json
├── package.json
└── README.md
```

El archivo `app.js` contiene todo el codigo JavaScript del proyecto.

El archivo `equipos.json` contiene los datos que seran leidos mediante `fs`.

## Requisitos

Se necesita:

- Node.js 20 o superior.
- npm.

No es necesario instalar paquetes externos.

## Instalacion

Entrar en la carpeta:

```bash
cd futbol-futsal-node
```

No es necesario ejecutar `npm install`, porque el proyecto utiliza solamente modulos incluidos en Node.js.

## Ejecucion

Para iniciar el servidor:

```bash
npm start
```

El servidor estara disponible en:

```text
http://localhost:3000
```

Para desarrollo:

```bash
npm run dev
```

Para comprobar la sintaxis:

```bash
npm run check
```

## Modulo fs

El concepto principal del ejercicio es el modulo `fs`.

Se importa utilizando:

```javascript
const fs = require("fs");
```

Node.js incluye este modulo para trabajar con el sistema de archivos.

En este proyecto se utiliza:

```javascript
fs.readFileSync()
```

para leer el archivo:

```text
equipos.json
```

El contenido se obtiene como texto:

```javascript
const contenido = fs.readFileSync(
    archivoEquipos,
    "utf-8"
);
```

Despues se convierte el texto JSON en un arreglo de JavaScript:

```javascript
const equipos = JSON.parse(contenido);
```

El proceso es:

```text
equipos.json
     |
     v
fs.readFileSync()
     |
     v
Texto JSON
     |
     v
JSON.parse()
     |
     v
Arreglo de equipos
```

## Datos almacenados

El archivo `equipos.json` contiene equipos de futbol y futbol sala.

Ejemplo:

```json
{
    "id": 1,
    "nombre": "Real Madrid",
    "deporte": "futbol",
    "pais": "España"
}
```

Cada equipo contiene:

| Campo | Descripcion |
|---|---|
| `id` | Identificador del equipo |
| `nombre` | Nombre del equipo |
| `deporte` | Futbol o futbol sala |
| `pais` | Pais del equipo |

## Endpoints

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/` | Informacion de la API |
| GET | `/equipos` | Obtener todos los equipos |
| GET | `/equipos/:id` | Buscar un equipo |
| GET | `/futbol` | Obtener equipos de futbol |
| GET | `/futbol-sala` | Obtener equipos de futbol sala |

## 1. Informacion de la API

Ejecutar:

```bash
curl http://localhost:3000/
```

Tambien se puede abrir:

```text
http://localhost:3000/
```

## 2. Obtener todos los equipos

```bash
curl http://localhost:3000/equipos
```

La API lee `equipos.json` y devuelve todos los equipos.

Respuesta:

```json
{
    "total": 5,
    "equipos": [
        {
            "id": 1,
            "nombre": "Real Madrid",
            "deporte": "futbol",
            "pais": "España"
        }
    ]
}
```

## 3. Obtener equipos de futbol

```bash
curl http://localhost:3000/futbol
```

La API lee el archivo y filtra los equipos cuyo campo `deporte` sea:

```text
futbol
```

## 4. Obtener equipos de futbol sala

```bash
curl http://localhost:3000/futbol-sala
```

La API realiza el mismo proceso, pero busca:

```text
futbol sala
```

## 5. Buscar un equipo por ID

Por ejemplo:

```bash
curl http://localhost:3000/equipos/1
```

Respuesta:

```json
{
    "id": 1,
    "nombre": "Real Madrid",
    "deporte": "futbol",
    "pais": "España"
}
```

Si el ID no existe:

```bash
curl http://localhost:3000/equipos/99
```

La API devuelve:

```json
{
    "error": "Equipo no encontrado."
}
```

con codigo HTTP `404`.

## Validacion

Aunque este ejercicio se enfoca principalmente en `fs`, tambien se incluye validacion basica.

La funcion:

```javascript
validarEquipo()
```

comprueba:

- Nombre obligatorio.
- Nombre de tipo texto.
- Deporte valido.
- Pais obligatorio.

Los deportes permitidos son:

```text
futbol
futbol sala
```

## Manejo de errores

La API contempla diferentes errores.

### Archivo no encontrado

Si `equipos.json` no puede ser leido, la funcion `leerEquipos()` devuelve `null`.

La API responde:

```json
{
    "error": "No fue posible leer el archivo de equipos."
}
```

con codigo HTTP `500`.

### Equipo inexistente

Si se busca un ID que no existe:

```text
GET /equipos/99
```

se devuelve:

```json
{
    "error": "Equipo no encontrado."
}
```

### Ruta inexistente

Si se consulta una ruta que no existe:

```text
GET /jugadores
```

la respuesta sera:

```json
{
    "error": "Ruta no encontrada."
}
```

## Codigos HTTP

| Codigo | Significado |
|---|---|
| `200` | Solicitud correcta |
| `400` | Datos incorrectos |
| `404` | Recurso o ruta no encontrada |
| `500` | Error al leer el archivo |

## Flujo de funcionamiento

La API funciona de la siguiente manera:

```text
Cliente
   |
   v
Solicitud HTTP
   |
   v
Servidor Node.js
   |
   v
Ruta
   |
   v
fs.readFileSync()
   |
   v
equipos.json
   |
   v
JSON.parse()
   |
   v
Procesamiento
   |
   v
Respuesta JSON
```

## Por que utilizar fs

El modulo `fs` permite trabajar directamente con archivos del sistema.

En este ejercicio se utiliza para simular una fuente sencilla de datos sin utilizar:

- MySQL.
- MongoDB.
- PostgreSQL.
- APIs externas.

Esto permite concentrarse en aprender como Node.js puede leer informacion almacenada localmente.

## Diferencia entre leer y modificar datos

En este ejercicio solamente se utiliza:

```javascript
fs.readFileSync()
```

porque el objetivo es practicar la lectura de archivos.

No se implementan operaciones de escritura para mantener el ejercicio enfocado en el concepto solicitado.

## Proceso de solucion

### 1. Analizar el problema

El escenario es futbol y futbol sala.

### 2. Definir los datos

Se necesitan equipos con:

```text
id
nombre
deporte
pais
```

### 3. Crear el archivo de datos

Se crea:

```text
equipos.json
```

### 4. Leer el archivo

Se utiliza:

```javascript
fs.readFileSync()
```

### 5. Convertir JSON

Se utiliza:

```javascript
JSON.parse()
```

### 6. Procesar los datos

Se utiliza `filter()` para separar:

```text
futbol
futbol sala
```

### 7. Crear las rutas

Se implementan:

```text
GET /
GET /equipos
GET /equipos/:id
GET /futbol
GET /futbol-sala
```

### 8. Agregar validaciones y errores

Se controlan archivos no disponibles, IDs incorrectos, equipos inexistentes y rutas no existentes.

### 9. Probar la API

Se puede utilizar:

- Navegador.
- Postman.
- Thunder Client.
- curl.

## Prueba completa

Primero comprobar la sintaxis:

```bash
npm run check
```

Iniciar el servidor:

```bash
npm start
```

Consultar todos los equipos:

```bash
curl http://localhost:3000/equipos
```

Consultar solamente futbol:

```bash
curl http://localhost:3000/futbol
```

Consultar futbol sala:

```bash
curl http://localhost:3000/futbol-sala
```

Buscar un equipo:

```bash
curl http://localhost:3000/equipos/1
```

## Resultado

La solucion implementa una pequena API de futbol y futbol sala utilizando Node.js y el modulo `fs`.

Todo el codigo JavaScript esta dentro de `app.js`.

El archivo `equipos.json` funciona como fuente de datos.

El ejercicio permite practicar:

```text
Node.js
fs
Lectura de archivos
JSON
HTTP
Rutas
Validacion
Manejo de errores
npm scripts
```