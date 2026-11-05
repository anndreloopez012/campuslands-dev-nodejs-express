# Intermedio 20 - CORS controlado

## Que hace

API de una galeria de dibujo digital con CORS implementado a mano, sin paquetes extra. Cada grupo de rutas tiene su propia politica:

- `publica` (`/galeria`, `/cors`): cualquier origen puede leer (`Access-Control-Allow-Origin: *`), solo GET y HEAD, sin credenciales.
- `restringida` (`/obras`): solo los origenes de una lista blanca, con GET, POST, PATCH y DELETE, cabeceras `Content-Type` y `X-Cliente`, y credenciales.

Un origen que no esta en la lista recibe 403 y ninguna cabecera CORS. Las peticiones sin cabecera `Origin` (curl, Postman, servidor a servidor) pasan normal, porque CORS solo lo aplican los navegadores. Los preflight (`OPTIONS` con `Access-Control-Request-Method`) se validan: metodo y cabeceras pedidas deben estar permitidos, y si todo esta bien responde 204.

## Estructura

```
src/
  app.js
  server.js
  config/cors.js
  constants/obras.js
  controllers/
  data/obras.json
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

Origenes permitidos por defecto: `http://localhost:5173`, `http://localhost:3000` y `https://lienzo.dibujo.test`. Para cambiarlos usa la variable `ORIGENES_PERMITIDOS` (origenes completos separados por coma, sin ruta ni barra final):

```
$env:ORIGENES_PERMITIDOS = "http://localhost:4200,https://miapp.com"
npm run dev
```

Si algun valor no es un origen valido, el servidor no arranca y lo indica. El puerto se cambia con `PORT` (3000 por defecto).

## Respuesta esperada

`GET /intermedio/ejercicio-20`

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "CORS controlado"
}
```

## Endpoints

Base: `/intermedio/ejercicio-20`

| Metodo | Ruta | Politica | Descripcion |
|---|---|---|---|
| GET | `/cors/politicas` | publica | Muestra las dos politicas y sus rutas |
| GET | `/galeria` | publica | Obras publicas |
| GET | `/galeria/:id` | publica | Una obra publica (si es privada, 404) |
| GET | `/obras` | restringida | Todas las obras |
| GET | `/obras/:id` | restringida | Detalle de una obra |
| POST | `/obras` | restringida | Crea una obra |
| PATCH | `/obras/:id` | restringida | Edita campos de una obra |
| DELETE | `/obras/:id` | restringida | Elimina una obra |

## Campos del body

`POST /obras`:

| Campo | Tipo | Regla |
|---|---|---|
| titulo | texto | 3 a 80 caracteres, obligatorio |
| artista | texto | 2 a 60 caracteres, obligatorio |
| herramienta | texto | procreate, krita, photoshop, clip studio o medibang, obligatorio |
| ancho | entero | 64 a 8192, obligatorio |
| alto | entero | 64 a 8192, obligatorio |
| publica | booleano | opcional, false por defecto |

`PATCH /obras/:id` acepta los mismos campos, todos opcionales, con al menos uno.

## Parametros de consulta

- `/galeria`: `herramienta`, `artista` (contiene el texto), `orden` (id, titulo, reciente), `pagina`, `limite`.
- `/obras`: lo mismo mas `publica` (true o false).

## Ejemplos

curl:

```
curl http://localhost:3000/intermedio/ejercicio-20/galeria -H "Origin: https://cualquiera.com" -i
curl http://localhost:3000/intermedio/ejercicio-20/obras -H "Origin: http://localhost:5173" -i
curl http://localhost:3000/intermedio/ejercicio-20/obras -H "Origin: https://malo.com" -i
curl -X OPTIONS http://localhost:3000/intermedio/ejercicio-20/obras/1 -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: PATCH" -H "Access-Control-Request-Headers: Content-Type" -i
curl -X POST http://localhost:3000/intermedio/ejercicio-20/obras -H "Origin: http://localhost:5173" -H "Content-Type: application/json" -d "{\"titulo\":\"Luna de papel\",\"artista\":\"Ana Ruiz\",\"herramienta\":\"krita\",\"ancho\":1000,\"alto\":800}"
```

PowerShell:

```
Invoke-RestMethod http://localhost:3000/intermedio/ejercicio-20/galeria
Invoke-RestMethod -Headers @{ Origin = "http://localhost:5173" } http://localhost:3000/intermedio/ejercicio-20/obras
$body = @{ titulo = "Luna de papel"; artista = "Ana Ruiz"; herramienta = "krita"; ancho = 1000; alto = 800 } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/intermedio/ejercicio-20/obras -Headers @{ Origin = "http://localhost:5173" } -ContentType "application/json" -Body $body
```

Para ver las cabeceras CORS con curl usa `-i`. Con `Invoke-RestMethod` no se ven; usa `Invoke-WebRequest` y revisa `.Headers`.

## Formato de respuesta

Exito: `{ "ok": true, "data": ... }`. Los listados agregan `paginacion` y el header `X-Total-Count`. Al crear responde 201 con el header `Location`.

Cabeceras CORS que se envian cuando el origen esta permitido: `Access-Control-Allow-Origin` (el origen exacto, o `*` en la politica publica), `Access-Control-Allow-Credentials` (solo restringida), `Access-Control-Expose-Headers` y `Vary: Origin`. El preflight agrega `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers` y `Access-Control-Max-Age`.

## Errores

Formato: `{ "ok": false, "message": "...", "codigo": "...", "errores": [...] }`

| Status | Codigo | Cuando |
|---|---|---|
| 400 | VALIDACION, CONSULTA_INVALIDA, JSON_INVALIDO | Body o parametros invalidos |
| 403 | ORIGEN_NO_PERMITIDO | El origen no esta en la lista blanca |
| 403 | METODO_CORS_NO_PERMITIDO | El preflight pide un metodo no permitido |
| 403 | CABECERA_CORS_NO_PERMITIDA | El preflight pide una cabecera no permitida |
| 404 | OBRA_NO_ENCONTRADA, RUTA_NO_ENCONTRADA | No existe el recurso |
| 405 | METODO_NO_PERMITIDO | Metodo no soportado en la ruta |
| 409 | OBRA_DUPLICADA | El artista ya tiene una obra con ese titulo |
