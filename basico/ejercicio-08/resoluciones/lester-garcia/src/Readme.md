# API Hiperdeportivos — Gestión de Variables de Entorno

Este proyecto es una API REST desarrollada con Node.js y Express para gestionar la información y datos de telemetría de hiperdeportivos. El objetivo principal de este ejercicio es aprender a gestionar configuraciones sensibles y dinámicas (como el puerto, el entorno de ejecución NODE_ENV y credenciales de acceso) mediante variables de entorno utilizando la bandera nativa de Node.js (--env-file) y las mejores prácticas de seguridad en el backend.

## Tecnologías y Conceptos Aplicados

* **Node.js:** Entorno de ejecución en el servidor.
* **Express.js:** Framework web para la creación de la API REST.
* **ES Modules (import/export):** Uso de la sintaxis moderna de módulos configurada con `"type": "module"`.
* **Variables de Entorno Nativa (--env-file=.env):**
  * Carga explícita de archivos .env sin necesidad de librerías externas (disponible en Node.js v20+).
  * Acceso mediante el objeto global `process.env`.
* **Seguridad en Repositorios:**
  * Exclusión de secretos en Git mediante `.gitignore`.
  * Creación de un archivo `.env.example` como documentación técnica para el equipo de desarrollo.
  * Validación de cabeceras personalizadas (`X-API-KEY`) basadas en variables de entorno.
* **Modo Desarrollo (node --watch):** Auto-recarga nativa del servidor.

## Estructura del Proyecto

```plaintext
src/
├── app.js                          # Configuración de Express, middlewares y rutas
├── server.js                       # Punto de entrada y lectura de variables de entorno
├── config/
│   └── env.config.js               # Centralización, sanitización y valores fallback de process.env
├── routes/
│   └── hypercars.routes.js         # Definición de endpoints de hiperdeportivos y telemetría
├── controllers/
│   └── hypercars.controller.js     # Manejo de req/res, autenticación por API Key y errores
├── services/
│   └── hypercars.service.js        # Lógica de negocio y búsqueda de telemetría
└── data/
    └── hypercars.data.js           # Base de datos en memoria de hiperdeportivos
.env                                # Variables de entorno locales (NO se sube a Git)
.env.example                        # Plantilla pública de variables de entorno
.gitignore                          # Exclusión de archivos sensibles y node_modules
package.json                        # Scripts de inicio y dependencias
```

## Configuración del Proyecto

### 1. Archivo .gitignore

Es imprescindible asegurar que el archivo `.env` nunca se suba al control de versiones:

```plaintext
node_modules/
package-lock.json
.env
```

### 2. Archivo .env.example (Plantilla Pública)

Crea este archivo en la raíz del proyecto para que otros desarrolladores conozcan qué variables requiere la aplicación:

```plaintext
PORT=3000
NODE_ENV=development
API_SECRET_KEY=tu_clave_secreta_aqui
```

### 3. Archivo .env (Configuración Local)

Crea tu archivo `.env` local copiando la plantilla y definiendo tus valores reales:

```plaintext
PORT=3000
NODE_ENV=development
API_SECRET_KEY=hyper_secret_2026
```

### 4. Configuración de package.json

Verifica la inclusión de `"type": "module"` y el uso de `--env-file=.env` en los scripts:

```json
{
  "name": "hypercars-env-vars",
  "version": "1.0.0",
  "type": "module",
  "main": "src/server.js",
  "scripts": {
    "dev": "node --watch --env-file=.env src/server.js",
    "start": "node --env-file=.env src/server.js"
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
cd hypercars-env-vars

# Instalar dependencias
npm install
```

### 2. Iniciar el Servidor

```bash
npm run dev
```

El servidor leerá la variable `PORT` declarada en tu archivo `.env` (por defecto `http://localhost:3000`).

## Documentación de la API (Endpoints)

**Base URL:** `/api/v1`

### 1. Obtener la lista de hiperdeportivos

* **Método:** `GET`
* **Ruta:** `/api/v1/hypercars`
* **Autenticación:** No requerida.

#### Respuesta Exitosa (200 OK):
```json
{
  "status": "success",
  "environment": "development",
  "total": 3,
  "data": [
    {
      "id": "1",
      "brand": "Bugatti",
      "model": "Chiron Super Sport",
      "horsepower": 1600,
      "topSpeedKmh": 440
    },
    {
      "id": "2",
      "brand": "Koenigsegg",
      "model": "Jesko Absolut",
      "horsepower": 1600,
      "topSpeedKmh": 530
    }
  ]
}
```

### 2. Consultar datos de telemetría de un vehículo

* **Método:** `GET`
* **Ruta:** `/api/v1/hypercars/:id/telemetry`
* **Headers Requeridos:** `x-api-key: <TU_API_SECRET_KEY>`

#### Respuesta Exitosa (200 OK):
```json
{
  "status": "success",
  "data": {
    "car": "Bugatti Chiron Super Sport",
    "telemetry": {
      "horsepower": 1600,
      "topSpeedKmh": 440,
      "status": "Telemetry active",
      "timestamp": "2026-10-05T20:30:00.000Z"
    }
  }
}
```

#### Respuesta de Error de Autenticación (401 Unauthorized):
Si el header `x-api-key` no coincide con la variable `API_SECRET_KEY` del `.env`:
```json
{
  "status": "error",
  "message": "Acceso no autorizado: X-API-KEY no válida o ausente."
}
```

## Pruebas con cURL

Ejecuta los siguientes comandos desde tu terminal para probar los endpoints y la seguridad con variables de entorno:

```bash
# 1. Consultar la lista pública de hiperdeportivos
curl -X GET http://localhost:3000/api/v1/hypercars

# 2. Intentar acceder a telemetría sin enviar el header de autenticación (401 Unauthorized)
curl -X GET http://localhost:3000/api/v1/hypercars/1/telemetry

# 3. Acceder a telemetría enviando la clave secreta correcta definida en tu .env
curl -X GET http://localhost:3000/api/v1/hypercars/1/telemetry \
  -H "x-api-key: hyper_secret_2026"
```
