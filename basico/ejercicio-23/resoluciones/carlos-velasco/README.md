# BASICO 23 - Datos en memoria

## Autor

**Velasco-c**

## Objetivo

Crear una pequeña API HTTP con Node.js y Express para practicar el manejo de datos almacenados temporalmente en memoria.

El ejercicio utiliza la temática de **soldadura** y permite consultar, crear y eliminar trabajos de soldadura sin utilizar una base de datos externa.

El objetivo principal es comprender cómo una aplicación backend puede administrar información durante su ejecución utilizando estructuras de datos de JavaScript.

---

## Concepto principal

El concepto principal de este ejercicio es el uso de **datos en memoria**.

En lugar de utilizar una base de datos, la aplicación mantiene los datos dentro de un arreglo de JavaScript:

```javascript
const weldings = [];
```

Este arreglo vive mientras el proceso de Node.js está ejecutándose.

Cuando se crea un nuevo trabajo de soldadura, se agrega al arreglo.

Cuando se elimina un trabajo, se modifica el mismo arreglo.

Si el servidor se detiene o se reinicia, los cambios realizados durante la ejecución se pierden.

Por esta razón, los datos en memoria son útiles para:

- ejercicios educativos;
- prototipos;
- pruebas;
- demostraciones;
- aplicaciones temporales.

No proporcionan persistencia permanente como una base de datos.

---

## Temática

La temática utilizada es:

**Soldadura**

Los datos representan trabajos de soldadura relacionados con diferentes proyectos, técnicas y materiales.

---

## Tecnologías utilizadas

- Node.js 20 o superior recomendado.
- Express.
- JavaScript.
- HTTP.
- JSON.

No se utiliza una base de datos externa.

---

## Estructura del proyecto

```text
basico/ejercicio-23/resoluciones/carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── controllers/
    │   └── welding.controller.js
    ├── routes/
    │   └── welding.routes.js
    └── services/
        └── welding.service.js
```

---

## Responsabilidad de cada archivo

| Archivo | Responsabilidad |
|---|---|
| `src/app.js` | Configura Express, middleware, rutas y servidor |
| `src/routes/welding.routes.js` | Define las rutas HTTP |
| `src/controllers/welding.controller.js` | Procesa las peticiones y respuestas HTTP |
| `src/services/welding.service.js` | Administra los datos de soldadura en memoria |
| `package.json` | Define información, scripts y dependencias del proyecto |
| `README.md` | Documenta instalación, ejecución y pruebas |

---

## Arquitectura

La aplicación utiliza una separación sencilla de responsabilidades:

```text
Cliente HTTP
     │
     ▼
  routes/
     │
     ▼
controllers/
     │
     ▼
 services/
     │
     ▼
datos en memoria
```

Por ejemplo, para consultar un trabajo:

```text
GET /api/weldings/1
        │
        ▼
welding.routes.js
        │
        ▼
welding.controller.js
        │
        ▼
welding.service.js
        │
        ▼
weldings[]
        │
        ▼
respuesta JSON
```

---

## Datos en memoria

Los datos iniciales se encuentran en:

```text
src/services/welding.service.js
```

La estructura utilizada es:

```javascript
const weldings = [
  {
    id: 1,
    project: "Estructura metálica",
    technique: "MIG",
    material: "Acero"
  }
];
```

Cada registro contiene:

- `id`: identificador único.
- `project`: proyecto relacionado con el trabajo.
- `technique`: técnica de soldadura.
- `material`: material utilizado.

---

## Instalación

Ingresar a la carpeta del ejercicio:

```bash
cd basico/ejercicio-23/resoluciones/carlos-velasco
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

# API

## Endpoint de salud

### `GET /health`

Permite comprobar que el servidor está funcionando.

Ejemplo:

```bash
curl http://localhost:3000/health
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "API de soldadura funcionando correctamente"
}
```

Código HTTP:

```text
200 OK
```

---

# Trabajos de soldadura

## 1. Listar trabajos

### Endpoint

```http
GET /api/weldings
```

Este endpoint devuelve todos los trabajos almacenados actualmente en memoria.

Ejemplo:

```bash
curl http://localhost:3000/api/weldings
```

Respuesta esperada:

```json
{
  "ok": true,
  "data": [
    {
      "id": 1,
      "project": "Estructura metálica",
      "technique": "MIG",
      "material": "Acero"
    },
    {
      "id": 2,
      "project": "Puerta industrial",
      "technique": "TIG",
      "material": "Acero inoxidable"
    },
    {
      "id": 3,
      "project": "Soporte para maquinaria",
      "technique": "Electrodo revestido",
      "material": "Acero al carbono"
    }
  ]
}
```

Código HTTP:

```text
200 OK
```

---

## 2. Consultar un trabajo por ID

### Endpoint

```http
GET /api/weldings/:id
```

El parámetro `id` identifica el trabajo que se desea consultar.

Ejemplo:

```bash
curl http://localhost:3000/api/weldings/1
```

Respuesta esperada:

```json
{
  "ok": true,
  "data": {
    "id": 1,
    "project": "Estructura metálica",
    "technique": "MIG",
    "material": "Acero"
  }
}
```

Código HTTP:

```text
200 OK
```

---

## 3. Crear un trabajo

### Endpoint

```http
POST /api/weldings
```

El cuerpo de la petición debe contener:

```json
{
  "project": "Baranda residencial",
  "technique": "MIG",
  "material": "Acero"
}
```

Ejemplo:

```bash
curl -X POST http://localhost:3000/api/weldings \
  -H "Content-Type: application/json" \
  -d '{
    "project": "Baranda residencial",
    "technique": "MIG",
    "material": "Acero"
  }'
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Trabajo de soldadura creado correctamente",
  "data": {
    "id": 4,
    "project": "Baranda residencial",
    "technique": "MIG",
    "material": "Acero"
  }
}
```

Código HTTP:

```text
201 Created
```

El nuevo registro se agrega al arreglo que se encuentra en memoria.

---

## 4. Eliminar un trabajo

### Endpoint

```http
DELETE /api/weldings/:id
```

Ejemplo:

```bash
curl -X DELETE http://localhost:3000/api/weldings/4
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Trabajo de soldadura eliminado correctamente",
  "data": {
    "id": 4,
    "project": "Baranda residencial",
    "technique": "MIG",
    "material": "Acero"
  }
}
```

Código HTTP:

```text
200 OK
```

La operación elimina el registro directamente del arreglo en memoria.

---

# Validaciones y errores

## ID inválido

El ID debe ser un número entero positivo.

Ejemplo:

```bash
curl http://localhost:3000/api/weldings/abc
```

Respuesta esperada:

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

## Trabajo inexistente

Ejemplo:

```bash
curl http://localhost:3000/api/weldings/999
```

Respuesta esperada:

```json
{
  "ok": false,
  "message": "Trabajo de soldadura no encontrado"
}
```

Código HTTP:

```text
404 Not Found
```

---

## Datos obligatorios

Para crear un trabajo de soldadura son obligatorios:

```text
project
technique
material
```

Una petición incorrecta:

```bash
curl -X POST http://localhost:3000/api/weldings \
  -H "Content-Type: application/json" \
  -d '{
    "project": "Estructura nueva"
  }'
```

Respuesta esperada:

```json
{
  "ok": false,
  "message": "project, technique y material son obligatorios"
}
```

Código HTTP:

```text
400 Bad Request
```

---

## Ruta inexistente

Si se solicita una ruta que no existe:

```bash
curl http://localhost:3000/api/ruta-inexistente
```

Respuesta esperada:

```json
{
  "ok": false,
  "message": "Ruta no encontrada"
}
```

Código HTTP:

```text
404 Not Found
```

---

# Códigos HTTP utilizados

| Código | Significado | Uso |
|---|---|---|
| `200` | OK | Consulta, eliminación o health check exitoso |
| `201` | Created | Creación de un trabajo |
| `400` | Bad Request | Datos o parámetros inválidos |
| `404` | Not Found | Recurso o ruta inexistente |

---

# Flujo de creación de datos

Cuando se crea un trabajo mediante `POST`, el flujo es:

```text
Cliente
   │
   │ POST /api/weldings
   │
   ▼
routes
   │
   ▼
controller
   │
   │ addWelding()
   ▼
service
   │
   ▼
weldings[]
   │
   ▼
nuevo registro
   │
   ▼
controller
   │
   ▼
respuesta 201
```

El servicio modifica directamente el arreglo que contiene los datos.

---

# Persistencia de los datos

Este proyecto **no utiliza persistencia permanente**.

Por ejemplo, si se crea:

```json
{
  "project": "Puente metálico",
  "technique": "MIG",
  "material": "Acero"
}
```

el registro estará disponible mientras el servidor continúe ejecutándose.

Si se detiene y vuelve a iniciar:

```bash
npm run dev
```

el registro creado desaparecerá y solamente estarán disponibles nuevamente los datos iniciales definidos en el servicio.

Esto es precisamente lo que se busca practicar en este ejercicio.

---

# Ventajas de los datos en memoria

Los datos en memoria son sencillos para:

- aprender conceptos de backend;
- crear prototipos rápidos;
- practicar endpoints;
- probar controladores y servicios;
- evitar configurar una base de datos durante ejercicios pequeños.

---

# Limitaciones

Los datos en memoria presentan varias limitaciones:

- no existe persistencia;
- los datos desaparecen al reiniciar el servidor;
- no existe una base de datos;
- no existe almacenamiento compartido entre múltiples procesos;
- no son adecuados como mecanismo de persistencia para una aplicación de producción.

Para una aplicación de producción normalmente sería necesario utilizar un mecanismo de persistencia apropiado, como una base de datos.

---

# Pruebas manuales

Con el servidor ejecutándose mediante:

```bash
npm run dev
```

realizar las siguientes pruebas.

## Prueba 1 - Health check

```bash
curl http://localhost:3000/health
```

Debe devolver:

```text
200 OK
```

y confirmar que la API está funcionando.

---

## Prueba 2 - Listar datos iniciales

```bash
curl http://localhost:3000/api/weldings
```

Debe devolver los tres trabajos iniciales almacenados en memoria.

---

## Prueba 3 - Consultar un trabajo existente

```bash
curl http://localhost:3000/api/weldings/1
```

Debe devolver el trabajo con ID `1`.

---

## Prueba 4 - Crear un nuevo trabajo

```bash
curl -X POST http://localhost:3000/api/weldings \
  -H "Content-Type: application/json" \
  -d '{
    "project": "Baranda residencial",
    "technique": "TIG",
    "material": "Acero inoxidable"
  }'
```

Debe devolver:

```text
201 Created
```

---

## Prueba 5 - Comprobar que el nuevo dato quedó en memoria

Después de crear el registro:

```bash
curl http://localhost:3000/api/weldings
```

Debe aparecer el nuevo trabajo dentro de la respuesta.

---

## Prueba 6 - Eliminar un trabajo

```bash
curl -X DELETE http://localhost:3000/api/weldings/4
```

Debe devolver:

```text
200 OK
```

y mostrar el registro eliminado.

---

## Prueba 7 - Comprobar la eliminación

```bash
curl http://localhost:3000/api/weldings/4
```

Debe devolver:

```text
404 Not Found
```

porque el registro ya no existe en el arreglo en memoria.

---

## Prueba 8 - ID inválido

```bash
curl http://localhost:3000/api/weldings/abc
```

Debe devolver:

```text
400 Bad Request
```

---

## Prueba 9 - Crear registro incompleto

```bash
curl -X POST http://localhost:3000/api/weldings \
  -H "Content-Type: application/json" \
  -d '{
    "project": "Trabajo incompleto"
  }'
```

Debe devolver:

```text
400 Bad Request
```

---

## Prueba 10 - Ruta inexistente

```bash
curl http://localhost:3000/api/no-existe
```

Debe devolver:

```text
404 Not Found
```

---

# Resultado esperado

Al finalizar el ejercicio se debe tener una API capaz de:

- iniciar un servidor Express;
- responder un health check;
- mantener datos de soldadura en memoria;
- listar los datos;
- consultar un dato por ID;
- crear nuevos datos;
- eliminar datos;
- validar parámetros;
- validar campos obligatorios;
- responder con códigos HTTP coherentes;
- separar rutas, controladores y servicios.

---

# Concepto aprendido

La característica principal del ejercicio es comprender que un backend puede mantener temporalmente información utilizando estructuras de datos de JavaScript.

En este caso:

```javascript
const weldings = [];
```

funciona como almacenamiento temporal.

El servicio controla las operaciones sobre este arreglo:

```javascript
getAllWeldings()
findWeldingById()
addWelding()
removeWelding()
```

Esto permite practicar una arquitectura sencilla antes de introducir una base de datos.

---

# Limitaciones del ejercicio

Este ejercicio está diseñado con fines educativos.

No implementa:

- base de datos;
- autenticación;
- autorización;
- persistencia;
- paginación;
- filtros avanzados;
- manejo de múltiples procesos;
- validación avanzada.

Estas funcionalidades no son necesarias para comprender el concepto de datos en memoria.

---

# Comprobación final

La solución cumple con los requisitos cuando:

- [x] Existe `package.json`.
- [x] Existe `README.md`.
- [x] Existe la carpeta `src/`.
- [x] Existen `routes/`, `controllers/` y `services/`.
- [x] Se utiliza Node.js.
- [x] Se utiliza Express.
- [x] Existe `GET /health`.
- [x] Los datos se almacenan en memoria.
- [x] Existe un endpoint para listar trabajos.
- [x] Existe un endpoint para consultar por ID.
- [x] Existe un endpoint para crear trabajos.
- [x] Existe un endpoint para eliminar trabajos.
- [x] Se validan los IDs.
- [x] Se validan los campos obligatorios.
- [x] Se manejan recursos inexistentes.
- [x] Se utilizan códigos HTTP coherentes.
- [x] No se utiliza una base de datos externa.
- [x] No se requiere Docker.
- [x] `node_modules/` no forma parte de la entrega.
- [x] La solución permanece dentro de la carpeta personal del estudiante.

---

# Resumen

Este ejercicio permite comprender el funcionamiento de los **datos en memoria** dentro de una API Node.js y Express.

La información se mantiene temporalmente en un arreglo administrado por la capa de servicios:

```text
routes
   ↓
controllers
   ↓
services
   ↓
datos en memoria
```

La aplicación permite listar, consultar, crear y eliminar trabajos de soldadura.

La principal característica de este enfoque es que los cambios solamente existen mientras el proceso de Node.js está ejecutándose. Al reiniciar el servidor, los datos regresan a su estado inicial.

Este concepto constituye una base importante antes de incorporar mecanismos de persistencia como bases de datos.  