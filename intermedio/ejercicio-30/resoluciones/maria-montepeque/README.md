# Ejercicio 30 - proyecto integrador intermedio

API de un **taller de motos** hecha con Node.js y Express. Junta en un
solo proyecto lo que se vio en el nivel intermedio: capas, validacion,
errores centralizados, paginacion, filtros y busqueda, subrecursos, JWT
con roles, passwords con hash, config con dotenv, limite de intentos y
tests.

## El problema

En el taller trabajan tres roles:

| Rol         | Que hace                                                        |
| ----------- | --------------------------------------------------------------- |
| `recepcion` | Registra motos, abre ordenes de servicio y entrega la moto lista |
| `mecanico`  | Trabaja solo las ordenes que tiene asignadas y usa repuestos     |
| `admin`     | Asigna mecanicos, maneja el inventario y puede hacer todo        |

Una orden de servicio pasa por estos estados:

```text
pendiente --(mecanico/admin)--> en_proceso --(mecanico/admin)--> lista --(recepcion/admin)--> entregada
    |
    +--(recepcion/admin)--> cancelada
```

- Para pasar a `en_proceso` la orden tiene que tener mecanico asignado.
- Una moto solo puede tener una orden abierta a la vez.
- Los repuestos se agregan solo con la orden `en_proceso`, se descuentan
  del inventario y si no alcanza el stock no se toca nada (409).
- El precio del repuesto se guarda en la orden: si despues sube en el
  inventario, lo ya cobrado no cambia.
- Total = mano de obra segun el tipo (revision Q75, mantenimiento Q150,
  reparacion Q300) + repuestos.
- Cada cambio de estado queda en el `historial` con quien lo hizo.

## Que se uso de cada ejercicio

| Tema del nivel                      | Donde esta                                                  |
| ----------------------------------- | ----------------------------------------------------------- |
| 01-05 capas, routers, controllers, services, datos | `src/routes`, `controllers`, `services`, `data`   |
| 06 validacion centralizada          | `src/validators/` + `utils/validar.js` (todos los errores juntos) |
| 07 middleware de errores            | `middlewares/errores.js`, todas las respuestas con la misma forma |
| 08 request id                       | `middlewares/request-id.js`, header `X-Request-Id` y `requestId` en errores |
| 09-11 paginacion, orden, busqueda   | `GET /api/motos?page&limit&sort&marca&q&anioDesde` (`utils/listado.js`) |
| 12-13 subrecursos y relaciones      | `/api/motos/:id/ordenes`, orden -> moto, mecanico y repuestos |
| 15-17 JWT, rutas protegidas, roles  | `middlewares/auth.js`: `requireAuth` y `requireRol`         |
| 18 hash de passwords                | `bcryptjs` en `data/db.js` y `auth.service.js`              |
| 19 dotenv y config                  | `src/config.js`, en production exige `JWT_SECRET`           |
| 21 rate limit                       | 5 logins fallidos por email bloquean 15 minutos (429 + `Retry-After`) |
| 23-26 tests                         | `test/` con `node:test`, `supertest` y `mock.timers`        |
| 28 coleccion HTTP                   | `http/flujo-taller.http`                                    |

Detalles de seguridad:

- El rol se lee del usuario guardado, no del token. Aunque alguien
  firmara un token que diga `admin`, se usa su rol real.
- Si se borra un usuario, su token deja de servir.
- El login responde lo mismo si el email no existe o la clave esta mal.
- El body tiene un limite de 20kb.

## Usuarios de prueba

| Email              | Password       | Rol       |
| ------------------ | -------------- | --------- |
| `ana@taller.com`   | `recepcion123` | recepcion |
| `beto@taller.com`  | `mecanico123`  | mecanico (id 2) |
| `carla@taller.com` | `mecanico456`  | mecanico (id 3) |
| `admin@taller.com` | `admin12345`   | admin     |

Las claves se hashean con bcrypt al arrancar, en los datos solo queda el
`passwordHash`.

## Requisitos

Node.js 20 o superior. Sin base de datos.

## Instalacion y ejecucion

```bash
npm install
copy .env.example .env
npm start
```

| Script        | Descripcion                                      |
| ------------- | ------------------------------------------------ |
| `npm start`   | Servidor en http://localhost:3030                |
| `npm run dev` | Servidor con recarga automatica                  |
| `npm test`    | Todos los tests                                  |

## Variables de entorno

| Variable                 | Por defecto                   | Nota                                    |
| ------------------------ | ----------------------------- | --------------------------------------- |
| `NODE_ENV`               | `development`                 | `development`, `production` o `test`    |
| `PORT`                   | `3030`                        |                                         |
| `JWT_SECRET`             | uno de desarrollo (con aviso) | En production obligatorio, 32+ caracteres |
| `JWT_EXPIRES_IN`         | `8h`                          |                                         |
| `LOGIN_MAX_INTENTOS`     | `5`                           | Fallos seguidos antes de bloquear       |
| `LOGIN_BLOQUEO_MINUTOS`  | `15`                          |                                         |

## Endpoints

Todo lo de `/api` menos el login pide `Authorization: Bearer <token>`.

| Metodo | Ruta                         | Roles              | Descripcion                          |
| ------ | ---------------------------- | ------------------ | ------------------------------------ |
| GET    | `/health`                    | Publico            | El servidor vive                     |
| POST   | `/api/auth/login`            | Publico            | `{ email, password }` -> token       |
| GET    | `/api/auth/yo`               | Todos              | Mi usuario                           |
| GET    | `/api/motos`                 | Todos              | Lista paginada con filtros           |
| POST   | `/api/motos`                 | recepcion, admin   | Registra una moto                    |
| GET    | `/api/motos/:id`             | Todos              | Una moto                             |
| GET    | `/api/motos/:id/ordenes`     | Todos              | Historial de ordenes de la moto      |
| POST   | `/api/motos/:id/ordenes`     | recepcion, admin   | Abre una orden `{ tipo, descripcion }` |
| GET    | `/api/ordenes`               | Todos (mecanico: solo las suyas) | Lista paginada, `?estado=` |
| GET    | `/api/ordenes/:id`           | Todos (mecanico: solo las suyas) | Orden con totales e historial |
| PATCH  | `/api/ordenes/:id/asignar`   | admin              | `{ mecanicoId }`                     |
| PATCH  | `/api/ordenes/:id/estado`    | Depende del estado | `{ estado }`                         |
| POST   | `/api/ordenes/:id/repuestos` | mecanico, admin    | `{ repuestoId, cantidad }`           |
| GET    | `/api/repuestos`             | Todos              | Inventario, `?sinStock=true`         |
| PATCH  | `/api/repuestos/:id/stock`   | admin              | `{ stock }`                          |

### Query params de `GET /api/motos`

| Param       | Ejemplo        | Que hace                                           |
| ----------- | -------------- | -------------------------------------------------- |
| `page`      | `2`            | Pagina, empieza en 1                               |
| `limit`     | `5`            | Por pagina, maximo 50 (por defecto 10)             |
| `marca`     | `honda`        | Filtra por marca sin importar mayusculas           |
| `q`         | `luis`         | Busca en placa, marca, modelo y propietario        |
| `anioDesde` | `2020`         | Motos de ese anio en adelante                      |
| `sort`      | `-anio,km`     | Ordena por `placa`, `marca`, `anio`, `km`, `cilindraje`; `-` es descendente |

La respuesta trae `meta`: `{ page, limit, total, totalPages }`.

## Ejemplos (PowerShell)

```powershell
$t = (Invoke-RestMethod -Method Post -Uri http://localhost:3030/api/auth/login -ContentType "application/json" -Body '{"email":"ana@taller.com","password":"recepcion123"}').data.token
```

```bash
curl.exe "http://localhost:3030/api/motos?marca=honda&sort=km&limit=2" -H "Authorization: Bearer $t"
```

```json
{
  "ok": true,
  "meta": { "page": 1, "limit": 2, "total": 2, "totalPages": 1 },
  "data": [
    { "id": 1, "placa": "M123ABC", "marca": "Honda", "modelo": "CB190R", "anio": 2021, "cilindraje": 190, "km": 18500, "propietario": { "nombre": "Luis Perez", "telefono": "55551234" } },
    { "id": 4, "placa": "M321JKL", "marca": "Honda", "modelo": "XR150L", "anio": 2018, "cilindraje": 150, "km": 55300, "propietario": { "nombre": "Sofia Ramos", "telefono": "22221111" } }
  ]
}
```

```bash
curl.exe -X POST http://localhost:3030/api/motos/1/ordenes -H "Authorization: Bearer $t" -H "Content-Type: application/json" -d '{\"tipo\":\"reparacion\",\"descripcion\":\"Cambio de kit de arrastre\"}'
```

El flujo completo de punta a punta, con los tres roles, esta en
`http/flujo-taller.http` (extension REST Client de VS Code). Termina con
esta orden:

```json
{
  "id": 2,
  "motoId": 7,
  "tipo": "mantenimiento",
  "estado": "entregada",
  "mecanicoId": 2,
  "repuestos": [
    { "repuestoId": 1, "nombre": "Aceite 20W50 (1 litro)", "cantidad": 1, "precioUnitario": 65 },
    { "repuestoId": 2, "nombre": "Filtro de aceite", "cantidad": 1, "precioUnitario": 45 }
  ],
  "moto": { "id": 7, "placa": "M246XYZ", "modelo": "Honda Navi" },
  "manoDeObra": 150,
  "totalRepuestos": 110,
  "total": 260
}
```

(se recorto `descripcion`, `historial` y fechas)

## Tests

```text
test/
├── auth.test.js     login, bloqueo por intentos, tokens vencidos o falsos, request id, JSON roto, 413
├── motos.test.js    paginacion, filtros, busqueda, orden, validacion, permisos
└── ordenes.test.js  flujo completo, reglas de estado, stock, permisos por rol, consultas
test-helpers/
└── sesiones.js      login de cada rol para los tests
```

- `resetDb()` en `beforeEach` deja los datos como al inicio en cada test.
- El desbloqueo del login se prueba adelantando el reloj con
  `t.mock.timers` en vez de esperar 15 minutos.

```text
ℹ tests 54
ℹ pass 54
ℹ fail 0
```

Para comprobar que los tests sirven quite a proposito la revision de
"esta orden es tuya" al cambiar de estado y fallo
`un mecanico no toca las ordenes de otro`.

La coleccion `http/flujo-taller.http` (20 peticiones) tambien la corri
entera y todas dieron el status de su `# espera:`.

## Casos de error

| Caso                                           | Status | Mensaje                                                 |
| ---------------------------------------------- | ------ | ------------------------------------------------------- |
| Body con datos malos                           | 400    | `Datos invalidos` + lista `errors`                      |
| Query param malo (`limit=100`, `sort=x`...)    | 400    | `limit no puede pasar de 50`, `No se puede ordenar por "x"...` |
| Sin token, token roto o vencido                | 401    | `Falta el token...`, `Token invalido`, `El token expiro...` |
| Rol que no puede hacer eso                     | 403    | `Necesitas ser recepcion o admin para esto`             |
| Mecanico con una orden que no es suya          | 403    | `Esta orden no esta asignada a ti`                      |
| Cambio de estado que no le toca a ese rol      | 403    | `Pasar a "entregada" lo hace recepcion o admin`         |
| Moto, orden o repuesto que no existe           | 404    | `No existe la moto con id 99`                           |
| Placa repetida                                 | 409    | `Ya hay una moto registrada con la placa M123ABC`       |
| Moto con una orden abierta                     | 409    | `La moto ya tiene la orden 1 abierta`                   |
| Salto de estado no permitido                   | 409    | `No se puede pasar de "pendiente" a "lista"`            |
| Empezar sin mecanico                           | 409    | `Primero hay que asignar un mecanico`                   |
| No alcanza el stock                            | 409    | `Solo hay 4 de "Pastillas de freno" en bodega`          |
| Body de mas de 20kb                            | 413    | `El body es demasiado grande (maximo 20kb)`             |
| 5 logins fallidos seguidos                     | 429    | `Demasiados intentos fallidos, espera 15 minutos`       |

Todas las respuestas de error traen `ok: false`, `message` y `requestId`.

## Estructura

| Carpeta / archivo     | Que hay dentro                                          |
| --------------------- | ------------------------------------------------------- |
| `src/config.js`       | Lee y valida el `.env`                                  |
| `src/app.js`          | Middlewares y rutas                                     |
| `src/routes/`         | Un router por recurso                                   |
| `src/controllers/`    | Leen la peticion y responden                            |
| `src/services/`       | Reglas del taller (auth, motos, ordenes, repuestos)     |
| `src/validators/`     | Reglas de los bodies de moto y orden                    |
| `src/middlewares/`    | Auth, roles, request id y errores                       |
| `src/utils/`          | `AppError`, validaciones, paginacion y orden            |
| `src/data/db.js`      | Datos en memoria y `resetDb()`                          |
| `test/`               | Tests                                                   |
| `http/`               | Coleccion de ejemplos                                   |

## Notas

- Los datos viven en memoria, al reiniciar el servidor vuelven a los de
  `src/data/db.js`.
- El bloqueo de login es por email. Tiene la contra de que alguien puede
  bloquear a otro usuario a proposito fallando su clave; en un proyecto
  real se combinaria con un limite por IP.
