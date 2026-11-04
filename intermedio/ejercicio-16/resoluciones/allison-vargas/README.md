# Intermedio 16 - Rutas protegidas (Allison Vargas)

## Que hace este ejercicio

API de una tienda de ropa y sneakers donde unas rutas son publicas y otras exigen sesion. La proteccion se arma con middlewares encadenados en el router, antes del controlador:

1. `autenticar` lee el header `Authorization: Bearer <token>`, verifica el JWT (HS256 con `node:crypto`) y deja al usuario en `req.usuario`. Sin token o con token malo responde 401.
2. `requerirRol('admin')` revisa el rol del usuario. Si no alcanza responde 403.
3. Recien despues se carga el recurso (404) y se aplican las reglas de negocio (409, 422).

Zonas de la API:

| Zona | Proteccion |
| --- | --- |
| `GET /productos`, `GET /productos/:id` | publicas |
| `POST`, `PATCH`, `DELETE` en `/productos` | token y rol admin |
| `/favoritos` completo | token (cada usuario solo ve los suyos) |
| `/pedidos` completo | token (el cliente solo ve los suyos, el admin ve todos) |
| `/admin/*` | token y rol admin, aplicado una sola vez con `router.use` |

Detalles:

- Un pedido de otra persona responde 404, como si no existiera, para no revelar que existe.
- El token solo lleva el id del usuario; el rol se consulta en cada peticion.
- Al crear un pedido el servidor valida el stock, descuenta unidades y calcula el total con los precios del catalogo. Al cancelar devuelve el stock.
- Ciclo del pedido: `pendiente` a `pagado` o `cancelado`, `pagado` a `enviado` o `cancelado`. El cliente solo puede cancelar sus pedidos pendientes; el admin avanza los estados.
- No se puede borrar un producto que esta en pedidos `pendiente` o `pagado`.

## Estructura

```text
.
|-- package.json
|-- README.md
`-- src
    |-- app.js
    |-- server.js
    |-- routes/
    |-- controllers/
    |-- services/
    |-- repositories/
    |-- validators/
    |-- middlewares/
    |-- constants/
    |-- utils/
    `-- data/
```

- routes: auth, productos, favoritos, pedidos y admin.
- controllers: validan el body, llaman al service y arman la respuesta.
- services: login y lectura del token, catalogo, favoritos, pedidos y resumen de admin.
- repositories: usuarios, productos, pedidos y favoritos en memoria.
- validators: esquemas del body, validador de pedidos y lector de parametros de consulta.
- middlewares: `autenticar`, `requerirRol`, carga de producto, metodo no permitido, notFound y errorHandler.
- constants: roles y estados del pedido.
- utils: JWT, hash de contrasenas, configuracion, errores, paginacion y respuestas.
- data: 3 usuarios, 10 productos, 2 pedidos y 1 favorito en JSON.

## Como ejecutar

```bash
cd intermedio/ejercicio-16/resoluciones/allison-vargas
npm install
npm run dev
```

El servidor queda en http://localhost:3000. Los datos viven en memoria: al reiniciar vuelven a los del JSON.

Variables opcionales (no hace falta un `.env`):

- `JWT_SECRET`: secreto de firma. Si no se define se usa uno de desarrollo y el servidor lo avisa al arrancar.
- `JWT_EXPIRES_SECONDS`: duracion del token, por defecto 3600.

## Respuesta esperada

```bash
curl http://localhost:3000/intermedio/ejercicio-16
```

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "rutas protegidas"
}
```

## Usuarios de prueba

| Email | Contrasena | Rol |
| --- | --- | --- |
| admin@sneakers.test | Admin123 | admin |
| cliente@sneakers.test | Cliente123 | cliente |
| cliente2@sneakers.test | Cliente2123 | cliente |

## Endpoints

Todas las rutas cuelgan de `/intermedio/ejercicio-16`.

| Metodo | Ruta | Acceso | Descripcion |
| --- | --- | --- | --- |
| POST | /auth/registro | publico | Crea una cuenta con rol cliente |
| POST | /auth/login | publico | Devuelve el `accessToken` |
| GET | /auth/perfil | token | Datos del usuario del token |
| GET | /productos | publico | Lista paginada con filtros |
| GET | /productos/:id | publico | Detalle de un producto |
| POST | /productos | admin | Crea un producto |
| PATCH | /productos/:id | admin | Actualiza un producto |
| DELETE | /productos/:id | admin | Borra un producto |
| GET | /favoritos | token | Favoritos del usuario con el producto incluido |
| POST | /favoritos | token | Agrega un producto a favoritos |
| DELETE | /favoritos/:productoId | token | Quita un favorito |
| GET | /pedidos | token | Pedidos propios (todos para admin) |
| POST | /pedidos | token | Crea un pedido |
| GET | /pedidos/:id | dueno o admin | Detalle de un pedido |
| PATCH | /pedidos/:id/estado | dueno o admin | Cambia el estado del pedido |
| GET | /admin/resumen | admin | Totales de usuarios, productos, pedidos y ventas |
| GET | /admin/usuarios | admin | Lista de usuarios con filtro por rol |

## Campos del body

| Ruta | Campos |
| --- | --- |
| /auth/registro | `nombre` (2-60), `email`, `password` (8-72, con letra y numero) |
| /auth/login | `email`, `password` |
| /productos | `nombre` (2-80), `marca` (2-40), `categoria` (`running`, `basket`, `casual`, `skate`), `precio` (1-5000, entero), `stock` (0-1000) |
| /favoritos | `productoId` |
| /pedidos | `items` (1 a 5 lineas con `productoId`, `talla` de 35 a 46 y `cantidad` de 1 a 5, sin productos repetidos) y `direccion` (5-120) |
| /pedidos/:id/estado | `estado` (`pendiente`, `pagado`, `enviado`, `cancelado`) |

En POST todos los campos son obligatorios. En PATCH de productos basta con enviar uno. Los campos desconocidos se rechazan con 400.

## Parametros de consulta

Los listados aceptan `pagina` (por defecto 1), `limite` (por defecto 10, maximo 50) y `orden`.

| Listado | Filtros | Orden |
| --- | --- | --- |
| /productos | `categoria`, `marca`, `precioMax`, `enStock` | `nombre` (por defecto), `precio`, `marca` |
| /favoritos | ninguno | `reciente` (por defecto), `antiguo` |
| /pedidos | `estado` | `reciente` (por defecto), `total` |
| /admin/usuarios | `rol` | `id` (por defecto), `nombre` |

## Ejemplos

```bash
curl "http://localhost:3000/intermedio/ejercicio-16/productos?categoria=running&enStock=true&orden=precio"

curl -X POST http://localhost:3000/intermedio/ejercicio-16/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente@sneakers.test","password":"Cliente123"}'

curl http://localhost:3000/intermedio/ejercicio-16/favoritos \
  -H "Authorization: Bearer TOKEN"

curl -X POST http://localhost:3000/intermedio/ejercicio-16/pedidos \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"items":[{"productoId":2,"talla":41,"cantidad":1}],"direccion":"Zona 1, Guatemala"}'

curl http://localhost:3000/intermedio/ejercicio-16/admin/resumen \
  -H "Authorization: Bearer TOKEN_ADMIN"
```

En PowerShell, las comillas del JSON dan problemas con `curl`. Se puede usar Thunder Client, Postman o `Invoke-RestMethod`:

```powershell
$login = Invoke-RestMethod -Method Post -Uri http://localhost:3000/intermedio/ejercicio-16/auth/login -ContentType "application/json" -Body '{"email":"cliente@sneakers.test","password":"Cliente123"}'
Invoke-RestMethod -Uri http://localhost:3000/intermedio/ejercicio-16/favoritos -Headers @{ Authorization = "Bearer $($login.data.accessToken)" }
```

## Formato de respuesta

```json
{
  "ok": true,
  "data": {
    "id": 3,
    "usuarioId": 2,
    "items": [{ "productoId": 2, "nombre": "Ultraboost Light", "talla": 41, "precio": 180, "cantidad": 1 }],
    "total": 180,
    "direccion": "Zona 1, Guatemala",
    "estado": "pendiente",
    "creadoEn": "2026-11-03T20:00:00.000Z"
  }
}
```

Los listados agregan `paginacion` y el header `X-Total-Count`.

## Errores

```json
{
  "ok": false,
  "message": "Esta ruta es solo para: admin",
  "codigo": "PERMISOS_INSUFICIENTES"
}
```

| Status | Codigo | Cuando |
| --- | --- | --- |
| 400 | VALIDACION, JSON_INVALIDO, CONSULTA_INVALIDA, ID_INVALIDO | body, id o parametros invalidos |
| 401 | NO_AUTENTICADO | falta el header Authorization |
| 401 | TOKEN_INVALIDO, TOKEN_MALFORMADO, TOKEN_FIRMA_INVALIDA, TOKEN_ALGORITMO_NO_PERMITIDO, TOKEN_EMISOR_INVALIDO, TOKEN_EXPIRADO | token mal formado, alterado o vencido |
| 401 | CREDENCIALES_INVALIDAS | email o contrasena incorrectos |
| 403 | PERMISOS_INSUFICIENTES, ACCION_SOLO_ADMIN | el rol no alcanza para la ruta o la accion |
| 404 | PRODUCTO_NO_ENCONTRADO, PEDIDO_NO_ENCONTRADO, FAVORITO_NO_ENCONTRADO | recurso inexistente o ajeno |
| 405 | METODO_NO_PERMITIDO | metodo no soportado (con header `Allow`) |
| 409 | EMAIL_DUPLICADO, PRODUCTO_DUPLICADO, FAVORITO_DUPLICADO | duplicados |
| 409 | SIN_STOCK, TRANSICION_INVALIDA, PRODUCTO_EN_PEDIDOS | el estado actual no permite la accion |
| 422 | REFERENCIA_INVALIDA | un `productoId` no existe |
