# Ejercicio 22 - subida simulada de archivos

API de un estudio de arquitectura 3D hecha con Node.js y Express. Cada
proyecto puede tener archivos: planos en PDF, renders en PNG/JPG y
modelos 3D en GLB. Se suben con `multer`, pero se guardan **en memoria**
y no en disco, por eso es una subida simulada.

## Como funciona

1. El cliente manda los archivos como `multipart/form-data` en el campo
   `archivos` (se pueden mandar varios).
2. `express.json()` no entiende ese formato, lo lee `multer` en
   `middlewares/upload.middleware.js`.
3. `multer.memoryStorage()` deja cada archivo en `req.files[i].buffer`.
   En un proyecto real se usaria `diskStorage` o se mandaria a un
   servicio como S3.
4. Antes de aceptar un archivo se revisa:
   - **Tipo**: la extension y el mimetype tienen que coincidir con la
     lista permitida. Si no, 415.
   - **Tamano**: maximo `MAX_ARCHIVO_MB` por archivo. Si pasa, 413.
   - **Cantidad**: maximo `MAX_ARCHIVOS_POR_SUBIDA` por peticion. Si
     pasa, 400.
5. El service guarda la info (nombre, tipo, tamano, fecha) junto con el
   buffer. Al responder nunca se manda el buffer, solo la info.
6. El nombre original se limpia: se quitan carpetas (`../../`) y
   caracteres raros. Por ejemplo `render fachada.png` queda
   `render_fachada.png`.
7. La descarga devuelve el contenido igual a como se subio, con
   `Content-Type` y `Content-Disposition: attachment`.

Tipos permitidos:

| Extension       | Mimetype aceptado                               | Categoria |
| --------------- | ----------------------------------------------- | --------- |
| `.pdf`          | `application/pdf`                               | plano     |
| `.png`          | `image/png`                                     | render    |
| `.jpg`, `.jpeg` | `image/jpeg`                                    | render    |
| `.glb`          | `model/gltf-binary` o `application/octet-stream` | modelo 3D |

El `.glb` acepta `application/octet-stream` porque curl y la mayoria de
navegadores no conocen su mimetype real.

**Ojo:** el mimetype lo manda el cliente, se puede mentir. Revisar
extension + mimetype frena errores comunes, pero para estar seguro
habria que leer los primeros bytes del archivo ("magic numbers"), por
ejemplo un PDF empieza con `%PDF`.

| Carpeta / archivo | Que hay dentro                                       |
| ----------------- | ---------------------------------------------------- |
| `config.js`       | Lee limites del `.env`                               |
| `middlewares/`    | `upload.middleware.js` con multer y sus errores      |
| `routes/`         | `index.js`                                           |
| `controllers/`    | `archivos.controller.js` (subir, listar, descargar)  |
| `services/`       | `archivos.service.js` (guardar, limpiar nombre)      |
| `utils/`          | `app-error.js`                                       |
| `data/`           | `db.js` con proyectos y archivos en memoria          |

## Variables de entorno

```bash
copy .env.example .env
```

| Variable                  | Por defecto |
| ------------------------- | ----------- |
| `PORT`                    | `3022`      |
| `MAX_ARCHIVO_MB`          | `2`         |
| `MAX_ARCHIVOS_POR_SUBIDA` | `3`         |

## Requisitos

Node.js 20 o superior. Sin base de datos.

## Instalacion y ejecucion

```bash
npm install
npm start
```

| Script        | Descripcion                                        |
| ------------- | -------------------------------------------------- |
| `npm start`   | Levanta el servidor en http://localhost:3022       |
| `npm run dev` | Igual pero con recarga automatica (`node --watch`) |

## Endpoints

| Metodo | Ruta                          | Descripcion                                  |
| ------ | ----------------------------- | -------------------------------------------- |
| GET    | `/health`                     | Comprueba que el servidor vive               |
| GET    | `/api/proyectos`              | Proyectos con `totalArchivos`                |
| POST   | `/api/proyectos/:id/archivos` | Sube archivos (campo `archivos`, form-data)  |
| GET    | `/api/proyectos/:id/archivos` | Lista la info de los archivos del proyecto   |
| GET    | `/api/archivos/:id`           | Info de un archivo                           |
| GET    | `/api/archivos/:id/descarga`  | Descarga el contenido                        |
| DELETE | `/api/archivos/:id`           | Borra un archivo                             |

## Ejemplos (PowerShell)

Con `curl.exe -F` se manda `multipart/form-data`. El `@` indica que es un
archivo de la compu.

Subir tres archivos a la vez:

```bash
curl.exe -X POST http://localhost:3022/api/proyectos/1/archivos -F "archivos=@plano-planta.pdf" -F "archivos=@render fachada.png" -F "archivos=@casa.glb"
```

```json
{
  "ok": true,
  "total": 3,
  "data": [
    { "id": 1, "proyectoId": 1, "nombre": "plano-planta.pdf", "categoria": "plano", "mimetype": "application/pdf", "tamanoBytes": 31, "subido": "2026-11-02T23:51:47.830Z" },
    { "id": 2, "proyectoId": 1, "nombre": "render_fachada.png", "categoria": "render", "mimetype": "image/png", "tamanoBytes": 15, "subido": "2026-11-02T23:51:47.830Z" },
    { "id": 3, "proyectoId": 1, "nombre": "casa.glb", "categoria": "modelo 3D", "mimetype": "application/octet-stream", "tamanoBytes": 8, "subido": "2026-11-02T23:51:47.830Z" }
  ]
}
```

Descargar un archivo y guardarlo:

```bash
curl.exe -o bajado.pdf http://localhost:3022/api/archivos/1/descarga
```

Headers de la descarga:

```text
Content-Type: application/pdf
Content-Disposition: attachment; filename="plano-planta.pdf"
Content-Length: 31
```

## Casos de error

| Caso                                        | Status | Mensaje                                                  |
| ------------------------------------------- | ------ | -------------------------------------------------------- |
| Tipo no permitido (ej. `.txt`)              | 415    | `Tipo de archivo no permitido: notas.txt (text/plain). Se aceptan ...` |
| `.txt` mandado con mimetype `application/pdf` | 415  | Igual, la extension no coincide                          |
| Archivo de mas de 2 MB                      | 413    | `Un archivo pasa el maximo de 2 MB`                      |
| Mas de 3 archivos o campo con otro nombre   | 400    | `Manda hasta 3 archivos en el campo "archivos"`          |
| Peticion sin archivos                       | 400    | `No llego ningun archivo, mandalos en el campo "archivos"` |
| Proyecto que no existe                      | 404    | `No existe el proyecto con id 9`                         |
| Archivo que no existe                       | 404    | `No existe el archivo con id 3`                          |

Archivo no permitido:

```bash
curl.exe -X POST http://localhost:3022/api/proyectos/1/archivos -F "archivos=@notas.txt"
```

```json
{ "ok": false, "message": "Tipo de archivo no permitido: notas.txt (text/plain). Se aceptan .pdf, .png, .jpg, .jpeg, .glb" }
```

## Notas

- Todo vive en memoria, al reiniciar el servidor se pierden los archivos.
- Como se guardan en RAM, el limite de tamano y de cantidad es importante
  para que nadie llene la memoria del servidor.
