# Intermedio - Ejercicio 22: Subida Simulada de Archivos
> **Autor:** Anderson Oloroso | **Temática:** Arquitectura 3D | **Tema:** Subida simulada de archivos

## Descripción
Simula y valida el procesamiento de subida de archivos de diseño y planos arquitectónicos 3D (`.obj`, `.fbx`, `.dwg`, `.ifc`). Valida extensiones autorizadas, límites de tamaño (máximo 50MB) y genera metadatos persistentes de hash y fecha.

## Instalación y ejecución
```bash
cd intermedio/ejercicio-22/resoluciones/anderson-oloroso
npm install
npm start
npm run dev
```

## Endpoints
- `GET /intermedio/ejercicio-22` -> Health check.
- `GET /api/arq3d/blueprints` -> Listar planos subidos.
- `POST /api/arq3d/blueprints/upload` -> Subir y validar plano.

### Ejemplo POST
```bash
curl -X POST http://localhost:3000/api/arq3d/blueprints/upload \
  -H "Content-Type: application/json" \
  -d '{"nombreArchivo":"estadio_principal_v2","extension":".dwg","tamanoBytes":12582912,"autor":"Arq. Laura M."}'
```

## Estructura
```text
intermedio/ejercicio-22/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── controllers/
    │   └── upload.controller.js
    ├── routes/
    │   └── upload.routes.js
    └── services/
        └── upload.service.js
```
