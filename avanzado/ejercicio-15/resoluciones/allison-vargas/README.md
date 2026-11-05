# Avanzado 15 - Seguridad de headers (comida urbana)

API en Node.js y Express para puestos de comida urbana (cartas, resenas y pedidos). El foco del ejercicio son las **cabeceras HTTP de seguridad**, escritas a mano para entender que hace cada una en lugar de usar `helmet` o `cors`.

## Como ejecutarlo

```bash
npm install
npm start               # puerto 3000, cambia con PORT=3100
TRUST_PROXY=loopback npm start   # si corre detras de un proxy local que termina https
npm test
```

Ruta base: `/avanzado/ejercicio-15`.

## Probar rapido

```bash
curl -i http://localhost:3000/avanzado/ejercicio-15/puestos
curl -i http://localhost:3000/avanzado/ejercicio-15/puestos/1/carta
curl -i -X OPTIONS -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" http://localhost:3000/avanzado/ejercicio-15/pedidos
curl http://localhost:3000/avanzado/ejercicio-15/seguridad/autoevaluacion
```

## Cabeceras que se envian en todas las respuestas

| Cabecera | Valor | Para que |
| --- | --- | --- |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'nonce-...'; ...; object-src 'none'; frame-ancestors 'none'; report-uri ...` | Solo se ejecutan scripts y estilos propios o con el nonce de esa respuesta. Bloquea XSS aunque se cuele HTML |
| `X-Content-Type-Options` | `nosniff` | El navegador no adivina el tipo de contenido |
| `X-Frame-Options` | `DENY` | Nadie puede meter la pagina en un iframe (clickjacking) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | No filtra rutas completas a otros sitios |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(self), payment=()` | Apaga APIs del navegador que no se usan |
| `Cross-Origin-Opener-Policy` / `Cross-Origin-Resource-Policy` | `same-origin` | Aisla la pagina de otras ventanas y origenes |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | **Solo si la conexion es https.** Obliga a usar https en adelante |
| `X-XSS-Protection` | `0` | Desactiva el filtro antiguo, que generaba fallos de seguridad propios |
| `X-Powered-By` | (se elimina) | No revela que el servidor usa Express |

Detalles importantes:

- **Nonce por peticion**: cada respuesta genera 16 bytes aleatorios. La pagina `GET /puestos/:id/carta` usa ese mismo nonce en su `<script>` y `<style>`. Un script inyectado no lo conoce, asi que no se ejecuta.
- **Escape de HTML**: las resenas que escriben los usuarios se escapan (`& < > " ' \``) antes de ir a la pagina. La CSP es una segunda linea de defensa, no reemplaza el escape.
- **HSTS y proxies**: detras de un proxy la app ve http. Solo si se configura `trust proxy` (variable `TRUST_PROXY`) se acepta `X-Forwarded-Proto: https`. Sin esa configuracion la cabecera se ignora, porque cualquiera podria enviarla.
- La configuracion se valida al arrancar: directivas CSP desconocidas, palabras como `self` sin comillas, `Referrer-Policy` invalida o HSTS con `preload` sin cumplir los requisitos detienen el inicio.

## CORS

- Lista blanca de origenes: `http://localhost:5173` y cualquier subdominio `https://*.comida-urbana.test` (con una expresion anclada, para que `x.comida-urbana.test.evil.example` no pase).
- `*` esta prohibido en la lista porque se usan credenciales.
- Origen permitido: se refleja en `Access-Control-Allow-Origin` con `Access-Control-Allow-Credentials: true` y `Access-Control-Expose-Headers: Location`.
- Origen no permitido en una peticion simple: se responde sin cabeceras CORS y el navegador bloquea la lectura.
- Preflight (`OPTIONS` con `Access-Control-Request-Method`): `204` si el origen, el metodo y las cabeceras estan permitidos; `403` si no.
- Siempre se agrega `Vary: Origin` para que una cache no entregue la respuesta de un origen a otro.

## Cache

- `GET /puestos` y `GET /puestos/:id`: `Cache-Control: public, max-age=60`.
- `/pedidos`, `/csp-reportes` y `/seguridad/*`: `Cache-Control: no-store`, `Pragma: no-cache`, porque tienen datos del cliente o de diagnostico.

## Rutas

| Metodo y ruta | Que hace |
| --- | --- |
| `GET /` | Informacion del ejercicio |
| `GET /puestos`, `GET /puestos/:id` | Puestos y su carta en JSON |
| `GET /puestos/:id/carta` | Pagina HTML de la carta con resenas (usa el nonce) |
| `GET /puestos/:id/resenas`, `POST /puestos/:id/resenas` | `{ autor, texto, estrellas }` |
| `POST /pedidos` | `{ puestoId, items: [{ platoId, cantidad }] }`. Calcula el total |
| `GET /pedidos/:id` | Detalle del pedido |
| `POST /csp-reportes` | Recibe violaciones CSP (`application/csp-report` o `application/reports+json`). Guarda las ultimas 50 |
| `GET /csp-reportes` | Lista las violaciones recibidas |
| `GET /seguridad/autoevaluacion` | Analiza las cabeceras de su propia respuesta |
| `POST /seguridad/analizar` | `{ cabeceras: {...}, https }` analiza cabeceras de otro sitio y da puntaje y nota (A-F) |

El analizador revisa, entre otras cosas, `unsafe-inline` sin nonce, `unsafe-eval`, comodines en scripts, HSTS corto, `X-Powered-By` y `*` combinado con credenciales.

## Errores

| Codigo | Estado | Cuando |
| --- | --- | --- |
| `VALIDACION` | 400 | Datos invalidos |
| `JSON_INVALIDO` | 400 | Body que no es JSON |
| `ORIGEN_NO_PERMITIDO` | 403 | Preflight desde un origen fuera de la lista |
| `PREFLIGHT_RECHAZADO` | 403 | Metodo o cabeceras no permitidos por CORS |
| `PUESTO_NO_ENCONTRADO`, `PEDIDO_NO_ENCONTRADO` | 404 | No existe |
| `RUTA_NO_ENCONTRADA` | 404 | Ruta desconocida |
| `METODO_NO_PERMITIDO` | 405 | Metodo no admitido (cabecera `Allow`) |
| `PAYLOAD_GRANDE` | 413 | Body muy grande |
| `FORMATO_NO_SOPORTADO` | 415 | `Content-Type` incorrecto |
| `ERROR_INTERNO` | 500 | Error inesperado |

## Estructura

```
src/
  app.js, server.js
  seguridad/    csp, cabeceras (helmet casero y sinCache), cors, analizador
  vistas/       carta html con escape
  routes/       puestos y pedidos, seguridad y reportes csp
  services/     puestos
  validators/   validaciones escritas a mano
  middlewares/  errores, notFound, metodoNoPermitido, exigirTipo
  errores/      catalogo de errores
test/           unidades de seguridad y pruebas de API
```
