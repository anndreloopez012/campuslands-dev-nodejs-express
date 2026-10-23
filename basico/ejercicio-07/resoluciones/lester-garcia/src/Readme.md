# API Catálogo de Autos de Lujo — Lectura de Parámetros CLI con process.argv

Este proyecto es una API REST desarrollada con Node.js y Express para consultar un catálogo exclusivo de vehículos de lujo. El objetivo principal de este ejercicio es aprender a capturar, procesar y aplicar argumentos pasados directamente desde la línea de comandos (process.argv) al momento de inicializar el servidor backend.

## Tecnologías y Conceptos Aplicados

* **Node.js:** Entorno de ejecución en el servidor.
* **Express.js:** Framework para la gestión de rutas y middleware.
* **ES Modules (import/export):** Sintaxis moderna de JavaScript configurada vía `"type": "module"`.
* **Procesamiento de Argumentos CLI (process.argv):**
  * Lectura nativa de banderas en la consola (`--port=XXXX`, `--currency=XXXX`).
  * Extracción y sanitización de argumentos en un objeto de configuración global.
* **Inyección de Configuración Dinámica:** Uso de `app.set()` en Express para compartir variables de entorno/CLI a lo largo de la aplicación.
* **Modo Desarrollo (node --watch):** Auto-recarga nativa de Node.js al detectar cambios en el código.

## Estructura del Proyecto

```plaintext
src/
├── app.js                    # Configuración de Express y asignación de middlewares/rutas
├── server.js                 # Punto de entrada, procesamiento CLI y arranque del servidor
├── config/
│   └── cli.config.js         # Parser y validador de banderas enviadas por process.argv
├── routes/
│   └── cars.routes.js        # Definición de rutas del recurso /cars
├── controllers/
│   └── cars.controller.js   # Captura de datos globales de app y respuesta HTTP
├── services/
│   └── cars.service.js      # Lógica de conversión de precios según la moneda activa
└── data/
    └── cars.data.js         # Inventario inicial de vehículos de lujo
.gitignore                    # Archivos y carpetas omitidos en Git
package.json                  # Scripts y dependencias del proyecto
```

## Configuración del Proyecto

### 1. Archivo .gitignore

Comprueba que el control de versiones omita las dependencias del proyecto:

```plaintext
node_modules/
package-lock.json
```

### 2. Configuración de package.json

Verifica la presencia de `"type": "module"` y los scripts para la ejecución de la API con diferentes parámetros de consola:

```json
{
  "name": "luxury-cars-cli",
  "version": "1.0.0",
  "type": "module",
  "main": "src/server.js",
  "scripts": {
    "dev": "node --watch src/server.js --port=3000 --currency=USD",
    "dev:eur": "node --watch src/server.js --port=4000 --currency=EUR",
    "start": "node src/server.js"
  },
  "dependencies": {
    "express": "^4.19.2"
  }
}
```

## Instrucciones de Instalación y Ejecución

### 1. Instalar Dependencias

```bash
# Entrar a la carpeta del proyecto
cd luxury-cars-cli

# Instalar dependencias
npm install
```

### 2. Formas de Iniciar el Servidor

Puedes personalizar el puerto y la moneda por defecto (USD o EUR) directamente desde la terminal:

* **Opción A:** Ejecutar script en modo desarrollo por defecto (Puerto 3000 | USD)
  ```bash
  npm run dev
  ```
* **Opción B:** Ejecutar script con moneda Euros por defecto (Puerto 4000 | EUR)
  ```bash
  npm run dev:eur
  ```
* **Opción C:** Ejecutar dinámicamente con banderas personalizadas en la terminal
  ```bash
  node src/server.js --port=5000 --currency=EUR
  ```

## Documentación de la API (Endpoints)

**Base URL:** `/api/v1`

### 1. Consultar el catálogo de autos de lujo

* **Método:** `GET`
* **Ruta:** `/api/v1/cars`

#### Respuesta Exitosa con --currency=USD (200 OK):
```json
{
  "status": "success",
  "activeCurrency": "USD",
  "total": 3,
  "data": [
    {
      "id": "1",
      "brand": "Rolls-Royce",
      "model": "Phantom VIII",
      "price": 460000,
      "currency": "USD",
      "topSpeedKmh": 250
    },
    {
      "id": "2",
      "brand": "Bentley",
      "model": "Continental GT",
      "price": 240000,
      "currency": "USD",
      "topSpeedKmh": 335
    }
  ]
}
```

#### Respuesta Exitosa con --currency=EUR (200 OK):
```json
{
  "status": "success",
  "activeCurrency": "EUR",
  "total": 3,
  "data": [
    {
      "id": "1",
      "brand": "Rolls-Royce",
      "model": "Phantom VIII",
      "price": 423200,
      "currency": "EUR",
      "topSpeedKmh": 250
    }
  ]
}
```

## Pruebas con cURL

Puedes probar la API desde tu terminal con curl según el puerto configurado:

```bash
# Probar instancia ejecutada en puerto 3000 (Moneda USD)
curl -X GET http://localhost:3000/api/v1/cars

# Probar instancia ejecutada en puerto 4000 (Moneda EUR)
curl -X GET http://localhost:4000/api/v1/cars

# Probar instancia personalizada ejecutada en puerto 5000
curl -X GET http://localhost:5000/api/v1/cars
```