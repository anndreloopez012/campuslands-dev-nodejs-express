# BASICO 25 - Respuestas HTTP correctas

## Autor

**Velasco-c**

## Objetivo

Crear una API HTTP pequeña utilizando **Node.js** y **Express** para practicar el uso correcto de los códigos de estado HTTP en un escenario relacionado con videojuegos RPG.

El ejercicio utiliza una API de personajes RPG para demostrar que una petición HTTP debe responder con un código de estado coherente según el resultado de la operación.

La aplicación permite:

- Listar personajes RPG.
- Consultar un personaje por ID.
- Crear personajes.
- Actualizar personajes.
- Eliminar personajes.
- Manejar errores de validación.
- Manejar recursos inexistentes.
- Utilizar diferentes códigos de estado HTTP según cada situación.

---

## Concepto principal

El objetivo principal del ejercicio es comprender que una API no debe responder siempre con `200 OK`.

Cada respuesta HTTP debe indicar correctamente el resultado de la operación.

En esta implementación se utilizan principalmente:

| Código | Significado | Uso |
|---|---|---|
| `200` | OK | Consulta y actualización exitosas. |
| `201` | Created | Creación exitosa. |
| `204` | No Content | Eliminación exitosa sin contenido. |
| `400` | Bad Request | Datos de entrada inválidos. |
| `404` | Not Found | Recurso o ruta inexistente. |

---

## Temática

La API utiliza personajes de videojuegos RPG.

Cada personaje contiene:

- `id`
- `name`
- `class`
- `level`

Ejemplo:

```json
{
  "id": 1,
  "name": "Arthas",
  "class": "Paladín",
  "level": 45
}
```

---

## Tecnologías utilizadas

- Node.js 20 o superior recomendado.
- Express.
- JavaScript.
- API HTTP.
- JSON.

No se utiliza una base de datos externa.

Los datos se almacenan temporalmente en memoria.

---

# Estructura del proyecto

```text
basico/ejercicio-25/resoluciones/carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── controllers/
    │   └── character.controller.js
    ├── routes/
    │   └── character.routes.js
    └── services/
        └── character.service.js
```

---

## Responsabilidad de cada archivo

### `src/app.js`

Es el punto de entrada de la aplicación.

Se encarga de:

- Crear la aplicación Express.
- Habilitar `express.json()`.
- Registrar el endpoint `/health`.
- Registrar las rutas de personajes.
- Manejar rutas inexistentes.
- Iniciar el servidor.

---

### `src/routes/character.routes.js`

Define las rutas relacionadas con los personajes RPG.

Las rutas reciben las peticiones HTTP y delegan su procesamiento al controlador correspondiente.

---

### `src/controllers/character.controller.js`

Se encarga de la comunicación HTTP.

Sus responsabilidades incluyen:

- Leer parámetros de ruta.
- Leer el cuerpo de las peticiones.
- Validar datos.
- Invocar los servicios.
- Seleccionar el código HTTP adecuado.
- Construir las respuestas JSON.

---

### `src/services/character.service.js`

Contiene la lógica para trabajar con los personajes.

Se encarga de:

- Listar personajes.
- Buscar personajes.
- Crear personajes.
- Actualizar personajes.
- Eliminar personajes.

Los datos permanecen temporalmente en memoria.

---

# Instalación

## 1. Entrar al directorio de la solución

Desde la raíz del repositorio:

```bash
cd basico/ejercicio-25/resoluciones/carlos-velasco
```

## 2. Instalar las dependencias

```bash
npm install
```

---

# Ejecución

## Modo normal

```bash
npm start
```

## Modo desarrollo

Si el proyecto tiene configurado un script `dev`:

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

Este endpoint permite verificar que el servidor está funcionando correctamente.

### Solicitud

```bash
curl http://localhost:3000/health
```

### Respuesta esperada

```json
{
  "ok": true,
  "message": "API de videojuegos RPG funcionando correctamente"
}
```

### Código HTTP

```text
200 OK
```

---

# Endpoints

## `GET /api/characters`

Obtiene todos los personajes RPG.

### Solicitud

```bash
curl http://localhost:3000/api/characters
```

### Respuesta esperada

```json
{
  "ok": true,
  "data": [
    {
      "id": 1,
      "name": "Arthas",
      "class": "Paladín",
      "level": 45
    },
    {
      "id": 2,
      "name": "Lyra",
      "class": "Maga",
      "level": 32
    },
    {
      "id": 3,
      "name": "Gorn",
      "class": "Guerrero",
      "level": 28
    }
  ]
}
```

### Código HTTP

```text
200 OK
```

---

## `GET /api/characters/:id`

Obtiene un personaje específico mediante su ID.

### Ejemplo

```bash
curl http://localhost:3000/api/characters/1
```

### Respuesta esperada

```json
{
  "ok": true,
  "data": {
    "id": 1,
    "name": "Arthas",
    "class": "Paladín",
    "level": 45
  }
}
```

### Código HTTP

```text
200 OK
```

---

## `POST /api/characters`

Crea un nuevo personaje RPG.

Los campos requeridos son:

- `name`
- `class`
- `level`

### Solicitud

```bash
curl -X POST http://localhost:3000/api/characters \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Selena",
    "class": "Arquera",
    "level": 20
  }'
```

### Respuesta esperada

```json
{
  "ok": true,
  "message": "Personaje RPG creado correctamente",
  "data": {
    "id": 4,
    "name": "Selena",
    "class": "Arquera",
    "level": 20
  }
}
```

### Código HTTP

```text
201 Created
```

Se utiliza `201 Created` porque la operación creó correctamente un nuevo recurso.

---

## `PUT /api/characters/:id`

Actualiza un personaje existente.

### Ejemplo

```bash
curl -X PUT http://localhost:3000/api/characters/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Arthas",
    "class": "Caballero de la Muerte",
    "level": 50
  }'
```

### Respuesta esperada

```json
{
  "ok": true,
  "message": "Personaje RPG actualizado correctamente",
  "data": {
    "id": 1,
    "name": "Arthas",
    "class": "Caballero de la Muerte",
    "level": 50
  }
}
```

### Código HTTP

```text
200 OK
```

Se utiliza `200 OK` porque la actualización fue procesada correctamente y la respuesta contiene el recurso actualizado.

---

## `DELETE /api/characters/:id`

Elimina un personaje.

### Ejemplo

```bash
curl -X DELETE http://localhost:3000/api/characters/3
```

### Respuesta esperada

```text
204 No Content
```

No se devuelve un objeto JSON porque `204 No Content` indica que la operación fue procesada correctamente y que la respuesta no contiene contenido.

Este endpoint demuestra una diferencia importante frente a ejercicios donde las operaciones exitosas podían devolver siempre `200 OK`.

---

# Validaciones

## ID inválido

El ID debe ser un número entero positivo.

### Ejemplo

```bash
curl http://localhost:3000/api/characters/abc
```

### Respuesta esperada

```json
{
  "ok": false,
  "message": "El ID debe ser un número entero positivo"
}
```

### Código HTTP

```text
400 Bad Request
```

---

## Personaje inexistente

Si se consulta un personaje que no existe:

```bash
curl http://localhost:3000/api/characters/999
```

### Respuesta esperada

```json
{
  "ok": false,
  "message": "Personaje RPG no encontrado"
}
```

### Código HTTP

```text
404 Not Found
```

El mismo criterio se aplica al intentar actualizar o eliminar un personaje inexistente.

---

# Validación de creación

Para crear un personaje son obligatorios los campos:

- `name`
- `class`
- `level`

Si faltan campos obligatorios:

```bash
curl -X POST http://localhost:3000/api/characters \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nuevo personaje"
  }'
```

### Respuesta esperada

```json
{
  "ok": false,
  "message": "Los campos name, class y level son obligatorios"
}
```

### Código HTTP

```text
400 Bad Request
```

---

# Validación del nivel

El campo `level` debe ser un número entero mayor o igual a `1`.

### Ejemplo incorrecto

```bash
curl -X POST http://localhost:3000/api/characters \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Personaje inválido",
    "class": "Mago",
    "level": 0
  }'
```

### Respuesta esperada

```json
{
  "ok": false,
  "message": "El nivel debe ser mayor o igual a 1"
}
```

### Código HTTP

```text
400 Bad Request
```

---

# Ruta inexistente

Si se solicita una ruta que no existe:

```bash
curl http://localhost:3000/api/otra-ruta
```

### Respuesta esperada

```json
{
  "ok": false,
  "message": "Ruta no encontrada"
}
```

### Código HTTP

```text
404 Not Found
```

---

# Tabla general de respuestas HTTP

| Situación | Método | Código HTTP |
|---|---|---:|
| Health check correcto | `GET` | `200` |
| Listar personajes | `GET` | `200` |
| Obtener personaje existente | `GET` | `200` |
| Crear personaje | `POST` | `201` |
| Actualizar personaje | `PUT` | `200` |
| Eliminar personaje | `DELETE` | `204` |
| ID inválido | `GET`, `PUT`, `DELETE` | `400` |
| Datos inválidos | `POST`, `PUT` | `400` |
| Personaje inexistente | `GET`, `PUT`, `DELETE` | `404` |
| Ruta inexistente | Cualquier método | `404` |

---

# Flujo de una petición

La arquitectura utiliza el siguiente flujo:

```text
Cliente
   │
   │ HTTP Request
   ▼
Ruta
   │
   ▼
Controlador
   │
   ▼
Servicio
   │
   ▼
Datos en memoria
   │
   ▼
Servicio
   │
   ▼
Controlador
   │
   │ HTTP Response
   ▼
Cliente
```

El controlador es responsable de interpretar el resultado de la operación y seleccionar el código HTTP correspondiente.

---

# Ejemplo conceptual

Una petición para crear un personaje:

```http
POST /api/characters
```

Si los datos son correctos:

```text
201 Created
```

Si faltan datos:

```text
400 Bad Request
```

Una petición para consultar un personaje existente:

```http
GET /api/characters/1
```

Respuesta:

```text
200 OK
```

Una petición para consultar un personaje inexistente:

```http
GET /api/characters/999
```

Respuesta:

```text
404 Not Found
```

Una petición para eliminar correctamente un personaje:

```http
DELETE /api/characters/3
```

Respuesta:

```text
204 No Content
```

La diferencia entre estos códigos representa el objetivo principal del ejercicio.

---

# Pruebas manuales

Las pruebas pueden realizarse utilizando:

- `curl`.
- Postman.
- Thunder Client.
- Navegador para las peticiones `GET`.

Se recomienda ejecutar las siguientes pruebas.

---

## 1. Verificar el servidor

```bash
curl http://localhost:3000/health
```

### Resultado esperado

```text
200 OK
```

---

## 2. Listar personajes

```bash
curl http://localhost:3000/api/characters
```

### Resultado esperado

```text
200 OK
```

Debe mostrar los personajes iniciales.

---

## 3. Consultar personaje existente

```bash
curl http://localhost:3000/api/characters/1
```

### Resultado esperado

```text
200 OK
```

---

## 4. Consultar personaje inexistente

```bash
curl http://localhost:3000/api/characters/999
```

### Resultado esperado

```text
404 Not Found
```

---

## 5. Crear personaje

```bash
curl -X POST http://localhost:3000/api/characters \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Selena",
    "class": "Arquera",
    "level": 20
  }'
```

### Resultado esperado

```text
201 Created
```

---

## 6. Crear personaje con datos incompletos

```bash
curl -X POST http://localhost:3000/api/characters \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Personaje incompleto"
  }'
```

### Resultado esperado

```text
400 Bad Request
```

---

## 7. Actualizar personaje

```bash
curl -X PUT http://localhost:3000/api/characters/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Arthas",
    "class": "Caballero de la Muerte",
    "level": 50
  }'
```

### Resultado esperado

```text
200 OK
```

---

## 8. Eliminar personaje

```bash
curl -X DELETE http://localhost:3000/api/characters/3
```

### Resultado esperado

```text
204 No Content
```

---

## 9. Probar una ruta inexistente

```bash
curl http://localhost:3000/api/ruta-inexistente
```

### Resultado esperado

```text
404 Not Found
```

---

# Datos iniciales

La API comienza con tres personajes:

| ID | Nombre | Clase | Nivel |
|---:|---|---|---:|
| `1` | Arthas | Paladín | `45` |
| `2` | Lyra | Maga | `32` |
| `3` | Gorn | Guerrero | `28` |

Estos datos se encuentran en:

```text
src/services/character.service.js
```

---

# Persistencia

El ejercicio utiliza datos almacenados en memoria.

Por lo tanto:

- No utiliza MySQL.
- No utiliza MongoDB.
- No utiliza PostgreSQL.
- No requiere una base de datos.
- No requiere Docker.
- Los cambios realizados desaparecen al reiniciar el servidor.

Esto permite concentrar el ejercicio en el manejo correcto de las respuestas HTTP.

---

# Errores comunes evitados

La implementación busca evitar los siguientes errores:

- Responder `200 OK` para todas las operaciones.
- Utilizar `201 Created` para una consulta.
- Utilizar `200 OK` cuando un recurso no existe.
- Ignorar los errores de validación.
- No distinguir entre una petición inválida y un recurso inexistente.
- Devolver contenido junto con `204 No Content`.
- Colocar toda la lógica en `app.js`.
- No documentar los códigos HTTP utilizados.
- No proporcionar ejemplos para probar los endpoints.

---

# Resultado esperado

Al finalizar el ejercicio, la API debe demostrar que cada operación utiliza un código HTTP coherente con su resultado.

El resultado principal debe ser:

```text
GET exitoso       → 200 OK
POST exitoso      → 201 Created
PUT exitoso       → 200 OK
DELETE exitoso    → 204 No Content
Datos inválidos   → 400 Bad Request
No encontrado     → 404 Not Found
```

---

# Checklist final

- [ ] Proyecto Node.js creado.
- [ ] Express configurado.
- [ ] `package.json` creado.
- [ ] Carpeta `src/` creada.
- [ ] Separación entre rutas, controladores y servicios.
- [ ] Endpoint `/health`.
- [ ] API de personajes RPG.
- [ ] Uso de `200 OK`.
- [ ] Uso de `201 Created`.
- [ ] Uso de `204 No Content`.
- [ ] Uso de `400 Bad Request`.
- [ ] Uso de `404 Not Found`.
- [ ] Validación de IDs.
- [ ] Validación de datos.
- [ ] Validación del nivel.
- [ ] Manejo de recursos inexistentes.
- [ ] Manejo de rutas inexistentes.
- [ ] Ejemplos de peticiones documentados.
- [ ] Pruebas manuales realizadas.
- [ ] README incluido.
- [ ] No se utiliza base de datos externa.
- [ ] No se requiere Docker.
- [ ] `node_modules/` no debe subirse al repositorio.
- [ ] La solución está dentro de la carpeta personal.

---

# Resumen

Este ejercicio implementa una API básica de videojuegos RPG utilizando **Node.js y Express**.

El objetivo principal es practicar el uso correcto de los códigos de estado HTTP y comprender que cada respuesta debe representar adecuadamente el resultado de la operación solicitada.

La aplicación utiliza la siguiente arquitectura:

```text
routes
   ↓
controllers
   ↓
services
   ↓
datos en memoria
```

Las principales respuestas HTTP utilizadas son:

```text
200 → operación exitosa con contenido
201 → recurso creado correctamente
204 → operación exitosa sin contenido
400 → petición inválida
404 → recurso o ruta no encontrada
```

De esta forma se practica una característica fundamental del desarrollo de APIs HTTP: utilizar códigos de estado que describan correctamente el resultado de cada petición.