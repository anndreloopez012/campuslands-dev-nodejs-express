# Avanzado 16 - sanitizacion de entrada

API de una tienda de sneakers (productos, resenas, perfil e imagenes)
hecha con Node.js y Express. Todo lo que manda el cliente se **limpia y
se revisa** antes de usarlo, porque la entrada del usuario es el camino
de casi todos los ataques.

Validar (avanzado 03) es decir "esto esta bien o mal". Sanitizar es
**dejarlo en una forma segura** antes de usarlo: quitar lo que sobra,
normalizar y cortar los trucos.

## Los ataques que se cubren

### 1. Prototype pollution (`src/sanitizar/objetos.js`)

```js
JSON.parse('{"__proto__":{"esAdmin":true}}')
```

crea un objeto con una llave propia `__proto__`. Un merge ingenuo
(`destino[clave] = valor`) termina cambiando el **prototipo de todos los
objetos**: de repente `({}).esAdmin === true` en toda la aplicacion. En
`test/sanitizar.test.js` hay un test que lo muestra pasando de verdad.

Defensa:

- Un middleware rechaza (400) cualquier body con `__proto__`,
  `constructor` o `prototype`, aunque esten anidados, y dice donde estan.
- `mergeSeguro()` las ignora igual (segunda capa) y usa `Object.hasOwn`.

### 2. Mass assignment

`PATCH /api/perfil` con `{ "nombre": "x", "rol": "admin", "saldo": 1000000 }`.
`elegir(body, ["nombre", "preferencias"])` copia **solo** los campos
permitidos. En las resenas tampoco se puede mandar `id` ni `aprobada`.

### 3. Tipos inesperados

Si un campo deberia ser texto y llega `{ "$gt": "" }` (inyeccion de
operadores, tipica en MongoDB) o un arreglo, `limpiarTexto` devuelve
`null` en vez de convertirlo en `"[object Object]"`.

En la query, `?marca=nike&marca=adidas` llega como **arreglo** (HTTP
parameter pollution): `textoDeQuery` solo acepta un texto.

### 4. Texto sucio (`src/sanitizar/texto.js`)

`limpiarTexto`:

- Normaliza a NFC: `José` puede escribirse con 1 o 2 caracteres y se
  veria igual; asi quedan iguales.
- Quita caracteres de control y los **invisibles** de ancho cero (con
  ellos `"ad​min"` parece `"admin"`).
- Junta espacios y recorta.
- Corta por caracteres reales (un emoji ocupa 2 posiciones en JS).

`quitarHtml` deja las resenas en texto plano: quita `<script>` con su
contenido, cualquier etiqueta y los `<` sueltos. Igual hay que escapar al
mostrar en HTML (avanzado 15); esto es otra capa.

`numeroEstricto`: `"1e309"` es `Infinity`, `""` es `0`, `" 12 "` es `12`
para `Number()`. Solo acepto numeros escritos como numeros, finitos y
dentro del rango.

### 5. ReDoS en busquedas (`src/sanitizar/entrada.js`)

La busqueda arma un `RegExp` con lo que escribe el usuario. Sin escapar,
`(a+)+$` puede dejar el servidor colgado (*ReDoS*) y `.*` se salta el
filtro. `escaparRegex` lo convierte en texto literal: buscar `(Hi)`
encuentra "Chuck 70 (Hi)".

### 6. Path traversal

`GET /api/imagenes/:archivo` lee un archivo de `data/imagenes/`. Con
`..%2Fsecreto.txt` se podria leer `data/secreto.txt`. `rutaDentroDe`:

- Solo acepta nombres con letras, numeros, guion y un punto de extension
  (nada de `/`, `\`, `..` ni archivos ocultos).
- Resuelve la ruta y revisa que **quede dentro** de la carpeta.

## Requisitos e instalacion

Node.js 20 o superior. Sin base de datos.

```bash
npm install
npm start
```

| Script        | Descripcion                        |
| ------------- | ---------------------------------- |
| `npm start`   | Servidor en http://localhost:4016  |
| `npm run dev` | Servidor con recarga automatica    |
| `npm test`    | Tests de los sanitizadores y de la API |

## Endpoints

| Metodo | Ruta                            | Descripcion                                     |
| ------ | ------------------------------- | ----------------------------------------------- |
| GET    | `/health`                       | El servidor vive                                |
| GET    | `/api/productos`                | `?q=` (busqueda segura), `?marca=`              |
| POST   | `/api/productos/:id/resenas`    | `{ autor, texto, calificacion }`                |
| GET    | `/api/productos/:id/resenas`    | Resenas del producto                            |
| PATCH  | `/api/perfil`                   | `{ nombre, preferencias }` (merge seguro)       |
| GET    | `/api/imagenes/:archivo`        | Archivo de `data/imagenes/`                     |

## Ejemplos (PowerShell)

Una resena "sucia":

```bash
curl.exe -X POST http://localhost:4016/api/productos/1/resenas -H "Content-Type: application/json" -d '{\"autor\":\" Marco \",\"texto\":\"Muy <b>comodos</b><script>robar()</script>\",\"calificacion\":\"5\",\"aprobada\":true}'
```

```json
{ "ok": true, "data": { "id": 1, "productoId": 1, "autor": "Marco", "texto": "Muy comodos", "calificacion": 5 } }
```

Intento de prototype pollution:

```bash
curl.exe -X PATCH http://localhost:4016/api/perfil -H "Content-Type: application/json" -d '{\"preferencias\":{\"__proto__\":{\"esAdmin\":true}}}'
```

```json
{ "ok": false, "message": "El body tiene llaves no permitidas", "errors": ["body.preferencias.__proto__"] }
```

Intento de leer un archivo de afuera:

```bash
curl.exe http://localhost:4016/api/imagenes/..%2Fsecreto.txt
```

```json
{ "ok": false, "message": "Nombre de archivo no valido" }
```

## Tests

- `test/sanitizar.test.js`: el merge ingenuo contaminando de verdad,
  `mergeSeguro`, llaves anidadas, limpiar texto (invisibles, NFC,
  emojis, objetos), quitar HTML, 11 valores que `numeroEstricto`
  rechaza, query con arreglos, ReDoS rapido, 8 rutas de path traversal,
  `elegir` sin heredados.
- `test/api.test.js`: los mismos ataques por HTTP.

```text
ℹ tests 31
ℹ pass 31
ℹ fail 0
```

Para comprobar que sirven hice que `mergeSeguro` no saltara las llaves
peligrosas y fallo `mergeSeguro ignora __proto__, constructor y prototype`.
