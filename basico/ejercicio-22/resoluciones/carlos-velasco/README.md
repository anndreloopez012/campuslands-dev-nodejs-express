# BASICO 22 - Servicios simples

## Autor

**Velasco-c**

## Objetivo

Crear una pequeña API HTTP con Node.js y Express para practicar el uso de una capa de servicios dentro de una arquitectura backend sencilla.

El ejercicio utiliza la temática de **arquitectura 3D** y trabaja con modelos arquitectónicos almacenados temporalmente en memoria.

El objetivo principal no es construir una aplicación grande, sino comprender cómo separar las responsabilidades entre:

- rutas;
- controladores;
- servicios;
- datos.

---

## Concepto principal

El concepto principal de este ejercicio es el uso de **servicios simples**.

Un servicio es una capa que concentra operaciones relacionadas con la lógica de una determinada funcionalidad.

En este ejercicio:

```text
routes/
    ↓
controllers/
    ↓
services/
    ↓
datos en memoria
````

La ruta recibe la petición y la dirige al controlador.

El controlador se encarga principalmente de:

* recibir los datos HTTP;
* validar entradas básicas;
* llamar al servicio;
* construir la respuesta HTTP.

El servicio se encarga de trabajar con los datos.

Esto evita colocar toda la lógica directamente dentro de las rutas o los controladores.

---

## Temática

La temática utilizada para el ejercicio es:

**Arquitectura 3D**

Los recursos representan modelos arquitectónicos realizados mediante diferentes herramientas de diseño 3D.

---

## Tecnologías utilizadas

* Node.js 20 o superior recomendado.
* Express.
* JavaScript.
* HTTP.
* JSON.

No se utiliza una base de datos.

Los datos permanecen en memoria mientras el servidor está ejecutándose.

---

## Estructura del proyecto

```text
basico/ejercicio-22/resoluciones/carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── controllers/
    │   └── model.controller.js
    ├── routes/
    │   └── model.routes.js
    └── services/
        └── model.service.js
```

---

## Responsabilidad de cada archivo

### `src/app.js`

Es el punto de entrada de la aplicación.

Sus responsabilidades son:

* crear la aplicación Express;
* habilitar `express.json()`;
* configurar `/health`;
* registrar las rutas;
* configurar una respuesta para rutas inexistentes;
* iniciar el servidor.

---

### `src/routes/model.routes.js`

Define las rutas HTTP relacionadas con los modelos arquitectónicos.

Actualmente contiene:

```text
GET  /api/models
GET  /api/models/:id
POST /api/models
```

Las rutas delegan el trabajo en los controladores.

---

### `src/controllers/model.controller.js`

Contiene los controladores HTTP.

Sus responsabilidades son:

* recibir parámetros;
* recibir datos del cuerpo de la petición;
* realizar validaciones básicas;
* llamar a los servicios;
* devolver respuestas HTTP.

El controlador no administra directamente el arreglo de modelos.

---

### `src/services/model.service.js`

Contiene los servicios relacionados con los modelos arquitectónicos.

Sus responsabilidades son:

* obtener todos los modelos;
* buscar un modelo por ID;
* crear un nuevo modelo.

El arreglo utilizado como almacenamiento temporal también se encuentra en este archivo.

---

## Instalación

Ingresar a la carpeta del ejercicio:

```bash
cd basico/ejercicio-22/resoluciones/carlos-velasco
```

Instalar las dependencias:

```bash
npm install
```

---

## Ejecución

### Modo normal

```bash
npm start
```

### Modo desarrollo

```bash
npm run dev
```

El servidor estará disponible en:

```text
http://localhost:3000
```

---

## Endpoint de salud

### `GET /health`

Permite comprobar que la API está funcionando.

Ejemplo:

```bash
curl http://localhost:3000/health
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "API de arquitectura 3D funcionando correctamente"
}
```

---

# API de modelos arquitectónicos

## 1. Listar modelos

### Endpoint

```http
GET /api/models
```

Ejemplo:

```bash
curl http://localhost:3000/api/models
```

Respuesta esperada:

```json
{
  "ok": true,
  "data": [
    {
      "id": 1,
      "name": "Casa Moderna",
      "software": "Blender",
      "type": "Residencial"
    },
    {
      "id": 2,
      "name": "Edificio Corporativo",
      "software": "SketchUp",
      "type": "Comercial"
    },
    {
      "id": 3,
      "name": "Museo Contemporáneo",
      "software": "3ds Max",
      "type": "Cultural"
    }
  ]
}
```

---

## 2. Buscar un modelo por ID

### Endpoint

```http
GET /api/models/:id
```

Ejemplo:

```bash
curl http://localhost:3000/api/models/1
```

Respuesta esperada:

```json
{
  "ok": true,
  "data": {
    "id": 1,
    "name": "Casa Moderna",
    "software": "Blender",
    "type": "Residencial"
  }
}
```

---

## 3. Crear un modelo

### Endpoint

```http
POST /api/models
```

El endpoint recibe:

```json
{
  "name": "Torre Residencial",
  "software": "Revit",
  "type": "Residencial"
}
```

Ejemplo con `curl`:

```bash
curl -X POST http://localhost:3000/api/models \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Torre Residencial",
    "software": "Revit",
    "type": "Residencial"
  }'
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Modelo arquitectónico creado correctamente",
  "data": {
    "id": 4,
    "name": "Torre Residencial",
    "software": "Revit",
    "type": "Residencial"
  }
}
```

El nuevo modelo se agrega al arreglo que administra el servicio.

---

# Validaciones

## ID inválido

El ID debe ser un número entero positivo.

Petición:

```bash
curl http://localhost:3000/api/models/abc
```

Respuesta:

```json
{
  "ok": false,
  "message": "El ID debe ser un número entero positivo"
}
```

Código HTTP:

```text
400 Bad Request
```

---

## Modelo inexistente

Petición:

```bash
curl http://localhost:3000/api/models/999
```

Respuesta:

```json
{
  "ok": false,
  "message": "Modelo arquitectónico no encontrado"
}
```

Código HTTP:

```text
404 Not Found
```

---

## Datos obligatorios

Para crear un modelo se requieren:

```text
name
software
type
```

Petición incorrecta:

```bash
curl -X POST http://localhost:3000/api/models \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Casa Experimental"
  }'
```

Respuesta esperada:

```json
{
  "ok": false,
  "message": "name, software y type son obligatorios"
}
```

Código HTTP:

```text
400 Bad Request
```

---

# Códigos HTTP utilizados

| Código | Significado | Uso                              |
| ------ | ----------- | -------------------------------- |
| `200`  | OK          | Consulta realizada correctamente |
| `201`  | Created     | Modelo creado correctamente      |
| `400`  | Bad Request | Datos de entrada inválidos       |
| `404`  | Not Found   | Ruta o modelo inexistente        |

---

# Flujo de una petición

Para consultar un modelo:

```text
Cliente
   │
   │ GET /api/models/1
   ▼
routes/model.routes.js
   │
   ▼
controllers/model.controller.js
   │
   ▼
services/model.service.js
   │
   ▼
models[]
   │
   ▼
controller
   │
   ▼
respuesta JSON
```

El flujo permite separar las responsabilidades.

---

# ¿Por qué utilizar un servicio?

Sin una capa de servicios, podríamos terminar colocando toda la lógica directamente en el controlador:

```javascript
const getModels = (req, res) => {
  // búsqueda
  // procesamiento
  // creación
  // actualización
  // eliminación
  // respuesta HTTP
};
```

A medida que una aplicación crece, esto puede generar controladores difíciles de mantener.

En cambio, podemos delegar la operación:

```javascript
const models = getAllModels();
```

El controlador solamente solicita la información al servicio.

El servicio conoce cómo trabajar con los datos.

---

# Ejemplo de separación de responsabilidades

## Ruta

```javascript
router.get("/", getModels);
```

La ruta solamente define qué controlador responde al endpoint.

## Controller

```javascript
const getModels = (req, res) => {
  const models = getAllModels();

  res.status(200).json({
    ok: true,
    data: models
  });
};
```

El controller coordina la petición HTTP.

## Service

```javascript
const getAllModels = () => {
  return models;
};
```

El service encapsula la operación sobre los datos.

---

# Pruebas manuales

Con el servidor ejecutándose:

```bash
npm run dev
```

Realizar las siguientes pruebas.

## Prueba 1 - Health check

```bash
curl http://localhost:3000/health
```

Debe responder con:

```json
{
  "ok": true,
  "message": "API de arquitectura 3D funcionando correctamente"
}
```

## Prueba 2 - Listar modelos

```bash
curl http://localhost:3000/api/models
```

Debe devolver los modelos almacenados.

## Prueba 3 - Buscar modelo existente

```bash
curl http://localhost:3000/api/models/1
```

Debe devolver el modelo con ID `1`.

## Prueba 4 - Buscar modelo inexistente

```bash
curl http://localhost:3000/api/models/999
```

Debe devolver:

```text
404 Not Found
```

## Prueba 5 - ID inválido

```bash
curl http://localhost:3000/api/models/abc
```

Debe devolver:

```text
400 Bad Request
```

## Prueba 6 - Crear modelo

```bash
curl -X POST http://localhost:3000/api/models \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Centro Cultural 3D",
    "software": "Blender",
    "type": "Cultural"
  }'
```

Debe devolver:

```text
201 Created
```

y mostrar el nuevo modelo.

## Prueba 7 - Crear modelo sin todos los campos

```bash
curl -X POST http://localhost:3000/api/models \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Modelo Incompleto"
  }'
```

Debe devolver:

```text
400 Bad Request
```

---

# Resultado esperado

Al finalizar el ejercicio se debe tener una pequeña API capaz de:

* iniciar un servidor Express;
* responder un health check;
* listar modelos arquitectónicos;
* buscar modelos por ID;
* crear nuevos modelos;
* validar datos básicos;
* responder con códigos HTTP coherentes;
* separar rutas, controladores y servicios.

La característica principal del ejercicio es que las operaciones sobre los modelos se encuentran en la capa:

```text
services/
```

---

# Limitaciones

Este ejercicio utiliza un arreglo en memoria como almacenamiento.

Por lo tanto:

* no existe una base de datos;
* los datos se pierden al reiniciar el servidor;
* no existe persistencia;
* no existe autenticación;
* no existe autorización.

Estas limitaciones son intencionales porque el objetivo es practicar la separación entre rutas, controllers y services.

---

# Comprobación final

La solución cumple con los requisitos cuando:

* [x] Existe `package.json`.
* [x] Existe `README.md`.
* [x] Existe la carpeta `src/`.
* [x] Existen `routes/`, `controllers/` y `services/`.
* [x] Se utiliza Node.js.
* [x] Se utiliza Express.
* [x] Existe un endpoint `/health`.
* [x] Existe un endpoint para listar modelos.
* [x] Existe un endpoint para buscar modelos por ID.
* [x] Existe un endpoint para crear modelos.
* [x] Existe validación básica.
* [x] Existe manejo de errores esperados.
* [x] La lógica de datos está separada mediante un servicio.
* [x] No se utiliza una base de datos externa.
* [x] No se requiere Docker.
* [x] `node_modules/` no forma parte de la entrega.
* [x] La solución permanece dentro de la carpeta personal del estudiante.

---

# Resumen

Este ejercicio introduce una separación más clara de responsabilidades dentro de una API Express.

La estructura utilizada es:

```text
routes
  ↓
controllers
  ↓
services
```

Las rutas reciben las peticiones y las dirigen a los controladores.

Los controladores trabajan con la capa HTTP y delegan las operaciones en los servicios.

Los servicios contienen las operaciones relacionadas con los modelos arquitectónicos.

La idea fundamental es aprender que una API puede organizarse progresivamente sin necesidad de convertir un ejercicio pequeño en una aplicación compleja.

