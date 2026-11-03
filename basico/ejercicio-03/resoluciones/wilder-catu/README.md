# Plantilla de entrega Node.js/Express

## Comandos sugeridos

```bash
npm install
npm run dev
```

## package.json sugerido

```json
{
  "type": "module",
  "scripts": {
    "dev": "node --watch src/server.js",
    "start": "node src/server.js"
  },
  "dependencies": {
    "express": "latest"
  }
}
```

## Estructura sugerida

```text
src/
├── app.js
├── server.js
├── routes/
├── controllers/
├── services/
└── data/
```

## Checklist

- [ ] Endpoint principal funcionando.
- [ ] Validacion de entrada cuando aplique.
- [ ] Manejo de error basico.
- [ ] README de entrega con instrucciones.
- [ ] PR hacia dev.
# API MOBA Esports

## Descripción

Este proyecto consiste en una pequeña API backend desarrollada con Node.js para administrar equipos de un escenario de MOBA esports.

El ejercicio está enfocado en comprender el funcionamiento de un backend utilizando:

- Node.js
- CommonJS
- HTTP
- Rutas
- Métodos HTTP
- Validaciones
- JSON
- Manejo de errores
- npm scripts

El proyecto **no utiliza Express**. Se utiliza el módulo `http` incluido directamente en Node.js.

## Estructura del proyecto

```text
moba-node-commonjs/
├── app.js
├── package.json
└── README.md
```

Todo el código JavaScript se encuentra dentro de `app.js`.

## Requisitos

Se necesita:

- Node.js 20 o superior.
- npm.

No se necesitan dependencias externas.

## Instalación

Entrar en la carpeta del proyecto:

```bash
cd moba-node-commonjs
```

No es necesario ejecutar `npm install`, porque el proyecto no utiliza paquetes externos.

## Ejecución

Para iniciar el servidor:

```bash
npm start
```

El servidor estará disponible en:

```text
http://localhost:3000
```

Para desarrollo:

```bash
npm run dev
```

Este comando utiliza `node --watch` para reiniciar automáticamente el servidor cuando se modifica `app.js`.

Para comprobar la sintaxis:

```bash
npm run check
```

## Datos utilizados

La API trabaja con equipos de MOBA esports.

Cada equipo contiene:

```json
{
    "id": 1,
    "nombre": "Dragons",
    "region": "LATAM",
    "jugadores": 5
}
```

Los datos se almacenan temporalmente en memoria.

Esto significa que si el servidor se apaga, los cambios realizados se pierden.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Información general de la API |
| GET | `/equipos` | Obtener todos los equipos |
| GET | `/equipos/:id` | Obtener un equipo específico |
| POST | `/equipos` | Crear un equipo |
| PUT | `/equipos/:id` | Actualizar un equipo |
| DELETE | `/equipos/:id` | Eliminar un equipo |

## 1. Obtener información de la API

Abrir en el navegador:

```text
http://localhost:3000/
```

También puede probarse con:

```bash
curl http://localhost:3000/
```

## 2. Obtener todos los equipos

```bash
curl http://localhost:3000/equipos
```

Respuesta:

```json
{
    "total": 2,
    "equipos": [
        {
            "id": 1,
            "nombre": "Dragons",
            "region": "LATAM",
            "jugadores": 5
        },
        {
            "id": 2,
            "nombre": "Titans",
            "region": "NA",
            "jugadores": 5
        }
    ]
}
```

## 3. Buscar un equipo

Para buscar un equipo específico se utiliza su ID:

```bash
curl http://localhost:3000/equipos/1
```

Respuesta:

```json
{
    "id": 1,
    "nombre": "Dragons",
    "region": "LATAM",
    "jugadores": 5
}
```

Si el equipo no existe:

```bash
curl http://localhost:3000/equipos/99
```

La API devuelve:

```json
{
    "error": "Equipo no encontrado."
}
```

con código HTTP `404`.

## 4. Crear un equipo

Para crear un equipo se utiliza `POST`.

Ejemplo:

```bash
curl -X POST http://localhost:3000/equipos \
-H "Content-Type: application/json" \
-d "{\"nombre\":\"Phoenix\",\"region\":\"LATAM\",\"jugadores\":5}"
```

Respuesta:

```json
{
    "mensaje": "Equipo creado correctamente.",
    "equipo": {
        "id": 3,
        "nombre": "Phoenix",
        "region": "LATAM",
        "jugadores": 5
    }
}
```

La respuesta utiliza el código HTTP `201`.

## 5. Actualizar un equipo

Para actualizar un equipo se utiliza `PUT`.

```bash
curl -X PUT http://localhost:3000/equipos/1 \
-H "Content-Type: application/json" \
-d "{\"nombre\":\"Dragons Academy\",\"region\":\"LATAM\",\"jugadores\":6}"
```

La API busca el equipo mediante su ID y reemplaza sus datos.

## 6. Eliminar un equipo

Para eliminar un equipo se utiliza `DELETE`.

```bash
curl -X DELETE http://localhost:3000/equipos/1
```

Respuesta:

```json
{
    "mensaje": "Equipo eliminado correctamente.",
    "equipo": {
        "id": 1,
        "nombre": "Dragons",
        "region": "LATAM",
        "jugadores": 5
    }
}
```

## Validaciones

La API valida los datos antes de crear o actualizar un equipo.

### Nombre

Debe existir y ser texto.

Correcto:

```json
{
    "nombre": "Dragons"
}
```

Incorrecto:

```json
{
    "nombre": ""
}
```

### Región

Debe existir y ser texto.

Ejemplo:

```json
{
    "region": "LATAM"
}
```

### Jugadores

Debe ser un número entero entre `1` y `10`.

Correcto:

```json
{
    "jugadores": 5
}
```

Incorrecto:

```json
{
    "jugadores": 15
}
```

## Manejo de errores

La API utiliza diferentes códigos HTTP.

| Código | Significado |
|---|---|
| 200 | Solicitud realizada correctamente |
| 201 | Recurso creado |
| 400 | Datos enviados incorrectamente |
| 404 | Ruta o recurso no encontrado |

Por ejemplo, si falta el nombre:

```json
{
    "nombre": "",
    "region": "LATAM",
    "jugadores": 5
}
```

La API responde:

```json
{
    "error": "Los datos enviados no son válidos.",
    "detalles": [
        "El nombre es obligatorio y debe ser texto."
    ]
}
```

## CommonJS

El ejercicio trabaja con módulos CommonJS.

En `app.js` se utiliza:

```javascript
const http = require("http");
const { URL } = require("url");
```

La función `require()` permite importar funcionalidades de Node.js utilizando el sistema CommonJS.

## Servidor HTTP

Como no se utiliza Express, el servidor se crea directamente con:

```javascript
const servidor = http.createServer();
```

Esto permite comprender cómo funciona una API antes de utilizar un framework.

El servidor recibe:

```text
Solicitud HTTP
      |
      v
Método HTTP
      |
      v
Ruta
      |
      v
Validación
      |
      v
Operación
      |
      v
Respuesta JSON
```

## Lectura de datos

Para las solicitudes `POST` y `PUT`, el servidor recibe información JSON.

Por ejemplo:

```json
{
    "nombre": "Phoenix",
    "region": "LATAM",
    "jugadores": 5
}
```

El contenido se obtiene mediante los eventos de la solicitud:

```javascript
req.on("data", ...)
req.on("end", ...)
```

Después se convierte el JSON utilizando:

```javascript
JSON.parse()
```

## Organización del código

Aunque todo el JavaScript está dentro de `app.js`, se mantiene organizado mediante funciones.

Las principales funciones son:

```text
enviarRespuesta()
leerCuerpo()
validarEquipo()
obtenerIdDesdeRuta()
```

Cada función tiene una responsabilidad concreta.

Después se encuentra la creación del servidor y las diferentes rutas.

## Flujo de desarrollo

La solución sigue los pasos indicados en el problema:

### 1. Analizar los requerimientos

Se identificó que era necesario crear una pequeña API relacionada con MOBA esports.

### 2. Definir el recurso

El recurso principal es:

```text
equipos
```

### 3. Definir los datos

Cada equipo tiene:

```text
id
nombre
region
jugadores
```

### 4. Definir las rutas

Se crearon operaciones para:

```text
GET
POST
PUT
DELETE
```

### 5. Implementar el caso principal

Primero se implementó la consulta de equipos.

### 6. Agregar validaciones

Se agregaron validaciones para:

- Nombre.
- Región.
- Número de jugadores.
- ID.

### 7. Agregar errores

Se agregaron respuestas para:

- Datos inválidos.
- Equipo inexistente.
- Ruta inexistente.
- JSON inválido.

### 8. Probar la API

Se puede utilizar:

- Navegador.
- Postman.
- Thunder Client.
- curl.

### 9. Documentar

Todas las rutas y comandos de prueba se encuentran en este README.

## Prueba completa

Primero ejecutar:

```bash
npm run check
```

Después:

```bash
npm start
```

En otra terminal:

```bash
curl http://localhost:3000/equipos
```

Crear un equipo:

```bash
curl -X POST http://localhost:3000/equipos \
-H "Content-Type: application/json" \
-d "{\"nombre\":\"Phoenix\",\"region\":\"LATAM\",\"jugadores\":5}"
```

Consultar nuevamente:

```bash
curl http://localhost:3000/equipos
```

Actualizar:

```bash
curl -X PUT http://localhost:3000/equipos/3 \
-H "Content-Type: application/json" \
-d "{\"nombre\":\"Phoenix Elite\",\"region\":\"LATAM\",\"jugadores\":6}"
```

Eliminar:

```bash
curl -X DELETE http://localhost:3000/equipos/3
```

## Resultado

El proyecto implementa una API pequeña de MOBA esports utilizando Node.js y CommonJS.

No utiliza Express ni dependencias externas.

El ejercicio permite practicar los fundamentos de:

```text
Node.js
CommonJS
HTTP
Rutas
JSON
Validación
Métodos HTTP
Códigos de respuesta
Manejo de errores
npm scripts
```

La implementación mantiene todo el código JavaScript en `app.js`, facilitando su lectura y estudio para un nivel inicial de backend.