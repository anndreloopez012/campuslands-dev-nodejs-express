# BASICO 30 - Proyecto integrador básico

## Autor

**Velasco-c**

---

# 1. Objetivo

Crear una pequeña API REST utilizando **Node.js** y **Express** para gestionar información básica de motos dentro de un escenario relacionado con motos y mecánica.

El proyecto integra los conceptos trabajados durante los ejercicios anteriores:

- Estructura de un proyecto Node.js.
- Uso de Express.
- Rutas HTTP.
- Controladores.
- Servicios.
- Datos almacenados en memoria.
- `req.params`.
- `req.body`.
- Validación de datos.
- Códigos de estado HTTP.
- Respuestas JSON.
- Manejo de errores.
- Documentación técnica.

La aplicación implementa un **CRUD básico de motos** sin utilizar una base de datos externa.

---

# 2. Concepto principal

El ejercicio funciona como un proyecto integrador básico.

La aplicación recibe peticiones HTTP, las dirige mediante las rutas hacia un controlador y el controlador utiliza un servicio para trabajar con los datos.

El flujo principal es:

```text
Cliente HTTP
    |
    v
Routes
    |
    v
Controller
    |
    v
Service
    |
    v
Datos en memoria
```

Cada capa tiene una responsabilidad específica.

---

# 3. Temática

La temática utilizada es:

**Motos y mecánica**

La API permite registrar motos y controlar de manera básica su estado de mantenimiento.

Cada moto contiene:

- Marca.
- Modelo.
- Año.
- Tipo.
- Estado de mantenimiento.

---

# 4. Tecnologías utilizadas

- Node.js 20 o superior recomendado.
- Express.
- JavaScript.
- JSON.
- HTTP.
- npm.

No se utiliza:

- Base de datos.
- Docker.
- Docker Compose.
- ORM.
- Autenticación.
- Dependencias innecesarias.

El objetivo es mantener el proyecto pequeño y concentrarse en los fundamentos de una API REST.

---

# 5. Estructura del proyecto

```text
carlos-velasco/
├── package.json
├── package-lock.json
├── README.md
└── src/
    ├── app.js
    ├── controllers/
    │   └── motorcycle.controller.js
    ├── routes/
    │   └── motorcycle.routes.js
    └── services/
        └── motorcycle.service.js
```

---

# 6. Responsabilidad de los archivos

## `src/app.js`

Es el punto de entrada de la aplicación.

Responsabilidades:

- Crear la aplicación Express.
- Habilitar `express.json()`.
- Configurar `/health`.
- Registrar las rutas de motos.
- Manejar rutas inexistentes.
- Iniciar el servidor HTTP.

---

## `src/routes/motorcycle.routes.js`

Define las rutas HTTP relacionadas con las motos.

Responsabilidad:

- Asociar métodos HTTP con controladores.

No contiene lógica de negocio.

---

## `src/controllers/motorcycle.controller.js`

Gestiona las peticiones y respuestas HTTP.

Responsabilidades:

- Leer `req.params`.
- Leer `req.body`.
- Validar los datos recibidos.
- Solicitar operaciones al servicio.
- Seleccionar códigos de estado HTTP.
- Construir respuestas JSON.

El controlador no mantiene directamente la colección de motos.

---

## `src/services/motorcycle.service.js`

Contiene la lógica relacionada con los datos.

Responsabilidades:

- Obtener motos.
- Buscar una moto.
- Crear una moto.
- Actualizar una moto.
- Eliminar una moto.

Los datos se almacenan únicamente en memoria.

---

# 7. Instalación

Desde la carpeta del proyecto:

```bash
npm install
```

Esto instala las dependencias declaradas en `package.json`.

---

# 8. Ejecución

## Modo normal

Para ejecutar la aplicación:

```bash
npm start
```

Resultado esperado:

```text
Servidor ejecutándose en http://localhost:3000
```

---

## Modo desarrollo

También existe un script de desarrollo utilizando `node --watch`:

```bash
npm run dev
```

El servidor queda disponible en:

```text
http://localhost:3000
```

---

# 9. Endpoint de salud

## `GET /health`

Permite comprobar que el servidor está funcionando.

### Petición

```bash
curl http://localhost:3000/health
```

### Respuesta esperada

```json
{
  "ok": true,
  "message": "Servidor funcionando correctamente",
  "topic": "proyecto integrador basico"
}
```

### Código HTTP

```text
200 OK
```

---

# 10. API de motos

La ruta base es:

```text
/api/motorcycles
```

---

## 10.1 Listar todas las motos

### `GET /api/motorcycles`

Obtiene todas las motos almacenadas en memoria.

### Prueba

```bash
curl http://localhost:3000/api/motorcycles
```

### Respuesta esperada

```json
{
  "ok": true,
  "message": "Motos obtenidas correctamente",
  "data": [
    {
      "id": 1,
      "brand": "Yamaha",
      "model": "MT-07",
      "year": 2024,
      "type": "Naked",
      "maintenanceStatus": "pendiente"
    },
    {
      "id": 2,
      "brand": "Honda",
      "model": "CBR500R",
      "year": 2023,
      "type": "Deportiva",
      "maintenanceStatus": "realizado"
    }
  ]
}
```

### Código HTTP

```text
200 OK
```

---

## 10.2 Obtener una moto por ID

### `GET /api/motorcycles/:id`

El identificador se recibe mediante `req.params`.

### Ejemplo

```bash
curl http://localhost:3000/api/motorcycles/1
```

### Respuesta esperada

```json
{
  "ok": true,
  "message": "Moto obtenida correctamente",
  "data": {
    "id": 1,
    "brand": "Yamaha",
    "model": "MT-07",
    "year": 2024,
    "type": "Naked",
    "maintenanceStatus": "pendiente"
  }
}
```

### Código HTTP

```text
200 OK
```

---

## 10.3 Crear una moto

### `POST /api/motorcycles`

La información se envía mediante JSON en `req.body`.

### Ejemplo

```bash
curl -X POST http://localhost:3000/api/motorcycles \
  -H "Content-Type: application/json" \
  -d '{
    "brand": "Kawasaki",
    "model": "Ninja 400",
    "year": 2024,
    "type": "Deportiva",
    "maintenanceStatus": "pendiente"
  }'
```

### Respuesta esperada

```json
{
  "ok": true,
  "message": "Moto creada correctamente",
  "data": {
    "id": 3,
    "brand": "Kawasaki",
    "model": "Ninja 400",
    "year": 2024,
    "type": "Deportiva",
    "maintenanceStatus": "pendiente"
  }
}
```

### Código HTTP

```text
201 Created
```

---

## 10.4 Actualizar una moto

### `PUT /api/motorcycles/:id`

Actualiza la información de una moto existente.

### Ejemplo

```bash
curl -X PUT http://localhost:3000/api/motorcycles/1 \
  -H "Content-Type: application/json" \
  -d '{
    "brand": "Yamaha",
    "model": "MT-07",
    "year": 2025,
    "type": "Naked",
    "maintenanceStatus": "realizado"
  }'
```

### Respuesta esperada

```json
{
  "ok": true,
  "message": "Moto actualizada correctamente",
  "data": {
    "id": 1,
    "brand": "Yamaha",
    "model": "MT-07",
    "year": 2025,
    "type": "Naked",
    "maintenanceStatus": "realizado"
  }
}
```

### Código HTTP

```text
200 OK
```

---

## 10.5 Eliminar una moto

### `DELETE /api/motorcycles/:id`

Elimina una moto existente.

### Ejemplo

```bash
curl -X DELETE http://localhost:3000/api/motorcycles/2
```

### Respuesta esperada

```json
{
  "ok": true,
  "message": "Moto eliminada correctamente",
  "data": {
    "id": 2,
    "brand": "Honda",
    "model": "CBR500R",
    "year": 2023,
    "type": "Deportiva",
    "maintenanceStatus": "realizado"
  }
}
```

### Código HTTP

```text
200 OK
```

---

# 11. Campos de una moto

Cada moto utiliza la siguiente estructura:

```json
{
  "brand": "Yamaha",
  "model": "MT-07",
  "year": 2024,
  "type": "Naked",
  "maintenanceStatus": "pendiente"
}
```

## `brand`

Marca de la motocicleta.

Tipo:

```text
string
```

Obligatorio:

```text
Sí
```

---

## `model`

Modelo de la motocicleta.

Tipo:

```text
string
```

Obligatorio:

```text
Sí
```

---

## `year`

Año de fabricación de la motocicleta.

Tipo:

```text
integer
```

Debe ser un año válido entre `1900` y el siguiente año calendario.

---

## `type`

Tipo de motocicleta.

Tipo:

```text
string
```

Ejemplos:

```text
Naked
Deportiva
Cruiser
Enduro
Touring
```

El proyecto solamente comprueba que sea un texto no vacío.

---

## `maintenanceStatus`

Estado básico del mantenimiento.

Valores permitidos:

```text
pendiente
realizado
```

---

# 12. Validaciones

La API realiza validaciones antes de crear o actualizar una moto.

Se comprueba que:

- `brand` exista.
- `brand` sea texto.
- `model` exista.
- `model` sea texto.
- `year` sea un número entero.
- `year` esté dentro del rango permitido.
- `type` exista.
- `type` sea texto.
- `maintenanceStatus` sea `pendiente` o `realizado`.
- El `id` de las rutas sea un entero positivo.

---

# 13. Pruebas de validación

## 13.1 Crear una moto sin marca

### Prueba

```bash
curl -X POST http://localhost:3000/api/motorcycles \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Ninja 400",
    "year": 2024,
    "type": "Deportiva",
    "maintenanceStatus": "pendiente"
  }'
```

### Respuesta esperada

```json
{
  "ok": false,
  "message": "brand es obligatorio y debe ser texto"
}
```

### Código HTTP

```text
400 Bad Request
```

---

## 13.2 Estado de mantenimiento inválido

### Prueba

```bash
curl -X POST http://localhost:3000/api/motorcycles \
  -H "Content-Type: application/json" \
  -d '{
    "brand": "Suzuki",
    "model": "GSX-8R",
    "year": 2024,
    "type": "Deportiva",
    "maintenanceStatus": "pendiente-revision"
  }'
```

### Respuesta esperada

```json
{
  "ok": false,
  "message": "maintenanceStatus debe ser \"pendiente\" o \"realizado\""
}
```

### Código HTTP

```text
400 Bad Request
```

---

## 13.3 Buscar una moto inexistente

### Prueba

```bash
curl http://localhost:3000/api/motorcycles/999
```

### Respuesta esperada

```json
{
  "ok": false,
  "message": "Moto no encontrada"
}
```

### Código HTTP

```text
404 Not Found
```

---

## 13.4 ID inválido

### Prueba

```bash
curl http://localhost:3000/api/motorcycles/abc
```

### Respuesta esperada

```json
{
  "ok": false,
  "message": "El id debe ser un número entero positivo"
}
```

### Código HTTP

```text
400 Bad Request
```

---

## 13.5 Ruta inexistente

### Prueba

```bash
curl http://localhost:3000/api/unknown
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

# 14. Códigos HTTP utilizados

| Código | Nombre | Uso |
|---|---|---|
| `200 OK` | OK | Operación realizada correctamente |
| `201 Created` | Created | Moto creada correctamente |
| `400 Bad Request` | Bad Request | Datos de entrada inválidos |
| `404 Not Found` | Not Found | Recurso o ruta no encontrada |

---

# 15. Resumen de endpoints

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/health` | Comprueba el estado del servidor |
| `GET` | `/api/motorcycles` | Lista todas las motos |
| `GET` | `/api/motorcycles/:id` | Obtiene una moto |
| `POST` | `/api/motorcycles` | Crea una moto |
| `PUT` | `/api/motorcycles/:id` | Actualiza una moto |
| `DELETE` | `/api/motorcycles/:id` | Elimina una moto |

---

# 16. Flujo de una petición

Por ejemplo, para crear una moto:

```text
POST /api/motorcycles
        |
        v
motorcycle.routes.js
        |
        v
motorcycle.controller.js
        |
        |-- Validación
        |
        v
motorcycle.service.js
        |
        v
Array en memoria
        |
        v
Controller
        |
        v
Respuesta JSON
```

Esto permite evitar que toda la lógica de la aplicación quede concentrada en `app.js`.

---

# 17. Manejo de errores

La aplicación diferencia entre errores de entrada y recursos inexistentes.

## Error de validación

Cuando el cliente proporciona información incorrecta:

```text
400 Bad Request
```

Ejemplo:

```json
{
  "ok": false,
  "message": "year debe ser un año válido"
}
```

---

## Recurso inexistente

Cuando se solicita una moto que no existe:

```text
404 Not Found
```

Ejemplo:

```json
{
  "ok": false,
  "message": "Moto no encontrada"
}
```

---

## Ruta inexistente

Cuando el endpoint solicitado no existe:

```text
404 Not Found
```

Ejemplo:

```json
{
  "ok": false,
  "message": "Ruta no encontrada"
}
```

---

# 18. Datos en memoria

Las motos se almacenan temporalmente en un arreglo dentro de:

```text
src/services/motorcycle.service.js
```

Esto significa que los datos no son persistentes.

Por ejemplo, si se crea una moto:

```text
POST /api/motorcycles
```

la moto estará disponible mientras el servidor continúe ejecutándose.

Si el servidor se reinicia, los datos creados durante la ejecución se pierden y vuelven a cargarse los datos iniciales.

Esta limitación es intencional porque el ejercicio no solicita una base de datos.

---

# 19. Caso feliz completo

Un flujo normal puede ser:

```text
1. Iniciar servidor
        |
        v
2. Consultar GET /api/motorcycles
        |
        v
3. Crear una moto con POST
        |
        v
4. Consultar la moto creada con GET /:id
        |
        v
5. Actualizarla con PUT /:id
        |
        v
6. Eliminarla con DELETE /:id
```

Este flujo permite comprobar las operaciones principales del CRUD.

---

# 20. Prueba completa del CRUD

## Paso 1 - Listar

```bash
curl http://localhost:3000/api/motorcycles
```

---

## Paso 2 - Crear

```bash
curl -X POST http://localhost:3000/api/motorcycles \
  -H "Content-Type: application/json" \
  -d '{
    "brand": "KTM",
    "model": "Duke 390",
    "year": 2024,
    "type": "Naked",
    "maintenanceStatus": "pendiente"
  }'
```

---

## Paso 3 - Consultar

Utilizar el `id` recibido en la respuesta anterior.

Por ejemplo:

```bash
curl http://localhost:3000/api/motorcycles/3
```

---

## Paso 4 - Actualizar

```bash
curl -X PUT http://localhost:3000/api/motorcycles/3 \
  -H "Content-Type: application/json" \
  -d '{
    "brand": "KTM",
    "model": "Duke 390",
    "year": 2024,
    "type": "Naked",
    "maintenanceStatus": "realizado"
  }'
```

---

## Paso 5 - Eliminar

```bash
curl -X DELETE http://localhost:3000/api/motorcycles/3
```

---

## Paso 6 - Comprobar que ya no existe

```bash
curl http://localhost:3000/api/motorcycles/3
```

Debe responder:

```json
{
  "ok": false,
  "message": "Moto no encontrada"
}
```

con código:

```text
404 Not Found
```

---

# 21. Buenas prácticas aplicadas

El proyecto aplica las siguientes prácticas:

- Separación de rutas, controladores y servicios.
- Nombres de archivos en minúsculas.
- Uso de `express.json()`.
- Validación de datos de entrada.
- Uso de códigos HTTP coherentes.
- Respuestas JSON consistentes.
- Manejo de recursos inexistentes.
- No colocar toda la lógica en `app.js`.
- No utilizar una base de datos innecesaria para este ejercicio.
- No incluir `node_modules/` en el repositorio.
- Documentar la instalación y las pruebas.

---

# 22. Errores comunes durante la ejecución

## El puerto 3000 está ocupado

Puede aparecer un error indicando que el puerto ya está siendo utilizado.

Se debe identificar el proceso que está utilizando el puerto o detener el servidor anterior.

En Linux se puede consultar qué proceso utiliza el puerto mediante:

```bash
lsof -i :3000
```

---

## Se recibe `400 Bad Request`

Revisar que el JSON enviado contenga:

```text
brand
model
year
type
maintenanceStatus
```

También comprobar que:

```text
year
```

sea un número entero válido y que:

```text
maintenanceStatus
```

sea:

```text
pendiente
```

o:

```text
realizado
```

---

## Se recibe `404 Not Found`

Comprobar:

- Método HTTP.
- URL.
- ID solicitado.
- Nombre del endpoint.

La ruta base correcta es:

```text
/api/motorcycles
```

---

## Los datos creados desaparecen

Esto es esperado.

El proyecto utiliza un arreglo en memoria y no una base de datos.

Al reiniciar el servidor, los datos vuelven al estado inicial.

---

# 23. Resultado esperado

Al finalizar el ejercicio se obtiene una API REST básica de motos y mecánica con:

- Servidor Express.
- Endpoint `/health`.
- CRUD de motos.
- Rutas separadas.
- Controladores separados.
- Servicios separados.
- Validación básica.
- Manejo de errores.
- Códigos HTTP apropiados.
- Datos en memoria.
- Documentación técnica.

---

# 24. Checklist final

- [ ] Proyecto Node.js creado.
- [ ] `package.json` incluido.
- [ ] Express instalado.
- [ ] Carpeta `src/` creada.
- [ ] Rutas implementadas.
- [ ] Controladores implementados.
- [ ] Servicios implementados.
- [ ] Endpoint `/health`.
- [ ] Operación `GET`.
- [ ] Operación `POST`.
- [ ] Operación `PUT`.
- [ ] Operación `DELETE`.
- [ ] Validación de `req.body`.
- [ ] Validación de `req.params`.
- [ ] Códigos HTTP correctos.
- [ ] Manejo de errores.
- [ ] Datos en memoria.
- [ ] README documentado.
- [ ] No se utiliza base de datos externa.
- [ ] No se utiliza Docker.
- [ ] No se debe subir `node_modules/`.

---

# 25. Resumen

Este ejercicio integra los conceptos fundamentales trabajados en los ejercicios anteriores mediante una pequeña API REST relacionada con motos y mecánica.

La aplicación utiliza una arquitectura sencilla:

```text
Routes
   ↓
Controllers
   ↓
Services
   ↓
Datos en memoria
```

El proyecto permite:

- Listar motos.
- Consultar una moto por ID.
- Crear motos.
- Actualizar motos.
- Eliminar motos.

También incorpora validaciones, manejo de errores, códigos HTTP apropiados y documentación técnica para que otro desarrollador pueda instalar, ejecutar y probar la aplicación.

La solución mantiene una complejidad adecuada para un proyecto integrador básico y deja una base organizada para proyectos backend posteriores.