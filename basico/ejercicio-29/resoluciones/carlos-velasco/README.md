# BASICO 29 - README técnico

## Autor

**Velasco-c**

## Objetivo

Crear una pequeña API backend utilizando **Node.js** y **Express** y documentarla mediante un **README técnico completo**.

La API utiliza una temática relacionada con **fútbol y fútbol sala**.

El objetivo principal del ejercicio es comprender que la documentación técnica forma parte del desarrollo backend y debe permitir que otro desarrollador pueda:

- Entender qué hace el proyecto.
- Conocer su estructura.
- Instalarlo.
- Ejecutarlo.
- Conocer sus endpoints.
- Saber qué datos enviar.
- Entender las respuestas HTTP.
- Identificar los errores esperados.
- Ejecutar las pruebas manuales.

---

# Concepto principal: README técnico

Un README técnico es un documento que acompaña a un proyecto de software y explica cómo utilizarlo.

No debe limitarse a describir el proyecto de manera general.

Una documentación técnica útil debe responder preguntas como:

- ¿Qué hace el proyecto?
- ¿Qué tecnologías utiliza?
- ¿Cómo se instala?
- ¿Cómo se ejecuta?
- ¿Cuál es su estructura?
- ¿Qué endpoints existen?
- ¿Qué parámetros recibe?
- ¿Qué respuestas devuelve?
- ¿Qué errores pueden ocurrir?
- ¿Cómo se puede probar?
- ¿Qué limitaciones tiene?

En este ejercicio el README documenta una API pequeña de partidos de fútbol y fútbol sala.

---

# Descripción del proyecto

La aplicación proporciona una API HTTP sencilla para consultar y registrar partidos deportivos.

La API permite:

- Consultar partidos.
- Crear nuevos partidos.
- Validar los datos recibidos.
- Diferenciar entre fútbol y fútbol sala.
- Devolver códigos HTTP coherentes.
- Documentar todas las operaciones disponibles.

Los datos se mantienen en memoria mediante un arreglo de JavaScript.

No se utiliza una base de datos porque el objetivo del ejercicio es practicar documentación técnica y organización básica de una API.

---

# Tecnologías utilizadas

- Node.js 20 o superior recomendado.
- Express.
- JavaScript.
- HTTP.
- JSON.
- `curl` para pruebas manuales.

---

# Requisitos previos

Antes de ejecutar el proyecto se necesita tener instalado:

```text
Node.js 20+
npm
```

Se puede verificar la instalación con:

```bash
node --version
npm --version
```

---

# Estructura del proyecto

```text
basico/ejercicio-29/resoluciones/carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── controllers/
    │   └── match.controller.js
    ├── routes/
    │   └── match.routes.js
    └── services/
        └── match.service.js
```

---

# Responsabilidad de cada archivo

## `package.json`

Contiene:

- Información del proyecto.
- Dependencias.
- Scripts de ejecución.

Scripts disponibles:

```json
{
  "scripts": {
    "start": "node src/app.js",
    "dev": "node --watch src/app.js"
  }
}
```

---

## `README.md`

Contiene la documentación técnica del proyecto.

Explica:

- Objetivo.
- Tecnologías.
- Requisitos.
- Estructura.
- Arquitectura.
- Instalación.
- Ejecución.
- Endpoints.
- Validaciones.
- Códigos HTTP.
- Pruebas.
- Errores.
- Limitaciones.

---

## `src/app.js`

Es el punto de entrada de la aplicación.

Responsabilidades:

- Crear la aplicación Express.
- Habilitar `express.json()`.
- Crear `/health`.
- Registrar las rutas de partidos.
- Manejar rutas inexistentes.
- Iniciar el servidor.

---

## `src/routes/match.routes.js`

Define las rutas relacionadas con los partidos.

Actualmente contiene:

```text
GET  /api/matches
POST /api/matches
```

Las rutas delegan el procesamiento de las peticiones al controlador correspondiente.

---

## `src/controllers/match.controller.js`

Gestiona las peticiones HTTP.

Responsabilidades:

- Leer `req.body`.
- Validar los datos recibidos.
- Invocar los servicios.
- Construir las respuestas HTTP.

El controlador no mantiene directamente la colección de partidos.

---

## `src/services/match.service.js`

Contiene la lógica relacionada con los partidos.

Responsabilidades:

- Consultar partidos.
- Crear partidos.
- Generar identificadores.
- Mantener temporalmente los datos en memoria.

---

# Arquitectura

El proyecto utiliza una separación sencilla de responsabilidades:

```text
Cliente
   │
   ▼
Route
   │
   ▼
Controller
   │
   ▼
Service
   │
   ▼
Datos en memoria
```

Cada capa tiene una responsabilidad concreta.

---

# Flujo de consulta

Para:

```text
GET /api/matches
```

el flujo es:

```text
Cliente
   │
   ▼
match.routes.js
   │
   ▼
match.controller.js
   │
   ▼
match.service.js
   │
   ▼
Array de partidos
   │
   ▼
Controller
   │
   ▼
Respuesta JSON
```

La ruta recibe la petición, el controlador coordina la operación y el servicio obtiene los datos.

---

# Instalación

Desde la carpeta del proyecto:

```bash
npm install
```

Este comando instala las dependencias definidas en `package.json`.

---

# Ejecución

## Modo normal

Ejecutar:

```bash
npm start
```

Resultado esperado:

```text
Servidor ejecutándose en http://localhost:3000
```

---

## Modo desarrollo

Ejecutar:

```bash
npm run dev
```

Este comando utiliza:

```bash
node --watch src/app.js
```

para reiniciar automáticamente el proceso cuando se detectan cambios en los archivos.

---

# URL base

Una vez iniciado el servidor:

```text
http://localhost:3000
```

Las rutas de la API utilizan:

```text
http://localhost:3000/api
```

---

# Endpoint de salud

## `GET /health`

Permite verificar que el servidor está funcionando.

### Petición

```http
GET /health
```

### Respuesta

```json
{
  "ok": true,
  "message": "Servidor funcionando correctamente"
}
```

### Código HTTP

```text
200 OK
```

---

# API de partidos

## Obtener todos los partidos

### `GET /api/matches`

Devuelve todos los partidos almacenados actualmente en memoria.

### Petición

```http
GET /api/matches
```

### Respuesta

```json
{
  "ok": true,
  "message": "Partidos obtenidos correctamente",
  "data": [
    {
      "id": 1,
      "homeTeam": "Real Madrid",
      "awayTeam": "Barcelona",
      "modality": "futbol",
      "status": "scheduled"
    },
    {
      "id": 2,
      "homeTeam": "Inter Sala",
      "awayTeam": "Titanes Futsal",
      "modality": "futbol-sala",
      "status": "scheduled"
    }
  ]
}
```

### Código HTTP

```text
200 OK
```

---

## Crear un partido

### `POST /api/matches`

Crea un nuevo partido.

### Cuerpo de la petición

El servidor espera un objeto JSON con:

- `homeTeam`
- `awayTeam`
- `modality`

Ejemplo:

```json
{
  "homeTeam": "Manchester City",
  "awayTeam": "Liverpool",
  "modality": "futbol"
}
```

### Respuesta exitosa

```json
{
  "ok": true,
  "message": "Partido creado correctamente",
  "data": {
    "id": 3,
    "homeTeam": "Manchester City",
    "awayTeam": "Liverpool",
    "modality": "futbol",
    "status": "scheduled"
  }
}
```

### Código HTTP

```text
201 Created
```

---

# Campos de creación

| Campo | Tipo | Obligatorio | Valores |
|---|---|---|---|
| `homeTeam` | string | Sí | Nombre del equipo local |
| `awayTeam` | string | Sí | Nombre del equipo visitante |
| `modality` | string | Sí | `futbol` o `futbol-sala` |

---

# Validaciones

La API valida los datos antes de crear un partido.

## Campos obligatorios

Son obligatorios:

```text
homeTeam
awayTeam
modality
```

Si falta alguno, se devuelve:

```json
{
  "ok": false,
  "message": "Los campos homeTeam, awayTeam y modality son obligatorios"
}
```

Código:

```text
400 Bad Request
```

---

## Validación de modalidad

La modalidad solamente puede ser:

```text
futbol
```

o:

```text
futbol-sala
```

Si se envía otra modalidad:

```json
{
  "homeTeam": "Equipo A",
  "awayTeam": "Equipo B",
  "modality": "baloncesto"
}
```

la respuesta será:

```json
{
  "ok": false,
  "message": "La modalidad debe ser futbol o futbol-sala"
}
```

Código:

```text
400 Bad Request
```

---

# Códigos HTTP

La API utiliza los siguientes códigos:

| Código | Nombre | Uso |
|---|---|---|
| `200` | OK | Consulta exitosa |
| `201` | Created | Partido creado |
| `400` | Bad Request | Datos inválidos o faltantes |
| `404` | Not Found | Ruta inexistente |

---

# Formato de respuestas

Las respuestas exitosas utilizan una estructura similar a:

```json
{
  "ok": true,
  "message": "Operación realizada correctamente",
  "data": {}
}
```

Las respuestas de error utilizan:

```json
{
  "ok": false,
  "message": "Descripción del error"
}
```

Esto permite mantener una estructura de respuesta consistente.

---

# Manejo de rutas inexistentes

Si el cliente solicita una ruta que no existe:

```http
GET /api/unknown
```

la aplicación responde:

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

---

# Pruebas manuales

Las siguientes pruebas permiten comprobar el funcionamiento de la API.

## 1. Verificar el servidor

Iniciar primero:

```bash
npm start
```

Después ejecutar:

```bash
curl http://localhost:3000/health
```

Resultado esperado:

```json
{
  "ok": true,
  "message": "Servidor funcionando correctamente"
}
```

Código:

```text
200
```

---

## 2. Obtener partidos

Ejecutar:

```bash
curl http://localhost:3000/api/matches
```

Debe devolver una respuesta con los partidos iniciales.

Código esperado:

```text
200
```

---

## 3. Crear un partido de fútbol

Ejecutar:

```bash
curl -X POST http://localhost:3000/api/matches \
  -H "Content-Type: application/json" \
  -d '{"homeTeam":"Manchester City","awayTeam":"Liverpool","modality":"futbol"}'
```

Resultado esperado:

```json
{
  "ok": true,
  "message": "Partido creado correctamente",
  "data": {
    "id": 3,
    "homeTeam": "Manchester City",
    "awayTeam": "Liverpool",
    "modality": "futbol",
    "status": "scheduled"
  }
}
```

Código:

```text
201
```

---

## 4. Crear un partido de fútbol sala

Ejecutar:

```bash
curl -X POST http://localhost:3000/api/matches \
  -H "Content-Type: application/json" \
  -d '{"homeTeam":"Inter Sala","awayTeam":"Titanes Futsal","modality":"futbol-sala"}'
```

Código esperado:

```text
201
```

---

## 5. Probar una validación

Ejecutar:

```bash
curl -X POST http://localhost:3000/api/matches \
  -H "Content-Type: application/json" \
  -d '{"homeTeam":"Equipo A"}'
```

Respuesta esperada:

```json
{
  "ok": false,
  "message": "Los campos homeTeam, awayTeam y modality son obligatorios"
}
```

Código:

```text
400
```

---

## 6. Probar modalidad inválida

Ejecutar:

```bash
curl -X POST http://localhost:3000/api/matches \
  -H "Content-Type: application/json" \
  -d '{"homeTeam":"Equipo A","awayTeam":"Equipo B","modality":"baloncesto"}'
```

Respuesta esperada:

```json
{
  "ok": false,
  "message": "La modalidad debe ser futbol o futbol-sala"
}
```

Código:

```text
400
```

---

## 7. Probar una ruta inexistente

Ejecutar:

```bash
curl http://localhost:3000/api/unknown
```

Respuesta esperada:

```json
{
  "ok": false,
  "message": "Ruta no encontrada"
}
```

Código:

```text
404
```

---

# Ejemplo completo de flujo

Un desarrollador que recibe este proyecto puede seguir estos pasos:

```text
1. Clonar o recibir el proyecto
          │
          ▼
2. Ejecutar npm install
          │
          ▼
3. Ejecutar npm start
          │
          ▼
4. Comprobar GET /health
          │
          ▼
5. Consultar GET /api/matches
          │
          ▼
6. Crear un partido con POST /api/matches
          │
          ▼
7. Comprobar las validaciones
```

La documentación permite realizar todo este proceso sin necesidad de inspeccionar primero el código fuente.

---

# Datos iniciales

La aplicación inicia con dos partidos:

```json
[
  {
    "id": 1,
    "homeTeam": "Real Madrid",
    "awayTeam": "Barcelona",
    "modality": "futbol",
    "status": "scheduled"
  },
  {
    "id": 2,
    "homeTeam": "Inter Sala",
    "awayTeam": "Titanes Futsal",
    "modality": "futbol-sala",
    "status": "scheduled"
  }
]
```

Estos datos solamente existen mientras el proceso Node.js está ejecutándose.

---

# Persistencia

Este ejercicio utiliza memoria:

```javascript
let matches = [];
```

Por lo tanto:

- Los datos no se almacenan permanentemente.
- Reiniciar el servidor restaura los datos iniciales.
- No existe una base de datos.

Esto es intencional porque el objetivo principal del ejercicio es practicar la documentación técnica.

---

# Errores comunes

## No ejecutar `npm install`

Si las dependencias no están instaladas, Express no estará disponible.

Solución:

```bash
npm install
```

---

## Utilizar un puerto diferente

Si el servidor utiliza el puerto `3000`, las peticiones deben dirigirse a:

```text
http://localhost:3000
```

---

## No utilizar `Content-Type`

Al enviar JSON mediante `POST`, debe indicarse:

```text
Content-Type: application/json
```

Por ejemplo:

```bash
curl -X POST http://localhost:3000/api/matches \
  -H "Content-Type: application/json" \
  -d '{"homeTeam":"Equipo A","awayTeam":"Equipo B","modality":"futbol"}'
```

---

## Enviar una modalidad no soportada

Solamente se aceptan:

```text
futbol
futbol-sala
```

---

# Limitaciones

La solución está diseñada para un ejercicio educativo.

No incluye:

- Base de datos.
- Autenticación.
- Autorización.
- Paginación.
- Filtros avanzados.
- Sistema de logs.
- Variables de entorno.
- Tests automatizados.
- Docker.
- Despliegue en la nube.

Agregar estas características aumentaría innecesariamente el alcance del ejercicio.

---

# Buenas prácticas aplicadas

## Separación de responsabilidades

Las rutas, controladores y servicios se encuentran separados.

## Validación de entrada

Los datos recibidos mediante `req.body` son validados antes de procesarse.

## Códigos HTTP coherentes

La API diferencia entre:

```text
200
201
400
404
```

según el resultado de la operación.

## Documentación reproducible

Los ejemplos del README pueden utilizarse directamente para instalar, ejecutar y probar la aplicación.

## Formato consistente de respuestas

Las respuestas utilizan una estructura predecible con:

```text
ok
message
data
```

cuando corresponde.

---

# ¿Qué hace que este README sea técnico?

Este README no solamente explica el objetivo del ejercicio.

También documenta:

```text
Proyecto
   │
   ├── Requisitos
   ├── Instalación
   ├── Ejecución
   ├── Estructura
   ├── Arquitectura
   ├── Endpoints
   ├── Parámetros
   ├── Validaciones
   ├── Códigos HTTP
   ├── Ejemplos JSON
   ├── Pruebas
   ├── Errores
   └── Limitaciones
```

Esto permite que otro desarrollador pueda utilizar el proyecto sin depender de explicaciones adicionales.

---

# Checklist final

- [ ] Proyecto Node.js creado.
- [ ] `package.json` incluido.
- [ ] Express instalado.
- [ ] Carpeta `src/` creada.
- [ ] Rutas separadas.
- [ ] Controladores separados.
- [ ] Servicios separados.
- [ ] Endpoint `/health`.
- [ ] Endpoint `GET /api/matches`.
- [ ] Endpoint `POST /api/matches`.
- [ ] Validación de campos obligatorios.
- [ ] Validación de modalidad.
- [ ] Respuestas HTTP coherentes.
- [ ] Manejo de rutas inexistentes.
- [ ] Datos iniciales.
- [ ] Ejemplos de JSON.
- [ ] Ejemplos de `curl`.
- [ ] Documentación de instalación.
- [ ] Documentación de ejecución.
- [ ] Documentación de arquitectura.
- [ ] Documentación de endpoints.
- [ ] Documentación de errores.
- [ ] Documentación de limitaciones.
- [ ] No se utiliza base de datos.
- [ ] No se utiliza Docker.
- [ ] No se suben dependencias generadas.
- [ ] La solución permanece dentro de `resoluciones/carlos-velasco/`.

---

# Resultado

El ejercicio demuestra que una API pequeña también necesita documentación técnica.

La aplicación permite gestionar de forma sencilla partidos de:

```text
Fútbol
Fútbol sala
```

y el README explica de manera reproducible cómo:

```text
Instalar
   ↓
Ejecutar
   ↓
Entender
   ↓
Consumir
   ↓
Probar
   ↓
Diagnosticar errores
```

---

# Resumen

En este ejercicio se construyó una API sencilla con Node.js y Express y se acompañó con un README técnico completo.

La arquitectura utilizada es:

```text
Routes
   ↓
Controllers
   ↓
Services
```

La API expone:

```text
GET  /health
GET  /api/matches
POST /api/matches
```

También implementa validaciones y códigos HTTP apropiados.

El concepto fundamental del ejercicio es que la documentación técnica debe permitir que otro desarrollador comprenda, instale, ejecute y pruebe un proyecto sin tener que descubrir su funcionamiento por ensayo y error.

Por esta razón, el README funciona como una guía técnica del proyecto y no solamente como una descripción general.