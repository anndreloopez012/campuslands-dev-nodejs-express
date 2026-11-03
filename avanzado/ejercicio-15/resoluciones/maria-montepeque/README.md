# Avanzado 15 - seguridad de headers

API de comida urbana (menu de puestos y pedidos) hecha con Node.js y
Express. El foco son los **headers de seguridad**: le dicen al navegador
que cosas peligrosas NO hacer con nuestras respuestas. Los hice a mano
(`src/seguridad/cabeceras.js`) para entender que hace cada uno, igual que
la libreria `helmet`.

## Los headers y que evitan

| Header                          | Valor                                  | Que evita |
| ------------------------------- | -------------------------------------- | --------- |
| `X-Content-Type-Options`        | `nosniff`                              | Que el navegador "adivine" el tipo y ejecute como script algo que dijimos que era JSON o texto |
| `X-Frame-Options`               | `DENY`                                 | Que otro sitio meta nuestra pagina en un iframe invisible y engane al usuario para que haga clic (clickjacking) |
| `Content-Security-Policy`       | API: `default-src 'none'; frame-ancestors 'none'; ...` | Que se cargue o ejecute cualquier cosa que no autorizamos (la defensa mas fuerte contra XSS) |
| `Referrer-Policy`               | `no-referrer`                          | Que al seguir un link se mande nuestra URL (que puede tener datos) |
| `Permissions-Policy`            | `camera=(), microphone=(), geolocation=(), payment=()` | Que la pagina (o un script inyectado) pida camara, ubicacion, etc. |
| `Cross-Origin-Opener-Policy`    | `same-origin`                          | Que una ventana de otro sitio tenga referencia a la nuestra |
| `Cross-Origin-Resource-Policy`  | `same-origin`                          | Que otros sitios incrusten nuestros recursos |
| `X-DNS-Prefetch-Control`        | `off`                                  | Que el navegador resuelva DNS de links por adelantado (filtra a donde navega el usuario) |
| `Strict-Transport-Security`     | `max-age=15552000; includeSubDomains`  | Que alguien fuerce al usuario a entrar por HTTP (solo se manda si la conexion ya es HTTPS y en produccion) |
| `X-Powered-By`                  | (se quita)                             | Decirle al mundo que usamos Express |

Los headers salen en **todas** las respuestas, tambien en los 400, 404,
413 y JSON roto (hay un test que lo revisa en cada caso).

### CSP con nonce para la pagina HTML

`GET /menu` es una pagina con un script propio. Su CSP permite solo los
scripts que tengan el **nonce** (un numero aleatorio de un solo uso)
que se genera en cada respuesta:

```text
Content-Security-Policy: default-src 'self'; script-src 'nonce-q8Zt...'; ...
<script nonce="q8Zt..."> ... </script>
```

Si alguien lograra meter un `<script>` en la pagina, no tendria el nonce
y el navegador no lo ejecutaria.

### Escapar el HTML (la otra mitad)

En los datos hay un plato con nombre `<script>alert("hackeado")</script>Pupusas`.
Al armar la pagina, todo pasa por `escaparHtml()` y sale como texto
(`&lt;script&gt;...`). Los headers son una segunda capa; escapar es la
primera.

### HSTS y los proxies

En produccion la app suele estar detras de un proxy (nginx, un
balanceador) que recibe el HTTPS y le pasa HTTP a Node. Con
`app.set("trust proxy", 1)` (`TRUST_PROXY=true`), `req.secure` mira el
header `X-Forwarded-Proto` que pone el proxy. **Sin** trust proxy ese
header se ignora, porque cualquier cliente lo puede inventar (hay un test
para eso).

### Cache

- `GET /api/menu`: `public, max-age=300` (es publico y cambia poco).
- Pedidos (tienen nombre y telefono): `no-store`, para que no quede copia
  ni en el navegador ni en un proxy.

## Requisitos e instalacion

Node.js 20 o superior. Sin base de datos.

```bash
npm install
npm start
```

| Script        | Descripcion                        |
| ------------- | ---------------------------------- |
| `npm start`   | Servidor en http://localhost:4015  |
| `npm run dev` | Servidor con recarga automatica    |
| `npm test`    | Tests de los headers               |

## Endpoints

| Metodo | Ruta                | Descripcion                                   |
| ------ | ------------------- | --------------------------------------------- |
| GET    | `/health`           | El servidor vive                              |
| GET    | `/api/menu`         | Menu en JSON (cache publica)                  |
| GET    | `/menu`             | Menu en HTML (CSP con nonce, contenido escapado) |
| POST   | `/api/pedidos`      | `{ platoId, cliente, telefono }` (no-store)   |
| GET    | `/api/pedidos/:id`  | Un pedido (no-store)                          |

## Ejemplo

```bash
curl.exe -i http://localhost:4015/api/menu
```

```text
HTTP/1.1 200 OK
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
X-DNS-Prefetch-Control: off
Content-Security-Policy: default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'
Cache-Control: public, max-age=300
Content-Type: application/json; charset=utf-8
```

Abriendo http://localhost:4015/menu en el navegador se ve el plato con
`<script>` como texto, y el script propio (la hora) si funciona. En la
consola de las herramientas del navegador, cualquier script sin nonce
aparece bloqueado por la CSP.

## Tests

`test/cabeceras.test.js`:

- Los 7 headers base y sin `X-Powered-By` en 200, 201, 400, 404, JSON
  roto y HTML.
- La CSP de la API.
- Cache publica en el menu y `no-store` en los pedidos.
- HSTS: no por HTTP, no fuera de produccion, si detras de un proxy HTTPS
  y no si no se confia en el proxy.
- El nonce del script coincide con la CSP y cambia en cada respuesta.
- El nombre con `<script>` sale escapado.
- `escaparHtml` y el 413 con headers.

```text
ℹ tests 17
ℹ pass 17
ℹ fail 0
```

Para comprobar que sirven quite el `escaparHtml` del nombre del plato y
fallo `el nombre con <script> sale escapado, como texto`.
