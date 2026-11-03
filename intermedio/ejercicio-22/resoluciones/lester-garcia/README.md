# API Repositorio BIM y Arquitectura 3D — Subida Simulada de Archivos (File Upload Pipeline)

Este repositorio implementa el flujo de **Ingesta, Validación y Almacenamiento Simulado de Archivos** utilizando **Node.js** y **Express** sobre la temática de **arquitectura 3D, modelado BIM (`.ifc`, `.rvt`) y planos CAD (`.dwg`, `.obj`)**. La finalidad del ejercicio es dominar las validaciones críticas de seguridad en cargas de archivos: control de extensiones, tipos MIME, límites de tamaño (`413 Payload Too Large`), sanitización de nombres y generación de sumas de verificación (`SHA-256`).

---

## Flujo del Middleware de Subida Simulada

1. **Validación de Extensión y MIME Type (`415 Unsupported Media Type`)**:
   Verifica que el archivo pertenezca a formatos arquitectónicos autorizados (`.ifc`, `.rvt`, `.dwg`, `.obj`, `.fbx`) y que su `mimeType` coincida con la lista blanca.
2. **Control de Peso Máximo (`413 Payload Too Large`)**:
   Compara `fileSizeBytes` contra `MAX_FILE_SIZE_MB` (50 MB por defecto) antes de procesar el almacenamiento.
3. **Sanitización de Nombre y Huella Criptográfica (`SHA-256`)**:
   Reemplaza caracteres especiales en el nombre original, antepone un timestamp único, calcula el checksum `SHA-256` con `node:crypto` e inyecta `req.uploadedFile` hacia el controlador.

---

## Estructura de Directorios

```text
src/
├── app.js                                       # Configuración global de Express y rutas
├── server.js                                    # Arranque del servidor HTTP
├── config/
│   └── upload.config.js                         # Tamaños máximos, bucket URL, extensiones y MIME types
├── routes/
│   ├── index.routes.js                          # Montaje centralizado
│   └── blueprints.routes.js                     # Endpoints de consulta y subida (/blueprints/upload)
├── controllers/
│   └── blueprints.controller.js                 # Controladores HTTP limpios
├── services/
│   └── blueprints.service.js                    # Asociación de metadatos del proyecto y archivo subido
├── repositories/
│   └── blueprints.inMemory.repository.js        # Persistencia en memoria de modelos BIM
├── middlewares/
│   ├── requestId.middleware.js                  # Trazabilidad con UUID v4
│   ├── logger.middleware.js                     # Logger transversal
│   ├── fileUploadSimulator.middleware.js        # Validación de archivo, sanitización y hash SHA-256
│   ├── errorHandler.middleware.js               # Captura centralizada de errores (400, 413, 415)
│   └── validators/
│       ├── validate.middleware.js               # Envoltorio de validación
│       └── blueprint.validator.js               # Validación de proyecto, arquitecto y escala (1:N)
└── utils/
    ├── asyncHandler.js                          # Envoltorio asíncrono
    └── customErrors.js                          # PayloadTooLargeError (413), UnsupportedMediaTypeError (415)
.env                                             # Variables de entorno locales (excluido en Git)
.env.example                                     # Plantilla de variables de entorno
.gitignore                                       # Control de exclusiones
package.json                                     # Scripts y dependencias
```

---

## Configuración e Instalación

### 1. Variables de entorno
```bash
cp .env.example .env
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Modo desarrollo
```bash
npm run dev
```

---

## Referencia de Endpoints

**Base URL:** `/api/v1`

| Recurso | Método | Endpoint | Descripción |
| :--- | :--- | :--- | :--- |
| **Planos 3D** | **GET** | `/blueprints` | Lista todos los modelos arquitectónicos 3D y sus metadatos de archivo |
| **Planos 3D** | **GET** | `/blueprints/:id` | Consulta un modelo BIM específico por su ID |
| **Planos 3D** | **POST** | `/blueprints/upload` | Simula la subida de un plano 3D validando MIME, extensión y peso |

---

## Pruebas con cURL

```bash
# 1. Listar todos los modelos BIM registrados
curl -X GET http://localhost:3000/api/v1/blueprints

# 2. Subir un nuevo modelo 3D válido (.rvt de 20 MB)
curl -X POST http://localhost:3000/api/v1/blueprints/upload \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "Museo de Arte Contemporáneo",
    "architect": "Arq. Frida Escobedo",
    "scale": "1:50",
    "fileName": "museo_pabellon_central.rvt",
    "mimeType": "application/octet-stream",
    "fileSizeBytes": 20971520
  }'

# 3. Probar error 415 Unsupported Media Type enviando un ejecutable (.exe)
curl -X POST http://localhost:3000/api/v1/blueprints/upload \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "Proyecto Inválido",
    "architect": "Arq. Test",
    "scale": "1:100",
    "fileName": "instalador.exe",
    "mimeType": "application/x-msdownload",
    "fileSizeBytes": 102400
  }'

# 4. Probar error 413 Payload Too Large superando los 50 MB permitidos
curl -X POST http://localhost:3000/api/v1/blueprints/upload \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "Complejo Aeroportuario",
    "architect": "Arq. Norman Foster",
    "scale": "1:200",
    "fileName": "terminal_completa.ifc",
    "mimeType": "application/x-step",
    "fileSizeBytes": 94371840
  }'
```
