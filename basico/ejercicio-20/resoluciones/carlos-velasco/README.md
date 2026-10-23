# BASICO 20 - middleware express.json

## Autor

**Velasco-c**

## Objetivo

Crear una pequeña API HTTP con Node.js y Express para comprender y utilizar el middleware `express.json()`.

La solución utiliza la temática de dibujo digital y permite consultar y registrar dibujos digitales mediante solicitudes HTTP.

El objetivo principal es comprender cómo Express procesa automáticamente un cuerpo JSON para que pueda ser utilizado mediante:

```javascript
req.body
```

## Concepto principal

El concepto principal del ejercicio es el middleware:

```javascript
express.json()
```

Este middleware permite que Express interprete solicitudes cuyo cuerpo contiene información en formato JSON.

La configuración utilizada en la aplicación es:

```javascript
app.use(express.json());
```

Gracias a este middleware, una solicitud como:

```http
POST /api/drawings
Content-Type: application/json
```

con el siguiente cuerpo:

```json
{
  "title": "Paisaje digital",
  "technique": "pintura digital",
  "software": "Krita"
}
```

puede ser leída desde el controlador mediante:

```javascript
const { title, technique, software } = req.body;
```

Sin `express.json()`, Express no interpreta automáticamente el cuerpo JSON de este tipo de solicitudes.

## ¿Qué es un middleware?

Un middleware es una función que participa en el procesamiento de una solicitud HTTP antes de que esta llegue al controlador final.

En este ejercicio:

```javascript
app.use(express.json());
```

registra el middleware JSON para que las solicitudes puedan ser procesadas antes de llegar a las rutas.

El flujo simplificado es:

```text
Cliente
   │
   │ POST /api/drawings
   │ Content-Type: application/json
   │
   │ JSON
   ▼
express.json()
   │
   │ interpreta req.body
   ▼
Ruta
   │
   ▼
Controlador
   │
   ▼
Servicio
   │
   ▼
Respuesta HTTP
```

## ¿Qué hace `express.json()`?

`express.json()` analiza el cuerpo de las solicitudes que contienen JSON válido y deja los datos disponibles mediante:

```javascript
req.body
```

Por ejemplo, si el cliente envía:

```json
{
  "title": "Ciudad futurista",
  "technique": "concept art",
  "software": "Procreate"
}
```

el controlador puede acceder a:

```javascript
req.body.title
req.body.technique
req.body.software
```

También puede utilizar destructuring:

```javascript
const { title, technique, software } = req.body;
```

## Tecnologías utilizadas

- Node.js 20 o superior recomendado.
- Express 5.
- JavaScript.
- API HTTP.
- JSON.
- Datos almacenados temporalmente en memoria.

## Estructura del proyecto

```text
basico/ejercicio-20/resoluciones/carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── controllers/
    │   └── drawing.controller.js
    ├── routes/
    │   └── drawing.routes.js
    └── services/
        └── drawing.service.js
```

## Responsabilidad de cada archivo

| Archivo | Responsabilidad |
|---|---|
| `package.json` | Define la información del proyecto, scripts y dependencia de Express. |
| `src/app.js` | Configura Express, registra `express.json()`, `/health` y las rutas. |
| `src/routes/drawing.routes.js` | Define los endpoints relacionados con dibujos digitales. |
| `src/controllers/drawing.controller.js` | Lee `req.body`, valida los datos y genera las respuestas HTTP. |
| `src/services/drawing.service.js` | Mantiene los datos en memoria y contiene la lógica para consultar y crear dibujos. |
| `README.md` | Documenta instalación, ejecución, funcionamiento y pruebas. |

## Instalación

Ubicarse dentro de la carpeta del proyecto:

```bash
cd /home/camper/Documentos/repositorios-locales-carlos/campuslands-dev-nodejs-express/basico/ejercicio-20/resoluciones/carlos-velasco
```

Instalar las dependencias:

```bash
npm install
```

Esto instalará Express y sus dependencias.

La carpeta:

```text
node_modules/
```

no debe subirse al repositorio.

## Ejecución

Para ejecutar el servidor:

```bash
npm start
```

Para ejecutarlo utilizando `node --watch`:

```bash
npm run dev
```

El servidor estará disponible en:

```text
http://localhost:3000
```

## Endpoint de salud

La API incluye:

```text
GET /health
```

Este endpoint permite verificar rápidamente que el servidor está funcionando.

### Prueba

```bash
curl "http://localhost:3000/health"
```

### Respuesta esperada

Código HTTP:

```text
200 OK
```

Respuesta:

```json
{
  "ok": true,
  "message": "Servidor funcionando correctamente"
}
```

## Endpoints disponibles

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/health` | Comprueba el estado del servidor. |
| `GET` | `/api/drawings` | Obtiene todos los dibujos digitales. |
| `POST` | `/api/drawings` | Crea un nuevo dibujo digital utilizando `req.body`. |

## Endpoint GET `/api/drawings`

Este endpoint devuelve los dibujos almacenados temporalmente en memoria.

### Solicitud

```bash
curl "http://localhost:3000/api/drawings"
```

### Respuesta esperada

Código HTTP:

```text
200 OK
```

Respuesta:

```json
{
  "ok": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "title": "Paisaje espacial",
      "technique": "pintura digital",
      "software": "Krita"
    },
    {
      "id": 2,
      "title": "Retrato fantástico",
      "technique": "ilustración digital",
      "software": "Photoshop"
    }
  ]
}
```

## Endpoint POST `/api/drawings`

Este endpoint permite crear un nuevo dibujo digital.

La información se envía en el cuerpo de la solicitud utilizando JSON.

### Estructura esperada

```json
{
  "title": "Paisaje futurista",
  "technique": "concept art",
  "software": "Krita"
}
```

La solicitud debe indicar:

```http
Content-Type: application/json
```

## Funcionamiento de `req.body`

Cuando el cliente envía:

```json
{
  "title": "Paisaje futurista",
  "technique": "concept art",
  "software": "Krita"
}
```

el middleware:

```javascript
app.use(express.json());
```

procesa el contenido y permite que el controlador pueda acceder a:

```javascript
req.body
```

El controlador utiliza:

```javascript
const { title, technique, software } = req.body;
```

Después valida los datos antes de enviarlos al servicio.

## Prueba de creación

### Solicitud

```bash
curl -X POST "http://localhost:3000/api/drawings" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Paisaje futurista",
    "technique": "concept art",
    "software": "Krita"
  }'
```

### Respuesta esperada

Código HTTP:

```text
201 Created
```

Respuesta similar a:

```json
{
  "ok": true,
  "message": "Dibujo digital creado correctamente",
  "data": {
    "id": 3,
    "title": "Paisaje futurista",
    "technique": "concept art",
    "software": "Krita"
  }
}
```

El identificador puede variar dependiendo de la cantidad de registros creados durante la ejecución.

## Campos del cuerpo

El endpoint espera tres campos:

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `title` | `string` | Sí | Nombre del dibujo. |
| `technique` | `string` | Sí | Técnica utilizada. |
| `software` | `string` | Sí | Software utilizado para realizar el dibujo. |

## Validación de campos obligatorios

Si falta alguno de los campos requeridos, la API responde con:

```text
400 Bad Request
```

### Prueba

```bash
curl -X POST "http://localhost:3000/api/drawings" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Personaje digital",
    "technique": "ilustración digital"
  }'
```

### Respuesta esperada

```json
{
  "ok": false,
  "message": "Los campos title, technique y software son obligatorios"
}
```

## Validación de tipos

Los campos deben ser cadenas de texto.

Por ejemplo, no es válido enviar:

```json
{
  "title": 123,
  "technique": "pintura digital",
  "software": "Krita"
}
```

### Prueba

```bash
curl -X POST "http://localhost:3000/api/drawings" \
  -H "Content-Type: application/json" \
  -d '{
    "title": 123,
    "technique": "pintura digital",
    "software": "Krita"
  }'
```

### Respuesta esperada

Código HTTP:

```text
400 Bad Request
```

Respuesta:

```json
{
  "ok": false,
  "message": "Los campos title, technique y software deben ser texto"
}
```

## Validación de cadenas vacías

Los campos tampoco pueden contener únicamente espacios.

Por ejemplo:

```json
{
  "title": "   ",
  "technique": "pintura digital",
  "software": "Krita"
}
```

no es válido.

### Prueba

```bash
curl -X POST "http://localhost:3000/api/drawings" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "   ",
    "technique": "pintura digital",
    "software": "Krita"
  }'
```

### Respuesta esperada

Código HTTP:

```text
400 Bad Request
```

Respuesta:

```json
{
  "ok": false,
  "message": "Los campos title, technique y software no pueden estar vacíos"
}
```

## Content-Type

Las solicitudes de creación deben indicar que el cuerpo contiene JSON:

```http
Content-Type: application/json
```

Por ejemplo:

```bash
curl -X POST "http://localhost:3000/api/drawings" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Retrato digital",
    "technique": "pintura digital",
    "software": "Photoshop"
  }'
```

El encabezado permite identificar el formato del contenido enviado.

## JSON inválido

El middleware `express.json()` también participa en el procesamiento del JSON enviado por el cliente.

Si se proporciona un cuerpo con formato JSON inválido, Express no puede analizarlo correctamente.

Por ejemplo:

```bash
curl -X POST "http://localhost:3000/api/drawings" \
  -H "Content-Type: application/json" \
  -d '{"title":"Dibujo digital",}'
```

El JSON anterior contiene una coma incorrecta antes de `}`.

En este caso Express detecta que el cuerpo no es JSON válido y la solicitud no llega normalmente al controlador.

## Manejo de rutas inexistentes

Si se solicita una ruta que no existe:

```bash
curl "http://localhost:3000/api/unknown"
```

la aplicación responde:

Código HTTP:

```text
404 Not Found
```

Respuesta:

```json
{
  "ok": false,
  "message": "Ruta no encontrada"
}
```

## Códigos HTTP utilizados

| Código | Situación |
|---|---|
| `200 OK` | Consulta realizada correctamente. |
| `201 Created` | Dibujo digital creado correctamente. |
| `400 Bad Request` | Datos enviados incorrectamente o faltantes. |
| `404 Not Found` | La ruta solicitada no existe. |

## Flujo de una solicitud POST

Para:

```text
POST /api/drawings
```

el flujo es:

```text
Cliente
   │
   │ JSON
   ▼
express.json()
   │
   │ convierte el cuerpo en req.body
   ▼
drawing.routes.js
   │
   ▼
drawing.controller.js
   │
   │ valida req.body
   ▼
drawing.service.js
   │
   │ crea el dibujo
   ▼
drawing.controller.js
   │
   ▼
Respuesta HTTP 201
```

## Separación de responsabilidades

### `app.js`

Es el punto de configuración de la aplicación.

Aquí se registra:

```javascript
app.use(express.json());
```

Esto hace que el middleware esté disponible para las rutas posteriores.

### `drawing.routes.js`

Define qué controlador debe atender cada endpoint:

```javascript
router.get("/", drawingController.getDrawings);
router.post("/", drawingController.createDrawing);
```

### `drawing.controller.js`

Trabaja directamente con HTTP.

En el endpoint POST obtiene los datos:

```javascript
const { title, technique, software } = req.body;
```

Después valida la información y genera la respuesta correspondiente.

### `drawing.service.js`

Se ocupa de los datos y de la lógica relacionada con los dibujos.

La información se mantiene en memoria mediante un arreglo.

## Almacenamiento

Este ejercicio no utiliza una base de datos.

Los datos se encuentran temporalmente en:

```javascript
const drawings = [
  // ...
];
```

Por esta razón, los nuevos dibujos creados desaparecen cuando el servidor se reinicia.

Esta decisión es intencional porque el objetivo del ejercicio es practicar:

```text
express.json()
        ↓
req.body
        ↓
validación
        ↓
servicio
        ↓
respuesta HTTP
```

## Prueba completa recomendada

Primero instalar las dependencias:

```bash
npm install
```

Iniciar el servidor:

```bash
npm run dev
```

Comprobar el servidor:

```bash
curl "http://localhost:3000/health"
```

Consultar los dibujos iniciales:

```bash
curl "http://localhost:3000/api/drawings"
```

Crear un dibujo:

```bash
curl -X POST "http://localhost:3000/api/drawings" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ciudad nocturna",
    "technique": "pintura digital",
    "software": "Krita"
  }'
```

Consultar nuevamente los dibujos:

```bash
curl "http://localhost:3000/api/drawings"
```

Finalmente, comprobar una validación:

```bash
curl -X POST "http://localhost:3000/api/drawings" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Dibujo incompleto",
    "technique": "ilustración digital"
  }'
```

La última solicitud debe responder con:

```text
400 Bad Request
```

## Errores comunes

### Olvidar `express.json()`

Sin:

```javascript
app.use(express.json());
```

el controlador no tendría el procesamiento esperado del cuerpo JSON.

### No enviar `Content-Type`

Una solicitud JSON debe indicar:

```http
Content-Type: application/json
```

### No validar `req.body`

No se debe asumir que el cliente siempre enviará información correcta.

La aplicación comprueba:

- campos obligatorios;
- tipos de datos;
- cadenas vacías.

### Colocar toda la lógica en `app.js`

La solución separa:

```text
routes
controllers
services
```

para mantener una estructura clara.

## Resultado esperado

La solución está correctamente implementada si:

- Instala las dependencias mediante `npm install`.
- Ejecuta mediante `npm start`.
- Permite utilizar `npm run dev`.
- Expone `GET /health`.
- Expone `GET /api/drawings`.
- Expone `POST /api/drawings`.
- Utiliza `express.json()`.
- Permite acceder a los datos enviados mediante `req.body`.
- Valida los campos recibidos.
- Devuelve `201 Created` cuando crea un dibujo correctamente.
- Devuelve `400 Bad Request` cuando los datos son inválidos.
- Devuelve `404 Not Found` para rutas inexistentes.
- Mantiene separadas rutas, controladores y servicios.
- No utiliza una base de datos externa.
- No requiere Docker.
- Mantiene la solución dentro de la carpeta personal del estudiante.

## Archivos que no deben subirse

No se deben subir:

```text
node_modules/
.env
```

`node_modules/` se genera automáticamente mediante:

```bash
npm install
```

## Comandos principales

Instalar dependencias:

```bash
npm install
```

Ejecutar normalmente:

```bash
npm start
```

Ejecutar en desarrollo:

```bash
npm run dev
```

## Resumen

Este ejercicio demuestra el funcionamiento de `express.json()` como middleware de Express.

La configuración:

```javascript
app.use(express.json());
```

permite procesar solicitudes HTTP que contienen datos JSON y acceder a esos datos mediante:

```javascript
req.body
```

La solución utiliza un endpoint `POST` para recibir información de un dibujo digital:

```json
{
  "title": "Paisaje futurista",
  "technique": "concept art",
  "software": "Krita"
}
```

El flujo principal es:

```text
Solicitud JSON
      ↓
express.json()
      ↓
req.body
      ↓
Controlador
      ↓
Validación
      ↓
Servicio
      ↓
Respuesta HTTP
```

De esta manera se practica el uso de middleware, el procesamiento de cuerpos JSON, la validación de entradas y la separación básica de responsabilidades en una API Express.