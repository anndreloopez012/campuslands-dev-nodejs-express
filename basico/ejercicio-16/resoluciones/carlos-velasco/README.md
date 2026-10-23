# BASICO 16 - Primer servidor Express

## Objetivo

Construir un primer servidor HTTP utilizando Node.js y Express, aplicando una estructura básica de rutas, controladores y servicios.

La temática utilizada para el ejercicio es ropa y sneakers.

## Concepto principal

El ejercicio permite practicar la creación de un servidor Express y la separación básica de responsabilidades:

- `app.js`: configuración y arranque del servidor.
- `routes/`: definición de las rutas HTTP.
- `controllers/`: manejo de las peticiones y respuestas.
- `services/`: lógica relacionada con los datos.

## Tecnologías

- Node.js 20+
- Express 5
- JavaScript
- HTTP/JSON

## Estructura

```text
carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── routes/
    │   └── sneakers.routes.js
    ├── controllers/
    │   └── sneakers.controller.js
    └── services/
        └── sneakers.service.js