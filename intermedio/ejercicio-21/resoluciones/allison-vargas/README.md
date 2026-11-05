# Intermedio 21 - rate limit conceptual

## Que hace

API de escenas de animacion 3D con limitacion de peticiones (rate limit) implementada a mano, sin paquetes extra, para entender como funciona por dentro. Hay dos algoritmos y tres politicas:

| Politica | Rutas | Algoritmo | Regla |
|---|---|---|---|
| lectura | `GET /escenas`, `GET /escenas/:id` | ventana fija | 10 peticiones cada 10 segundos |
| escritura | `POST /escenas` | cubeta de tokens | capacidad 3, recupera 1 token cada 5 segundos |
| render | `POST /escenas/:id/render` | ventana fija | 2 peticiones cada 30 segundos |

Ideas clave:

- **Ventana fija**: se cuentan las peticiones dentro de un periodo. Al llegar al limite se bloquea hasta que el periodo termina y el contador vuelve a cero. Es simple, pero permite rafagas pegadas al cambio de ventana.
- **Cubeta de tokens**: cada peticion gasta un token y los tokens se recuperan con el tiempo. Permite rafagas cortas (hasta la capacidad) y luego obliga a ir mas despacio.
- El limite es **por cliente**. El cliente se identifica con el header `x-cliente`; si no viene, se usa la IP. Cada politica tiene su propio contador.
- El limite se revisa **antes** de validar el body, asi que los intentos con datos invalidos tambien cuentan.
- Las respuestas incluyen `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` (segundos) y `RateLimit-Policy`. Al superar el limite responde 429 con `Retry-After`.
- Los contadores viven en memoria y se limpian solos cada minuto. Si el servidor se reinicia, se pierden; con varias instancias haria falta un almacen compartido.
- El header `x-cliente` lo puede enviar cualquiera, por eso aqui sirve solo para practicar. En una API real se identifica por IP, API key o usuario autenticado.

## Estructura

```
src/
  app.js
  server.js
  config/limites.js
  constants/escenas.js
  controllers/
  data/escenas.json
  middlewares/
  repositories/
  routes/
  services/
  utils/limitadores.js
  validators/
```

## Como ejecutar

```
npm install
npm run dev
```

Puerto 3000 por defecto; se cambia con la variable `PORT`.

## Respuesta esperada

`GET /intermedio/ejercicio-21`

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "rate limit conceptual"
}
```

## Endpoints

Base: `/intermedio/ejercicio-21`

| Metodo | Ruta | Politica | Descripcion |
|---|---|---|---|
| GET | `/limites` | ninguna | Muestra las politicas y cuanto le queda al cliente actual |
| GET | `/escenas` | lectura | Lista escenas |
| GET | `/escenas/:id` | lectura | Detalle de una escena |
| POST | `/escenas` | escritura | Crea una escena (queda en borrador) |
| POST | `/escenas/:id/render` | render | Envia una escena en borrador a render. Responde 202 con cuadros y tiempo estimado |

## Campos del body

`POST /escenas` (todos obligatorios):

| Campo | Tipo | Regla |
|---|---|---|
| titulo | texto | 3 a 80 caracteres |
| autor | texto | 2 a 60 caracteres |
| fps | entero | 12 a 120 |
| duracionSeg | entero | 1 a 600 |
| resolucion | texto | 720p, 1080p o 4k |

## Parametros de consulta

`/escenas`: `estado` (borrador o renderizando), `resolucion`, `orden` (id, titulo, reciente), `pagina`, `limite`.

## Ejemplos

curl (el `-i` muestra los headers del limite):

```
curl -i -H "x-cliente: ana" http://localhost:3000/intermedio/ejercicio-21/escenas
curl -H "x-cliente: ana" http://localhost:3000/intermedio/ejercicio-21/limites
curl -i -X POST -H "x-cliente: ana" http://localhost:3000/intermedio/ejercicio-21/escenas/1/render
curl -X POST http://localhost:3000/intermedio/ejercicio-21/escenas -H "x-cliente: ana" -H "Content-Type: application/json" -d "{\"titulo\":\"Escena nueva\",\"autor\":\"Ana Ruiz\",\"fps\":24,\"duracionSeg\":10,\"resolucion\":\"720p\"}"
```

Para ver el 429 repite la primera linea mas de 10 veces en menos de 10 segundos.

PowerShell:

```
1..12 | ForEach-Object { try { (Invoke-WebRequest -Headers @{ "x-cliente" = "ana" } http://localhost:3000/intermedio/ejercicio-21/escenas).StatusCode } catch { $_.Exception.Response.StatusCode.value__ } }
Invoke-RestMethod -Headers @{ "x-cliente" = "ana" } http://localhost:3000/intermedio/ejercicio-21/limites
$body = @{ titulo = "Escena nueva"; autor = "Ana Ruiz"; fps = 24; duracionSeg = 10; resolucion = "720p" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/intermedio/ejercicio-21/escenas -Headers @{ "x-cliente" = "ana" } -ContentType "application/json" -Body $body
```

## Formato de respuesta

Exito: `{ "ok": true, "data": ... }`. Los listados agregan `paginacion` y el header `X-Total-Count`. Al crear responde 201 con `Location`.

Headers de limite en las rutas limitadas:

| Header | Significado |
|---|---|
| RateLimit-Limit | Maximo de peticiones de la politica |
| RateLimit-Remaining | Peticiones que quedan |
| RateLimit-Reset | Segundos hasta que se renueva el cupo |
| RateLimit-Policy | Resumen de la regla, por ejemplo `10;w=10` |
| Retry-After | Solo en 429: segundos de espera |

## Errores

Formato: `{ "ok": false, "message": "...", "codigo": "...", "errores": [...] }`

| Status | Codigo | Cuando |
|---|---|---|
| 400 | VALIDACION, CONSULTA_INVALIDA, JSON_INVALIDO | Body o parametros invalidos |
| 400 | CLIENTE_INVALIDO | `x-cliente` no tiene entre 3 y 40 letras, numeros, guiones o guiones bajos |
| 404 | ESCENA_NO_ENCONTRADA, RUTA_NO_ENCONTRADA | No existe el recurso |
| 405 | METODO_NO_PERMITIDO | Metodo no soportado en la ruta |
| 409 | ESCENA_NO_RENDERIZABLE | La escena ya esta renderizando |
| 429 | LIMITE_EXCEDIDO | Se supero el limite; revisa `Retry-After` |
