# BASICO 18 - Rutas POST

## Autor

**Velasco-c**

## Objetivo

Crear una pequeña API HTTP utilizando **Node.js** y **Express** para practicar el funcionamiento de las **rutas HTTP POST**.

El ejercicio utiliza la temática de **paracaidismo**. La API permite consultar y registrar saltos de paracaidismo almacenados temporalmente en memoria.

El objetivo principal es comprender cómo una solicitud HTTP POST transporta información mediante `req.body`, cómo se valida esa información, cómo se procesa mediante un controlador y cómo se crea un nuevo recurso desde un servicio.

---

## Concepto principal

El concepto principal de este ejercicio es el uso de **rutas HTTP POST con Express**.

Una solicitud `POST` se utiliza normalmente para **enviar información al servidor y crear un nuevo recurso**.

En este ejercicio las solicitudes POST reciben información en formato JSON y crean nuevos registros de saltos de paracaidismo en memoria.

La implementación permite practicar:

- Rutas HTTP `POST`.
- Lectura de información mediante `req.body`.
- Middleware `express.json()`.
- Validación básica de datos.
- Separación entre rutas, controladores y servicios.
- Creación de recursos.
- Respuestas en formato JSON.
- Códigos de estado HTTP.
- Manejo de datos inválidos.
- Uso del código `201 Created`.

---

## Tecnologías utilizadas

- **Node.js 20 o superior**
- **Express**
- **JavaScript**
- **npm**

No se utiliza una base de datos, ya que el objetivo del ejercicio es practicar el funcionamiento de las rutas POST.

Los saltos de paracaidismo se mantienen temporalmente en memoria mientras el servidor está ejecutándose.

---

## Estructura del proyecto

```text
carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── routes/
    │   └── skydiving.routes.js
    ├── controllers/
    │   └── skydiving.controller.js
    └── services/
        └── skydiving.service.js