# BÁSICO 05 — fs para leer archivos

## Descripción

API básica desarrollada con **Node.js**, **Express** y el módulo nativo `fs` para leer información almacenada en un archivo JSON.

El proyecto utiliza una temática de **fútbol y fútbol sala** y permite consultar los partidos almacenados en `matches.json`.

## Tecnologías

* Node.js 20+
* Express
* JavaScript
* ES Modules
* `fs/promises`
* JSON
* `curl`

## Estructura

```text
carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── server.js
    ├── app.js
    ├── data/
    │   └── matches.json
    ├── routes/
    │   └── match.routes.js
    ├── controllers/
    │   └── match.controller.js
    └── services/
        └── match.service.js
```

### Responsabilidad de cada parte

* `server.js`: inicia el servidor.
* `app.js`: configura Express y registra las rutas.
* `routes/`: define los endpoints.
* `controllers/`: recibe las peticiones y construye las respuestas.
* `services/`: contiene la lógica para leer el archivo.
* `data/matches.json`: almacena los datos de los partidos.

## Funcionamiento

El flujo de la aplicación es:

```text
Cliente
   ↓
Ruta
   ↓
Controlador
   ↓
Servicio
   ↓
fs.readFile()
   ↓
matches.json
   ↓
JSON.parse()
   ↓
Respuesta JSON
```

El servicio utiliza el módulo nativo de Node.js:

```js
import { readFile } from "node:fs/promises";
```

Para leer el archivo:

```js
const content = await readFile(filePath, "utf-8");
```

Después, el contenido de texto se convierte en objetos JavaScript:

```js
const matches = JSON.parse(content);
```

No se utiliza una base de datos externa. La fuente de información es el archivo `matches.json`.

## Instalación

Desde la carpeta del proyecto:

```bash
npm install
```

## Ejecución

Modo desarrollo:

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

Servidor:

```text
http://localhost:3000
```

## Endpoint

| Método | Endpoint       | Descripción                             |
| ------ | -------------- | --------------------------------------- |
| GET    | `/health`      | Verificar el estado de la API           |
| GET    | `/api/matches` | Leer los partidos desde el archivo JSON |

## Pruebas con curl

Las pruebas se realizan con el servidor ejecutándose.

### 1. Health check

```bash
curl http://localhost:3000/health
```

Resultado:

```json
{
  "ok": true,
  "message": "API funcionando correctamente",
  "topic": "fs para leer archivos"
}
```

### 2. Leer los partidos

```bash
curl http://localhost:3000/api/matches
```

Resultado inicial:

```json
{
  "ok": true,
  "total": 3,
  "data": [
    {
      "id": 1,
      "sport": "Fútbol",
      "teamA": "Barcelona",
      "teamB": "Real Madrid",
      "score": "2-1"
    },
    {
      "id": 2,
      "sport": "Fútbol",
      "teamA": "Liverpool",
      "teamB": "Arsenal",
      "score": "1-1"
    },
    {
      "id": 3,
      "sport": "Fútbol sala",
      "teamA": "Inter Movistar",
      "teamB": "ElPozo Murcia",
      "score": "4-3"
    }
  ]
}
```

## Prueba de lectura del archivo

Una forma sencilla de comprobar que la API realmente está leyendo el archivo es modificar un dato en:

```text
src/data/matches.json
```

Por ejemplo:

```json
"score": "5-0"
```

Después se vuelve a ejecutar:

```bash
curl http://localhost:3000/api/matches
```

La respuesta debe mostrar el nuevo marcador.

Esto demuestra que los datos no están escritos directamente en el servicio, sino que son obtenidos desde el archivo mediante `fs`.

## Manejo de errores

Si el archivo no puede ser leído, el controlador captura el error y responde:

```json
{
  "ok": false,
  "message": "No se pudieron leer los partidos"
}
```

con el código:

```text
500 Internal Server Error
```

## Resultado

El ejercicio demuestra cómo utilizar el módulo nativo `fs` de Node.js para leer archivos y utilizar su contenido dentro de una API Express.

La aplicación mantiene una separación sencilla entre:

* Datos.
* Lectura de archivos.
* Lógica de la aplicación.
* Controladores.
* Rutas.

El objetivo principal es comprender el flujo:

```text
Archivo JSON → fs → JavaScript → Express → Cliente
```
