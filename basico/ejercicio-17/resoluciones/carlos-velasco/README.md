# BASICO 17 - Rutas GET

## Autor

**carlos-velasco**

## Objetivo

Crear una pequeña API HTTP utilizando **Node.js** y **Express** para practicar el funcionamiento de las **rutas HTTP GET**.

El ejercicio utiliza la temática de **viajes y turismo**. La API permite consultar información sobre destinos turísticos almacenados temporalmente en memoria.

El objetivo principal es comprender cómo una solicitud HTTP GET llega a una ruta, cómo se procesa mediante un controlador y cómo se obtiene la información desde un servicio.

---

## Concepto principal

El concepto principal de este ejercicio es el uso de **rutas HTTP GET con Express**.

Una solicitud `GET` se utiliza principalmente para **consultar o recuperar información** del servidor. En este ejercicio las solicitudes GET no modifican los datos almacenados.

La implementación permite practicar:

* Rutas HTTP `GET`.
* Parámetros de ruta (`req.params`).
* Parámetros de consulta (`req.query`).
* Separación entre rutas, controladores y servicios.
* Respuestas en formato JSON.
* Códigos de estado HTTP.
* Validación básica de parámetros.
* Manejo de recursos inexistentes.
* Filtrado de información mediante query parameters.

---

## Tecnologías utilizadas

* **Node.js 20 o superior**
* **Express**
* **JavaScript**
* **npm**

No se utiliza una base de datos, ya que el objetivo del ejercicio es practicar el funcionamiento de las rutas GET. Los destinos turísticos se mantienen temporalmente en memoria mientras el servidor está ejecutándose.

---

## Estructura del proyecto

```text
carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── routes/
    │   └── destinations.routes.js
    ├── controllers/
    │   └── destinations.controller.js
    └── services/
        └── destinations.service.js
```

### Responsabilidad de cada archivo

| Archivo                                      | Responsabilidad                                                                           |
| -------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `src/app.js`                                 | Configura Express, registra los middlewares y monta las rutas de la API.                  |
| `src/routes/destinations.routes.js`          | Define las rutas HTTP relacionadas con los destinos turísticos.                           |
| `src/controllers/destinations.controller.js` | Recibe las solicitudes HTTP, valida los parámetros necesarios y construye las respuestas. |
| `src/services/destinations.service.js`       | Contiene la lógica para consultar y filtrar los destinos almacenados en memoria.          |
| `package.json`                               | Define la configuración del proyecto y sus dependencias.                                  |
| `README.md`                                  | Documenta el ejercicio, su estructura y las pruebas realizadas.                           |

---

## Instalación

Desde la raíz del proyecto, instalar las dependencias:

```bash
npm install
```

---

## Ejecución

Iniciar el servidor con:

```bash
npm start
```

El servidor estará disponible en:

```text
http://localhost:3000
```

---

## Endpoints disponibles

### Health check

```http
GET /health
```

Permite comprobar que el servidor está funcionando correctamente.

**Respuesta esperada:**

```http
200 OK
```

---

### Listar todos los destinos

```http
GET /api/destinations
```

Devuelve la colección completa de destinos turísticos disponibles.

**Respuesta esperada:**

```http
200 OK
```

---

### Obtener un destino por ID

```http
GET /api/destinations/:id
```

Permite consultar un destino específico utilizando su identificador.

**Ejemplo:**

```http
GET /api/destinations/1
```

Si el destino existe:

```http
200 OK
```

La respuesta debe contener los datos correspondientes a **Antigua Guatemala**.

---

### Filtrar destinos por país

```http
GET /api/destinations?country=Guatemala
```

Permite filtrar los destinos utilizando el parámetro de consulta `country`.

**Ejemplo:**

```http
GET /api/destinations?country=Guatemala
```

La respuesta debe contener únicamente los destinos cuyo país corresponda a `Guatemala`.

---

## Parámetros utilizados

### Parámetro de ruta

El endpoint:

```http
GET /api/destinations/:id
```

utiliza el parámetro de ruta `id`.

Ejemplo:

```text
/api/destinations/1
```

En Express se obtiene mediante:

```javascript
req.params.id
```

---

### Parámetro de consulta

El endpoint:

```http
GET /api/destinations?country=Guatemala
```

utiliza el parámetro de consulta `country`.

En Express se obtiene mediante:

```javascript
req.query.country
```

Los parámetros de consulta son opcionales y permiten modificar la consulta sin cambiar la estructura principal de la ruta.

---

## Códigos HTTP utilizados

La API utiliza códigos de estado HTTP para indicar el resultado de cada solicitud.

| Código | Significado | Uso en el ejercicio                |
| ------ | ----------- | ---------------------------------- |
| `200`  | OK          | Solicitud procesada correctamente. |
| `400`  | Bad Request | Parámetro de entrada inválido.     |
| `404`  | Not Found   | Recurso o ruta inexistente.        |

---

# Pruebas

Las pruebas son **manuales** y pueden realizarse utilizando `curl` desde una terminal.

Antes de ejecutar las pruebas, iniciar el servidor:

```bash
npm start
```

---

## Prueba 1 - Health check

Ejecutar:

```bash
curl http://localhost:3000/health
```

**Resultado esperado:**

```text
HTTP 200
```

El servidor debe indicar que está funcionando correctamente.

---

## Prueba 2 - Listar destinos

Ejecutar:

```bash
curl http://localhost:3000/api/destinations
```

**Resultado esperado:**

```text
HTTP 200
```

La respuesta debe contener la colección de destinos turísticos almacenados en memoria.

---

## Prueba 3 - Obtener un destino

Ejecutar:

```bash
curl http://localhost:3000/api/destinations/1
```

**Resultado esperado:**

```text
HTTP 200
```

La respuesta debe contener la información correspondiente al destino con ID `1`, que corresponde a **Antigua Guatemala**.

---

## Prueba 4 - Filtrar por país

Ejecutar:

```bash
curl "http://localhost:3000/api/destinations?country=Guatemala"
```

**Resultado esperado:**

```text
HTTP 200
```

La respuesta debe contener únicamente los destinos cuyo país sea `Guatemala`.

---

## Prueba 5 - ID inválido

Ejecutar:

```bash
curl http://localhost:3000/api/destinations/abc
```

**Resultado esperado:**

```text
HTTP 400
```

El servidor debe rechazar el valor `abc` porque el parámetro `id` debe tener un formato numérico válido.

---

## Prueba 6 - ID inexistente

Ejecutar:

```bash
curl http://localhost:3000/api/destinations/999
```

**Resultado esperado:**

```text
HTTP 404
```

El servidor debe indicar que no existe un destino con el ID `999`.

---

## Prueba 7 - Ruta inexistente

Ejecutar:

```bash
curl http://localhost:3000/api/unknown
```

**Resultado esperado:**

```text
HTTP 404
```

El servidor debe indicar que la ruta solicitada no existe.

---

## Flujo de una solicitud

La arquitectura utilizada para este ejercicio sigue un flujo sencillo:

```text
Cliente
   │
   │ HTTP GET
   ▼
Routes
   │
   ▼
Controller
   │
   ▼
Service
   │
   ▼
Datos en memoria
   │
   ▼
Service
   │
   ▼
Controller
   │
   │ JSON + HTTP Status
   ▼
Cliente
```

Por ejemplo, para:

```http
GET /api/destinations/1
```

el flujo es:

1. Express recibe la solicitud.
2. La ruta identifica el endpoint correspondiente.
3. El controlador obtiene `id` desde `req.params`.
4. El controlador solicita el destino al servicio.
5. El servicio busca el destino en memoria.
6. El resultado regresa al controlador.
7. El controlador responde con JSON y el código HTTP correspondiente.

---

## Resultado esperado

Al finalizar el ejercicio, la API debe permitir:

* Consultar el estado del servidor.
* Obtener todos los destinos turísticos.
* Obtener un destino específico mediante su ID.
* Filtrar destinos mediante el parámetro `country`.
* Validar IDs con formato incorrecto.
* Informar cuando un destino no existe.
* Informar cuando se solicita una ruta inexistente.
* Utilizar correctamente códigos de estado HTTP.
* Mantener separadas las responsabilidades de rutas, controladores y servicios.

---

## Notas

Este ejercicio está diseñado como una práctica introductoria de **rutas GET en Express**.

No se implementan:

* Base de datos.
* Autenticación.
* Autorización.
* Operaciones `POST`, `PUT`, `PATCH` o `DELETE`.
* Persistencia permanente.
* Sistemas de paginación.
* Arquitecturas complejas.

El propósito es concentrarse en los fundamentos de las solicitudes `GET`, los parámetros HTTP, la organización básica del código y las respuestas de una API REST.

---

## Resumen

Este ejercicio implementa una API pequeña de destinos turísticos utilizando **Node.js + Express**.

Los conceptos principales practicados son:

```text
GET
├── /health
├── /api/destinations
├── /api/destinations/:id
└── /api/destinations?country=Guatemala
```

La separación:

```text
Routes → Controllers → Services → Data
```

permite mantener el código organizado y facilita la comprensión de las responsabilidades de cada componente.
