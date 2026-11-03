# BASICO 27 - Logs simples

## Autor

**Velasco-c**

## Objetivo

Crear una pequeña API HTTP utilizando Node.js y Express para practicar la implementación de **logs simples mediante un middleware**.

La API utiliza una temática de **MOBA esports** y registra información básica sobre las peticiones y respuestas HTTP realizadas contra el servidor.

El objetivo principal no es construir un sistema de logging avanzado, sino comprender cómo observar el comportamiento de una API mientras se ejecuta.

---

## Concepto principal

Un **log** es un registro de información generada por una aplicación durante su ejecución.

Los logs pueden utilizarse para:

- Observar qué está haciendo una aplicación.
- Detectar errores.
- Saber qué rutas están siendo utilizadas.
- Conocer los métodos HTTP recibidos.
- Identificar los códigos de respuesta.
- Medir aproximadamente cuánto tarda una petición.
- Facilitar la depuración durante el desarrollo.

En este ejercicio se implementa un middleware de Express que registra cada petición HTTP.

---

## ¿Qué se registra?

El middleware registra dos eventos principales.

### 1. Inicio de la petición

Cuando llega una petición al servidor se registra:

- Fecha y hora.
- Método HTTP.
- URL solicitada.

Ejemplo:

```text
[REQUEST] 2026-10-01T14:00:00.000Z GET /api/matches
```

### 2. Finalización de la respuesta

Cuando Express termina de enviar la respuesta se registra:

- Fecha y hora.
- Método HTTP.
- URL.
- Código de estado HTTP.
- Tiempo aproximado de procesamiento.

Ejemplo:

```text
[RESPONSE] 2026-10-01T14:00:00.015Z GET /api/matches 200 - 15ms
```

---

## Tecnologías utilizadas

- Node.js 20 o superior recomendado.
- Express.
- JavaScript.
- HTTP.
- Middleware.
- `console.log()` para los logs.

No se utiliza:

- Base de datos.
- Sistema externo de logging.
- Docker.
- Variables de entorno.
- Librerías adicionales de logging.

La intención es mantener el ejercicio pequeño y centrado en el concepto de logs simples.

---

## Estructura del proyecto

```text
basico/ejercicio-27/resoluciones/carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── controllers/
    │   └── match.controller.js
    ├── middlewares/
    │   └── logger.middleware.js
    ├── routes/
    │   └── match.routes.js
    └── services/
        └── match.service.js
```

---

## Responsabilidad de cada archivo

### `src/app.js`

Es el punto de entrada de la aplicación.

Se encarga de:

- Crear la aplicación Express.
- Configurar `express.json()`.
- Registrar el middleware de logs.
- Crear `/health`.
- Registrar las rutas de partidas.
- Manejar rutas inexistentes.
- Iniciar el servidor.

---

### `src/middlewares/logger.middleware.js`

Contiene el middleware encargado de registrar las peticiones HTTP.

Registra:

```text
Método HTTP
URL
Fecha y hora
Código de respuesta
Tiempo de procesamiento
```

Utiliza:

```javascript
res.on("finish", ...)
```

para ejecutar el registro final cuando la respuesta HTTP ha terminado.

---

### `src/routes/match.routes.js`

Define las rutas relacionadas con las partidas de MOBA.

Actualmente contiene:

```text
GET  /api/matches
POST /api/matches
```

---

### `src/controllers/match.controller.js`

Se encarga de recibir las peticiones HTTP y construir las respuestas.

También realiza la validación básica de los datos recibidos.

---

### `src/services/match.service.js`

Contiene la lógica relacionada con las partidas.

Los datos se almacenan temporalmente en memoria mediante un arreglo de JavaScript.

No existe persistencia en una base de datos.

---

# Instalación

Desde la carpeta del proyecto:

```bash
npm install
```

Esto instala las dependencias definidas en `package.json`.

---

# Ejecución

Para iniciar la aplicación:

```bash
npm start
```

También se puede utilizar el modo desarrollo:

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

Permite comprobar rápidamente que el servidor está funcionando.

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Servidor funcionando correctamente"
}
```

Código HTTP:

```text
200 OK
```

Al realizar esta petición también aparecerán logs en la terminal.

Ejemplo:

```text
[REQUEST] 2026-10-01T14:00:00.000Z GET /health
[RESPONSE] 2026-10-01T14:00:00.005Z GET /health 200 - 5ms
```

---

# API de partidas

## Listar partidas

### `GET /api/matches`

Obtiene todas las partidas disponibles en memoria.

Respuesta:

```json
{
  "ok": true,
  "message": "Partidas obtenidas correctamente",
  "data": [
    {
      "id": 1,
      "teamA": "Dragons",
      "teamB": "Titans",
      "map": "Summoners Rift",
      "status": "scheduled"
    },
    {
      "id": 2,
      "teamA": "Phoenix",
      "teamB": "Wolves",
      "map": "Summoners Rift",
      "status": "scheduled"
    }
  ]
}
```

Código HTTP:

```text
200 OK
```

---

## Crear una partida

### `POST /api/matches`

Permite registrar una nueva partida.

El cuerpo debe contener:

```json
{
  "teamA": "Dragons",
  "teamB": "Titans",
  "map": "Summoners Rift"
}
```

Respuesta exitosa:

```json
{
  "ok": true,
  "message": "Partida creada correctamente",
  "data": {
    "id": 3,
    "teamA": "Dragons",
    "teamB": "Titans",
    "map": "Summoners Rift",
    "status": "scheduled"
  }
}
```

Código HTTP:

```text
201 Created
```

---

## Validación de creación

Los siguientes campos son obligatorios:

```text
teamA
teamB
map
```

Si falta alguno, la API responde:

```json
{
  "ok": false,
  "message": "Los campos teamA, teamB y map son obligatorios"
}
```

Código HTTP:

```text
400 Bad Request
```

---

# Middleware de logs

El middleware se registra en `app.js` mediante:

```javascript
app.use(loggerMiddleware);
```

Esto significa que el middleware se ejecuta para las peticiones que pasan por la aplicación después de su registro.

La implementación utiliza:

```javascript
const startTime = Date.now();
```

para guardar el momento en que comienza la petición.

Después utiliza:

```javascript
res.on("finish", () => {
  // log de respuesta
});
```

para detectar cuándo la respuesta HTTP ha finalizado.

El tiempo se calcula mediante:

```javascript
const duration = Date.now() - startTime;
```

---

## Ejemplo de logs

Al iniciar el servidor:

```text
Servidor ejecutándose en http://localhost:3000
```

Después de solicitar:

```text
GET /health
```

se puede observar algo similar a:

```text
[REQUEST] 2026-10-01T14:00:00.000Z GET /health
[RESPONSE] 2026-10-01T14:00:00.005Z GET /health 200 - 5ms
```

Al solicitar:

```text
GET /api/matches
```

se puede observar:

```text
[REQUEST] 2026-10-01T14:01:00.000Z GET /api/matches
[RESPONSE] 2026-10-01T14:01:00.004Z GET /api/matches 200 - 4ms
```

Si se intenta crear una partida sin todos los campos:

```text
[REQUEST] 2026-10-01T14:02:00.000Z POST /api/matches
[RESPONSE] 2026-10-01T14:02:00.003Z POST /api/matches 400 - 3ms
```

Esto demuestra que el logger también permite observar respuestas con errores HTTP.

---

# Pruebas manuales

Las siguientes pruebas permiten comprobar tanto la API como los logs generados.

## 1. Comprobar el servidor

Ejecutar:

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

En la terminal del servidor deben aparecer dos logs:

```text
[REQUEST] ... GET /health
[RESPONSE] ... GET /health 200 - ...ms
```

---

## 2. Listar partidas

Ejecutar:

```bash
curl http://localhost:3000/api/matches
```

Debe responder con:

```json
{
  "ok": true,
  "message": "Partidas obtenidas correctamente",
  "data": [
    {
      "id": 1,
      "teamA": "Dragons",
      "teamB": "Titans",
      "map": "Summoners Rift",
      "status": "scheduled"
    },
    {
      "id": 2,
      "teamA": "Phoenix",
      "teamB": "Wolves",
      "map": "Summoners Rift",
      "status": "scheduled"
    }
  ]
}
```

Código esperado:

```text
200
```

También deben aparecer los logs correspondientes en la terminal.

---

## 3. Crear una partida correctamente

Ejecutar:

```bash
curl -X POST http://localhost:3000/api/matches \
  -H "Content-Type: application/json" \
  -d '{"teamA":"Dragons","teamB":"Titans","map":"Summoners Rift"}'
```

Debe devolver:

```json
{
  "ok": true,
  "message": "Partida creada correctamente",
  "data": {
    "id": 3,
    "teamA": "Dragons",
    "teamB": "Titans",
    "map": "Summoners Rift",
    "status": "scheduled"
  }
}
```

Código esperado:

```text
201
```

En la terminal también debe aparecer un registro parecido a:

```text
[REQUEST] ... POST /api/matches
[RESPONSE] ... POST /api/matches 201 - ...ms
```

---

## 4. Probar una validación

Ejecutar:

```bash
curl -X POST http://localhost:3000/api/matches \
  -H "Content-Type: application/json" \
  -d '{"teamA":"Dragons"}'
```

Debe devolver:

```json
{
  "ok": false,
  "message": "Los campos teamA, teamB y map son obligatorios"
}
```

Código esperado:

```text
400
```

El middleware debe registrar también esta respuesta:

```text
[REQUEST] ... POST /api/matches
[RESPONSE] ... POST /api/matches 400 - ...ms
```

---

## 5. Probar una ruta inexistente

Ejecutar:

```bash
curl http://localhost:3000/api/unknown
```

Debe responder:

```json
{
  "ok": false,
  "message": "Ruta no encontrada"
}
```

Código esperado:

```text
404
```

También debe aparecer el log correspondiente en la terminal.

---

# Flujo de una petición

El flujo general de una petición es:

```text
Cliente
   │
   ▼
Express
   │
   ▼
Logger Middleware
   │
   ├── registra REQUEST
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
Controller
   │
   ▼
Response
   │
   ▼
Logger Middleware
   │
   └── registra RESPONSE
```

De esta forma, el middleware puede observar la petición sin colocar código de logging dentro de cada controlador.

---

# Códigos HTTP utilizados

| Código | Significado | Uso |
|---|---|---|
| `200` | OK | Consultas exitosas |
| `201` | Created | Creación de una partida |
| `400` | Bad Request | Datos obligatorios faltantes |
| `404` | Not Found | Ruta inexistente |

---

# Validaciones implementadas

La API valida que al crear una partida existan:

```text
teamA
teamB
map
```

Si falta alguno de estos campos, se devuelve:

```text
400 Bad Request
```

No se utilizan validadores externos porque el ejercicio solamente requiere una validación básica.

---

# Manejo de errores

La aplicación maneja principalmente:

### Datos incompletos

Respuesta:

```text
400 Bad Request
```

### Ruta inexistente

Respuesta:

```text
404 Not Found
```

El middleware registra ambos tipos de respuestas.

Esto permite que los logs sean útiles también cuando ocurre un error esperado.

---

# ¿Por qué utilizar un middleware?

El logging es una preocupación transversal de la aplicación.

Si cada controlador tuviera que escribir manualmente:

```javascript
console.log(req.method);
console.log(req.originalUrl);
console.log(res.statusCode);
```

se produciría código repetido.

Con un middleware:

```javascript
app.use(loggerMiddleware);
```

se centraliza esta responsabilidad.

Esto permite mantener los controladores enfocados principalmente en procesar las peticiones y construir las respuestas.

---

# Limitaciones

Este ejercicio implementa únicamente **logs simples**.

No incluye:

- Archivos de logs.
- Rotación de logs.
- Logs estructurados.
- Niveles como `INFO`, `WARN` o `ERROR`.
- Winston.
- Pino.
- Sistemas externos de observabilidad.
- Persistencia de logs.
- Elasticsearch.
- Grafana.
- OpenTelemetry.

Estas herramientas pueden utilizarse en proyectos reales, pero agregar infraestructura de ese tipo estaría fuera del objetivo de este ejercicio básico integrador.

---

# Resultado esperado

La solución demuestra:

- Creación de una API con Express.
- Organización mediante rutas, controladores y servicios.
- Uso de middleware.
- Registro de peticiones HTTP.
- Registro de respuestas HTTP.
- Registro del código de estado.
- Medición básica del tiempo de respuesta.
- Validación básica de datos.
- Uso coherente de códigos HTTP.
- Manejo de rutas inexistentes.
- Documentación técnica.
- Pruebas manuales mediante `curl`.

---

# Checklist final

- [x] Proyecto Node.js creado.
- [x] `package.json` incluido.
- [x] Express instalado.
- [x] Carpeta `src/` creada.
- [x] Rutas separadas.
- [x] Controladores separados.
- [x] Servicios separados.
- [x] Middleware de logging creado.
- [x] Logs de inicio de petición.
- [x] Logs de finalización de respuesta.
- [x] Método HTTP registrado.
- [x] URL registrada.
- [x] Código HTTP registrado.
- [x] Tiempo aproximado registrado.
- [x] Validación básica implementada.
- [x] Endpoint `/health` implementado.
- [x] Manejo de rutas inexistentes.
- [x] README incluido.
- [x] No se utiliza base de datos.
- [x] No se utiliza Docker.
- [x] No se incluyen dependencias generadas.
- [x] La solución permanece dentro de `resoluciones/carlos-velasco/`.

---

# Resumen

En este ejercicio se construyó una API pequeña de MOBA esports utilizando Node.js y Express.

El concepto principal fue la implementación de **logs simples mediante middleware**.

El middleware permite registrar automáticamente:

```text
REQUEST
   ↓
Método + URL + fecha
   ↓
Procesamiento de la petición
   ↓
RESPONSE
   ↓
Método + URL + status + duración
```

La solución mantiene una separación sencilla entre:

```text
Routes
   ↓
Controllers
   ↓
Services
```

y utiliza un middleware transversal para el registro de actividad HTTP.

Con esto se practica una pieza fundamental del backend: **poder observar qué está ocurriendo dentro de una API mientras recibe y procesa peticiones**.