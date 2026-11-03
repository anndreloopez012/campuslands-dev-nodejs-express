# BÁSICO 06 — path y rutas seguras

## Descripción

API básica desarrollada con **Node.js**, **Express** y el módulo nativo `path` para construir rutas de archivos de forma controlada.

El proyecto utiliza una temática de **motos y mecánica** y permite consultar fichas de mantenimiento almacenadas como archivos JSON.

## Tecnologías

* Node.js 20+
* Express
* JavaScript
* ES Modules
* `path`
* `fs/promises`
* JSON
* `curl`

## Estructura

```text
carlos-velasco/
├── package.json
├── package-lock.json
├── README.md
└── src/
    ├── server.js
    ├── app.js
    ├── data/
    │   └── motos/
    │       └── honda-cb190r.json
    ├── routes/
    │   └── moto.routes.js
    ├── controllers/
    │   └── moto.controller.js
    └── services/
        └── moto.service.js
```

### Responsabilidad de cada parte

* `server.js`: inicia el servidor.
* `app.js`: configura Express y registra las rutas.
* `routes/`: define los endpoints.
* `controllers/`: recibe las peticiones y construye las respuestas.
* `services/`: contiene la lógica para construir la ruta y leer el archivo.
* `data/motos/`: almacena las fichas de las motos en archivos JSON.

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
path.basename()
   ↓
path.join()
   ↓
Archivo JSON
   ↓
fs.readFile()
   ↓
JSON.parse()
   ↓
Respuesta JSON
```

El servicio utiliza el módulo nativo:

```js
import path from "node:path";
import { readFile } from "node:fs/promises";
```

Primero obtiene únicamente el nombre del archivo:

```js
const safeFileName = path.basename(fileName);
```

Después construye la ruta:

```js
const filePath = path.join(motosDirectory, safeFileName);
```

Finalmente lee el archivo:

```js
const content = await readFile(filePath, "utf-8");
```

Y convierte el contenido JSON en un objeto JavaScript:

```js
return JSON.parse(content);
```

El uso de `path.basename()` permite evitar utilizar directamente segmentos de rutas enviados por el cliente.

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

Servidor:

```text
http://localhost:3000
```

## Endpoints

| Método | Endpoint               | Descripción                   |
| ------ | ---------------------- | ----------------------------- |
| GET    | `/health`              | Verificar el estado de la API |
| GET    | `/api/motos/:fileName` | Leer una ficha de moto        |

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
  "topic": "path y rutas seguras"
}
```

### 2. Consultar una moto existente

```bash
curl http://localhost:3000/api/motos/honda-cb190r.json
```

Resultado:

```json
{
  "ok": true,
  "data": {
    "id": 1,
    "marca": "Honda",
    "modelo": "CB190R",
    "anio": 2024,
    "tipo": "Naked",
    "mantenimiento": {
      "aceite": "Cada 3000 km",
      "cadena": "Revisar cada 1000 km",
      "frenos": "Revisar cada 5000 km"
    }
  }
}
```

### 3. Consultar una moto inexistente

```bash
curl http://localhost:3000/api/motos/yamaha-r15.json
```

Resultado:

```json
{
  "ok": false,
  "message": "No se encontró la ficha de la moto"
}
```

Código HTTP:

```text
404 Not Found
```

### 4. Probar una ruta sospechosa

```bash
curl "http://localhost:3000/api/motos/..%2F..%2Fpackage.json"
```

Resultado:

```json
{
  "ok": false,
  "message": "No se encontró la ficha de la moto"
}
```

Esta prueba permite comprobar que el nombre recibido se procesa mediante:

```js
path.basename(fileName)
```

antes de construir la ruta final.

## Manejo de errores

Si el archivo solicitado no existe o no puede ser leído, el controlador captura el error y responde:

```json
{
  "ok": false,
  "message": "No se encontró la ficha de la moto"
}
```

con el código:

```text
404 Not Found
```

## Resultado

El ejercicio demuestra cómo utilizar el módulo nativo `path` para construir rutas de archivos de forma controlada dentro de una API Express.

La aplicación mantiene una separación sencilla entre:

* Datos.
* Construcción de rutas.
* Lectura de archivos.
* Controladores.
* Rutas.

El objetivo principal es comprender el flujo:

```text
Ruta recibida → path → Ruta segura → Archivo JSON → Express → Cliente
```
