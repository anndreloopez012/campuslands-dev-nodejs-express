# BASICO 19 - req.params y req.query

## Autor

**Velasco-c**

## Objetivo

Crear una pequeña API HTTP con Node.js y Express para practicar el uso de `req.params` y `req.query`.

La solución utiliza la temática de tatuajes y trabaja con un conjunto de datos almacenados temporalmente en memoria.

El ejercicio demuestra la diferencia entre:

- `req.params`: obtener valores dinámicos definidos dentro de la ruta.
- `req.query`: obtener parámetros opcionales enviados en la URL después de `?`.

La aplicación está organizada utilizando rutas, controladores y servicios para mantener separadas las responsabilidades.

## Concepto principal

El concepto principal de este ejercicio es el manejo de parámetros de ruta y parámetros de consulta en Express.

### `req.params`

`req.params` permite acceder a valores definidos como segmentos dinámicos de una ruta.

Por ejemplo:

```text
GET /api/tattoos/3
```

La ruta se define como:

```javascript
router.get("/:id", tattooController.getTattooById);
```

Cuando se solicita:

```text
/api/tattoos/3
```

Express coloca el valor `3` dentro de:

```javascript
req.params.id
```

Por lo tanto:

```javascript
const { id } = req.params;
```

permite obtener el identificador enviado en la URL.

### `req.query`

`req.query` permite obtener parámetros enviados como parte de la cadena de consulta.

Por ejemplo:

```text
GET /api/tattoos?style=tradicional
```

El valor puede obtenerse mediante:

```javascript
const { style } = req.query;
```

También pueden enviarse varios parámetros:

```text
GET /api/tattoos?style=tradicional&size=grande
```

En este caso:

```javascript
req.query.style
```

contiene:

```text
tradicional
```

y:

```javascript
req.query.size
```

contiene:

```text
grande
```

## Diferencia entre `req.params` y `req.query`

| Característica | `req.params` | `req.query` |
|---|---|---|
| Ubicación | Ruta | Cadena de consulta |
| Ejemplo | `/api/tattoos/3` | `/api/tattoos?style=japones` |
| Uso principal | Identificar un recurso específico | Filtrar o personalizar una consulta |
| Acceso | `req.params.id` | `req.query.style` |
| ¿Es obligatorio? | En esta ruta, sí | No |

Una forma sencilla de entenderlo es:

```text
/api/tattoos/3
             ↑
             req.params.id
```

Mientras que:

```text
/api/tattoos?style=tradicional&size=grande
              ↑                 ↑
              req.query.style   req.query.size
```

## Tecnologías utilizadas

- Node.js 20 o superior recomendado.
- Express 5.
- JavaScript.
- API HTTP REST.
- Datos almacenados temporalmente en memoria.

## Estructura del proyecto

```text
basico/ejercicio-19/resoluciones/carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── controllers/
    │   └── tattoo.controller.js
    ├── routes/
    │   └── tattoo.routes.js
    └── services/
        └── tattoo.service.js
```

## Responsabilidad de cada archivo

| Archivo | Responsabilidad |
|---|---|
| `package.json` | Define la información del proyecto, dependencia de Express y scripts de ejecución. |
| `src/app.js` | Configura Express, middleware, `/health`, rutas principales y manejo de rutas inexistentes. |
| `src/routes/tattoo.routes.js` | Define las rutas relacionadas con los tatuajes. |
| `src/controllers/tattoo.controller.js` | Obtiene parámetros HTTP, valida entradas y genera respuestas. |
| `src/services/tattoo.service.js` | Contiene los datos en memoria y la lógica de búsqueda y filtrado. |
| `README.md` | Documenta la instalación, ejecución, funcionamiento y pruebas. |

## Datos utilizados

La aplicación utiliza temporalmente los siguientes tatuajes:

```text
ID  Nombre                  Estilo          Tamaño       Artista
1   Rosa tradicional        tradicional     mediano      Valentina
2   Dragón japonés          japones         grande       Marco
3   Luna minimalista        minimalista     pequeno      Sofia
4   Serpiente ornamental    ornamental      mediano      Diego
5   Calavera tradicional    tradicional     grande       Valentina
```

Los datos están definidos en:

```text
src/services/tattoo.service.js
```

No se utiliza una base de datos porque el objetivo del ejercicio es practicar `req.params` y `req.query`.

## Instalación

Ubicarse dentro de la carpeta de la solución:

```bash
cd /home/camper/Documentos/repositorios-locales-carlos/campuslands-dev-nodejs-express/basico/ejercicio-19/resoluciones/carlos-velasco
```

Instalar las dependencias:

```bash
npm install
```

La instalación genera `node_modules/` localmente.

Esta carpeta no debe subirse al repositorio.

## Ejecución

Para ejecutar el servidor normalmente:

```bash
npm start
```

Para ejecutar el servidor utilizando `node --watch`:

```bash
npm run dev
```

El servidor estará disponible en:

```text
http://localhost:3000
```

## Endpoint de salud

La aplicación incluye:

```text
GET /health
```

Este endpoint permite comprobar rápidamente que el servidor está funcionando.

### Ejemplo

```bash
curl http://localhost:3000/health
```

### Respuesta esperada

```json
{
  "ok": true,
  "message": "Servidor funcionando correctamente"
}
```

## Endpoints disponibles

La API proporciona los siguientes endpoints:

| Método | Endpoint | Propósito |
|---|---|---|
| `GET` | `/health` | Comprobar el estado del servidor. |
| `GET` | `/api/tattoos` | Obtener todos los tatuajes. |
| `GET` | `/api/tattoos?style=...` | Filtrar tatuajes por estilo. |
| `GET` | `/api/tattoos?size=...` | Filtrar tatuajes por tamaño. |
| `GET` | `/api/tattoos?style=...&size=...` | Filtrar por estilo y tamaño. |
| `GET` | `/api/tattoos/:id` | Obtener un tatuaje específico mediante `req.params`. |

## Uso de `req.query`

La ruta:

```text
GET /api/tattoos
```

permite utilizar parámetros de consulta opcionales.

### Filtrar por estilo

Solicitud:

```bash
curl "http://localhost:3000/api/tattoos?style=tradicional"
```

El controlador obtiene el parámetro mediante:

```javascript
const { style, size } = req.query;
```

La respuesta contiene los tatuajes cuyo estilo es `tradicional`.

### Filtrar por tamaño

Solicitud:

```bash
curl "http://localhost:3000/api/tattoos?size=grande"
```

La API devuelve únicamente los tatuajes de tamaño `grande`.

### Filtrar por estilo y tamaño

Solicitud:

```bash
curl "http://localhost:3000/api/tattoos?style=tradicional&size=grande"
```

En este caso se utilizan simultáneamente:

```javascript
req.query.style
```

y:

```javascript
req.query.size
```

Los filtros se aplican dentro del servicio.

### Consultar todos los tatuajes

Solicitud:

```bash
curl "http://localhost:3000/api/tattoos"
```

Al no proporcionar parámetros de consulta, la API devuelve todos los tatuajes disponibles.

## Uso de `req.params`

Para consultar un tatuaje específico se utiliza:

```text
GET /api/tattoos/:id
```

Por ejemplo:

```bash
curl "http://localhost:3000/api/tattoos/3"
```

La ruta:

```javascript
router.get("/:id", tattooController.getTattooById);
```

permite obtener el valor mediante:

```javascript
const { id } = req.params;
```

El valor recibido inicialmente es texto, por lo que se convierte a número:

```javascript
const tattooId = Number(id);
```

Después se valida que sea un entero positivo.

## Respuesta de un recurso existente

Solicitud:

```bash
curl "http://localhost:3000/api/tattoos/3"
```

Respuesta esperada:

```json
{
  "ok": true,
  "data": {
    "id": 3,
    "name": "Luna minimalista",
    "style": "minimalista",
    "size": "pequeno",
    "artist": "Sofia"
  }
}
```

## Validación de `req.params`

El identificador debe ser un número entero positivo.

Una solicitud como:

```text
/api/tattoos/abc
```

no es válida.

### Prueba

```bash
curl "http://localhost:3000/api/tattoos/abc"
```

### Respuesta esperada

Código HTTP:

```text
400 Bad Request
```

Respuesta:

```json
{
  "ok": false,
  "message": "El parámetro id debe ser un número entero positivo"
}
```

También sería inválido:

```text
/api/tattoos/0
```

o:

```text
/api/tattoos/-5
```

## Recurso inexistente

Si el identificador tiene un formato válido pero no existe, la API responde con `404 Not Found`.

### Prueba

```bash
curl "http://localhost:3000/api/tattoos/999"
```

### Respuesta esperada

Código HTTP:

```text
404 Not Found
```

Respuesta:

```json
{
  "ok": false,
  "message": "Tatuaje no encontrado"
}
```

## Prueba de filtros

### Caso 1 - Obtener todos

```bash
curl "http://localhost:3000/api/tattoos"
```

Resultado esperado:

- Código HTTP `200`.
- Se devuelve la lista completa.
- El campo `count` indica la cantidad de resultados.

Ejemplo:

```json
{
  "ok": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "name": "Rosa tradicional",
      "style": "tradicional",
      "size": "mediano",
      "artist": "Valentina"
    }
  ]
}
```

### Caso 2 - Filtrar por estilo

```bash
curl "http://localhost:3000/api/tattoos?style=tradicional"
```

Resultado esperado:

- Código HTTP `200`.
- Solo aparecen tatuajes con estilo `tradicional`.

### Caso 3 - Filtrar por tamaño

```bash
curl "http://localhost:3000/api/tattoos?size=grande"
```

Resultado esperado:

- Código HTTP `200`.
- Solo aparecen tatuajes con tamaño `grande`.

### Caso 4 - Filtrar por dos parámetros

```bash
curl "http://localhost:3000/api/tattoos?style=tradicional&size=grande"
```

Resultado esperado:

- Código HTTP `200`.
- Solo aparecen tatuajes que cumplen ambos filtros.

### Caso 5 - Filtro sin coincidencias

```bash
curl "http://localhost:3000/api/tattoos?style=realista"
```

Resultado esperado:

- Código HTTP `200`.
- `count` debe ser `0`.
- `data` debe ser un arreglo vacío.

Ejemplo:

```json
{
  "ok": true,
  "count": 0,
  "data": []
}
```

Que un filtro no encuentre resultados no representa un error del servidor.

## Códigos HTTP utilizados

| Código | Situación |
|---|---|
| `200 OK` | Solicitud procesada correctamente. |
| `400 Bad Request` | El parámetro `id` no tiene un formato válido. |
| `404 Not Found` | El tatuaje solicitado no existe o la ruta no existe. |

## Flujo de una solicitud con `req.params`

Para:

```text
GET /api/tattoos/2
```

el flujo es:

```text
Cliente
   │
   │ GET /api/tattoos/2
   ▼
Express
   │
   ▼
tattoo.routes.js
   │
   │ req.params.id = "2"
   ▼
tattoo.controller.js
   │
   │ convierte y valida id
   ▼
tattoo.service.js
   │
   │ busca el tatuaje
   ▼
tattoo.controller.js
   │
   ▼
Respuesta HTTP
```

## Flujo de una solicitud con `req.query`

Para:

```text
GET /api/tattoos?style=tradicional&size=grande
```

el flujo es:

```text
Cliente
   │
   │ GET /api/tattoos?style=tradicional&size=grande
   ▼
Express
   │
   ▼
tattoo.routes.js
   │
   │ req.query.style
   │ req.query.size
   ▼
tattoo.controller.js
   │
   ▼
tattoo.service.js
   │
   │ aplica filtros
   ▼
tattoo.controller.js
   │
   ▼
Respuesta HTTP
```

## Separación de responsabilidades

La aplicación evita colocar toda la lógica dentro de `app.js`.

### Rutas

Las rutas determinan qué función debe ejecutarse para cada endpoint:

```javascript
router.get("/", tattooController.getTattoos);
router.get("/:id", tattooController.getTattooById);
```

### Controladores

Los controladores trabajan con la solicitud y respuesta HTTP.

Por ejemplo:

```javascript
const { style, size } = req.query;
```

y:

```javascript
const { id } = req.params;
```

También se encargan de validar los parámetros y seleccionar el código HTTP correspondiente.

### Servicios

El servicio trabaja con los datos y la lógica de búsqueda.

Por ejemplo:

```javascript
const findTattooById = (id) => {
  return tattoos.find((tattoo) => tattoo.id === id);
};
```

Esto permite mantener separada la lógica de negocio de la capa HTTP.

## Manejo de datos

Los tatuajes se almacenan en un arreglo en memoria:

```javascript
const tattoos = [
  {
    id: 1,
    name: "Rosa tradicional",
    style: "tradicional",
    size: "mediano",
    artist: "Valentina"
  }
];
```

Esto significa que los datos no son persistentes.

Si el servidor se reinicia, los datos vuelven a cargarse desde el código.

Para este ejercicio es suficiente porque el objetivo no es trabajar con persistencia, sino practicar los parámetros de Express.

## Errores comunes evitados

### Colocar el identificador como query cuando corresponde a un parámetro de ruta

No se utiliza:

```text
/api/tattoos?id=3
```

para la consulta principal de un recurso individual.

Se utiliza:

```text
/api/tattoos/3
```

porque el identificador forma parte de la ruta y se obtiene mediante:

```javascript
req.params.id
```

### Confundir `req.params` con `req.query`

`req.params`:

```text
/api/tattoos/3
```

`req.query`:

```text
/api/tattoos?style=tradicional
```

### No validar el identificador

No se asume que cualquier valor recibido como `id` es válido.

Se comprueba:

```javascript
Number.isInteger(tattooId) && tattooId > 0
```

### Responder siempre con HTTP 200

La aplicación utiliza diferentes códigos HTTP según el resultado.

Por ejemplo:

```text
200 → solicitud correcta
400 → parámetro inválido
404 → recurso inexistente
```

## Prueba general de funcionamiento

Una secuencia recomendada para comprobar la solución es:

```bash
npm install
npm run dev
```

Después, en otra terminal:

```bash
curl "http://localhost:3000/health"
```

Luego:

```bash
curl "http://localhost:3000/api/tattoos"
```

Después probar `req.query`:

```bash
curl "http://localhost:3000/api/tattoos?style=tradicional"
```

Y finalmente probar `req.params`:

```bash
curl "http://localhost:3000/api/tattoos/2"
```

Para comprobar el manejo de errores:

```bash
curl "http://localhost:3000/api/tattoos/abc"
```

y:

```bash
curl "http://localhost:3000/api/tattoos/999"
```

## Resultado esperado

La solución debe permitir:

- Ejecutar el proyecto con `npm start`.
- Ejecutar el proyecto en modo desarrollo con `npm run dev`.
- Comprobar el servidor mediante `GET /health`.
- Obtener todos los tatuajes mediante `GET /api/tattoos`.
- Filtrar tatuajes mediante `req.query`.
- Consultar un tatuaje específico mediante `req.params`.
- Validar el parámetro `id`.
- Devolver `404` cuando el tatuaje no existe.
- Mantener separadas las rutas, los controladores y los servicios.
- Trabajar sin una base de datos externa.

## Archivos que no deben subirse

No se debe subir:

```text
node_modules/
.env
```

El proyecto utiliza únicamente dependencias declaradas en `package.json`.

## Comandos principales

Instalar dependencias:

```bash
npm install
```

Ejecutar:

```bash
npm start
```

Ejecutar en desarrollo:

```bash
npm run dev
```

## Resumen

Este ejercicio permite practicar dos mecanismos fundamentales de Express:

```text
req.params
req.query
```

`req.params` se utiliza para obtener valores dinámicos definidos dentro de una ruta, como:

```text
GET /api/tattoos/3
```

donde:

```javascript
req.params.id
```

representa el identificador del tatuaje.

`req.query` se utiliza para obtener parámetros opcionales de una consulta, como:

```text
GET /api/tattoos?style=tradicional&size=grande
```

donde:

```javascript
req.query.style
req.query.size
```

representan los filtros enviados por el cliente.

La solución mantiene una estructura sencilla con:

```text
routes
controllers
services
```

para practicar una organización backend clara sin agregar complejidad innecesaria.