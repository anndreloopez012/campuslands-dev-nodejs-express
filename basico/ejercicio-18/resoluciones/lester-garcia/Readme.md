# API Paracaidismo y Dropzones — Rutas POST

Este proyecto es una API REST desarrollada con Node.js y Express enfocada en la gestión de registros dentro de la temática de paracaidismo y zonas de salto (dropzones). El objetivo central de este ejercicio es implementar rutas de creación (`POST`) profesionales, aplicando validaciones estrictas de datos en el cuerpo de la petición (`req.body`), reglas de seguridad de aviación y respuestas estandarizadas bajo el código de estado `201 Created`.

## Tecnologías y Conceptos Aplicados

* **Node.js y Express.js:** Plataforma de ejecución y framework para la gestión de enrutamiento web.
* **Procesamiento de Datos Core:** Uso de módulos nativos de ECMAScript (`ES Modules`) y configuración del middleware `express.json()` para la lectura de peticiones JSON.
* **Reglas de Validación y Seguridad:** Implementación de listas blancas (*whitelists*) para modalidades de salto permitidas, control estricto de rangos numéricos de altitud (entre 3,000 y 18,000 ft) y requerimientos de montos financieros positivos.
* **Manejo Centralizado de Excepciones:** Flujo controlado para evitar la persistencia de registros duplicados en el sistema mediante estados de conflicto (`409 Conflict`), apoyado por clases de error extendidas y la envoltura asíncrona `asyncHandler`.

---

## Arquitectura del Proyecto y Estructura de Carpetas

La aplicación distribuye sus responsabilidades mediante un esquema de capas bien definido dentro del directorio `src/`:

* **`data/`**
  * `skydive.json`: Base de datos emulada en formato JSON que almacena el histórico de saltos realizados por los paracaidistas.
* **`routes/`**
  * `skydive.routes.js`: Modulo que expone formalmente los endpoints de lectura (`GET`) y escritura (`POST`) del recurso de saltos.
* **`controllers/`**
  * `skydive.controller.js`: Capa encargada de interceptar la petición HTTP, validar la integridad física del formato de datos en `req.body` y retornar la respuesta estructurada o disparar errores lógicos.
* **`services/`**
  * `skydive.service.js`: Capa de negocio pura que implementa la persistencia de datos en el archivo plano, maneja la lógica de duplicados y computa los identificadores unívocos basados en marcas de tiempo.
* **`middlewares/`**
  * `errorHandler.js`: Interceptor de errores global de Express que homologa las respuestas fallidas del servidor en un formato JSON consistente hacia el cliente.
* **`utils/`**
  * `customErrors.js`: Abstracciones de software de la clase `Error` diseñadas para categorizar respuestas semánticas fallidas en la red (`BadRequestError`, `NotFoundError`, `ConflictError`).
  * `asyncHandler.js`: Mecanismo de envoltura funcional encargado de centralizar y redirigir promesas rotas directamente al flujo del middleware de error global.
* **Archivos Raíz (`app.js` y `server.js`)**
  * Inicializadores del servidor HTTP, inyección de middlewares base del framework y definición del prefijo de enrutamiento global.

---

## Configuración y Despliegue

### 1. Requisitos del Sistema
Asegúrese de contar con Node.js instalado y el manifiesto `package.json` configurado con la bandera `"type": "module"` para dar soporte nativo a las importaciones modernas de ECMAScript.

### 2. Instalación de Dependencias
Descargue los paquetes requeridos por el proyecto ejecutando en su terminal:

```bash
npm install
```

### 3. Ejecución del Servidor
Para arrancar el servicio en un entorno local con escucha activa ante cualquier cambio en el código fuente, utilice el siguiente comando:

```bash
npm run dev
```

El proceso se mantendrá escuchando peticiones en la dirección base `http://localhost:3000`.

---

## Documentación de Endpoints (Prefijo Base: `/api/v1`)

| Método | Endpoint | Cabeceras requeridas | Descripción / Códigos de Respuesta Esperados |
| :--- | :--- | :--- | :--- |
| **GET** | `/jumps` | Ninguna | Retorna la colección completa de saltos almacenados en el sistema (`200 OK`). |
| **GET** | `/jumps/:id` | Ninguna | Recupera un salto individual por su ID (`200 OK` / `404 Not Found`). |
| **POST** | `/jumps` | `Content-Type: application/json` | Valida, procesa y da de alta un nuevo salto en la base de datos local (`201 Created` / `400 Bad Request` / `409 Conflict`). |

### Especificaciones de Validación para Peticiones POST

Al realizar una inserción hacia `/api/v1/jumps`, la petición es evaluada bajo las siguientes directrices operacionales:

* El campo `jumpType` debe coincidir exactamente con una de las modalidades autorizadas en aviación: `Tandem`, `Solo AFF`, `Freefly`, `Wingsuit` o `Coaching`.
* La propiedad `altitudeFeet` debe comprender un rango estricto de seguridad aerotransportada ubicado entre **3,000** y **18,000** pies inclusive.
* El sistema impedirá la inserción (devolviendo un error `409`) si detecta que el mismo nombre de paracaidista ya posee un registro agendado con idéntica altitud y zona de salto (*dropzone*).

---

## Pruebas de Integración con cURL

Utilice las siguientes instrucciones directamente en su terminal para validar las diferentes capas de control del software:

```bash
# 1. Recuperar listado completo de saltos
curl -X GET http://localhost:3000/api/v1/jumps

# 2. Inserción exitosa de un registro de salto válido
curl -X POST http://localhost:3000/api/v1/jumps \
  -H "Content-Type: application/json" \
  -d '{"jumperName": "Sofia Alarcón", "jumpType": "Wingsuit", "altitudeFeet": 14000, "dropzone": "Skydive Cuautla", "priceUSD": 290.00, "hasVideoPackage": true}'

# 3. Comprobación de error por registro duplicado (Garantiza idempotencia lógica)
curl -X POST http://localhost:3000/api/v1/jumps \
  -H "Content-Type: application/json" \
  -d '{"jumperName": "Sofia Alarcón", "jumpType": "Wingsuit", "altitudeFeet": 14000, "dropzone": "Skydive Cuautla", "priceUSD": 290.00}'

# 4. Rechazo por modalidad de salto no listada internamente
curl -X POST http://localhost:3000/api/v1/jumps \
  -H "Content-Type: application/json" \
  -d '{"jumperName": "Andrés López", "jumpType": "Salto Ilegal", "altitudeFeet": 12000, "dropzone": "Skydive Cuautla", "priceUSD": 200.00}'

# 5. Rechazo operacional por altitud inferior a los estándares mínimos de seguridad
curl -X POST http://localhost:3000/api/v1/jumps \
  -H "Content-Type: application/json" \
  -d '{"jumperName": "Elena Torres", "jumpType": "Tandem", "altitudeFeet": 1500, "dropzone": "Skydive Tequesquitengo", "priceUSD": 220.00}'
```
