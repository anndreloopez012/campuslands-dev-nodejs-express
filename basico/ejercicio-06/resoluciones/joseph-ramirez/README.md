# BASICO 06 - path y rutas seguras

## Autor

Joseph Ramirez

## Temática

Motos y mecánica.

## Objetivo

Crear una API básica con Node.js y Express para practicar el módulo nativo `path` y la construcción segura de rutas hacia archivos.

El proyecto utiliza información de motos y fichas técnicas almacenadas en archivos locales.

El objetivo principal es aprender a construir rutas de archivos mediante `path.join()` y validar los nombres recibidos antes de utilizarlos.

---

## Tecnologías utilizadas

* Node.js
* Express
* JavaScript
* CommonJS
* `path`
* `fs/promises`
* JSON

Se recomienda Node.js 20 o superior.

---

# Estructura del proyecto

```text
joseph-ramirez/
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
├── data/
│   ├── motorcycles.json
│   └── fichas/
│       ├── honda-cb500.txt
│       ├── yamaha-mt07.txt
│       └── kawasaki-ninja400.txt
└── src/
    ├── app.js
    ├── routes/
    │   └── motorcycles.routes.js
    ├── controllers/
    │   └── motorcycles.controller.js
    └── services/
        └── motorcycles.service.js
```

---

# Responsabilidad de cada archivo

## `src/app.js`

Es el punto de entrada de la aplicación.

Se encarga de:

* Crear el servidor Express.
* Configurar JSON.
* Registrar las rutas.
* Crear `/health`.
* Manejar rutas inexistentes.
* Iniciar el servidor.

---

## `src/routes/motorcycles.routes.js`

Define las rutas relacionadas con las motos.

Endpoints:

```text
GET /motorcycles
GET /motorcycles/ficha/:fileName
```

---

## `src/controllers/motorcycles.controller.js`

Se encarga de recibir las peticiones HTTP y construir las respuestas.

No contiene directamente la lógica para construir las rutas de archivos.

---

## `src/services/motorcycles.service.js`

Contiene la lógica principal del ejercicio.

Aquí se utilizan:

```javascript
const path = require("path");
```

y:

```javascript
path.join()
```

para construir las rutas de los archivos.

También utiliza:

```javascript
path.basename()
```

para validar el nombre del archivo recibido.

---

## `data/motorcycles.json`

Contiene los datos de las motos.

---

## `data/fichas/`

Contiene las fichas técnicas que pueden ser consultadas mediante la API.

---

# Instalación

Ubicarse dentro de:

```text
basico/ejercicio-06/resoluciones/joseph-ramirez/
```

Instalar las dependencias:

```bash
npm install
```

La dependencia principal utilizada es Express.

No se debe subir:

```text
node_modules/
```

al repositorio.

---

# Ejecución

## Modo normal

Ejecutar:

```bash
npm start
```

Debe aparecer un mensaje similar a:

```text
Servidor ejecutandose en http://localhost:3000
```

---

## Modo desarrollo

Ejecutar:

```bash
npm run dev
```

Este comando utiliza:

```text
node --watch
```

para reiniciar automáticamente el servidor cuando se detectan cambios.

---

# Verificación de sintaxis

Ejecutar:

```bash
npm run check
```

Si no existen errores de sintaxis, el comando termina correctamente.

---

# Endpoints

## 1. Health check

Endpoint:

```http
GET /health
```

Con `curl`:

```bash
curl http://localhost:3000/health
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "path y rutas seguras"
}
```

---

# 2. Obtener todas las motos

Endpoint:

```http
GET /motorcycles
```

Con `curl`:

```bash
curl http://localhost:3000/motorcycles
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Motos obtenidas correctamente",
  "total": 3,
  "data": [
    {
      "id": 1,
      "nombre": "Honda CB500",
      "marca": "Honda",
      "cilindraje": 500,
      "tipo": "Naked",
      "ficha": "honda-cb500.txt"
    },
    {
      "id": 2,
      "nombre": "Yamaha MT-07",
      "marca": "Yamaha",
      "cilindraje": 689,
      "tipo": "Naked",
      "ficha": "yamaha-mt07.txt"
    },
    {
      "id": 3,
      "nombre": "Kawasaki Ninja 400",
      "marca": "Kawasaki",
      "cilindraje": 399,
      "tipo": "Deportiva",
      "ficha": "kawasaki-ninja400.txt"
    }
  ]
}
```

---

# 3. Obtener una ficha técnica

Endpoint:

```http
GET /motorcycles/ficha/honda-cb500.txt
```

Con `curl`:

```bash
curl http://localhost:3000/motorcycles/ficha/honda-cb500.txt
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Ficha tecnica obtenida correctamente",
  "data": {
    "fileName": "honda-cb500.txt",
    "content": "Honda CB500\n\nMotor: Bicilindrico\nCilindraje: 500 cc\nUso recomendado: Ciudad y carretera\nMantenimiento: Cambio de aceite y revision general cada intervalo recomendado.\n"
  }
}
```

También se pueden probar:

```text
/motorcycles/ficha/yamaha-mt07.txt
```

y:

```text
/motorcycles/ficha/kawasaki-ninja400.txt
```

---

# 4. Probar una ficha inexistente

Realizar:

```bash
curl http://localhost:3000/motorcycles/ficha/ducati-panigale.txt
```

La API debe responder con:

```text
404
```

y un JSON similar a:

```json
{
  "ok": false,
  "message": "No fue posible encontrar la ficha tecnica"
}
```

Esto demuestra que el servidor controla el caso en el que el archivo solicitado no existe.

---

# 5. Probar una ruta de archivo no permitida

Una parte importante del ejercicio es evitar que una entrada externa se utilice directamente para construir rutas de archivos.

Se puede realizar una petición intentando utilizar:

```text
../
```

Por ejemplo:

```bash
curl "http://localhost:3000/motorcycles/ficha/../motorcycles.json"
```

Dependiendo del cliente HTTP utilizado, la normalización de la URL puede modificar la petición antes de que llegue a Express.

Por eso también se puede utilizar una petición codificada:

```bash
curl "http://localhost:3000/motorcycles/ficha/%2E%2E%2Fmotorcycles.json"
```

La aplicación debe rechazar el nombre de archivo que intente utilizar una ruta diferente a un nombre de archivo permitido.

Respuesta esperada:

```text
400
```

con:

```json
{
  "ok": false,
  "message": "Ruta de archivo no permitida"
}
```

---

# ¿Qué significa una ruta segura?

Una ruta insegura sería construir una ruta utilizando directamente una entrada recibida:

```javascript
const filePath = dataDirectory + "/" + fileName;
```

Esto puede provocar problemas porque `fileName` puede contener segmentos de ruta.

Por ejemplo:

```text
../archivo.txt
```

podría intentar salir de la carpeta esperada.

En este ejercicio se utiliza:

```javascript
const safeFileName = path.basename(fileName);
```

y se valida que el nombre recibido sea exactamente el nombre de archivo esperado.

Después:

```javascript
const filePath = path.join(fichasDirectory, safeFileName);
```

construye la ruta utilizando las herramientas proporcionadas por Node.js.

---

# `path.join()`

`path.join()` permite unir segmentos de una ruta de forma adecuada para el sistema operativo.

Ejemplo:

```javascript
const filePath = path.join(
  fichasDirectory,
  safeFileName
);
```

En este proyecto permite construir una ruta como:

```text
data/fichas/honda-cb500.txt
```

sin tener que concatenar manualmente las barras `/`.

---

# `path.basename()`

`path.basename()` devuelve la última parte de una ruta.

Por ejemplo:

```javascript
path.basename("honda-cb500.txt");
```

devuelve:

```text
honda-cb500.txt
```

Si se recibe una entrada como:

```text
../motorcycles.json
```

`basename()` permite identificar la parte final:

```text
motorcycles.json
```

Por eso el proyecto compara el resultado con el valor original:

```javascript
if (safeFileName !== fileName) {
```

Si son diferentes, significa que la entrada original contenía una estructura de ruta y no únicamente un nombre de archivo.

---

# Flujo de una petición

Cuando se solicita:

```text
GET /motorcycles/ficha/honda-cb500.txt
```

el flujo es:

```text
Cliente
   │
   ▼
GET /motorcycles/ficha/honda-cb500.txt
   │
   ▼
motorcycles.routes.js
   │
   ▼
motorcycles.controller.js
   │
   ▼
motorcycles.service.js
   │
   ▼
path.basename()
   │
   ▼
Validación
   │
   ▼
path.join()
   │
   ▼
data/fichas/honda-cb500.txt
   │
   ▼
fs.readFile()
   │
   ▼
Respuesta JSON
```

---

# Códigos HTTP utilizados

| Código | Situación                              |
| -----: | -------------------------------------- |
|    200 | Petición realizada correctamente       |
|    400 | Nombre de archivo o ruta no permitida  |
|    404 | Ruta o archivo inexistente             |
|    500 | Error interno al procesar una petición |

---

# Pruebas recomendadas

Para considerar el ejercicio completo se deben comprobar como mínimo:

```text
GET /health
GET /motorcycles
GET /motorcycles/ficha/honda-cb500.txt
GET /motorcycles/ficha/yamaha-mt07.txt
GET /motorcycles/ficha/kawasaki-ninja400.txt
GET /motorcycles/ficha/archivo-inexistente.txt
GET /motorcycles/ficha/%2E%2E%2Fmotorcycles.json
```

Las primeras consultas deben funcionar correctamente.

La ficha inexistente debe producir `404`.

La ruta no permitida debe producir `400`.

---

# Diferencia entre `path` y `fs`

En este ejercicio se utilizan ambos módulos, pero cumplen funciones diferentes.

## `path`

Se utiliza para trabajar con rutas:

```javascript
path.join()
path.basename()
```

## `fs`

Se utiliza para trabajar con archivos:

```javascript
fs.readFile()
```

Por lo tanto:

```text
path
→ construye y analiza rutas

fs
→ lee el contenido de los archivos
```

El objetivo principal de BASICO 06 es comprender cómo `path` ayuda a trabajar de forma correcta y controlada con las rutas de archivos.

---

# Checklist de validación

La entrega está correcta si:

* [x] Tiene `package.json`.
* [x] Tiene `README.md`.
* [x] Tiene carpeta `src/`.
* [x] Utiliza Express.
* [x] Utiliza el módulo `path`.
* [x] Utiliza `path.join()`.
* [x] Utiliza `path.basename()`.
* [x] Utiliza `fs.readFile()`.
* [x] Tiene rutas, controladores y servicios separados.
* [x] Tiene datos sintéticos.
* [x] Tiene fichas técnicas en archivos separados.
* [x] Tiene `/health`.
* [x] Tiene `/motorcycles`.
* [x] Permite consultar una ficha.
* [x] Maneja archivos inexistentes.
* [x] Valida rutas de archivos.
* [x] Maneja errores HTTP.
* [x] Tiene scripts `start`, `dev` y `check`.
* [x] No utiliza una base de datos externa.
* [x] No incluye `node_modules/`.

---

# Reglas de entrega

La solución debe permanecer dentro de:

```text
basico/ejercicio-06/resoluciones/joseph-ramirez/
```

No modificar archivos base del ejercicio.

No eliminar entregas de otros estudiantes.

No subir:

```text
node_modules/
```

No subir archivos `.env` con secretos reales.

Si se realiza un Pull Request, debe dirigirse a:

```text
dev
```

y no a:

```text
main
```

---

# Resultado esperado

Al finalizar, la API debe demostrar que se comprende:

```text
path.join()
path.basename()
```

y cómo utilizarlos antes de acceder a archivos.

El flujo principal del ejercicio es:

```text
Entrada del usuario
       ↓
Validación
       ↓
path.basename()
       ↓
path.join()
       ↓
Ruta segura
       ↓
fs.readFile()
       ↓
Respuesta HTTP
```

El concepto central de BASICO 06 es trabajar con **rutas de archivos de forma segura**, manteniendo la lógica dentro de la capa de servicios.
