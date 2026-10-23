# BASICO 28 - Configuración por entorno

## Autor

**Velasco-c**

## Objetivo

Crear una pequeña API utilizando **Node.js** y **Express** que demuestre el uso de **configuración por entorno**.

La aplicación utiliza una temática de **battle royale** y obtiene diferentes valores de configuración mediante variables de entorno.

El objetivo principal es comprender cómo una aplicación puede cambiar determinados valores de configuración sin modificar directamente su código fuente.

---

## Concepto principal

Una aplicación backend normalmente necesita valores que pueden variar dependiendo del entorno donde se ejecuta.

Por ejemplo:

- Puerto del servidor.
- Nombre de la aplicación.
- Entorno de ejecución.
- URLs de servicios externos.
- Credenciales.
- Configuración de bases de datos.

No es recomendable colocar todos estos valores directamente en el código.

En este ejercicio se utilizan variables de entorno mediante:

```javascript
process.env
```

Por ejemplo:

```javascript
process.env.PORT
```

Esto permite que el mismo código pueda ejecutarse con diferentes configuraciones.

---

## ¿Qué es una variable de entorno?

Una variable de entorno es un valor proporcionado al proceso de la aplicación desde el entorno donde se está ejecutando.

Por ejemplo:

```text
PORT=3000
```

La aplicación puede acceder a este valor mediante:

```javascript
process.env.PORT
```

En este proyecto se utilizan las siguientes variables:

```text
NODE_ENV
PORT
API_NAME
```

---

## Variables utilizadas

### `NODE_ENV`

Indica el entorno en el que se está ejecutando la aplicación.

Valores permitidos:

```text
development
production
```

Ejemplo:

```text
NODE_ENV=development
```

---

### `PORT`

Indica el puerto donde Express levantará el servidor.

Ejemplo:

```text
PORT=3000
```

---

### `API_NAME`

Define el nombre utilizado por la aplicación.

Ejemplo:

```text
API_NAME=Battle Royale API
```

---

## Tecnologías utilizadas

- Node.js 20 o superior recomendado.
- Express.
- JavaScript.
- Variables de entorno.
- `process.env`.

No se utiliza:

- Base de datos.
- Docker.
- Servicios externos.
- Sistema de autenticación.
- Librerías adicionales para configuración.

El ejercicio se mantiene pequeño para concentrarse en el concepto de configuración por entorno.

---

## Estructura del proyecto

```text
basico/ejercicio-28/resoluciones/carlos-velasco/
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── config/
    │   └── env.js
    ├── controllers/
    │   └── match.controller.js
    ├── routes/
    │   └── match.routes.js
    └── services/
        └── match.service.js
```

---

## Responsabilidad de cada archivo

### `package.json`

Define:

- Información del proyecto.
- Dependencia de Express.
- Scripts de ejecución.

Scripts:

```json
{
  "scripts": {
    "start": "node src/app.js",
    "dev": "node --watch src/app.js"
  }
}
```

---

### `.env.example`

Documenta las variables de entorno que necesita el proyecto.

Contiene valores de ejemplo:

```text
NODE_ENV=development
PORT=3000
API_NAME=Battle Royale API
```

No debe utilizarse para almacenar secretos reales.

El archivo sirve como referencia para conocer qué variables necesita la aplicación.

---

### `.gitignore`

Evita subir archivos que no deben formar parte del repositorio.

Principalmente:

```text
node_modules/
.env
```

El archivo `.env` puede contener información específica o sensible del entorno y, por ello, no debe incluirse en el repositorio.

---

### `src/config/env.js`

Centraliza la configuración de la aplicación.

Lee:

```javascript
process.env.NODE_ENV
process.env.PORT
process.env.API_NAME
```

También proporciona valores predeterminados cuando las variables no están definidas.

Finalmente valida que:

- `NODE_ENV` sea un valor permitido.
- `PORT` sea un número entero.
- `PORT` esté dentro del rango válido de puertos.

De esta manera, el resto de la aplicación no necesita acceder directamente a cada variable de entorno.

---

### `src/app.js`

Es el punto de entrada de la aplicación.

Se encarga de:

- Crear la instancia de Express.
- Configurar el procesamiento de JSON.
- Utilizar la configuración del entorno.
- Crear el endpoint `/health`.
- Registrar las rutas.
- Manejar rutas inexistentes.
- Iniciar el servidor.

---

### `src/routes/match.routes.js`

Define las rutas relacionadas con las partidas.

Actualmente contiene:

```text
GET  /api/matches
POST /api/matches
```

---

### `src/controllers/match.controller.js`

Se encarga de:

- Recibir las peticiones HTTP.
- Leer `req.body`.
- Validar los datos recibidos.
- Solicitar operaciones al servicio.
- Construir las respuestas HTTP.

---

### `src/services/match.service.js`

Contiene la lógica relacionada con las partidas.

Los datos se almacenan temporalmente en memoria.

No existe una base de datos.

---

# Configuración por entorno

## Configuración predeterminada

Si no se proporcionan variables de entorno, la aplicación utiliza:

```text
NODE_ENV=development
PORT=3000
API_NAME=Battle Royale API
```

Estos valores están definidos como valores predeterminados dentro de:

```text
src/config/env.js
```

Esto permite iniciar la aplicación incluso cuando no se han definido variables de entorno manualmente.

---

## Usar variables directamente desde la terminal

Las variables pueden definirse antes de iniciar la aplicación.

En Linux/macOS:

```bash
NODE_ENV=production PORT=4000 API_NAME="Battle Royale Production API" npm start
```

En este caso:

```text
NODE_ENV = production
PORT = 4000
API_NAME = Battle Royale Production API
```

La misma aplicación se ejecutará en el puerto `4000` sin modificar el código fuente.

---

## Archivo `.env`

Un archivo `.env` normalmente puede utilizarse para almacenar variables de entorno durante el desarrollo.

Por ejemplo:

```text
NODE_ENV=development
PORT=3000
API_NAME=Battle Royale API
```

Sin embargo, este ejercicio **no utiliza `dotenv`**.

Node.js recibe las variables desde el entorno del proceso, por lo que no es necesario agregar una dependencia adicional solamente para demostrar el concepto.

El archivo:

```text
.env.example
```

se utiliza únicamente como plantilla y documentación.

Si se crea un `.env` local, este queda excluido mediante `.gitignore`.

> **Nota:** crear un archivo `.env` no hace que Node.js lo cargue automáticamente. En este ejercicio, las variables deben existir realmente en el entorno del proceso, por ejemplo, proporcionándolas desde la terminal.

---

# Instalación

Desde la carpeta del proyecto:

```bash
npm install
```

---

# Ejecución

## Desarrollo

Ejecutar:

```bash
npm run dev
```

La aplicación utilizará los valores predeterminados si no se proporcionan variables de entorno.

Resultado esperado:

```text
Battle Royale API ejecutándose en el puerto 3000
Entorno: development
```

---

## Ejecución con configuración diferente

También se puede iniciar la aplicación estableciendo variables antes del comando:

```bash
NODE_ENV=production PORT=4000 API_NAME="Battle Royale Production API" npm start
```

Resultado esperado:

```text
Battle Royale Production API ejecutándose en el puerto 4000
Entorno: production
```

La aplicación utiliza el mismo código fuente.

Lo único que cambió fue la configuración proporcionada al proceso.

---

# Endpoint de salud

## `GET /health`

Permite verificar:

- Que el servidor está funcionando.
- Qué entorno está utilizando.
- Qué nombre tiene la API.

Respuesta con la configuración predeterminada:

```json
{
  "ok": true,
  "message": "Servidor funcionando correctamente",
  "environment": "development",
  "apiName": "Battle Royale API"
}
```

Código HTTP:

```text
200 OK
```

---

# API de partidas

## Listar partidas

### `GET /api/matches`

Obtiene las partidas almacenadas en memoria.

Respuesta:

```json
{
  "ok": true,
  "message": "Partidas obtenidas correctamente",
  "data": [
    {
      "id": 1,
      "player": "Shadow",
      "location": "Island",
      "players": 42,
      "status": "waiting"
    },
    {
      "id": 2,
      "player": "Hunter",
      "location": "Desert",
      "players": 35,
      "status": "waiting"
    }
  ]
}
```

Código:

```text
200 OK
```

---

## Crear una partida

### `POST /api/matches`

Permite registrar una nueva partida.

Cuerpo esperado:

```json
{
  "player": "Storm",
  "location": "Jungle",
  "players": 50
}
```

Respuesta:

```json
{
  "ok": true,
  "message": "Partida creada correctamente",
  "data": {
    "id": 3,
    "player": "Storm",
    "location": "Jungle",
    "players": 50,
    "status": "waiting"
  }
}
```

Código:

```text
201 Created
```

---

# Validaciones

La creación de una partida requiere los siguientes campos:

```text
player
location
players
```

Los campos `player` y `location` deben estar presentes.

El campo `players` debe ser un número entero positivo.

---

## Error por campos faltantes

Petición:

```json
{
  "player": "Storm"
}
```

Respuesta:

```json
{
  "ok": false,
  "message": "Los campos player, location y players son obligatorios"
}
```

Código:

```text
400 Bad Request
```

---

## Error por cantidad de jugadores inválida

Petición:

```json
{
  "player": "Storm",
  "location": "Jungle",
  "players": 0
}
```

Respuesta:

```json
{
  "ok": false,
  "message": "El campo players debe ser un entero positivo"
}
```

Código:

```text
400 Bad Request
```

---

# Códigos HTTP utilizados

| Código | Significado | Uso |
|---|---|---|
| `200` | OK | Consultas exitosas |
| `201` | Created | Creación de una partida |
| `400` | Bad Request | Datos inválidos o faltantes |
| `404` | Not Found | Ruta inexistente |

---

# Pruebas manuales

Las siguientes pruebas deben realizarse con el servidor ejecutándose.

## 1. Probar configuración predeterminada

Ejecutar:

```bash
npm start
```

Resultado esperado:

```text
Battle Royale API ejecutándose en el puerto 3000
Entorno: development
```

Después consultar:

```bash
curl http://localhost:3000/health
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Servidor funcionando correctamente",
  "environment": "development",
  "apiName": "Battle Royale API"
}
```

---

## 2. Probar una configuración diferente

Detener el servidor anterior y ejecutar:

```bash
NODE_ENV=production PORT=4000 API_NAME="Battle Royale Production API" npm start
```

Resultado esperado:

```text
Battle Royale Production API ejecutándose en el puerto 4000
Entorno: production
```

Ahora consultar:

```bash
curl http://localhost:4000/health
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Servidor funcionando correctamente",
  "environment": "production",
  "apiName": "Battle Royale Production API"
}
```

Esta prueba demuestra el objetivo principal del ejercicio:

```text
Mismo código
     +
Configuración diferente
     =
Comportamiento configurado por entorno
```

---

## 3. Listar partidas

Con el servidor ejecutándose en el puerto `4000`:

```bash
curl http://localhost:4000/api/matches
```

Si se está utilizando el puerto predeterminado:

```bash
curl http://localhost:3000/api/matches
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Partidas obtenidas correctamente",
  "data": [
    {
      "id": 1,
      "player": "Shadow",
      "location": "Island",
      "players": 42,
      "status": "waiting"
    },
    {
      "id": 2,
      "player": "Hunter",
      "location": "Desert",
      "players": 35,
      "status": "waiting"
    }
  ]
}
```

---

## 4. Crear una partida

Con el servidor en el puerto `3000`:

```bash
curl -X POST http://localhost:3000/api/matches \
  -H "Content-Type: application/json" \
  -d '{"player":"Storm","location":"Jungle","players":50}'
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Partida creada correctamente",
  "data": {
    "id": 3,
    "player": "Storm",
    "location": "Jungle",
    "players": 50,
    "status": "waiting"
  }
}
```

Código esperado:

```text
201
```

---

## 5. Probar validación

Ejecutar:

```bash
curl -X POST http://localhost:3000/api/matches \
  -H "Content-Type: application/json" \
  -d '{"player":"Storm"}'
```

Respuesta:

```json
{
  "ok": false,
  "message": "Los campos player, location y players son obligatorios"
}
```

Código esperado:

```text
400
```

---

## 6. Probar cantidad de jugadores inválida

Ejecutar:

```bash
curl -X POST http://localhost:3000/api/matches \
  -H "Content-Type: application/json" \
  -d '{"player":"Storm","location":"Jungle","players":0}'
```

Respuesta esperada:

```json
{
  "ok": false,
  "message": "El campo players debe ser un entero positivo"
}
```

Código esperado:

```text
400
```

---

## 7. Probar una ruta inexistente

Ejecutar:

```bash
curl http://localhost:3000/api/unknown
```

Respuesta:

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

---

# Flujo de configuración

La configuración sigue este flujo:

```text
Variables de entorno
        │
        ▼
    process.env
        │
        ▼
  src/config/env.js
        │
        ├── NODE_ENV
        ├── PORT
        └── API_NAME
        │
        ▼
     src/app.js
        │
        ▼
      Express
        │
        ▼
   Servidor HTTP
```

La ventaja es que los módulos de la aplicación no necesitan conocer directamente cómo se obtiene cada configuración.

---

# Ventajas de la configuración por entorno

## Separar código y configuración

El código permanece igual mientras determinados valores cambian.

Por ejemplo:

```text
Código
  +
PORT=3000
```

puede utilizarse durante desarrollo, mientras que el mismo código puede ejecutarse con:

```text
Código
  +
PORT=4000
```

en otro entorno.

---

## Facilitar diferentes entornos

Por ejemplo:

```text
development
production
```

pueden utilizar diferentes configuraciones.

---

## Evitar valores sensibles dentro del código

Información como contraseñas, tokens o credenciales puede proporcionarse mediante variables de entorno en proyectos reales.

> **Importante:** las variables de entorno no garantizan por sí mismas una gestión segura de secretos. En aplicaciones reales también deben considerarse mecanismos como gestores de secretos, permisos del sistema y políticas de despliegue.

---

## Facilitar despliegues

Un mismo código puede desplegarse en diferentes entornos proporcionando diferentes variables.

Por ejemplo:

```text
Desarrollo
PORT=3000

Producción
PORT=4000
```

No es necesario modificar `src/app.js` para cambiar el puerto.

---

# Validación de configuración

El archivo:

```text
src/config/env.js
```

no solamente lee las variables.

También valida la configuración.

Por ejemplo, solamente acepta:

```text
development
production
```

para `NODE_ENV`.

También comprueba que `PORT` sea un puerto válido:

```text
1 - 65535
```

Si se proporciona una configuración inválida, la aplicación detiene su inicialización mostrando el error.

Esto evita iniciar la aplicación con una configuración incorrecta.

---

# Manejo de rutas inexistentes

La aplicación incluye un middleware final:

```javascript
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "Ruta no encontrada"
  });
});
```

Si una ruta no existe, la aplicación responde:

```json
{
  "ok": false,
  "message": "Ruta no encontrada"
}
```

con:

```text
404 Not Found
```

---

# Persistencia de datos

Las partidas se almacenan en memoria dentro de:

```text
src/services/match.service.js
```

Esto significa que los datos:

- No se almacenan en una base de datos.
- Se pierden cuando se detiene el proceso.
- Se reinician cuando vuelve a iniciar la aplicación.

Esta decisión es intencional porque el objetivo del ejercicio es trabajar con **configuración por entorno**, no con persistencia de datos.

---

# Limitaciones

Este ejercicio está diseñado para demostrar el concepto básico de configuración por entorno.

No incluye:

- Base de datos.
- Secret managers.
- Docker.
- Kubernetes.
- Sistemas de configuración distribuidos.
- Configuración compleja.
- Librerías externas para configuración.
- Carga automática de archivos `.env`.
- Persistencia de partidas.

En un proyecto real pueden utilizarse herramientas adicionales dependiendo de la infraestructura y de los requisitos de seguridad.

---

# Resultado esperado

La solución demuestra:

- Creación de una API con Express.
- Separación entre rutas, controladores y servicios.
- Configuración centralizada.
- Uso de `process.env`.
- Configuración mediante variables de entorno.
- Diferenciación entre `development` y `production`.
- Configuración del puerto.
- Configuración del nombre de la API.
- Valores predeterminados.
- Validación de variables de entorno.
- Manejo de errores de configuración.
- Validación básica de datos HTTP.
- Uso correcto de códigos HTTP.
- Documentación técnica.

---

# Checklist final

- [ ] Proyecto Node.js creado.
- [ ] `package.json` incluido.
- [ ] Express instalado.
- [ ] Carpeta `src/` creada.
- [ ] Carpeta `src/config/` creada.
- [ ] Configuración centralizada.
- [ ] Uso de `process.env`.
- [ ] Variable `NODE_ENV`.
- [ ] Variable `PORT`.
- [ ] Variable `API_NAME`.
- [ ] Valores predeterminados.
- [ ] Validación de `NODE_ENV`.
- [ ] Validación de `PORT`.
- [ ] `.env.example` incluido.
- [ ] `.env` excluido mediante `.gitignore`.
- [ ] `node_modules/` excluido.
- [ ] Endpoint `/health`.
- [ ] Rutas separadas.
- [ ] Controladores separados.
- [ ] Servicios separados.
- [ ] Validación de datos de entrada.
- [ ] Manejo de `400 Bad Request`.
- [ ] Manejo de `404 Not Found`.
- [ ] README incluido.
- [ ] No se utiliza base de datos.
- [ ] No se utiliza Docker.
- [ ] La solución permanece dentro de `resoluciones/carlos-velasco/`.

---

# Resumen

En este ejercicio se construyó una API pequeña relacionada con **battle royale** utilizando Node.js y Express.

El concepto principal fue la **configuración por entorno**.

La aplicación obtiene su configuración mediante:

```javascript
process.env
```

y la centraliza mediante:

```text
src/config/env.js
```

Las variables principales son:

```text
NODE_ENV
PORT
API_NAME
```

Esto permite ejecutar el mismo código con configuraciones diferentes:

```text
development
     │
     ├── PORT=3000
     └── API_NAME=Battle Royale API

production
     │
     ├── PORT=4000
     └── API_NAME=Battle Royale Production API
```

La idea fundamental es separar:

```text
Código de la aplicación
        +
Configuración del entorno
```

De esta manera, cambiar el entorno no requiere modificar directamente el código fuente.