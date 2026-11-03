# API Taller de Motos — Uso de `path` y Construcción de Rutas Seguras

Este proyecto es una API REST desarrollada con Node.js y Express para consultar manuales y fichas técnicas de motocicletas. El objetivo principal de este ejercicio es aprender a construir rutas de archivos absolutas y multiplataforma usando el módulo nativo `node:path`, implementando mecanismos de seguridad contra ataques de **Path Traversal** (o *Directory Traversal*).

## Tecnologías y Conceptos Aplicados

* **Node.js**: Entorno de ejecución en servidor.
* **Express.js**: Framework web para gestionar endpoints HTTP.
* **ES Modules (`import`/`export`)**: Uso de la sintaxis moderna con `"type": "module"`.
* **Módulo Nativo `node:path`**:

  * `path.resolve()` / `path.join()`: Construcción de rutas absolutas multiplataforma (compatibles con Windows y Linux/macOS).
  * `path.basename()`: Extracción segura del nombre de archivo, eliminando prefijos de directorios o rutas relativas salientes (`../`).
* **Módulo Nativo `node:fs/promises`**: Lectura asíncrona no bloqueante de los manuales en formato JSON.
* **Seguridad en Backend**: Prevención de accesos no autorizados al sistema de archivos mediante la validación de directorios base (`targetPath.startsWith(MANUALS_DIR)`).
* **Modo Desarrollo (`node --watch`)**: Recarga automática nativa del servidor al detectar cambios.

## Estructura del Proyecto

```text
src/
├── app.js                       # Configuración de Express, middlewares y rutas de la API
├── server.js                    # Punto de entrada y arranque del servidor HTTP
├── routes/
│   └── mechanic.routes.js       # Definición de rutas del recurso /manuals
├── controllers/
│   └── mechanic.controller.js   # Manejo de parámetros de ruta, respuestas HTTP y códigos de error
├── services/
│   └── mechanic.service.js      # Resolución segura de rutas y lectura con fs/promises
└── data/
    └── manuals/                 # Directorio delimitado para archivos JSON de manuales
        ├── kawasaki-z900.json
        └── yamaha-mt07.json
.gitignore                       # Exclusión de node_modules y package-lock.json
package.json                     # Scripts y dependencias del proyecto
```

## Configuración del Proyecto

### 1. Archivo `.gitignore`

Asegúrate de incluir las reglas para omitir dependencias y archivos de bloqueo del control de versiones:

```text
node_modules/
package-lock.json
```

### 2. Configuración de `package.json`

Verifica la inclusión de `"type": "module"` y los scripts de ejecución:

```json
{
  "name": "motos-path-seguro",
  "version": "1.0.0",
  "type": "module",
  "main": "src/server.js",
  "scripts": {
    "dev": "node --watch src/server.js",
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
cd motos-path-seguro

# Instalar dependencias necesarias
npm install
```

### 2. Iniciar el Servidor

Para iniciar en modo desarrollo con auto-recarga:

```bash
npm run dev
```

El servidor se iniciará por defecto en:

```text
http://localhost:3000
```

## Documentación de la API

### Base URL

```text
/api/v1
```

### 1. Consultar ficha técnica o manual por modelo

* **Método:** `GET`
* **Ruta:** `/api/v1/manuals/:model`
* **Ejemplo:** `/api/v1/manuals/yamaha-mt07`

#### Respuesta Exitosa (`200 OK`)

```json
{
  "status": "success",
  "data": {
    "model": "Yamaha MT-07",
    "engine": "689 cc - Bi-cilíndrico CP2",
    "oilCapacity": "2.6 L (10W-40)",
    "sparkPlug": "NGK LMAR8A-9",
    "tirePressureFront": "36 psi",
    "tirePressureRear": "42 psi"
  }
}
```

#### Respuesta de Recurso No Encontrado (`404 Not Found`)

Si el manual solicitado no existe en el directorio de datos:

```json
{
  "status": "error",
  "message": "El manual técnico del modelo especificado no existe."
}
```

#### Respuesta de Acceso Prohibido / Path Traversal (`403 Forbidden`)

Si se detecta un intento de navegación fuera del directorio de manuales:

```json
{
  "status": "error",
  "message": "Acceso no autorizado: la ruta está fuera del directorio permitido."
}
```

## Pruebas con cURL y Verificación de Seguridad

Puedes realizar peticiones desde tu terminal para comprobar el comportamiento ante archivos existentes, inexistentes e intentos de intrusión:

### 1. Consulta exitosa de manual existente

```bash
curl -X GET http://localhost:3000/api/v1/manuals/yamaha-mt07
```

### 2. Consulta de otra ficha técnica válida

```bash
curl -X GET http://localhost:3000/api/v1/manuals/kawasaki-z900
```

### 3. Modelo inexistente

Retorna HTTP 404:

```bash
curl -X GET http://localhost:3000/api/v1/manuals/ducati-panigale
```

### 4. Prueba de seguridad

Intento de Path Traversal para leer `package.json`:

```bash
curl -X GET "http://localhost:3000/api/v1/manuals/..%2F..%2Fpackage.json"
```
