# Intermedio 15 - JWT basico (Allison Vargas)

## Que hace este ejercicio

API de comida urbana protegida con JSON Web Tokens firmados con HS256. El JWT esta implementado con `node:crypto`, sin librerias extra, para ver como funciona por dentro:

- El login devuelve un `accessToken` con tres partes separadas por punto: encabezado (`alg`, `typ`), claims y firma.
- Claims del token: `sub` (id del usuario), `rol`, `iss` (emisor), `iat` (emitido) y `exp` (expira). Dura 15 minutos.
- La firma se calcula con HMAC SHA-256 sobre `encabezado.claims` y un secreto del servidor. Si alguien cambia un solo caracter del token, la firma deja de coincidir.
- La verificacion es estricta: formato, algoritmo permitido (se rechaza `alg: none`), firma comparada con `timingSafeEqual`, emisor y expiracion.
- El servidor no guarda sesiones: confia en el token. Por eso un cambio de rol solo se nota en el siguiente login.

Roles ordenados: `cliente` < `vendedor` < `admin`.

- `/menu` se lee sin token. Crear y editar platos pide vendedor o admin, y borrar pide admin.
- `/pedidos` pide token. Un cliente solo ve y cancela sus propios pedidos; vendedor y admin ven todos y avanzan el estado.
- El total del pedido lo calcula el servidor con los precios del menu, nunca el cliente.
- Ciclo de estados: `pendiente` a `preparando` o `cancelado`, `preparando` a `listo` y `listo` a `entregado`.

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

- routes: auth, menu y pedidos.
- controllers: validan el body, llaman al service y arman la respuesta.
- services: login, lectura del token, menu y reglas de pedidos.
- repositories: usuarios, platos y pedidos en memoria.
- validators: esquemas del body, validador de pedidos (lineas con `platoId` y `cantidad`) y lector de parametros de consulta.
- middlewares: `autenticar` (lee y verifica el JWT), `requerirRol`, carga de plato, metodo no permitido, notFound y errorHandler.
- constants: roles y transiciones de estado del pedido.
- utils: `jwt.js` (firmar y verificar), hash de contrasenas, configuracion, errores, paginacion y respuestas.
- data: 4 usuarios, 12 platos y 3 pedidos en JSON.

## Como ejecutar

```bash
cd intermedio/ejercicio-15/resoluciones/allison-vargas
npm install
npm run dev
```

El servidor queda en http://localhost:3000. Los datos viven en memoria: al reiniciar vuelven a los del JSON.

Variables opcionales (no hace falta un `.env`):

- `JWT_SECRET`: secreto de firma. Si no se define se usa uno de desarrollo y el servidor lo avisa al arrancar. En un proyecto real siempre debe venir del entorno.
- `JWT_EXPIRES_SECONDS`: duracion del token, por defecto 900.

## Respuesta esperada

```bash
curl http://localhost:3000/intermedio/ejercicio-15
```

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "JWT basico"
}
```

## Usuarios de prueba

| Email | Contrasena | Rol |
| --- | --- | --- |
| admin@comida.test | Admin123 | admin |
| vendedor@comida.test | Vendedor123 | vendedor |
| cliente@comida.test | Cliente123 | cliente |
| cliente2@comida.test | Cliente2123 | cliente |

## Endpoints

Todas las rutas cuelgan de `/intermedio/ejercicio-15`.

| Metodo | Ruta | Acceso | Descripcion |
| --- | --- | --- | --- |
| POST | /auth/registro | publico | Crea una cuenta con rol cliente |
| POST | /auth/login | publico | Devuelve el `accessToken` |
| GET | /auth/perfil | token | Datos del usuario del token |
| GET | /auth/token | token | Claims del token, fechas y segundos restantes |
| GET | /menu | publico | Lista paginada con filtros |
| GET | /menu/:id | publico | Detalle de un plato |
| POST | /menu | vendedor o admin | Crea un plato |
| PATCH | /menu/:id | vendedor o admin | Actualiza un plato |
| DELETE | /menu/:id | admin | Borra un plato |
| GET | /pedidos | token | Pedidos propios (todos para vendedor y admin) |
| POST | /pedidos | token | Crea un pedido con sus lineas |
| GET | /pedidos/:id | dueno o personal | Detalle de un pedido |
| PATCH | /pedidos/:id/estado | dueno o personal | Cambia el estado del pedido |

## Campos del body

| Ruta | Campos |
| --- | --- |
| /auth/registro | `nombre` (2-60), `email`, `password` (8-72, con letra y numero) |
| /auth/login | `email`, `password` |
| /menu | `nombre` (2-80), `categoria` (`tacos`, `hamburguesas`, `bowls`, `snacks`, `bebidas`, `postres`), `precio` (1-1000, entero), `vegetariano` (por defecto `false`), `disponible` (por defecto `true`) |
| /pedidos | `items` (1 a 10 lineas con `platoId` y `cantidad` de 1 a 20, sin platos repetidos) y `nota` opcional (1-140) |
| /pedidos/:id/estado | `estado` (`pendiente`, `preparando`, `listo`, `entregado`, `cancelado`) |

En POST todos los campos sin valor por defecto son obligatorios. En PATCH del menu basta con enviar uno. Los campos desconocidos se rechazan con 400. Un cliente solo puede pasar su pedido a `cancelado`, y solo mientras esta `pendiente`.

## Parametros de consulta

Los listados aceptan `pagina` (por defecto 1), `limite` (por defecto 10, maximo 50) y `orden`.

| Listado | Filtros | Orden |
| --- | --- | --- |
| /menu | `categoria`, `precioMax`, `vegetariano`, `disponible` | `nombre` (por defecto), `precio`, `categoria` |
| /pedidos | `estado` | `reciente` (por defecto), `total` |

## Ejemplos

```bash
curl -X POST http://localhost:3000/intermedio/ejercicio-15/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente@comida.test","password":"Cliente123"}'

curl http://localhost:3000/intermedio/ejercicio-15/auth/token \
  -H "Authorization: Bearer TOKEN"

curl "http://localhost:3000/intermedio/ejercicio-15/menu?vegetariano=true&precioMax=20&orden=precio"

curl -X POST http://localhost:3000/intermedio/ejercicio-15/pedidos \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"items":[{"platoId":1,"cantidad":2},{"platoId":10,"cantidad":1}],"nota":"Extra salsa"}'

curl -X PATCH http://localhost:3000/intermedio/ejercicio-15/pedidos/2/estado \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"estado":"cancelado"}'
```

Para ver el token por dentro se puede pegar en https://jwt.io o decodificar las dos primeras partes en base64url.

En PowerShell, las comillas del JSON dan problemas con `curl`. Se puede usar Thunder Client, Postman o `Invoke-RestMethod`:

```powershell
$login = Invoke-RestMethod -Method Post -Uri http://localhost:3000/intermedio/ejercicio-15/auth/login -ContentType "application/json" -Body '{"email":"cliente@comida.test","password":"Cliente123"}'
Invoke-RestMethod -Uri http://localhost:3000/intermedio/ejercicio-15/auth/token -Headers @{ Authorization = "Bearer $($login.data.accessToken)" }
```

## Formato de respuesta

```json
{
  "ok": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tipo": "Bearer",
    "expiraEnSegundos": 900,
    "expiraEn": "2026-11-03T20:15:00.000Z",
    "usuario": { "id": 3, "nombre": "Carla Cliente", "email": "cliente@comida.test", "rol": "cliente" }
  }
}
```

Los listados agregan `paginacion` y el header `X-Total-Count`.

## Errores

```json
{
  "ok": false,
  "message": "La firma del token no es valida",
  "codigo": "TOKEN_FIRMA_INVALIDA"
}
```

| Status | Codigo | Cuando |
| --- | --- | --- |
| 400 | VALIDACION, JSON_INVALIDO, CONSULTA_INVALIDA, ID_INVALIDO | body, id o parametros invalidos |
| 401 | NO_AUTENTICADO | falta el header Authorization |
| 401 | TOKEN_INVALIDO | el header no es `Bearer <token>` o el token no trae usuario o rol validos |
| 401 | TOKEN_MALFORMADO | el token no tiene tres partes JWT validas |
| 401 | TOKEN_ALGORITMO_NO_PERMITIDO | el encabezado pide un algoritmo distinto de HS256 (por ejemplo `none`) |
| 401 | TOKEN_FIRMA_INVALIDA | el token fue modificado o firmado con otro secreto |
| 401 | TOKEN_EMISOR_INVALIDO | el claim `iss` no es el de esta API |
| 401 | TOKEN_EXPIRADO | paso la fecha `exp` |
| 401 | CREDENCIALES_INVALIDAS | email o contrasena incorrectos |
| 403 | PERMISOS_INSUFICIENTES | el rol no alcanza para la accion |
| 403 | PEDIDO_AJENO | el pedido pertenece a otro usuario |
| 404 | PLATO_NO_ENCONTRADO, PEDIDO_NO_ENCONTRADO | recurso inexistente |
| 405 | METODO_NO_PERMITIDO | metodo no soportado (con header `Allow`) |
| 409 | EMAIL_DUPLICADO, PLATO_DUPLICADO, PLATO_NO_DISPONIBLE, TRANSICION_INVALIDA | conflicto con el estado actual |
| 422 | REFERENCIA_INVALIDA | un `platoId` del pedido no existe |
