# BASICO 21 - estructura src routes controllers

## Autor

**Velasco-c**

## Objetivo

Crear una pequeña API HTTP con Node.js y Express para practicar una estructura organizada utilizando las carpetas:

```text
src/
├── routes/
├── controllers/
└── services/
```

La solución utiliza la temática de animación 3D y permite consultar, buscar y registrar proyectos de animación almacenados temporalmente en memoria.

El objetivo principal no es construir una aplicación grande, sino comprender cómo distribuir las responsabilidades de una API Express en diferentes capas.

## Concepto principal

El concepto principal de este ejercicio es la organización de una aplicación Express mediante:

```text
src/
├── app.js
├── routes/
├── controllers/
└── services/
```

Cada parte tiene una responsabilidad concreta.

### `src/app.js`

Es el punto de entrada de la aplicación.

Se encarga principalmente de:

- Crear la aplicación Express.
- Registrar middleware.
- Registrar las rutas.
- Configurar el puerto.
- Iniciar el servidor.
- Manejar rutas inexistentes.

### `routes`

Las rutas determinan qué endpoint existe y qué controlador debe atenderlo.

Por ejemplo:

```javascript
router.get("/", animationController.getAnimations);
router.get("/:id", animationController.getAnimationById);
router.post("/", animationController.createAnimation);
```

Las rutas no contienen la lógica principal del negocio.

### `controllers`

Los controladores trabajan con la solicitud y la respuesta HTTP.

Se encargan de:

- Leer parámetros.
- Leer `req.body`.
- Validar entradas.
- Llamar al servicio correspondiente.
- Construir la respuesta HTTP.

### `services`

Los servicios contienen la lógica relacionada con los datos.

En este ejercicio el servicio trabaja con un arreglo en memoria.

La separación permite evitar que las rutas o `app.js` acumulen toda la lógica de la aplicación.

## Flujo general

Una solicitud HTTP sigue este flujo:

```text
Cliente
   │
   │ HTTP Request
   ▼
src/app.js
   │
   ▼
routes
   │
   ▼
controllers
   │
   ▼
services
   │
   ▼
controllers
   │
   ▼
HTTP Response
   │
   ▼
Cliente
```

Una forma sencilla de recordar las responsabilidades es:

```text
Routes      → ¿Qué ruta se solicita?
Controller  → ¿Qué debe hacer HTTP con la solicitud?
Service     → ¿Qué lógica y datos necesita la operación?
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
basico/ejercicio-21/resoluciones/carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── controllers/
    │   └── animation.controller.js
    ├── routes/
    │   └── animation.routes.js
    └── services/
        └── animation.service.js
```

## Responsabilidad de cada archivo

| Archivo | Responsabilidad |
|---|---|
| `package.json` | Define información del proyecto, dependencia de Express y scripts. |
| `src/app.js` | Configura Express, middleware, rutas y servidor. |
| `src/routes/animation.routes.js` | Define los endpoints de animaciones 3D. |
| `src/controllers/animation.controller.js` | Procesa solicitudes, valida entradas y genera respuestas HTTP. |
| `src/services/animation.service.js` | Administra los datos y la lógica relacionada con las animaciones. |
| `README.md` | Documenta instalación, ejecución, arquitectura y pruebas. |

## Instalación

Ubicarse dentro de la carpeta del proyecto:

```bash
cd /home/camper/Documentos/repositorios-locales-carlos/campuslands-dev-nodejs-express/basico/ejercicio-21/resoluciones/carlos-velasco
```

Instalar las dependencias:

```bash
npm install
```

La instalación genera:

```text
node_modules/
```

Esta carpeta no debe subirse al repositorio.

## Ejecución

Para ejecutar la aplicación normalmente:

```bash
npm start
```

Para ejecutar utilizando `node --watch`:

```bash
npm run dev
```

El servidor estará disponible en:

```text
http://localhost:3000
```

## Endpoint de salud

La aplicación proporciona:

```text
GET /health
```

Este endpoint permite comprobar que el servidor está funcionando.

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
| `GET` | `/api/animations` | Obtiene todas las animaciones 3D. |
| `GET` | `/api/animations/:id` | Obtiene una animación específica. |
| `POST` | `/api/animations` | Crea una nueva animación 3D. |

## Endpoint GET `/api/animations`

Este endpoint permite consultar todas las animaciones disponibles.

### Solicitud

```bash
curl "http://localhost:3000/api/animations"
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
  "count": 3,
  "data": [
    {
      "id": 1,
      "title": "Robot futurista",
      "software": "Blender",
      "duration": 12
    },
    {
      "id": 2,
      "title": "Criatura fantástica",
      "software": "Maya",
      "duration": 18
    },
    {
      "id": 3,
      "title": "Vehículo espacial",
      "software": "Cinema 4D",
      "duration": 10
    }
  ]
}
```

## Endpoint GET `/api/animations/:id`

Este endpoint permite obtener una animación específica.

El identificador se recibe como parámetro de ruta:

```text
/api/animations/:id
```

Por ejemplo:

```text
/api/animations/2
```

El controlador obtiene el valor mediante:

```javascript
const { id } = req.params;
```

Después lo convierte a número y valida que sea un entero positivo.

### Prueba

```bash
curl "http://localhost:3000/api/animations/2"
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
  "data": {
    "id": 2,
    "title": "Criatura fantástica",
    "software": "Maya",
    "duration": 18
  }
}
```

## Endpoint POST `/api/animations`

Este endpoint permite crear una nueva animación 3D.

Los datos se reciben mediante `req.body`.

### Cuerpo esperado

```json
{
  "title": "Dragón mecánico",
  "software": "Blender",
  "duration": 15
}
```

La solicitud debe utilizar:

```http
Content-Type: application/json
```

## Campos del cuerpo

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `title` | `string` | Sí | Nombre de la animación. |
| `software` | `string` | Sí | Software utilizado. |
| `duration` | `number` | Sí | Duración de la animación. |

## Prueba de creación

```bash
curl -X POST "http://localhost:3000/api/animations" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Dragón mecánico",
    "software": "Blender",
    "duration": 15
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
  "message": "Animación 3D creada correctamente",
  "data": {
    "id": 4,
    "title": "Dragón mecánico",
    "software": "Blender",
    "duration": 15
  }
}
```

El identificador depende de los registros existentes durante la ejecución.

## Validación de campos obligatorios

El controlador comprueba que estén presentes:

```text
title
software
duration
```

### Prueba

```bash
curl -X POST "http://localhost:3000/api/animations" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Animación incompleta",
    "software": "Blender"
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
  "message": "Los campos title, software y duration son obligatorios"
}
```

## Validación de tipos

`title` y `software` deben ser cadenas:

```text
string
```

Mientras que `duration` debe ser un número:

```text
number
```

Por ejemplo, esta solicitud es inválida:

```json
{
  "title": 123,
  "software": "Blender",
  "duration": "15"
}
```

### Prueba

```bash
curl -X POST "http://localhost:3000/api/animations" \
  -H "Content-Type: application/json" \
  -d '{
    "title": 123,
    "software": "Blender",
    "duration": "15"
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
  "message": "title y software deben ser texto, y duration debe ser un número"
}
```

## Validación de duración

La duración debe ser mayor que cero.

No se permite:

```json
{
  "title": "Robot",
  "software": "Blender",
  "duration": 0
}
```

### Prueba

```bash
curl -X POST "http://localhost:3000/api/animations" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Robot",
    "software": "Blender",
    "duration": 0
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
  "message": "duration debe ser un número mayor que cero"
}
```

## Validación de textos vacíos

Los campos de texto tampoco pueden estar vacíos o contener únicamente espacios.

Por ejemplo:

```json
{
  "title": "   ",
  "software": "Blender",
  "duration": 10
}
```

no es válido.

### Prueba

```bash
curl -X POST "http://localhost:3000/api/animations" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "   ",
    "software": "Blender",
    "duration": 10
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
  "message": "title y software no pueden estar vacíos"
}
```

## Recurso inexistente

Si se solicita un identificador válido pero que no existe:

```bash
curl "http://localhost:3000/api/animations/999"
```

la API responde:

Código HTTP:

```text
404 Not Found
```

Respuesta:

```json
{
  "ok": false,
  "message": "Animación 3D no encontrada"
}
```

## Parámetro inválido

Si el identificador no es un número entero positivo:

```bash
curl "http://localhost:3000/api/animations/abc"
```

la API responde:

Código HTTP:

```text
400 Bad Request
```

Respuesta:

```json
{
  "ok": false,
  "message": "El parámetro id debe ser un número entero positivo"
}
```

## Ruta inexistente

Si se solicita una ruta que no está definida:

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
| `201 Created` | Animación creada correctamente. |
| `400 Bad Request` | Los datos o parámetros enviados no son válidos. |
| `404 Not Found` | El recurso o la ruta no existe. |

## Ejemplo de separación entre rutas y controladores

La ruta:

```javascript
router.get("/:id", animationController.getAnimationById);
```

no realiza directamente la búsqueda.

Su responsabilidad es conectar:

```text
GET /api/animations/:id
```

con:

```javascript
animationController.getAnimationById
```

El controlador se encarga de la interacción HTTP:

```javascript
const { id } = req.params;

const animation = animationService.getAnimationById(animationId);
```

Mientras que el servicio realiza la búsqueda:

```javascript
const getAnimationById = (id) => {
  return animations.find((animation) => animation.id === id);
};
```

Esta separación evita mezclar responsabilidades.

## Ejemplo de separación entre controlador y servicio

El controlador contiene la validación y la respuesta:

```javascript
const animation = animationService.getAnimationById(animationId);

if (!animation) {
  return res.status(404).json({
    ok: false,
    message: "Animación 3D no encontrada"
  });
}
```

El servicio se concentra en obtener el dato:

```javascript
const getAnimationById = (id) => {
  return animations.find((animation) => animation.id === id);
};
```

El controlador sabe de HTTP.

El servicio sabe de los datos.

## Flujo de una solicitud GET

Para:

```text
GET /api/animations/2
```

el flujo es:

```text
Cliente
   │
   │ GET /api/animations/2
   ▼
app.js
   │
   ▼
animation.routes.js
   │
   ▼
animation.controller.js
   │
   │ req.params.id
   ▼
animation.service.js
   │
   │ busca la animación
   ▼
animation.controller.js
   │
   │ construye respuesta
   ▼
Cliente
```

## Flujo de una solicitud POST

Para:

```text
POST /api/animations
```

el flujo es:

```text
Cliente
   │
   │ JSON
   ▼
express.json()
   │
   ▼
animation.routes.js
   │
   ▼
animation.controller.js
   │
   │ req.body
   │ validación
   ▼
animation.service.js
   │
   │ crea registro
   ▼
animation.controller.js
   │
   ▼
HTTP 201 Created
```

## Almacenamiento

No se utiliza una base de datos.

Las animaciones se almacenan temporalmente en:

```javascript
const animations = [
  // ...
];
```

Esto significa que los nuevos registros desaparecen cuando se reinicia el servidor.

Esta decisión mantiene el ejercicio enfocado en la estructura del código y en la separación de responsabilidades.

## ¿Por qué utilizar `services`?

El servicio permite evitar que la lógica relacionada con los datos termine directamente en el controlador.

Sin una capa de servicio, el controlador podría terminar realizando demasiadas tareas:

```text
HTTP
validación
búsqueda
creación
almacenamiento
respuesta
```

Con la estructura utilizada:

```text
Controller
    │
    ▼
Service
```

el controlador se concentra en HTTP y el servicio en la lógica de datos.

## Errores comunes evitados

### Toda la aplicación dentro de `app.js`

No se coloca toda la lógica dentro de:

```text
src/app.js
```

El archivo solamente configura la aplicación.

### Toda la lógica dentro de las rutas

Las rutas tampoco realizan directamente la lógica de negocio.

En lugar de:

```javascript
router.get("/", (req, res) => {
  // demasiada lógica
});
```

se utiliza:

```javascript
router.get("/", animationController.getAnimations);
```

### Mezclar lógica HTTP con datos

El servicio no utiliza:

```javascript
res.status(...)
```

porque no debe encargarse de la respuesta HTTP.

El controlador es responsable de la respuesta.

### No validar los datos

El endpoint `POST` valida:

- campos obligatorios;
- tipos;
- textos vacíos;
- duración mayor que cero.

## Prueba general de funcionamiento

Primero instalar dependencias:

```bash
npm install
```

Iniciar el servidor:

```bash
npm run dev
```

Comprobar:

```bash
curl "http://localhost:3000/health"
```

Consultar todas las animaciones:

```bash
curl "http://localhost:3000/api/animations"
```

Consultar una animación:

```bash
curl "http://localhost:3000/api/animations/1"
```

Crear una animación:

```bash
curl -X POST "http://localhost:3000/api/animations" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ciudad futurista",
    "software": "Blender",
    "duration": 20
  }'
```

Comprobar una entrada inválida:

```bash
curl "http://localhost:3000/api/animations/abc"
```

Comprobar un recurso inexistente:

```bash
curl "http://localhost:3000/api/animations/999"
```

## Resultado esperado

La entrega está correctamente implementada si:

- Instala dependencias mediante `npm install`.
- Ejecuta mediante `npm start`.
- Permite utilizar `npm run dev`.
- Tiene una carpeta `src/`.
- Tiene una carpeta `routes/`.
- Tiene una carpeta `controllers/`.
- Tiene una carpeta `services/`.
- `app.js` configura Express y registra las rutas.
- Las rutas delegan en los controladores.
- Los controladores gestionan solicitudes y respuestas HTTP.
- Los servicios contienen la lógica relacionada con los datos.
- Existe un endpoint `GET /health`.
- Permite consultar animaciones.
- Permite consultar una animación mediante `:id`.
- Permite crear una animación.
- Valida los datos recibidos.
- Maneja errores mediante códigos HTTP coherentes.
- No utiliza una base de datos externa.
- No requiere Docker.
- No modifica archivos base ni entregas de otros estudiantes.

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

Este ejercicio integra conceptos básicos de Express y los organiza en una estructura sencilla:

```text
src/
├── app.js
├── routes/
├── controllers/
└── services/
```

El flujo principal es:

```text
Request
   ↓
Routes
   ↓
Controller
   ↓
Service
   ↓
Controller
   ↓
Response
```

Las rutas determinan qué controlador debe ejecutarse.

Los controladores trabajan con HTTP, validan entradas y construyen respuestas.

Los servicios contienen la lógica relacionada con los datos.

Esta separación permite que una aplicación pequeña mantenga responsabilidades claras y pueda crecer posteriormente sin concentrar toda la lógica en un único archivo.