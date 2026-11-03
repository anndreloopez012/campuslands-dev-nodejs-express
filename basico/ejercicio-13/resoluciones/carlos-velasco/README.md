# BASICO 13 - Manejo de errores

## 1. Nombre

Manejo de errores con Node.js y Express.

## 2. Objetivo

Crear una pequeña API relacionada con ciencia ficción para practicar el manejo de errores en una aplicación backend.

La solución utiliza un middleware global de Express para centralizar las respuestas de error.

## 3. Concepto principal

En una aplicación backend pueden producirse diferentes tipos de errores.

Por ejemplo:

- Datos de entrada inválidos.
- Recursos que no existen.
- Errores inesperados del servidor.
- Rutas inexistentes.

Estos errores deben producir respuestas HTTP coherentes.

## 4. Manejo de errores en Express

El middleware de errores utiliza una firma especial:

```js
(error, req, res, next)
```

El primer parámetro representa el error.

Cuando un controlador detecta un error puede enviarlo al siguiente middleware mediante:

```js
next(error);
```

El middleware global recibe ese error y genera la respuesta correspondiente.

## 5. Códigos HTTP utilizados

### 200 OK

La nave espacial fue encontrada correctamente.

### 400 Bad Request

El identificador proporcionado no es válido.

### 404 Not Found

La nave espacial solicitada no existe.

### 500 Internal Server Error

Se utiliza como código de respaldo cuando ocurre un error inesperado que no tiene un código específico.

## 6. Tecnologías

- Node.js 20+
- Express
- JavaScript
- HTTP
- Middleware

## 7. Estructura

```text
resoluciones/carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── routes/
    │   └── scifi.routes.js
    ├── controllers/
    │   └── scifi.controller.js
    ├── services/
    │   └── scifi.service.js
    └── middlewares/
        └── error.middleware.js
```

## 8. Instalación

Desde la carpeta de la entrega:

```bash
npm install
```

## 9. Ejecución

Modo normal:

```bash
npm start
```

Modo desarrollo:

```bash
npm run dev
```

El servidor utiliza el puerto:

```text
3000
```

## 10. Endpoints

### Health check

```http
GET /health
```

Comprueba que el servidor está funcionando.

### Obtener una nave espacial

```http
GET /spaceships/:id
```

Ejemplo:

```http
GET /spaceships/1
```

## 11. Caso exitoso

Petición:

```bash
curl http://localhost:3000/spaceships/1
```

Respuesta:

```json
{
  "ok": true,
  "message": "Nave espacial obtenida correctamente",
  "topic": "manejo de errores",
  "data": {
    "id": 1,
    "name": "Nostromo",
    "type": "Exploracion",
    "status": "activa"
  }
}
```

Código:

```text
200 OK
```

## 12. Error de validación

Petición:

```bash
curl http://localhost:3000/spaceships/abc
```

Respuesta:

```json
{
  "ok": false,
  "message": "El identificador de la nave no es valido"
}
```

Código:

```text
400 Bad Request
```

## 13. Recurso no encontrado

Petición:

```bash
curl http://localhost:3000/spaceships/999
```

Respuesta:

```json
{
  "ok": false,
  "message": "Nave espacial no encontrada"
}
```

Código:

```text
404 Not Found
```

## 14. Ruta inexistente

Petición:

```bash
curl http://localhost:3000/otra-ruta
```

Respuesta:

```json
{
  "ok": false,
  "message": "Ruta no encontrada"
}
```

Código:

```text
404 Not Found
```

Este caso es manejado por el middleware de rutas inexistentes y no por el middleware global de errores.

## 15. Flujo de manejo de errores

```text
Cliente
   |
   v
HTTP Request
   |
   v
Route
   |
   v
Controller
   |
   v
Service
   |
   +------ éxito ------> HTTP 200
   |
   +------ error
             |
             v
         next(error)
             |
             v
      Error Middleware
             |
             +---- 400
             |
             +---- 404
             |
             +---- 500
```

## 16. Separación de responsabilidades

### Service

Contiene la lógica relacionada con las naves espaciales y genera errores cuando los datos no son válidos o el recurso no existe.

### Controller

Recibe la petición, llama al servicio y entrega los errores al middleware mediante:

```js
next(error);
```

### Error Middleware

Centraliza la respuesta HTTP de los errores.

### Routes

Define las rutas disponibles de la API.

## 17. Validación

La entrega puede validarse comprobando:

- `npm install` instala correctamente las dependencias.
- `npm start` inicia el servidor.
- `npm run dev` inicia el servidor en modo desarrollo.
- `GET /health` responde correctamente.
- `GET /spaceships/1` devuelve una nave.
- Un identificador inválido produce `400`.
- Una nave inexistente produce `404`.
- Una ruta inexistente produce `404`.
- Los errores son enviados mediante `next(error)`.
- Existe un middleware global de manejo de errores.
- Los errores inesperados tienen `500` como código de respaldo.

## 18. Conceptos practicados

- Manejo de errores.
- `try/catch`.
- `throw new Error()`.
- `next(error)`.
- Middleware.
- Middleware de errores.
- Códigos de estado HTTP.
- Validación de parámetros.
- Express.
- Rutas.
- Controladores.
- Servicios.
- Separación de responsabilidades.