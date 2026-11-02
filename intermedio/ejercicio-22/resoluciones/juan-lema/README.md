# Ejercicio 22 - subida simulada de archivos (Juan Lema)

## Que hace

Tematica arquitectura 3D. `POST /uploads` recibe un archivo real por `multipart/form-data` (planos, modelos 3D, renders), lo valida como en un sistema de produccion y **simula el almacenamiento**: no escribe nada en disco, guarda solo los metadatos en memoria y descarta los bytes.

- **Multipart con `multer` en memoria** y limites: un solo archivo en el campo `file`, maximo 5 MB, pocos campos de texto. Pasarse del tamano responde `413`; campo equivocado, demasiados archivos o multipart malformado responden `400`.
- **Lista blanca de tipos**: `.glb`, `.obj`, `.stl`, `.png`, `.jpg` (extension en minusculas; `virus.exe`, `plano.glb.exe` o un archivo sin extension responden `415`).
- **No se confia en la extension ni en el `Content-Type` del cliente**: para `.glb`, `.png` y `.jpg` se comprueban los primeros bytes del archivo (firma). Un texto renombrado a `.png` responde `415`. Los formatos de texto (`.obj`, `.stl`) no tienen firma fiable, por eso solo se validan por extension.
- **Nombre saneado**: se descartan rutas (`../../x.glb` o `..\..\x.glb` quedan como `x.glb`), se reemplazan caracteres peligrosos y se recorta a 100 caracteres. Ademas el nombre nunca decide donde se guarda: el servidor genera la `storageKey` con un UUID.
- **Integridad y duplicados**: se calcula el `sha256`; el mismo contenido en el mismo proyecto responde `409` (en otro proyecto si se permite).
- El campo de texto `project` (obligatorio, hasta 60 caracteres) viaja junto al archivo.
- Los errores lanzados por el servicio llevan un `status` y `middlewares/error-handler.js` los convierte en JSON; un error inesperado responde `500` sin filtrar detalles.

Como es una simulacion, no hay ruta de descarga: `storageKey` representa la clave que devolveria un almacen real (S3, disco, etc.). Guardar en memoria solo es razonable con archivos pequenos y limitados; para archivos grandes se enviaria el flujo directamente al almacen.

## Como ejecutar

```bash
npm install
npm start
```

## Como probar

Los archivos de ejemplo se crean al vuelo (el primero es un `.obj` de texto valido):

```bash
printf 'v 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3\n' > casa.obj
curl -i -F "project=Torre Aurora" -F "file=@casa.obj" http://localhost:4022/uploads
curl http://localhost:4022/uploads
curl http://localhost:4022/uploads/1
```

## Como probar los casos de error

```bash
printf 'esto es texto plano' > falso.png
curl -i -F "project=Torre Aurora" -F "file=@falso.png" http://localhost:4022/uploads
curl -i -F "project=Torre Aurora" -F "file=@casa.obj" http://localhost:4022/uploads
curl -i -F "project=Torre Aurora" http://localhost:4022/uploads
curl -i -F "file=@casa.obj" http://localhost:4022/uploads
curl -i -F "project=Torre Aurora" -F "model=@casa.obj" http://localhost:4022/uploads
curl -i -F "project=Torre Aurora" -F "file=@casa.obj;filename=virus.exe" http://localhost:4022/uploads
curl http://localhost:4022/uploads/abc
curl http://localhost:4022/uploads/99
```

Para el limite de tamano, un archivo de mas de 5 MB responde `413`:

```bash
head -c 6000000 /dev/zero > grande.obj
curl -i -F "project=Torre Aurora" -F "file=@grande.obj" http://localhost:4022/uploads
```

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/uploads.routes.js
├── controllers/uploads.controller.js
├── services/uploads.service.js
└── middlewares/
    ├── receive-file.js
    └── error-handler.js
```
