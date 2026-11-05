# Avanzado 16 - Sanitizacion de entrada (ropa y sneakers)

API en Node.js y Express para un catalogo de ropa urbana y zapatillas. El objetivo es tratar **toda entrada como no confiable**: limpiar lo que se puede limpiar sin cambiar el significado, rechazar lo que es ambiguo o peligroso y escapar al mostrar. Cada respuesta de creacion o edicion devuelve una lista `cambios` explicando que se limpio.

## Como ejecutarlo

```bash
npm install
npm start          # puerto 3000, cambia con PORT=3100
npm test
```

Ruta base: `/avanzado/ejercicio-16`. Los datos viven en memoria (10 productos en `src/data/productos.json`).

## Probar rapido

```bash
curl -H "Content-Type: application/json" \
  -d '{"sku":"snk run 77","nombre":"  Runner   Noche ","marca":"Aerostep","categoria":"sneakers","precio":79990,"tallas":["42",40,"41,5",40],"colores":["Negro"," negro "]}' \
  http://localhost:3000/avanzado/ejercicio-16/productos
curl -H "Content-Type: application/json" -d '{"__proto__":{"esAdmin":true}}' \
  http://localhost:3000/avanzado/ejercicio-16/productos
curl "http://localhost:3000/avanzado/ejercicio-16/productos?q=poleron&talla=M&talla=L"
curl "http://localhost:3000/avanzado/ejercicio-16/productos/5/ficha?resaltar=pima"
```

## Tres capas

### 1. Estructura (`src/sanitizacion/estructura.js`)

Antes de mirar los campos se revisa la forma del JSON y se **rechaza** (400 `ENTRADA_PELIGROSA`) si tiene:

- Claves `__proto__`, `constructor` o `prototype` (contaminacion de prototipo: podrian agregar propiedades a todos los objetos).
- Claves que empiezan con `$` o tienen `.` (operadores tipo `{ "$gt": 0 }` que en bases NoSQL cambian el sentido de una consulta).
- Mas de 4 niveles de anidacion, mas de 30 claves por objeto, listas de mas de 50 elementos o textos de mas de 5000 caracteres.

En la url, el parser `simple` evita que `?precioMax[$gt]=0` se convierta en un objeto. Un parametro repetido (`?q=a&q=b`) se rechaza, salvo `talla`, que admite varios valores a proposito.

### 2. Campos (`src/sanitizacion/texto.js` y `campos.js`)

Se limpia solo lo que no cambia el significado y se informa:

| Que | Como |
| --- | --- |
| Unicode | Se normaliza a NFC: `e` + acento combinado y la letra acentuada precompuesta se guardan igual |
| Caracteres invisibles | Se quitan espacios de ancho cero, marcas de direccion (`U+202E` hace que `gpj.exe` se vea como `exe.jpg`) y BOM |
| Caracteres de control | Se quitan (salvo salto de linea en textos multilinea) |
| Espacios | Se recortan y se colapsan. En la descripcion se conservan parrafos |
| HTML en la descripcion | Se quitan las etiquetas y comentarios |
| SKU | Mayusculas y guiones: `snk run_77` -> `SNK-RUN-77`. El duplicado se detecta despues de normalizar |
| Tallas | Calzado: numeros de 34 a 48 en medios puntos (`"41,5"` -> `41.5`). Ropa: `XS..XXL` (`" m "` -> `M`). Sin repetidos y ordenadas |
| Colores | Minusculas, sin repetidos |

Y se **rechaza** lo ambiguo en lugar de adivinar:

- `precio` debe ser un numero entero; `"1e5"` o `"990"` como texto no se convierten.
- `nombre` y `marca` solo aceptan letras, numeros y signos basicos, por lo que `<script>` no entra.
- En la busqueda, `precioMax` solo acepta digitos y `orden` solo valores de una lista (`nombre`, `-nombre`, `precio`, `-precio`), asi nadie puede ordenar por `__proto__`.

### 3. Salida (`src/vistas/escape.js`)

Los datos se guardan como texto plano y se **escapan al mostrarlos**. `GET /productos/:id/ficha` arma un HTML donde todo se escapa (`& < > " ' \``). Para resaltar el termino buscado primero se escapa el texto, despues se escapa el termino y se arma la expresion regular con `escaparRegExp`, asi un termino como `(unica` no rompe la expresion y `<img>` nunca llega como etiqueta. La ficha ademas envia una CSP muy estricta.

## Rutas

| Metodo y ruta | Que hace |
| --- | --- |
| `GET /` | Informacion del ejercicio |
| `GET /productos` | Busqueda: `q` (sin acentos ni mayusculas), `marca`, `categoria`, `talla` (repetible, hasta 5), `precioMax`, `orden`, `pagina`, `limite` |
| `POST /productos` | Crea. Responde `data` y `cambios` |
| `GET /productos/:id` | Detalle |
| `PATCH /productos/:id` | Edicion parcial con las mismas reglas. Si cambia la categoria hay que enviar las tallas nuevas |
| `DELETE /productos/:id` | Elimina |
| `GET /productos/:id/ficha?resaltar=` | Ficha HTML escapada |
| `POST /sanitizar` | `{ texto, multilinea?, quitarHtml? }` muestra como quedaria un texto y que se cambio |

## Errores

| Codigo | Estado | Cuando |
| --- | --- | --- |
| `VALIDACION` | 400 | Campos invalidos o parametros repetidos |
| `ENTRADA_PELIGROSA` | 400 | Estructura no permitida (prototipo, `$`, profundidad, tamano) |
| `JSON_INVALIDO` | 400 | El body no es un objeto JSON |
| `PRODUCTO_NO_ENCONTRADO` | 404 | No existe |
| `RUTA_NO_ENCONTRADA` | 404 | Ruta desconocida |
| `METODO_NO_PERMITIDO` | 405 | Metodo no admitido (cabecera `Allow`) |
| `SKU_DUPLICADO` | 409 | El SKU normalizado ya existe |
| `PAYLOAD_GRANDE` | 413 | Body de mas de 16 kb |
| `FORMATO_NO_SOPORTADO` | 415 | Falta `Content-Type: application/json` |
| `ERROR_INTERNO` | 500 | Error inesperado |

## Estructura

```
src/
  app.js, server.js
  sanitizacion/  texto (limpieza unicode), estructura (forma del json y query), campos (sku, tallas, colores, precio)
  validators/    producto y busqueda
  vistas/        escape html y resaltado seguro
  routes/        productos y sanitizar
  services/      productos
  middlewares/   errores, notFound, metodoNoPermitido, exigirTipo
  errores/       catalogo de errores
test/            limpieza, estructura, escape y pruebas de API
```
