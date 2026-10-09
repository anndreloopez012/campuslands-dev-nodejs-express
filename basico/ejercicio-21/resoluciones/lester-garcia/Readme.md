# API Animación 3D y Renderizado — Estructura src/, routes/ y controllers/

Este proyecto es una API REST profesional construida con Node.js y Express sobre la temática de estudios de animación 3D, proyectos de renderizado y animación digital. La finalidad del ejercicio es aplicar la separación clara de responsabilidades integrando los módulos en una estructura organizada dentro de la carpeta `src/`.

---

## Arquitectura y Conceptos Aplicados

- **Node.js & Express**: Plataforma y framework base para enrutamiento e intercepción HTTP.
- **Estructura Modular N-Capas (`src/`)**:
  - `routes/`: Define endpoints, métodos HTTP e inyección de middlewares. Sin lógica de respuesta directa.
  - `controllers/`: Maneja el contrato de comunicación HTTP (extracción de `req.body`, `req.params`, `req.query`, validación previa y formateo de respuesta JSON).
  - `services/`: Encapsula las reglas de negocio y lectura/escritura del almacenamiento JSON.
  - `middlewares/`: Manejo unificado de excepciones y captura de sintaxis JSON.
  - `utils/`: Utilidades reutilizables (`asyncHandler` y clases de error HTTP personalizadas).
- **Control de Estado e Insumos**:
  - Validaciones estrictas para software de modelado, motores de render (`Cycles`, `Arnold`, `Redshift`, `Octane`), resoluciones soportadas (`1080p`, `1440p`, `4K`, `8K`) y estado de los renders (`Queued`, `In Progress`, `Completed`, `Paused`).

---

## Estructura del Proyecto

```text
src/
├── app.js                              # Ensamblado de Express, express.json() y rutas
├── server.js                           # Arranque e inicialización del servidor HTTP
├── routes/
│   └── renderProject.routes.js         # Mapeo de rutas y métodos HTTP
├── controllers/
│   └── renderProject.controller.js     # Gestión de req.query, req.params, req.body y respuestas
├── services/
│   └── renderProject.service.js        # Lógica de negocio y lectura/escritura en JSON
├── middlewares/
│   └── errorHandler.js                 # Middleware global de procesamiento de errores
├── utils/
│   ├── asyncHandler.js                 # Envoltorio asíncrono para captura de promesas
│   └── customErrors.js                 # Clases de error personalizadas (400, 404, 409)
└── data/
    └── renderProjects.json             # Base de datos local en JSON
.gitignore                              # Exclusión de node_modules
package.json                            # Scripts y configuración de ES Modules
```

---

## Configuración e Instalación

1. Instalación de dependencias:
```bash
npm install
```

2. Iniciar el servidor en modo desarrollo:
```bash
npm run dev
```

Servidor corriendo en: `http://localhost:3000`.

---

## Documentación de Endpoints

**Base URL:** `/api/v1`

### 1. Obtener proyectos de render con filtros

- **Método:** GET
- **Ruta:** `/api/v1/render-projects`
- **Query Parameters (Opcionales):**
  - `software` (string): Nombre del software 3D (ej. Blender, Maya, Houdini).
  - `renderEngine` (string): Motor de renderizado (ej. Cycles, Arnold, Redshift).
  - `status` (string): Estado del proyecto (Queued, In Progress, Completed, Paused).

### 2. Obtener un proyecto por ID

- **Método:** GET
- **Ruta:** `/api/v1/render-projects/:id`
- **Path Parameters (Obligatorios):**
  - `id` (string): Identificador del proyecto.

### 3. Registrar un nuevo proyecto de renderizado

- **Método:** POST
- **Ruta:** `/api/v1/render-projects`
- **Headers:** `Content-Type: application/json`

**Cuerpo de Petición Válido (JSON):**
```json
{
  "title": "Intro Cinema 4D Abstract",
  "studio": "VFX Motion Lab",
  "software": "Cinema 4D",
  "renderEngine": "Octane",
  "totalFrames": 900,
  "resolution": "4K",
  "estimatedCostUSD": 1100.00,
  "status": "Queued"
}
```

**Respuesta Exitosa (201 Created):**
```json
{
  "status": "success",
  "data": {
    "id": "1728163800000",
    "title": "Intro Cinema 4D Abstract",
    "studio": "VFX Motion Lab",
    "software": "Cinema 4D",
    "renderEngine": "Octane",
    "totalFrames": 900,
    "resolution": "4K",
    "estimatedCostUSD": 1100,
    "status": "Queued"
  }
}
```

---

## Pruebas con cURL

```bash
# 1. Obtener todos los proyectos
curl -X GET http://localhost:3000/api/v1/render-projects

# 2. Filtrar por software
curl -X GET "http://localhost:3000/api/v1/render-projects?software=Blender"

# 3. Buscar por ID
curl -X GET http://localhost:3000/api/v1/render-projects/1

# 4. Crear nuevo proyecto
curl -X POST http://localhost:3000/api/v1/render-projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Intro Cinema 4D Abstract",
    "studio": "VFX Motion Lab",
    "software": "Cinema 4D",
    "renderEngine": "Octane",
    "totalFrames": 900,
    "resolution": "4K",
    "estimatedCostUSD": 1100.00,
    "status": "Queued"
  }'
```
