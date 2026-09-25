# BASICO 30 - Proyecto Integrador Básico

## Información del proyecto

* **Ejercicio:** BASICO 30
* **Tema:** Proyecto integrador básico
* **Temática:** Motos y mecánica
* **Alumno:** Joseph Ramirez
* **Tecnología:** Node.js + Express
* **Puerto:** 3000
* **Almacenamiento:** Datos en memoria

---

# Descripción

Este proyecto consiste en una API REST básica para gestionar motocicletas dentro de un escenario relacionado con motos y mecánica.

La aplicación permite:

* Consultar todas las motos.
* Consultar una moto por ID.
* Crear una moto.
* Actualizar una moto.
* Eliminar una moto.
* Validar los datos recibidos.
* Manejar errores HTTP.
* Documentar el funcionamiento de la API.

El proyecto integra conceptos trabajados durante los ejercicios básicos anteriores:

* Node.js.
* Express.
* Rutas.
* Controladores.
* Servicios.
* `req.params`.
* `req.body`.
* `express.json()`.
* Códigos de estado HTTP.
* Validación.
* CRUD.
* Organización de carpetas.
* Documentación técnica.

---

# Objetivo

Construir una API pequeña pero organizada que permita practicar el flujo completo de una aplicación backend:

```text
Petición HTTP
     ↓
Ruta
     ↓
Controlador
     ↓
Servicio
     ↓
Datos
     ↓
Servicio
     ↓
Controlador
     ↓
Respuesta HTTP
```

---

# Tecnologías utilizadas

* Node.js 20 o superior recomendado.
* Express 5.
* JavaScript.
* npm.
* JSON.
* Datos almacenados en memoria.

No se utiliza una base de datos externa.

---

# Requisitos previos

Se recomienda tener instalado:

```text
Node.js 20+
npm
```

Comprobar las versiones:

```bash
node -v
npm -v
```

---

# Instalación

Entrar en la carpeta del ejercicio:

```bash
cd basico/ejercicio-30/resoluciones/joseph-ramirez
```

Instalar las dependencias:

```bash
npm install
```

---

# Scripts disponibles

## Iniciar la aplicación

```bash
npm start
```

La aplicación estará disponible en:

```text
http://localhost:3000
```

---

## Desarrollo

```bash
npm run dev
```

Este comando utiliza:

```text
node --watch
```

para reiniciar automáticamente la aplicación cuando se modifican los archivos.

---

## Comprobar sintaxis

```bash
npm run check
```

---

# Estructura del proyecto

```text
basico/ejercicio-30/resoluciones/joseph-ramirez/
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
└── src/
    ├── app.js
    ├── controllers/
    │   └── motorcycles.controller.js
    ├── routes/
    │   └── motorcycles.routes.js
    └── services/
        └── motorcycles.service.js
```

---

# Responsabilidades

## `src/app.js`

Es el punto de entrada de la aplicación.

Se encarga de:

* Crear Express.
* Configurar `express.json()`.
* Registrar `/health`.
* Registrar las rutas de motos.
* Manejar rutas inexistentes.
* Iniciar el servidor.

---

## `src/routes/motorcycles.routes.js`

Define los endpoints relacionados con las motocicletas.

```text
GET /
GET /:id
POST /
PUT /:id
DELETE /:id
```

Las rutas se montan en:

```text
/motorcycles
```

Por lo tanto, los endpoints completos son:

```text
GET /motorcycles
GET /motorcycles/:id
POST /motorcycles
PUT /motorcycles/:id
DELETE /motorcycles/:id
```

---

## `src/controllers/motorcycles.controller.js`

Se encarga de:

* Recibir las peticiones.
* Leer `req.params`.
* Leer `req.body`.
* Validar los datos.
* Llamar a los servicios.
* Devolver las respuestas HTTP.

---

## `src/services/motorcycles.service.js`

Se encarga de la información y operaciones sobre las motos.

Contiene:

* Datos iniciales.
* Listado.
* Búsqueda por ID.
* Creación.
* Actualización.
* Eliminación.

---

# Datos iniciales

La API inicia con cuatro motocicletas:

| ID | Marca    | Modelo      |  Año | Cilindrada | Tipo      | Estado           |
| -: | -------- | ----------- | ---: | ---------: | --------- | ---------------- |
|  1 | Yamaha   | MT-07       | 2023 |        689 | Naked     | disponible       |
|  2 | Honda    | CB500F      | 2022 |        471 | Naked     | en_mantenimiento |
|  3 | Kawasaki | Ninja 400   | 2024 |        399 | Deportiva | disponible       |
|  4 | Suzuki   | V-Strom 650 | 2021 |        645 | Adventure | en_mantenimiento |

Los datos están almacenados en memoria.

Esto significa que los cambios realizados mediante POST, PUT o DELETE se perderán cuando se reinicie el servidor.

---

# API

# 1. Health Check

## Endpoint

```text
GET /health
```

Comprueba que el servidor está
