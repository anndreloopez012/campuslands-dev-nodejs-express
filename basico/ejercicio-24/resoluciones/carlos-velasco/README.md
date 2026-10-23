# BASICO 24 - CRUD básico

## Autor

**Velasco-c**

## Objetivo

Crear una pequeña API HTTP utilizando **Node.js** y **Express** para practicar la implementación de un **CRUD básico**, utilizando como temática las fórmulas químicas.

El proyecto permite:

* Listar fórmulas químicas.
* Consultar una fórmula por ID.
* Crear nuevas fórmulas.
* Actualizar fórmulas existentes.
* Eliminar fórmulas.
* Validar datos de entrada.
* Manejar recursos inexistentes.
* Utilizar códigos de estado HTTP apropiados.

La información se almacena temporalmente en memoria para mantener el ejercicio sencillo y centrado en el funcionamiento del CRUD.

---

## Concepto principal

El concepto principal del ejercicio es el **CRUD**.

CRUD es un acrónimo que representa las cuatro operaciones fundamentales para trabajar con recursos:

| Operación | Significado | Método HTTP |
| --------- | ----------- | ----------- |
| Create    | Crear       | `POST`      |
| Read      | Leer        | `GET`       |
| Update    | Actualizar  | `PUT`       |
| Delete    | Eliminar    | `DELETE`    |

En esta implementación, el recurso utilizado es una **fórmula química**.

El CRUD se implementa mediante los siguientes endpoints:

| Operación           | Método   | Endpoint            |
| ------------------- | -------- | ------------------- |
| Listar fórmulas     | `GET`    | `/api/formulas`     |
| Obtener una fórmula | `GET`    | `/api/formulas/:id` |
| Crear fórmula       | `POST`   | `/api/formulas`     |
| Actualizar fórmula  | `PUT`    | `/api/formulas/:id` |
| Eliminar fórmula    | `DELETE` | `/api/formulas/:id` |

---

## Temática

La API trabaja con **fórmulas químicas**.

Cada fórmula contiene las siguientes propiedades:

| Campo         | Tipo     | Descripción                        |
| ------------- | -------- | ---------------------------------- |
| `id`          | `number` | Identificador único de la fórmula. |
| `name`        | `string` | Nombre de la sustancia.            |
| `formula`     | `string` | Fórmula química.                   |
| `description` | `string` | Descripción breve de la sustancia. |

### Ejemplo de una fórmula

```json
{
  "id": 1,
  "name": "Agua",
  "formula": "H2O",
  "description": "Compuesto formado por dos átomos de hidrógeno y uno de oxígeno."
}
```

---

## Tecnologías utilizadas

* **Node.js 20 o superior**
* **Express**
* **JavaScript**
* **npm**
* **API HTTP REST**
* **JSON**

No se utiliza una base de datos externa.

Los datos se almacenan temporalmente en un arreglo en memoria mientras el servidor está ejecutándose.

---

# Estructura del proyecto

```text
basico/
└── ejercicio-24/
    └── resoluciones/
        └── carlos-velasco/
            ├── package.json
            ├── README.md
            └── src/
                ├── app.js
                ├── controllers/
                │   └── formula.controller.js
                ├── routes/
                │   └── formula.routes.js
                └── services/
                    └── formula.service.js
```

---

## Responsabilidad de los archivos

### `src/app.js`

Es el punto de entrada de la aplicación.

Se encarga de:

* Crear la aplicación Express.
* Habilitar `express.json()`.
* Registrar la ruta `/health`.
* Registrar las rutas de fórmulas.
* Manejar rutas inexistentes.
* Iniciar el servidor.

---

### `src/routes/formula.routes.js`

Define las rutas HTTP relacionadas con las fórmulas químicas.

Las rutas reciben las peticiones y delegan su procesamiento al controlador correspondiente.

---

### `src/controllers/formula.controller.js`

Contiene la lógica relacionada con HTTP.

Se encarga de:

* Leer `req.params`.
* Leer `req.body`.
* Realizar validaciones básicas.
* Invocar los servicios.
* Seleccionar los códigos de estado HTTP.
* Construir las respuestas JSON.

---

### `src/services/formula.service.js`

Contiene la lógica de manipulación de los datos.

Se encarga de:

* Listar fórmulas.
* Buscar fórmulas.
* Crear fórmulas.
* Actualizar fórmulas.
* Eliminar fórmulas.

Los datos se almacenan temporalmente en un arreglo en memoria.

---

# Instalación

## 1. Entrar al directorio del ejercicio

Desde la raíz del repositorio:

```bash
cd basico/ejercicio-24/resoluciones/carlos-velasco
```

## 2. Instalar las dependencias

```bash
npm install
```

---

# Ejecución

## Modo normal

```bash
npm start
```

## Modo desarrollo

Si el proyecto tiene configurado un script `dev`:

```bash
npm run dev
```

El servidor estará disponible en:

```text
http://localhost:3000
```

---

# Endpoint de salud

## `GET /health`

Permite comprobar que el servidor está funcionando correctamente.

### Solicitud

```bash
curl http://localhost:3000/health
```

### Respuesta esperada

```json
{
  "ok": true,
  "message": "API de fórmulas químicas funcionando correctamente"
}
```

### Código HTTP

```text
200 OK
```

---

# CRUD de fórmulas

## 1. Listar todas las fórmulas

### Endpoint

```http
GET /api/formulas
```

### Solicitud

```bash
curl http://localhost:3000/api/formulas
```

### Respuesta esperada

```json
{
  "ok": true,
  "data": [
    {
      "id": 1,
      "name": "Agua",
      "formula": "H2O",
      "description": "Compuesto formado por dos átomos de hidrógeno y uno de oxígeno."
    },
    {
      "id": 2,
      "name": "Dióxido de carbono",
      "formula": "CO2",
      "description": "Compuesto formado por un átomo de carbono y dos de oxígeno."
    },
    {
      "id": 3,
      "name": "Cloruro de sodio",
      "formula": "NaCl",
      "description": "Compuesto iónico formado por sodio y cloro."
    }
  ]
}
```

### Código HTTP

```text
200 OK
```

---

## 2. Obtener una fórmula por ID

### Endpoint

```http
GET /api/formulas/:id
```

### Ejemplo

```bash
curl http://localhost:3000/api/formulas/1
```

### Respuesta esperada

```json
{
  "ok": true,
  "data": {
    "id": 1,
    "name": "Agua",
    "formula": "H2O",
    "description": "Compuesto formado por dos átomos de hidrógeno y uno de oxígeno."
  }
}
```

### Código HTTP

```text
200 OK
```

---

## 3. Crear una fórmula

### Endpoint

```http
POST /api/formulas
```

La solicitud debe enviar un objeto JSON con los campos:

* `name`
* `formula`
* `description`

### Solicitud

```bash
curl -X POST http://localhost:3000/api/formulas \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ácido sulfúrico",
    "formula": "H2SO4",
    "description": "Ácido mineral compuesto por hidrógeno, azufre y oxígeno."
  }'
```

### Respuesta esperada

```json
{
  "ok": true,
  "message": "Fórmula química creada correctamente",
  "data": {
    "id": 4,
    "name": "Ácido sulfúrico",
    "formula": "H2SO4",
    "description": "Ácido mineral compuesto por hidrógeno, azufre y oxígeno."
  }
}
```

### Código HTTP

```text
201 Created
```

---

## 4. Actualizar una fórmula

### Endpoint

```http
PUT /api/formulas/:id
```

### Ejemplo

```bash
curl -X PUT http://localhost:3000/api/formulas/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Agua",
    "formula": "H2O",
    "description": "Sustancia esencial formada por hidrógeno y oxígeno."
  }'
```

### Respuesta esperada

```json
{
  "ok": true,
  "message": "Fórmula química actualizada correctamente",
  "data": {
    "id": 1,
    "name": "Agua",
    "formula": "H2O",
    "description": "Sustancia esencial formada por hidrógeno y oxígeno."
  }
}
```

### Código HTTP

```text
200 OK
```

---

## 5. Eliminar una fórmula

### Endpoint

```http
DELETE /api/formulas/:id
```

### Ejemplo

```bash
curl -X DELETE http://localhost:3000/api/formulas/3
```

### Respuesta esperada

```json
{
  "ok": true,
  "message": "Fórmula química eliminada correctamente",
  "data": {
    "id": 3,
    "name": "Cloruro de sodio",
    "formula": "NaCl",
    "description": "Compuesto iónico formado por sodio y cloro."
  }
}
```

### Código HTTP

```text
200 OK
```

---

# Validaciones

La API implementa validaciones básicas para evitar datos incorrectos.

## Validación del ID

El parámetro `id` debe ser un **número entero positivo**.

### Ejemplo inválido

```bash
curl http://localhost:3000/api/formulas/abc
```

### Respuesta esperada

```json
{
  "ok": false,
  "message": "El ID debe ser un número entero positivo"
}
```

### Código HTTP

```text
400 Bad Request
```

---

## Validación de campos obligatorios

Para crear o actualizar una fórmula son obligatorios:

* `name`
* `formula`
* `description`

### Ejemplo

```bash
curl -X POST http://localhost:3000/api/formulas \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Agua"
  }'
```

### Respuesta esperada

```json
{
  "ok": false,
  "message": "Los campos name, formula y description son obligatorios"
}
```

### Código HTTP

```text
400 Bad Request
```

---

## Validación de tipos

Los campos `name`, `formula` y `description` deben ser de tipo texto.

Si se recibe un tipo diferente, la API responde:

```json
{
  "ok": false,
  "message": "Los campos deben ser de tipo texto"
}
```

### Código HTTP

```text
400 Bad Request
```

---

# Manejo de recursos inexistentes

Si se consulta una fórmula que no existe:

```bash
curl http://localhost:3000/api/formulas/999
```

La API responde:

```json
{
  "ok": false,
  "message": "Fórmula química no encontrada"
}
```

### Código HTTP

```text
404 Not Found
```

El mismo comportamiento se aplica al intentar **actualizar o eliminar** un ID inexistente.

---

# Manejo de rutas inexistentes

Si se solicita una ruta que no existe:

```bash
curl http://localhost:3000/api/otra-ruta
```

La API responde:

```json
{
  "ok": false,
  "message": "Ruta no encontrada"
}
```

### Código HTTP

```text
404 Not Found
```

---

# Códigos HTTP utilizados

| Código | Nombre      | Uso                                              |
| ------ | ----------- | ------------------------------------------------ |
| `200`  | OK          | Consultas, actualización y eliminación exitosas. |
| `201`  | Created     | Creación exitosa de una fórmula.                 |
| `400`  | Bad Request | Datos de entrada inválidos.                      |
| `404`  | Not Found   | Recurso o ruta inexistente.                      |

---

# Flujo de una petición

La arquitectura sigue un flujo sencillo de separación de responsabilidades:

```text
Cliente
   │
   │ HTTP Request
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
Datos en memoria
   │
   ▼
Servicio
   │
   ▼
Controlador
   │
   │ HTTP Response
   ▼
Cliente
```

Por ejemplo, para crear una fórmula:

```text
POST /api/formulas
        │
        ▼
formula.routes.js
        │
        ▼
formula.controller.js
        │
        ▼
formula.service.js
        │
        ▼
Arreglo en memoria
        │
        ▼
Nueva fórmula
        │
        ▼
Respuesta HTTP 201
```

Esta separación permite que cada componente tenga una responsabilidad concreta.

---

# Pruebas manuales

Las pruebas pueden realizarse utilizando:

* Terminal con `curl`.
* Postman.
* Thunder Client.
* Un navegador para las solicitudes `GET`.

Se recomienda ejecutar las pruebas en el siguiente orden.

---

## 1. Comprobar que el servidor funciona

```bash
curl http://localhost:3000/health
```

### Resultado esperado

```text
200 OK
```

---

## 2. Listar fórmulas

```bash
curl http://localhost:3000/api/formulas
```

### Resultado esperado

```text
200 OK
```

Debe mostrar las fórmulas iniciales.

---

## 3. Consultar una fórmula

```bash
curl http://localhost:3000/api/formulas/1
```

### Resultado esperado

```text
200 OK
```

---

## 4. Crear una fórmula

```bash
curl -X POST http://localhost:3000/api/formulas \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ácido clorhídrico",
    "formula": "HCl",
    "description": "Ácido formado por hidrógeno y cloro."
  }'
```

### Resultado esperado

```text
201 Created
```

---

## 5. Actualizar una fórmula

```bash
curl -X PUT http://localhost:3000/api/formulas/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Agua",
    "formula": "H2O",
    "description": "Compuesto esencial formado por hidrógeno y oxígeno."
  }'
```

### Resultado esperado

```text
200 OK
```

---

## 6. Eliminar una fórmula

```bash
curl -X DELETE http://localhost:3000/api/formulas/1
```

### Resultado esperado

```text
200 OK
```

---

## 7. Probar un ID inexistente

```bash
curl http://localhost:3000/api/formulas/999
```

### Resultado esperado

```text
404 Not Found
```

---

## 8. Probar una entrada inválida

```bash
curl -X POST http://localhost:3000/api/formulas \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Agua"
  }'
```

### Resultado esperado

```text
400 Bad Request
```

---

# Datos iniciales

La API comienza con tres fórmulas químicas:

| ID  | Nombre             | Fórmula |
| --- | ------------------ | ------- |
| `1` | Agua               | `H2O`   |
| `2` | Dióxido de carbono | `CO2`   |
| `3` | Cloruro de sodio   | `NaCl`  |

Estos datos están definidos en:

```text
src/services/formula.service.js
```

---

# Persistencia

Este ejercicio utiliza **almacenamiento en memoria**.

Esto significa que:

* No se utiliza MySQL.
* No se utiliza MongoDB.
* No se utiliza PostgreSQL.
* No se utiliza una base de datos externa.
* Los datos se pierden cuando se reinicia el servidor.

La finalidad es practicar el concepto CRUD sin agregar complejidad innecesaria relacionada con persistencia.

---

# Errores comunes evitados

La implementación busca evitar algunos errores frecuentes al desarrollar un CRUD básico:

* Colocar toda la lógica de la aplicación en `app.js`.
* No separar rutas, controladores y servicios.
* No validar `req.body`.
* No validar los parámetros de ruta.
* Utilizar siempre `200 OK`, incluso cuando ocurre un error.
* No manejar recursos inexistentes.
* No documentar las operaciones del CRUD.
* No proporcionar ejemplos para probar los endpoints.

---

# Resultado esperado

Al finalizar el ejercicio se debe disponer de una API capaz de ejecutar las cuatro operaciones principales del CRUD:

```text
CREATE  → POST
READ    → GET
UPDATE  → PUT
DELETE  → DELETE
```

Aplicadas al recurso:

```text
fórmulas químicas
```

La API debe permitir:

* Crear fórmulas.
* Consultar fórmulas.
* Modificar fórmulas.
* Eliminar fórmulas.
* Validar datos básicos.
* Manejar IDs inválidos.
* Manejar recursos inexistentes.
* Responder utilizando códigos HTTP coherentes.

---

# Checklist final

* [ ] Proyecto Node.js creado.
* [ ] Express configurado.
* [ ] `package.json` creado.
* [ ] Carpeta `src/` creada.
* [ ] Separación entre rutas, controladores y servicios.
* [ ] Endpoint `/health`.
* [ ] CRUD completo.
* [ ] Datos almacenados en memoria.
* [ ] Validación básica de IDs.
* [ ] Validación básica de `req.body`.
* [ ] Validación de tipos.
* [ ] Manejo de recursos inexistentes.
* [ ] Manejo de rutas inexistentes.
* [ ] Códigos HTTP coherentes.
* [ ] Ejemplos de peticiones documentados.
* [ ] Pruebas manuales realizadas.
* [ ] `README.md` incluido.
* [ ] No se utiliza una base de datos externa.
* [ ] No se requiere Docker.
* [ ] `node_modules/` no debe subirse al repositorio.
* [ ] La solución se encuentra dentro de la carpeta personal correspondiente.

---

# Resumen

Este ejercicio implementa un **CRUD básico de fórmulas químicas** utilizando **Node.js y Express**.

La aplicación utiliza una estructura organizada:

```text
Routes
   ↓
Controllers
   ↓
Services
   ↓
Datos en memoria
```

El proyecto permite practicar las operaciones HTTP fundamentales:

```text
GET     → consultar
POST    → crear
PUT     → actualizar
DELETE  → eliminar
```

Además, se practican conceptos complementarios como:

* Parámetros de ruta.
* Datos enviados mediante `req.body`.
* Validación de entradas.
* Códigos de estado HTTP.
* Manejo de errores.
* Recursos inexistentes.
* Separación básica de responsabilidades.
* Pruebas manuales mediante `curl`.

Con este ejercicio se consolida la comprensión de cómo construir una API REST sencilla utilizando Express y cómo organizar sus responsabilidades entre **rutas, controladores y servicios**.
