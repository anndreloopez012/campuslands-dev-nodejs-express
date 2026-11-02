# Básico 21 - Estructura src, routes y controllers

## Descripción

API sencilla desarrollada con Node.js y Express sobre el tema de animación 3D.

El objetivo es practicar la organización de un proyecto backend utilizando rutas, controladores y servicios.

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/
├── controllers/
└── services/
```

### Routes

Define las rutas disponibles de la API.

### Controllers

Recibe las peticiones HTTP, valida los datos y devuelve las respuestas.

### Services

Contiene la lógica y los datos de las animaciones.

## Instalación

```bash
npm install
```

## Ejecutar

```bash
npm run dev
```

Servidor:

```text
http://localhost:3000
```

## Pruebas

### Health

```text
GET /health
```

### Listar animaciones

```text
GET /animaciones
```

### Crear animación

```text
POST /animaciones
```

Body:

```json
{
  "nombre": "Dragon 3D",
  "tipo": "3D"
}
```

Si faltan `nombre` o `tipo`, la API responde con estado `400`.

## Concepto aprendido

El ejercicio practica la separación de responsabilidades entre `routes`, `controllers` y `services`.
