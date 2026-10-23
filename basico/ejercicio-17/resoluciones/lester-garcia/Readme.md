# Ejercicio 17: Rutas GET en Express - Travel & Tourism

Este proyecto es un ejercicio práctico básico diseñado para explorar las operaciones de lectura en Express aplicadas a la temática de Viajes y Turismo. Se enfoca en la estructuración de rutas GET, la captura de parámetros de ruta (`req.params`) y la implementación de filtrados avanzados mediante cadenas de consulta (`req.query`), todo bajo un flujo centralizado de control de errores.

## Arquitectura del Proyecto y Estructura de Directorios

El código está organizado siguiendo un patrón arquitectónico en capas para separar las responsabilidades del sistema dentro del directorio `src/`:

* **`data/`**
  * `tours.json`: Archivo plano en formato JSON que emula la persistencia de datos (catálogo de paquetes turísticos).
* **`routes/`**
  * `tours.routes.js`: Define los puntos de acceso (endpoints) expuestos y el orden de precedencia de las rutas para evitar conflictos de coincidencia.
* **`controllers/`**
  * `tours.controller.js`: Gestiona las peticiones HTTP, valida los datos de entrada de las consultas y despacha las respuestas estructuradas al cliente.
* **`services/`**
  * `tours.service.js`: Contiene la lógica de negocio subyacente, procesa las operaciones de lectura del sistema de archivos y aplica los filtros lógicos sobre los datos.
* **`middlewares/`**
  * `errorHandler.js`: Interceptor global encargado de capturar cualquier excepción del sistema y transformarla en una respuesta HTTP estandarizada.
* **`utils/`**
  * `customErrors.js`: Clases personalizadas que extienden el objeto `Error` nativo para manejar códigos de estado HTTP específicos (400, 404, 500).
  * `asyncHandler.js`: Función de envoltura (wrapper) que automatiza la captura de promesas rechazadas, eliminando la necesidad de bloques try-catch repetitivos en los controladores.
* **Archivos Raíz (`app.js` y `server.js`)**
  * Inicializan la aplicación Express, vinculan los middlewares globales, conectan los enrutadores principales y levantan el servidor en el puerto asignado.

---

## Preparación del Entorno

### 1. Inicialización de la Estructura
Ejecute el siguiente comando en la terminal para desplegar la estructura de directorios y archivos base:

```bash
mkdir -p src/routes src/controllers src/services src/data src/middlewares src/utils
touch src/app.js src/server.js .gitignore
touch src/routes/tours.routes.js src/controllers/tours.controller.js src/services/tours.service.js src/data/tours.json src/middlewares/errorHandler.js src/utils/asyncHandler.js src/utils/customErrors.js
npm init -y
```

### 2. Instalación de Dependencias
Instale el framework Express:

```bash
npm install express
```

### 3. Configuración del Manifiesto
Asegúrese de incluir `"type": "module"` en su archivo `package.json` para habilitar la sintaxis nativa de ECMAScript Modules (ESM), junto con los siguientes scripts de ejecución:

```json
"scripts": {
  "dev": "node --watch src/server.js",
  "start": "node src/server.js"
}
```

---

## Endpoints Disponibles (API v1)

| Método HTTP | Ruta de Acceso | Tipo de Parámetro | Funcionalidad |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/tours` | Query (`category`, `destination`, `maxPrice`, `featured`) | Recupera la colección completa de tours o aplica filtros combinados. |
| **GET** | `/api/v1/tours/featured` | Ninguno | Retorna de manera directa únicamente los paquetes marcados como destacados. |
| **GET** | `/api/v1/tours/:id` | Path (`:id`) | Busca y devuelve un paquete turístico específico coincidente con el identificador. |

---

## Instrucciones de Uso

Para levantar el servidor en el entorno de desarrollo con recarga automática activa ante cambios, ejecute:

```bash
npm run dev
```

La API quedará expuesta en `http://localhost:3000`, lista para recibir peticiones a través de clientes de pruebas HTTP como Postman, Insomnia o Thunder Client.
