# BASICO 20 - middleware express.json

## Descripción

Este ejercicio practica el uso del middleware `express.json()` en una API construida con Node.js y Express.

La temática utilizada es **dibujo digital**.

El objetivo principal es comprender cómo Express recibe información JSON enviada por un cliente y cómo esa información queda disponible mediante `req.body`.

---

## Conceptos practicados

* Node.js.
* Express.
* Middleware.
* `express.json()`.
* `req.body`.
* Rutas `GET`.
* Rutas `POST`.
* Controladores.
* Servicios.
* Validación básica.
* Códigos HTTP.
* JSON.
* Organización de una API.

---

## Tecnologías utilizadas

* Node.js
* Express
* JavaScript
* npm

Se recomienda utilizar Node.js 20 o superior.

---

## Estructura del proyecto

```text
joseph-ramirez/
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
└── src/
    ├── app.js
    ├── controllers/
    │   └── drawings.controller.js
    ├── routes/
    │   └── drawings.routes.js
    └── services/
        └── drawings.service.js
```

---

# Instalación

Desde la carpeta del ejercicio ejecutar:

```bash
npm install
```

---

# Ejecución

Para iniciar el servidor:

```bash
npm start
```

También se puede ejecutar utilizando `node --watch`:

```bash
npm run dev
```

El servidor estará disponible en:

```text
http://localhost:3000
```

---

# Verificación de sintaxis

Para verificar la sintaxis del archivo principal:

```bash
npm run check
```

---

# Endpoint de salud

## GET /health

Permite verificar que el servidor está funcionando.

### Prueba

```bash
curl http://localhost:3000/health
```

### Respuesta esperada

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "middleware express.json"
}
```

---

# Endpoint de dibujos

## GET /drawings

Obtiene todos los dibujos digitales registrados.

### Prueba

```bash
curl http://localhost:3000/drawings
```

La respuesta contiene los dibujos almacenados en memoria.

---

# Crear un dibujo

## POST /drawings

Este endpoint permite crear un nuevo dibujo digital.

La información se envía mediante JSON.

### Petición

```bash
curl -X POST http://localhost:3000/drawings \
-H "Content-Type: application/json" \
-d '{
  "titulo": "Robot Futurista",
  "artista": "Joseph Ramirez",
  "software": "Krita",
  "categoria": "Concept Art",
  "completado": false
}'
```

---

## ¿Qué significa Content-Type?

En la petición anterior se utiliza:

```text
Content-Type: application/json
```

Esto indica al servidor que el cuerpo de la petición contiene información en formato JSON.

La cabecera es importante porque Express necesita identificar correctamente el formato de los datos recibidos.

---

# ¿Qué hace express.json()?

En `src/app.js` se encuentra:

```javascript
app.use(express.json());
```

`express.json()` es un middleware incluido en Express.

Su función es analizar las peticiones que contienen JSON y convertir ese contenido para que podamos acceder a él mediante:

```javascript
req.body
```

Por ejemplo, si el cliente envía:

```json
{
  "titulo": "Robot Futurista",
  "artista": "Joseph Ramirez",
  "software": "Krita",
  "categoria": "Concept Art",
  "completado": false
}
```

el controlador puede acceder a los datos mediante:

```javascript
const {
  titulo,
  artista,
  software,
  categoria,
  completado
} = req.body;
```

---

# req.body

`req.body` contiene la información enviada dentro del cuerpo de la petición.

En este ejercicio:

```javascript
req.body
```

puede contener:

```json
{
  "titulo": "Robot Futurista",
  "artista": "Joseph Ramirez",
  "software": "Krita",
  "categoria": "Concept Art",
  "completado": false
}
```

Después podemos acceder a cada propiedad:

```javascript
req.body.titulo
```

```javascript
req.body.artista
```

```javascript
req.body.software
```

```javascript
req.body.categoria
```

```javascript
req.body.completado
```

---

# Flujo de una petición POST

Cuando el cliente envía:

```text
POST /drawings
```

el flujo es:

```text
Cliente
   ↓
POST /drawings
   ↓
express.json()
   ↓
req.body
   ↓
drawings.routes.js
   ↓
drawings.controller.js
   ↓
Validaciones
   ↓
drawings.service.js
   ↓
Crear dibujo
   ↓
Respuesta JSON
```

El middleware `express.json()` se ejecuta antes de llegar al controlador porque fue registrado mediante:

```javascript
app.use(express.json());
```

---

# Crear otro dibujo

Se puede probar con:

```bash
curl -X POST http://localhost:3000/drawings \
-H "Content-Type: application/json" \
-d '{
  "titulo": "Paisaje Espacial",
  "artista": "Maria Lopez",
  "software": "Photoshop",
  "categoria": "Paisaje",
  "completado": true
}'
```

Otro ejemplo:

```bash
curl -X POST http://localhost:3000/drawings \
-H "Content-Type: application/json" \
-d '{
  "titulo": "Personaje Medieval",
  "artista": "Carlos Perez",
  "software": "Procreate",
  "categoria": "Personaje",
  "completado": false
}'
```

---

# Verificar los dibujos creados

Después de realizar los `POST`, ejecutar:

```bash
curl http://localhost:3000/drawings
```

Los nuevos dibujos deben aparecer junto con los datos iniciales.

---

# Validaciones

El endpoint `POST /drawings` valida los datos recibidos.

Los campos requeridos son:

```text
titulo
artista
software
categoria
completado
```

---

## Validación del título

Si no se envía `titulo`:

```bash
curl -X POST http://localhost:3000/drawings \
-H "Content-Type: application/json" \
-d '{
  "artista": "Joseph Ramirez",
  "software": "Krita",
  "categoria": "Concept Art",
  "completado": false
}'
```

Debe responder con código:

```text
400
```

y un mensaje indicando que el título es obligatorio.

---

## Validación del artista

Probar:

```bash
curl -X POST http://localhost:3000/drawings \
-H "Content-Type: application/json" \
-d '{
  "titulo": "Dibujo de prueba",
  "software": "Krita",
  "categoria": "Personaje",
  "completado": false
}'
```

Debe responder:

```text
400
```

---

## Validación del software

Probar:

```bash
curl -X POST http://localhost:3000/drawings \
-H "Content-Type: application/json" \
-d '{
  "titulo": "Dibujo de prueba",
  "artista": "Joseph Ramirez",
  "categoria": "Personaje",
  "completado": false
}'
```

Debe responder:

```text
400
```

---

## Validación de categoría

Probar:

```bash
curl -X POST http://localhost:3000/drawings \
-H "Content-Type: application/json" \
-d '{
  "titulo": "Dibujo de prueba",
  "artista": "Joseph Ramirez",
  "software": "Krita",
  "completado": false
}'
```

Debe responder:

```text
400
```

---

## Validación de completado

El campo `completado` debe ser booleano.

Este ejemplo es incorrecto:

```bash
curl -X POST http://localhost:3000/drawings \
-H "Content-Type: application/json" \
-d '{
  "titulo": "Dibujo de prueba",
  "artista": "Joseph Ramirez",
  "software": "Krita",
  "categoria": "Personaje",
  "completado": "false"
}'
```

El valor:

```text
"false"
```

es un texto, no un booleano.

Debe utilizarse:

```json
"completado": false
```

sin comillas.

La petición incorrecta debe responder:

```text
400
```

---

# Petición válida

Una petición correcta debe utilizar:

```json
{
  "titulo": "Retrato Digital",
  "artista": "Joseph Ramirez",
  "software": "Procreate",
  "categoria": "Retrato",
  "completado": true
}
```

Y debe responder con:

```text
201 Created
```

---

# Código de estado 201

Cuando se crea correctamente un recurso mediante `POST`, el controlador responde:

```javascript
res.status(201).json(...)
```

El código:

```text
201 Created
```

indica que el recurso fue creado correctamente.

---

# Probar JSON inválido

También se puede probar qué ocurre cuando se envía un JSON mal formado.

Ejemplo:

```bash
curl -X POST http://localhost:3000/drawings \
-H "Content-Type: application/json" \
-d '{"titulo":"Dibujo incompleto"'
```

La información enviada no es un JSON válido.

Express no podrá procesar correctamente el cuerpo de la petición.

La respuesta puede producir un error de análisis del JSON antes de llegar al controlador.

Este comportamiento demuestra una de las funciones importantes de `express.json()`.

---

# Diferencia entre req.body, req.params y req.query

En ejercicios anteriores se trabajó con:

```javascript
req.params
```

y:

```javascript
req.query
```

Ahora se practica:

```javascript
req.body
```

### req.params

Forma parte de la ruta:

```text
/drawings/5
```

Ejemplo:

```javascript
req.params.id
```

---

### req.query

Se utiliza para parámetros de consulta:

```text
/drawings?categoria=Paisaje
```

Ejemplo:

```javascript
req.query.categoria
```

---

### req.body

Se utiliza para recibir información enviada dentro del cuerpo de la petición:

```json
{
  "titulo": "Paisaje Digital",
  "artista": "Joseph Ramirez"
}
```

Ejemplo:

```javascript
req.body.titulo
```

---

# Separación de responsabilidades

## app.js

Se encarga de:

* Crear la aplicación Express.
* Registrar `express.json()`.
* Registrar las rutas.
* Crear `/health`.
* Manejar rutas inexistentes.
* Iniciar el servidor.

---

## drawings.routes.js

Define las rutas:

```text
GET /
POST /
```

No contiene la lógica principal del negocio.

---

## drawings.controller.js

Se encarga de:

* Leer `req.body`.
* Validar los datos.
* Llamar al servicio.
* Generar las respuestas HTTP.

---

## drawings.service.js

Se encarga de:

* Mantener los datos.
* Obtener dibujos.
* Crear dibujos.

---

# Pruebas con Postman o Thunder Client

También se pueden realizar las pruebas desde Postman o Thunder Client.

## GET

```text
GET http://localhost:3000/health
```

## Obtener dibujos

```text
GET http://localhost:3000/drawings
```

## Crear dibujo

```text
POST http://localhost:3000/drawings
```

Seleccionar:

```text
Body
→ raw
→ JSON
```

Enviar:

```json
{
  "titulo": "Robot Futurista",
  "artista": "Joseph Ramirez",
  "software": "Krita",
  "categoria": "Concept Art",
  "completado": false
}
```

---

# Ruta inexistente

Probar:

```bash
curl http://localhost:3000/digital-art
```

Debe responder:

```json
{
  "ok": false,
  "status": 404,
  "message": "Ruta no encontrada"
}
```

---

# Códigos HTTP utilizados

| Código | Significado                      |
| ------ | -------------------------------- |
| 200    | Petición procesada correctamente |
| 201    | Recurso creado correctamente     |
| 400    | Datos enviados incorrectamente   |
| 404    | Ruta no encontrada               |

---

# Checklist final

Antes de entregar:

* [ ] Existe `package.json`.
* [ ] Express está instalado.
* [ ] Existe `src/app.js`.
* [ ] Existe `routes/`.
* [ ] Existe `controllers/`.
* [ ] Existe `services/`.
* [ ] Existe `README.md`.
* [ ] Existe `.gitignore`.
* [ ] `express.json()` está configurado.
* [ ] `GET /health` funciona.
* [ ] `GET /drawings` funciona.
* [ ] `POST /drawings` funciona.
* [ ] Se utiliza `req.body`.
* [ ] Se valida el título.
* [ ] Se valida el artista.
* [ ] Se valida el software.
* [ ] Se valida la categoría.
* [ ] Se valida `completado`.
* [ ] Las peticiones válidas devuelven `201`.
* [ ] Las peticiones inválidas devuelven `400`.
* [ ] Las rutas inexistentes devuelven `404`.
* [ ] `npm install` funciona.
* [ ] `npm start` funciona.
* [ ] `npm run dev` funciona.
* [ ] `npm run check` funciona.
* [ ] `node_modules/` no se sube.
* [ ] No se modificaron archivos base.
* [ ] No se modificaron entregas de otros estudiantes.
* [ ] La entrega está dentro de `resoluciones/joseph-ramirez/`.
* [ ] El PR apunta a `dev`.

---

# Git

Cuando todas las pruebas funcionen correctamente:

```bash
git status
```

Agregar únicamente la carpeta del ejercicio:

```bash
git add basico/ejercicio-20/resoluciones/joseph-ramirez/
```

Crear el commit:

```bash
git commit -m "feat: resolver basico 20 middleware express json"
```

Subir la rama:

```bash
git push -u origin alumno/joseph-ramirez/ejercicio-20
```

Crear el Pull Request:

```text
alumno/joseph-ramirez/ejercicio-20 → dev
```

No crear el Pull Request hacia `main`.

Después de crear el PR:

```bash
git switch dev
git pull origin dev
```
