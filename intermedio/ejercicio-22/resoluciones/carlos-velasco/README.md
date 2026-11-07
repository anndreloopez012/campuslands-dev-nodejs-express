# INTERMEDIO 22 - Subida simulada de archivos

## Objetivo

Crear una API Node.js con Express que implemente el flujo de subida de archivos en varias peticiones (sesion + chunks) sin sistema de archivos ni storage: el payload viaja en base64 y se guarda en memoria.

## Concepto principal

La subida real de archivos tiene retos independientes del transporte:

1. **Validar ANTES de aceptar bytes**: nombre, formato y saneamiento de ruta (`nombre` no acepta `..`).
2. **Limitar el tamano**: tamano maximo del total (5 MB) y del body JSON (`limit: '1mb'` con `express.json`). Sin limites, una subida gigante bloquea al servidor.
3. **Sesiones de subida**: `POST /modelos` crea un registro en estado `esperando_chunks`; el archivo se envia en trozos (chunks) con `POST /modelos/:id/chunks` hasta marcar `ultimo: true`.
4. **Referencia final**: al completarse, se devuelve una url simulada; en un sistema real seria `https://storage.../modelo.gltf`.

Transporte simulado vs real: la logica (validar, límite, sesion, referencia) no cambia; solo cambia quien mueve los bytes (multer/stream).

## Estructura del proyecto

```text
resoluciones/carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── data/
    │   └── modelos.data.js
    ├── errors/
    │   └── app.error.js
    ├── middlewares/
    │   └── error.handler.js
    ├── routes/
    │   └── uploads.routes.js
    ├── controllers/
    │   └── uploads.controller.js
    └── services/
        └── uploads.service.js
```

## Como ejecutar

```bash
npm install
npm run start
```

## Flujo completo de una subida

```bash
# 1. Iniciar sesion de subida: valida nombre y formato -> 201
curl -X POST http://localhost:3000/modelos \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Torre Sur", "formato": "obj"}'

# 2. Enviar chunk 1 (simulando parte del archivo en base64)
curl -X POST http://localhost:3000/modelos/3/chunks \
  -H "Content-Type: application/json" \
  -d '{"bytes_base64": "SG9sYSA0MyBkZSBsb3NzIGVvbiAxIGVqZW1wbG8K"}'

# 3. Enviar chunk final: может "ultimo": true -> estado completado + url
curl -X POST http://localhost:3000/modelos/3/chunks \
  -H "Content-Type: application/json" \
  -d '{"bytes_base64": "UEFSVEUyCg==", "ultimo": true}'

# Listar modelos: con conteo de chunks, sin payload pesado
curl http://localhost:3000/modelos
```

## Casos de error

```bash
# Formato no soportado -> 400
curl -X POST http://localhost:3000/modelos \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Archivo raro", "formato": "exe"}'

# Subida a un chunk de un modelo inexistente -> 404
curl -X POST http://localhost:3000/modelos/99/chunks \
  -H "Content-Type: application/json" \
  -d '{"bytes_base64": "eAo="}'

# Tamano total maximo superado (5 MB simulados) -> 400
# (envia chunk con base64 > tamano restante posible)
```

## Punto clave

La leccion del ejercicio: la validacion de subidas es **puro negocio de backend**, no del framework. Formato valido, tamano maximo y sesiones con chunks funcionan igual con base64, multipart o streams.
