# Intermedio 17 - Roles y permisos (Allison Vargas)

## Que hace este ejercicio

API de viajes y turismo con control de acceso por roles y permisos (RBAC). La autenticacion usa JWT HS256 (`node:crypto`, sin librerias extra) y el token solo lleva el id del usuario en `sub`. En cada peticion el servidor busca al usuario y toma su rol actual, por eso un cambio de rol se nota de inmediato sin volver a iniciar sesion.

Cada rol tiene una lista de permisos con formato `recurso:accion`. Las rutas piden permisos, no roles, y cada rol hereda los del anterior: `viajero` < `guia` < `agente` < `admin`.

| Rol | Permisos nuevos |
| --- | --- |
| viajero | `reservas:crear`, `reservas:ver-propias`, `reservas:cancelar-propias` |
| guia | `tours:gestionar-propios`, `reservas:ver-de-mis-tours`, `reservas:confirmar-de-mis-tours` |
| agente | `destinos:gestionar`, `tours:gestionar-todos`, `tours:ver-borradores`, `tours:eliminar`, `reservas:ver-todas`, `reservas:confirmar-todas`, `reservas:cancelar-todas`, `usuarios:ver` |
| admin | `destinos:eliminar`, `usuarios:cambiar-rol` |

Orden de las verificaciones en cada ruta protegida:

1. 401 si falta el token o es invalido.
2. 403 si el rol no tiene el permiso de la ruta.
3. 404 si el recurso no existe o el usuario no tiene derecho a verlo (un borrador ajeno o una reserva de otra persona se comportan como si no existieran).
4. 403 si ve el recurso pero no es suyo para esa accion (`TOUR_AJENO`, `RESERVA_SIN_PERMISO`).
5. 409 si el estado actual no permite la accion.

Reglas de negocio:

- Destinos: se leen sin token. Crear y editar pide `destinos:gestionar`; borrar pide `destinos:eliminar` y falla con 409 si tiene tours.
- Tours: el listado publico solo muestra los `publicado`. Un guia ve ademas los suyos y el agente o admin ven todos. Un guia solo crea y edita tours a su nombre; el agente o admin puede asignar cualquier guia. El `guiaId` debe ser un usuario con rol guia. Ciclo de estados: `borrador` a `publicado` a `cerrado`; un tour cerrado no se edita. Un guia solo borra sus tours en `borrador`; el agente o admin borra cualquiera sin reservas activas.
- Reservas: se crean sobre tours `publicado`. Se controlan los cupos (`SIN_CUPOS`), la reserva repetida y que el guia no reserve su propio tour. Ciclo: `pendiente` a `confirmada` o `cancelada`, y `confirmada` a `cancelada`. Confirma el guia del tour o un agente/admin; cancela el dueno o un agente/admin.
- Usuarios: el agente o admin los consulta; solo el admin cambia roles. No puede cambiar el suyo ni degradar a un guia que tenga tours asignados.

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

- routes: auth, roles, destinos, tours, reservas y usuarios.
- controllers: validan el body, llaman al service y arman la respuesta.
- services: login y lectura del token, y las reglas de cada recurso.
- repositories: usuarios, destinos, tours y reservas en memoria.
- validators: esquemas del body y lector de parametros de consulta.
- middlewares: `autenticar`, `autenticarOpcional`, `requierePermiso`, carga de tour y destino, metodo no permitido, notFound y errorHandler.
- constants: matriz de permisos por rol y transiciones de estado.
- utils: JWT, hash de contrasenas, configuracion, errores, paginacion y respuestas.
- data: 6 usuarios, 6 destinos, 8 tours y 6 reservas en JSON.

## Como ejecutar

```bash
cd intermedio/ejercicio-17/resoluciones/allison-vargas
npm install
npm run dev
```

El servidor queda en http://localhost:3000. Los datos viven en memoria: al reiniciar vuelven a los del JSON.

Variables opcionales (no hace falta un `.env`):

- `JWT_SECRET`: secreto de firma. Si no se define se usa uno de desarrollo y el servidor lo avisa al arrancar.
- `JWT_EXPIRES_SECONDS`: duracion del token, por defecto 3600.

## Respuesta esperada

```bash
curl http://localhost:3000/intermedio/ejercicio-17
```

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "roles y permisos"
}
```

## Usuarios de prueba

| Email | Contrasena | Rol |
| --- | --- | --- |
| admin@viajes.test | Admin123 | admin |
| agente@viajes.test | Agente123 | agente |
| guia@viajes.test | Guia1234 | guia (id 3) |
| guia2@viajes.test | Guia2234 | guia (id 4) |
| viajero@viajes.test | Viajero123 | viajero (id 5) |
| viajero2@viajes.test | Viajero2123 | viajero (id 6) |

## Endpoints

Todas las rutas cuelgan de `/intermedio/ejercicio-17`.

| Metodo | Ruta | Acceso | Descripcion |
| --- | --- | --- | --- |
| POST | /auth/registro | publico | Crea una cuenta con rol viajero |
| POST | /auth/login | publico | Devuelve el `accessToken` |
| GET | /auth/perfil | token | Usuario actual con su lista de permisos |
| GET | /roles | publico | Matriz de permisos por rol |
| GET | /destinos | publico | Lista paginada con filtros |
| GET | /destinos/:id | publico | Detalle de un destino |
| POST | /destinos | `destinos:gestionar` | Crea un destino |
| PATCH | /destinos/:id | `destinos:gestionar` | Actualiza un destino |
| DELETE | /destinos/:id | `destinos:eliminar` | Borra un destino sin tours |
| GET | /tours | publico (token opcional) | Tours visibles para quien consulta |
| GET | /tours/:id | publico (token opcional) | Detalle con `cuposDisponibles` |
| POST | /tours | `tours:gestionar-propios` o `-todos` | Crea un tour |
| PATCH | /tours/:id | `tours:gestionar-propios` o `-todos` | Actualiza un tour |
| DELETE | /tours/:id | `tours:eliminar` o guia dueno en borrador | Borra un tour |
| GET | /reservas | token | Reservas visibles para el usuario |
| POST | /reservas | `reservas:crear` | Reserva un tour publicado |
| GET | /reservas/:id | token | Detalle de una reserva visible |
| PATCH | /reservas/:id/estado | token | Confirma o cancela segun permisos |
| GET | /usuarios | `usuarios:ver` | Lista con filtro por rol |
| GET | /usuarios/:id | `usuarios:ver` | Detalle de un usuario |
| PATCH | /usuarios/:id/rol | `usuarios:cambiar-rol` | Cambia el rol de un usuario |

## Campos del body

| Ruta | Campos |
| --- | --- |
| /auth/registro | `nombre` (2-60), `email`, `password` (8-72, con letra y numero) |
| /auth/login | `email`, `password` |
| /destinos | `nombre` (2-60), `pais` (2-60), `tipo` (`cultural`, `naturaleza`, `aventura`, `playa`) |
| /tours | `titulo` (3-80), `destinoId`, `precio` (1-100000), `cupos` (1-200), `fechaInicio` (AAAA-MM-DD), `guiaId`, `estado` (`borrador` o `publicado` al crear) |
| /reservas | `tourId`, `personas` (1-10, por defecto 1) |
| /reservas/:id/estado | `estado` (`confirmada` o `cancelada`) |
| /usuarios/:id/rol | `rol` (`viajero`, `guia`, `agente`, `admin`) |

En POST todos los campos sin valor por defecto son obligatorios, salvo `guiaId` y `estado` en tours. Un guia puede omitir `guiaId` (se usa el suyo); un agente o admin debe enviarlo. En PATCH basta con enviar un campo. Los campos desconocidos se rechazan con 400.

## Parametros de consulta

Los listados aceptan `pagina` (por defecto 1), `limite` (por defecto 10, maximo 50) y `orden`.

| Listado | Filtros | Orden |
| --- | --- | --- |
| /destinos | `tipo` | `nombre` (por defecto), `pais` |
| /tours | `destinoId`, `guiaId`, `estado`, `precioMax` | `fecha` (por defecto), `precio`, `titulo` |
| /reservas | `estado`, `tourId` | `reciente` (por defecto), `antigua` |
| /usuarios | `rol` | `id` (por defecto), `nombre` |

## Ejemplos

```bash
curl -X POST http://localhost:3000/intermedio/ejercicio-17/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"viajero@viajes.test","password":"Viajero123"}'

curl http://localhost:3000/intermedio/ejercicio-17/auth/perfil \
  -H "Authorization: Bearer TOKEN"

curl "http://localhost:3000/intermedio/ejercicio-17/tours?destinoId=2&orden=precio"

curl -X POST http://localhost:3000/intermedio/ejercicio-17/reservas \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"tourId":8,"personas":2}'

curl -X PATCH http://localhost:3000/intermedio/ejercicio-17/reservas/2/estado \
  -H "Authorization: Bearer TOKEN_GUIA" -H "Content-Type: application/json" \
  -d '{"estado":"confirmada"}'

curl -X PATCH http://localhost:3000/intermedio/ejercicio-17/usuarios/5/rol \
  -H "Authorization: Bearer TOKEN_ADMIN" -H "Content-Type: application/json" \
  -d '{"rol":"guia"}'
```

En PowerShell, las comillas del JSON dan problemas con `curl`. Se puede usar Thunder Client, Postman o `Invoke-RestMethod`:

```powershell
$login = Invoke-RestMethod -Method Post -Uri http://localhost:3000/intermedio/ejercicio-17/auth/login -ContentType "application/json" -Body '{"email":"viajero@viajes.test","password":"Viajero123"}'
Invoke-RestMethod -Uri http://localhost:3000/intermedio/ejercicio-17/auth/perfil -Headers @{ Authorization = "Bearer $($login.data.accessToken)" }
```

## Formato de respuesta

```json
{
  "ok": true,
  "data": {
    "id": 5,
    "nombre": "Vera Viajera",
    "email": "viajero@viajes.test",
    "rol": "viajero",
    "creadoEn": "2026-01-05T09:00:00.000Z",
    "permisos": ["reservas:crear", "reservas:ver-propias", "reservas:cancelar-propias"]
  }
}
```

Los listados agregan `paginacion` y el header `X-Total-Count`.

## Errores

```json
{
  "ok": false,
  "message": "Tu rol (viajero) no tiene el permiso requerido",
  "codigo": "PERMISOS_INSUFICIENTES",
  "errores": [{ "campo": "permiso", "mensaje": "destinos:gestionar" }]
}
```

| Status | Codigo | Cuando |
| --- | --- | --- |
| 400 | VALIDACION, JSON_INVALIDO, CONSULTA_INVALIDA, ID_INVALIDO | body, id o parametros invalidos |
| 401 | NO_AUTENTICADO | falta el header Authorization |
| 401 | TOKEN_INVALIDO, TOKEN_MALFORMADO, TOKEN_FIRMA_INVALIDA, TOKEN_ALGORITMO_NO_PERMITIDO, TOKEN_EMISOR_INVALIDO, TOKEN_EXPIRADO | token mal formado, alterado o vencido |
| 401 | CREDENCIALES_INVALIDAS | email o contrasena incorrectos |
| 403 | PERMISOS_INSUFICIENTES | el rol no tiene el permiso de la ruta |
| 403 | TOUR_AJENO, TOUR_NO_ELIMINABLE, RESERVA_SIN_PERMISO | ve el recurso pero no puede hacer esa accion |
| 404 | DESTINO_NO_ENCONTRADO, TOUR_NO_ENCONTRADO, RESERVA_NO_ENCONTRADA, USUARIO_NO_ENCONTRADO | recurso inexistente o no visible |
| 405 | METODO_NO_PERMITIDO | metodo no soportado (con header `Allow`) |
| 409 | EMAIL_DUPLICADO, DESTINO_DUPLICADO, DESTINO_CON_TOURS | duplicados o dependencias |
| 409 | TRANSICION_INVALIDA, TOUR_CERRADO, TOUR_CON_RESERVAS, CUPOS_INSUFICIENTES | el estado actual no permite la accion |
| 409 | SIN_CUPOS, RESERVA_DUPLICADA, TOUR_PROPIO | reglas de reserva |
| 409 | ACCION_SOBRE_SI_MISMO, GUIA_CON_TOURS | reglas de cambio de rol |
| 422 | REFERENCIA_INVALIDA | `destinoId`, `guiaId` o `tourId` inexistente o no valido |
