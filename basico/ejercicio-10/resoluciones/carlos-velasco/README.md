# BASICO 10 - Funciones asincronas

## 1. Nombre

Funciones asíncronas con Node.js y Express.

## 2. Objetivo

Crear una pequeña API relacionada con pingpong para practicar el uso de funciones asíncronas mediante `async/await`.

La solución utiliza una separación básica entre:

- Rutas.
- Controladores.
- Servicios.

## 3. Concepto principal

Una función asíncrona permite ejecutar operaciones que pueden tardar en completarse sin detener el flujo general de ejecución de Node.js.

En JavaScript se puede utilizar:

```js
async function ejemplo() {
  const resultado = await operacionAsincrona();
}
```

En este ejercicio:

- `async` declara una función asíncrona.
- `await` espera el resultado de una operación asíncrona.
- `try/catch` permite manejar errores.
- El servicio contiene la lógica de la operación.
- El controlador coordina la operación y genera la respuesta HTTP.

## 4. Tecnologías

- Node.js 20+
- Express
- JavaScript
- HTTP
- async/await

## 5. Estructura

```text
resoluciones/carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── routes/
    │   └── pingpong.routes.js
    ├── controllers/
    │   └── pingpong.controller.js
    └── services/
        └── pingpong.service.js
```

## 6. Instalación

Desde la carpeta de la entrega:

```bash
npm install
```

## 7. Ejecución

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

## 8. Endpoints

### Health check

```http
GET /health
```

Sirve para comprobar que el servidor está funcionando.

### Obtener información de pingpong

```http
GET /pingpong
```

Este endpoint ejecuta una función asíncrona en el servicio y devuelve sus resultados.

## 9. Ejemplo de petición

Con `curl`:

```bash
curl http://localhost:3000/pingpong
```

## 10. Respuesta esperada

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "funciones asincronas",
  "data": {
    "sport": "pingpong",
    "players": 2,
    "status": "ready",
    "message": "Datos de pingpong obtenidos correctamente"
  }
}
```

## 11. Flujo de ejecución

La petición sigue este flujo:

```text
Cliente
   |
   v
GET /pingpong
   |
   v
Ruta
   |
   v
Controlador
   |
   v
Servicio
   |
   v
Función async
   |
   v
await
   |
   v
Resultado
   |
   v
Controlador
   |
   v
Respuesta HTTP
```

## 12. Manejo de errores

El controlador utiliza `try/catch` para capturar errores producidos durante la ejecución de la función asíncrona.

Si ocurre un error, la API responde:

```json
{
  "ok": false,
  "message": "Error interno del servidor"
}
```

con código HTTP:

```text
500 Internal Server Error
```

Si se solicita una ruta inexistente:

```bash
curl http://localhost:3000/otra-ruta
```

la API responde con:

```json
{
  "ok": false,
  "message": "Ruta no encontrada"
}
```

y código HTTP:

```text
404 Not Found
```

## 13. Validación

La entrega puede validarse comprobando:

- `npm install` instala correctamente las dependencias.
- `npm start` inicia el servidor.
- `npm run dev` inicia el servidor en modo desarrollo.
- `GET /health` responde correctamente.
- `GET /pingpong` ejecuta la función asíncrona.
- La respuesta contiene los datos de pingpong.
- Una ruta inexistente devuelve `404`.
- Los errores internos son manejados mediante `try/catch`.

## 14. Conceptos practicados

- Funciones asíncronas.
- `async`.
- `await`.
- `Promise`.
- `try/catch`.
- Express.
- Rutas.
- Controladores.
- Servicios.
- Códigos de estado HTTP.
- Separación de responsabilidades.