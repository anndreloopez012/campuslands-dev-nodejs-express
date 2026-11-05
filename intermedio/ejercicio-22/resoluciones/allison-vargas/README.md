# Intermedio 22 - subida simulada de archivos

## Que hace

API para registrar archivos de proyectos de arquitectura 3D (modelos, planos y texturas) con una subida simulada: no se envian bytes reales, solo los metadatos y los datos de verificacion. Funciona en dos fases, como las subidas con URL prefirmada:

1. **Solicitar** (`POST /proyectos/:id/subidas`): se validan nombre, extension, tipo MIME, tamano, checksum, duplicados y cuota del proyecto. Si todo esta bien se reserva la subida (estado `pendiente`) y se devuelve una URL simulada.
2. **Confirmar** (`POST /subidas/:id/confirmar`): el cliente dice cuantos bytes llegaron y el checksum. Si coinciden con lo declarado, la subida pasa a `completada` y el archivo queda en el proyecto.

Una solicitud pendiente vence a los 600 segundos (se cambia con `SUBIDA_TTL_SEG`). Mientras esta vigente cuenta para la cuota; si vence, deja de contar y se muestra como `expirada`.

## Estructura

```
src/
  app.js
  server.js
  config/subidas.js
  constants/archivos.js
  controllers/
  data/
  middlewares/
  repositories/
  routes/
  services/
  utils/
  validators/
```

## Como ejecutar

```
npm install
npm run dev
```

Puerto 3000 por defecto (`PORT`). Para probar la expiracion rapido en PowerShell:

```
$env:SUBIDA_TTL_SEG = "10"
npm run dev
```

## Respuesta esperada

`GET /intermedio/ejercicio-22`

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "subida simulada de archivos"
}
```

## Endpoints

Base: `/intermedio/ejercicio-22`

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/reglas` | Extensiones, tipos MIME y limites de tamano |
| GET | `/proyectos` | Lista proyectos con su uso de cuota |
| GET | `/proyectos/:id` | Detalle de un proyecto con `usoBytes` y `disponibleBytes` |
| GET | `/proyectos/:id/archivos` | Archivos completados del proyecto |
| POST | `/proyectos/:id/subidas` | Solicita una subida (201) |
| GET | `/subidas/:id` | Estado de una subida |
| POST | `/subidas/:id/confirmar` | Confirma que el archivo llego completo |
| DELETE | `/subidas/:id` | Elimina una subida o un archivo |

Proyectos de prueba: 1 (activo, 1 GB), 2 (activo, 250 MB con 180 MB usados) y 3 (archivado).

## Campos del body

`POST /proyectos/:id/subidas` (todos obligatorios):

| Campo | Tipo | Regla |
|---|---|---|
| nombre | texto | 3 a 120 caracteres; letras, numeros, espacios, `.`, `-`, `_`, `(`, `)`; con extension; sin `..` ni extensiones ejecutables dentro del nombre |
| tipoMime | texto | debe corresponder a la extension (ver `/reglas`) |
| tamanoBytes | entero | mayor que 0; maximo segun categoria |
| checksum | texto | SHA-256 en hexadecimal, 64 caracteres |

`POST /subidas/:id/confirmar`: `bytesRecibidos` (entero) y `checksum` (SHA-256).

Categorias y limites:

| Categoria | Extensiones | Maximo |
|---|---|---|
| modelo | .obj .fbx .glb .gltf .stl .ifc | 200 MB |
| plano | .dwg .dxf .pdf | 50 MB |
| textura | .png .jpg .jpeg .webp | 25 MB |

## Parametros de consulta

- `/proyectos`: `estado` (activo o archivado), `orden` (id, nombre), `pagina`, `limite`.
- `/proyectos/:id/archivos`: `categoria` (modelo, plano, textura), `orden` (reciente, nombre, tamano), `pagina`, `limite`.

## Ejemplos

Para generar un checksum de prueba en PowerShell:

```
$bytes = [Text.Encoding]::UTF8.GetBytes("mi archivo")
$hash = -join ([Security.Cryptography.SHA256]::Create().ComputeHash($bytes) | ForEach-Object { $_.ToString("x2") })
```

curl:

```
curl http://localhost:3000/intermedio/ejercicio-22/reglas
curl -X POST http://localhost:3000/intermedio/ejercicio-22/proyectos/1/subidas -H "Content-Type: application/json" -d "{\"nombre\":\"torre vista.obj\",\"tipoMime\":\"model/obj\",\"tamanoBytes\":5000000,\"checksum\":\"bf0ec3694e122e067d9964a38ec7d8415781df4b24f442ad767b4621fb98f8c5\"}"
curl -X POST http://localhost:3000/intermedio/ejercicio-22/subidas/5/confirmar -H "Content-Type: application/json" -d "{\"bytesRecibidos\":5000000,\"checksum\":\"bf0ec3694e122e067d9964a38ec7d8415781df4b24f442ad767b4621fb98f8c5\"}"
curl "http://localhost:3000/intermedio/ejercicio-22/proyectos/1/archivos?categoria=modelo&orden=tamano"
```

PowerShell:

```
$body = @{ nombre = "torre vista.obj"; tipoMime = "model/obj"; tamanoBytes = 5000000; checksum = $hash } | ConvertTo-Json
$subida = Invoke-RestMethod -Method Post -Uri http://localhost:3000/intermedio/ejercicio-22/proyectos/1/subidas -ContentType "application/json" -Body $body
$confirmacion = @{ bytesRecibidos = 5000000; checksum = $hash } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/intermedio/ejercicio-22/subidas/$($subida.data.id)/confirmar" -ContentType "application/json" -Body $confirmacion
```

## Formato de respuesta

Exito: `{ "ok": true, "data": ... }`. Los listados agregan `paginacion` y el header `X-Total-Count`. Al solicitar una subida responde 201 con `Location`, `urlSimulada` y `siguientePaso`.

Estados de una subida: `pendiente`, `completada` y `expirada` (solo se muestra, se calcula al consultar).

## Errores

Formato: `{ "ok": false, "message": "...", "codigo": "...", "errores": [...] }`

| Status | Codigo | Cuando |
|---|---|---|
| 400 | VALIDACION, CONSULTA_INVALIDA, JSON_INVALIDO | Body o parametros invalidos, nombre inseguro, checksum mal formado |
| 404 | PROYECTO_NO_ENCONTRADO, SUBIDA_NO_ENCONTRADA, RUTA_NO_ENCONTRADA | No existe el recurso |
| 405 | METODO_NO_PERMITIDO | Metodo no soportado en la ruta |
| 409 | PROYECTO_ARCHIVADO | El proyecto no admite archivos |
| 409 | ARCHIVO_DUPLICADO | Ya existe un archivo con el mismo checksum en el proyecto |
| 409 | SUBIDA_YA_CONFIRMADA | La subida ya estaba completada |
| 410 | SUBIDA_EXPIRADA | La solicitud vencio |
| 413 | ARCHIVO_MUY_GRANDE | Supera el limite de su categoria |
| 413 | CUOTA_EXCEDIDA | El proyecto no tiene espacio suficiente |
| 415 | TIPO_NO_SOPORTADO, MIME_NO_COINCIDE | Extension no permitida o tipo MIME que no corresponde |
| 422 | SUBIDA_INCOMPLETA, CHECKSUM_INVALIDO | Lo recibido no coincide con lo declarado |
