# Intermedio 14 - autenticacion simulada (Allison Vargas)

## Que hace este ejercicio

API de libros con autenticacion simulada, sin librerias externas ni base de datos:

- Registro e inicio de sesion con email y contrasena. Las contrasenas se guardan con scrypt y sal propia, nunca en texto plano.
- El login devuelve un token aleatorio opaco (`Authorization: Bearer <token>`). En el servidor solo se guarda su huella SHA-256 y la fecha de expiracion de la sesion.
- Tres roles ordenados: `lector` < `editor` < `admin`. Cada ruta pide un rol minimo.
- Respuestas distintas segun el caso: 401 si falta o no sirve el token, 403 si el rol no alcanza y 429 si hay demasiados intentos de login.
- Los favoritos son privados: cada usuario solo ve y modifica los suyos.

Reglas de seguridad simuladas:

- Email o contrasena incorrectos devuelven siempre el mismo mensaje, exista o no el email.
- Tras 5 intentos fallidos para un email, el login se bloquea 60 segundos (429 con `Retry-After`), incluso con la contrasena correcta.
- La sesion dura 30 minutos. Pasado ese tiempo el token responde 401 `TOKEN_EXPIRADO`.
- Cerrar sesion invalida el token. Cambiar la contrasena cierra las demas sesiones del usuario.
- Un admin puede cambiar el rol o desactivar cuentas, pero no la suya. Desactivar una cuenta cierra sus sesiones.
- Las rutas protegidas validan primero la identidad y el rol, y despues si el recurso existe (un 401 nunca revela si un id existe).
- Las respuestas nunca incluyen el hash de la contrasena.

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

- routes: auth, libros, favoritos y usuarios.
- controllers: validan el body, llaman al service y arman la respuesta.
- services: login, sesiones, reglas de roles, favoritos y libros.
- repositories: libros, usuarios y favoritos en memoria; sesiones e intentos de login en mapas privados.
- validators: esquemas del body (incluye email y contrasena) y lector de parametros de consulta.
- middlewares: `autenticar`, `requerirRol`, carga de libro y usuario, metodo no permitido, notFound y errorHandler.
- constants: roles y su orden.
- utils: errores tipados, hash de contrasenas, tokens, configuracion, paginacion y respuestas.
- data: 14 libros, 4 usuarios y 4 favoritos en JSON.

## Como ejecutar

```bash
cd intermedio/ejercicio-14/resoluciones/allison-vargas
npm install
npm run dev
```

El servidor queda en http://localhost:3000. Los datos viven en memoria: al reiniciar vuelven a los del JSON y se pierden las sesiones.

Variables opcionales (no hace falta un `.env`): `SESSION_TTL_SECONDS` (por defecto 1800), `LOGIN_MAX_INTENTOS` (5) y `LOGIN_BLOQUEO_SEGUNDOS` (60).

## Respuesta esperada

```bash
curl http://localhost:3000/intermedio/ejercicio-14
```

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "autenticacion simulada"
}
```

## Usuarios de prueba

| Email | Contrasena | Rol |
| --- | --- | --- |
| admin@libros.test | Admin123 | admin |
| editor@libros.test | Editor123 | editor |
| lector@libros.test | Lector123 | lector |
| bloqueado@libros.test | Bloqueado123 | lector (cuenta desactivada) |

## Endpoints

Todas las rutas cuelgan de `/intermedio/ejercicio-14`.

| Metodo | Ruta | Acceso | Descripcion |
| --- | --- | --- | --- |
| POST | /auth/registro | publico | Crea una cuenta con rol lector |
| POST | /auth/login | publico | Devuelve el token de sesion |
| POST | /auth/logout | autenticado | Cierra la sesion actual (204) |
| GET | /auth/perfil | autenticado | Datos del usuario y de su sesion |
| PATCH | /auth/password | autenticado | Cambia la contrasena y cierra las otras sesiones |
| GET | /libros | publico | Lista paginada con filtros |
| GET | /libros/:id | publico | Detalle de un libro |
| POST | /libros | editor o admin | Crea un libro |
| PATCH | /libros/:id | editor o admin | Actualiza un libro |
| DELETE | /libros/:id | admin | Borra un libro y lo quita de los favoritos |
| GET, POST | /favoritos | autenticado | Lista y agrega favoritos propios |
| GET, DELETE | /favoritos/:libroId | autenticado | Detalle y quita un favorito propio |
| GET | /usuarios | admin | Lista paginada de usuarios |
| GET, PATCH | /usuarios/:id | admin | Detalle y cambio de `rol` o `activo` |

## Campos del body

| Ruta | Campos |
| --- | --- |
| /auth/registro | `nombre` (2-60), `email`, `password` (8-72, con letra y numero) |
| /auth/login | `email`, `password` |
| /auth/password | `passwordActual`, `passwordNueva` (8-72, con letra y numero, distinta de la actual) |
| /libros | `titulo` (2-120), `autor` (2-80), `genero` (`novela`, `ciencia-ficcion`, `fantasia`, `misterio`, `historia`, `poesia`), `anio` (1000-2100), `paginas` (1-5000), `disponible` (por defecto `true`) |
| /favoritos | `libroId` |
| /usuarios/:id | `rol` (`lector`, `editor`, `admin`) y/o `activo` |

En POST todos los campos sin valor por defecto son obligatorios. En PATCH basta con enviar uno. Los campos desconocidos se rechazan con 400.

## Parametros de consulta

Los listados aceptan `pagina` (por defecto 1), `limite` (por defecto 10, maximo 50) y `orden`.

| Listado | Filtros | Orden |
| --- | --- | --- |
| /libros | `genero`, `anioMin`, `disponible` | `titulo` (por defecto), `autor`, `anio` |
| /favoritos | - | `reciente` (por defecto), `titulo` |
| /usuarios | `rol`, `activo` | `nombre` (por defecto), `email`, `creado` |

## Ejemplos

```bash
curl -X POST http://localhost:3000/intermedio/ejercicio-14/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"editor@libros.test","password":"Editor123"}'

curl http://localhost:3000/intermedio/ejercicio-14/auth/perfil \
  -H "Authorization: Bearer TOKEN"

curl -X POST http://localhost:3000/intermedio/ejercicio-14/libros \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"titulo":"El Aleph","autor":"Jorge Luis Borges","genero":"novela","anio":1949,"paginas":180}'

curl -X POST http://localhost:3000/intermedio/ejercicio-14/favoritos \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"libroId":2}'

curl "http://localhost:3000/intermedio/ejercicio-14/libros?genero=ciencia-ficcion&orden=anio"
curl -i -X POST http://localhost:3000/intermedio/ejercicio-14/auth/logout -H "Authorization: Bearer TOKEN"
```

En PowerShell, las comillas del JSON dan problemas con `curl`. Se puede usar Thunder Client, Postman o `Invoke-RestMethod`:

```powershell
$login = Invoke-RestMethod -Method Post -Uri http://localhost:3000/intermedio/ejercicio-14/auth/login -ContentType "application/json" -Body '{"email":"editor@libros.test","password":"Editor123"}'
Invoke-RestMethod -Uri http://localhost:3000/intermedio/ejercicio-14/auth/perfil -Headers @{ Authorization = "Bearer $($login.data.token)" }
```

## Formato de respuesta

```json
{
  "ok": true,
  "data": {
    "token": "9f2c...",
    "tipo": "Bearer",
    "expiraEnSegundos": 1800,
    "expiraEn": "2026-11-03T20:30:00.000Z",
    "usuario": { "id": 2, "nombre": "Eli Editor", "email": "editor@libros.test", "rol": "editor", "activo": true }
  }
}
```

Los listados agregan `paginacion` y el header `X-Total-Count`.

## Errores

```json
{
  "ok": false,
  "message": "Esta accion requiere el rol admin o superior",
  "codigo": "PERMISOS_INSUFICIENTES"
}
```

| Status | Codigo | Cuando |
| --- | --- | --- |
| 400 | VALIDACION, JSON_INVALIDO, CONSULTA_INVALIDA, ID_INVALIDO | body, id o parametros invalidos |
| 401 | NO_AUTENTICADO | falta el header Authorization |
| 401 | TOKEN_INVALIDO | formato incorrecto, token desconocido o sesion cerrada |
| 401 | TOKEN_EXPIRADO | la sesion paso su tiempo de vida |
| 401 | CREDENCIALES_INVALIDAS | email o contrasena incorrectos en el login |
| 403 | PERMISOS_INSUFICIENTES | el rol no alcanza para la ruta |
| 403 | CUENTA_DESACTIVADA, PASSWORD_ACTUAL_INCORRECTA | cuenta inactiva o contrasena actual mal escrita |
| 404 | LIBRO_NO_ENCONTRADO, USUARIO_NO_ENCONTRADO, FAVORITO_NO_ENCONTRADO | recurso inexistente |
| 405 | METODO_NO_PERMITIDO | metodo no soportado (con header `Allow`) |
| 409 | EMAIL_DUPLICADO, LIBRO_DUPLICADO, FAVORITO_DUPLICADO, ACCION_SOBRE_SI_MISMO | conflicto con el estado actual |
| 422 | REFERENCIA_INVALIDA | el `libroId` enviado no existe |
| 429 | DEMASIADOS_INTENTOS | login bloqueado temporalmente (header `Retry-After`) |
