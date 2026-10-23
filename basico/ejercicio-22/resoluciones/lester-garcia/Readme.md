# API Arquitectura 3D y ArchViz — Servicios Simples (`src/services`)

Este proyecto es una **API REST modular desarrollada con Node.js y Express** basada en la temática de **estudios de arquitectura 3D, renders fotorrealistas y visualización arquitectónica (ArchViz)**. El objetivo del ejercicio es aplicar la separación de la **capa de servicio (`src/services/`)**, delegándole las reglas de negocio, lógica de persistencia y cálculos agregados.

---

## 🛠️ Conceptos y Patrón de Capas

* **Node.js & Express**: Entorno de ejecución y framework para construir APIs.
* **Capa de Servicios (`src/services/`)**:
  * Abstrae el acceso y la mutación de la fuente de datos JSON.
  * Ejecuta transformaciones de datos y cálculos derivados (ej. costo promedio por m²).
  * Valida reglas de negocio únicas (control de duplicados por nombre de proyecto).
  * Devuelve datos listos al controlador o lanza errores operacionales.
* **Capa de Controladores (`src/controllers/`)**:
  * Delgada y enfocada únicamente en la interfaz HTTP (`req`, `res`).
  * Realiza validaciones superficiales de los tipos de datos enviados por el cliente.
* **Manejo Centralizado de Errores**:
  * Clases de error HTTP personalizadas (`400 Bad Request`, `404 Not Found`, `409 Conflict`).
  * Middleware global interceptor con envoltorio `asyncHandler`.

---

## 📂 Estructura del Proyecto

```text
src/
├── app.js                          # Configuración de Express, middlewares globales y 404
├── server.js                       # Inicialización y escucha del servidor HTTP
├── routes/
│   └── archviz.routes.js           # Declaración de rutas de ArchViz
├── controllers/
│   └── archviz.controller.js       # Controladores delgados para HTTP
├── services/
│   └── archviz.service.js          # Lógica de negocio pura, cálculos y persistencia
├── middlewares/
│   └── errorHandler.js             # Formateador global de respuestas de error
├── utils/
│   ├── asyncHandler.js             # Capturador asíncrono de promesas
│   └── customErrors.js             # Clases de error HTTP
└── data/
    └── archvizProjects.json        # Archivo de datos local en JSON
.gitignore                          # Control de ignorado para Git
package.json                        # Scripts y dependencias
```

---

## ⚙️ Configuración e Instalación

1. **Instalación de dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar el servidor en modo desarrollo:**
   ```bash
   npm run dev
   ```

> **Servidor listo en:** `http://localhost:3000`

---

## 📡 Documentación de Endpoints

* **Base URL:** `/api/v1`

### 1. Obtener proyectos con filtros
* **Método:** `GET`
* **Ruta:** `/api/v1/archviz`
* **Query Parameters (Opcionales):**
  * `style` (string): Estilo arquitectónico.
  * `software` (string): Software principal (*3ds Max, Revit, Rhinoceros, SketchUp, Blender*).
  * `isVRReady` (boolean): `true` / `false`.
  * `maxBudget` (number): Presupuesto máximo en USD.

### 2. Obtener métricas agregadas del estudio
* **Método:** `GET`
* **Ruta:** `/api/v1/archviz/stats`

### 3. Obtener un proyecto por ID
* **Método:** `GET`
* **Ruta:** `/api/v1/archviz/:id`
* **Detalle de Respuesta:** Incluye métricas calculadas como `costPerSqMeter`.

### 4. Crear un nuevo proyecto
* **Método:** `POST`
* **Ruta:** `/api/v1/archviz`
* **Headers:** `Content-Type: application/json`
* **Cuerpo de Petición Válido (JSON):**
  ```json
  {
    "projectName": "Pabellón Cultural Metropolitano",
    "architecturalStyle": "Paramétrico",
    "software": "Rhinoceros",
    "renderEngine": "V-Ray",
    "areaSqMeters": 1500,
    "budgetUSD": 4500.00,
    "rendersCount": 10,
    "isVRReady": true
  }
  ```

---

## 🧪 Pruebas con cURL

Puedes probar los endpoints ejecutando los siguientes comandos en tu terminal:

```bash
# 1. Obtener proyectos filtrados
curl -X GET "http://localhost:3000/api/v1/archviz?software=3ds%20Max"

# 2. Obtener métricas globales
curl -X GET http://localhost:3000/api/v1/archviz/stats

# 3. Obtener proyecto por ID
curl -X GET http://localhost:3000/api/v1/archviz/1

# 4. Crear nuevo proyecto
curl -X POST http://localhost:3000/api/v1/archviz \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "Pabellón Cultural Metropolitano",
    "architecturalStyle": "Paramétrico",
    "software": "Rhinoceros",
    "renderEngine": "V-Ray",
    "areaSqMeters": 1500,
    "budgetUSD": 4500.00,
    "rendersCount": 10,
    "isVRReady": true
  }'
```
