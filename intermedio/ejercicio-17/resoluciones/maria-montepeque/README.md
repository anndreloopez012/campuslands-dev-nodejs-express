# Ejercicio 17 - roles y permisos

API de una agencia de viajes hecha con Node.js y Express. Hay tres roles
(viajero, guia y admin) y cada uno tiene una lista de permisos. Las
rutas piden **permisos**, no roles.

## Como funciona

Todo sale de `src/config/permisos.js`:

```js
const PERMISOS_POR_ROL = {
    viajero: ["tours:ver", "reservas:crear", "reservas:ver_propias", "reservas:cancelar_propias"],
    guia: ["tours:ver", "tours:editar_propios", "reservas:ver_de_mis_tours"],
    admin: ["tours:ver", "tours:crear", "tours:editar", "tours:borrar", "reservas:ver_todas", "reservas:cancelar_todas"]
};
```

En las rutas se usa `requirePermiso`:

```js
router.post("/", requireAuth, requirePermiso("tours:crear"), createTour);
router.patch("/:id", requireAuth, requirePermiso("tours:editar", "tours:editar_propios"), updateTour);
```

- Si se pasa mas de un permiso, basta con tener uno.
- En el token solo va el rol. Los permisos se buscan en el servidor, asi
  si se cambia la tabla no hay que volver a hacer login.
- Hay dos niveles de revision:
  1. **Middleware**: el rol tiene el permiso o no (403).
  2. **Service**: permisos "propios". El guia pasa el middleware con
     `tours:editar_propios`, pero el service revisa que el tour sea suyo.
     Igual con el viajero y sus reservas.
- `GET /api/reservas` devuelve cosas distintas segun el permiso: el admin
  ve todas, el guia las de sus tours y el viajero solo las suyas.

| Que se quiere hacer         | viajero | guia            | admin |
| --------------------------- | ------- | --------------- | ----- |
| Ver tours                   | Si      | Si              | Si    |
| Crear / borrar tours        | No      | No              | Si    |
| Editar tours                | No      | Solo los suyos  | Todos |
| Cambiar el guia de un tour  | No      | No              | Si    |
| Reservar                    | Si      | No              | No    |
| Ver reservas                | Suyas   | De sus tours    | Todas |
| Cancelar reservas           | Suyas   | No              | Todas |

| Carpeta / archivo     | Que hay dentro                                   |
| --------------------- | ------------------------------------------------ |
| `config.js`           | Lee `.env` con dotenv                            |
| `config/permisos.js`  | Tabla de permisos por rol y `tienePermiso`       |
| `middlewares/`        | `requireAuth` y `requirePermiso`                 |
| `routes/`             | Auth, tours y reservas                           |
| `controllers/`        | Leen la peticion y responden                     |
| `services/`           | Login, reglas de "propios", cupos                |
| `data/`               | `db.js` con usuarios, tours y reservas en memoria |

## Variables de entorno

Copia `.env.example` a `.env` y cambia el secreto:

```bash
copy .env.example .env
```

| Variable         | Uso                            | Por defecto                   |
| ---------------- | ------------------------------ | ----------------------------- |
| `PORT`           | Puerto del servidor            | `3017`                        |
| `JWT_SECRET`     | Secreto para firmar los tokens | Uno de desarrollo (con aviso) |
| `JWT_EXPIRES_IN` | Cuanto dura el token           | `1h`                          |

## Usuarios de prueba

| Email               | Password    | Rol     |
| ------------------- | ----------- | ------- |
| `lucia@viajes.com`  | `lucia123`  | viajero |
| `pedro@viajes.com`  | `pedro123`  | viajero |
| `rosa@viajes.com`   | `rosa123`   | guia (tours 1 y 2) |
| `javier@viajes.com` | `javier123` | guia (tour 3) |
| `admin@viajes.com`  | `admin123`  | admin   |

## Requisitos

Node.js 20 o superior. Sin base de datos.

## Instalacion y ejecucion

```bash
npm install
npm start
```

| Script        | Descripcion                                        |
| ------------- | -------------------------------------------------- |
| `npm start`   | Levanta el servidor en http://localhost:3017       |
| `npm run dev` | Igual pero con recarga automatica (`node --watch`) |

## Endpoints

| Metodo | Ruta                  | Permiso que pide                                   |
| ------ | --------------------- | -------------------------------------------------- |
| GET    | `/health`             | Publico                                            |
| GET    | `/api/roles`          | Publico, muestra la tabla de permisos              |
| POST   | `/api/auth/login`     | Publico                                            |
| GET    | `/api/auth/permisos`  | Login, muestra mi rol y mis permisos               |
| GET    | `/api/tours`          | Publico                                            |
| GET    | `/api/tours/:id`      | Publico                                            |
| POST   | `/api/tours`          | `tours:crear`                                      |
| PATCH  | `/api/tours/:id`      | `tours:editar` o `tours:editar_propios`            |
| DELETE | `/api/tours/:id`      | `tours:borrar`                                     |
| GET    | `/api/reservas`       | `reservas:ver_todas`, `ver_de_mis_tours` o `ver_propias` |
| POST   | `/api/reservas`       | `reservas:crear`                                   |
| DELETE | `/api/reservas/:id`   | `reservas:cancelar_todas` o `cancelar_propias`     |

Bodies:

- Tour (POST): `nombre`, `destino`, `precio`, `cupos`, `guiaId`. En PATCH
  se manda solo lo que se quiere cambiar.
- Reserva: `tourId` y `personas`. Descuenta cupos del tour y al cancelar
  se devuelven.

## Ejemplos (PowerShell)

Login como guia y ver mis permisos:

```powershell
$rosa = (Invoke-RestMethod -Method Post -Uri http://localhost:3017/api/auth/login -ContentType "application/json" -Body '{"email":"rosa@viajes.com","password":"rosa123"}').data.token
```

```bash
curl.exe http://localhost:3017/api/auth/permisos -H "Authorization: Bearer $rosa"
```

```json
{ "ok": true, "data": { "id": 3, "nombre": "Rosa Guia", "rol": "guia", "permisos": ["tours:ver", "tours:editar_propios", "reservas:ver_de_mis_tours"] } }
```

La guia cambia el precio de su tour:

```bash
curl.exe -X PATCH http://localhost:3017/api/tours/1 -H "Content-Type: application/json" -H "Authorization: Bearer $rosa" -d '{\"precio\":275}'
```

```json
{ "ok": true, "data": { "id": 1, "nombre": "Volcan Pacaya", "destino": "Escuintla", "precio": 275, "cupos": 10, "guiaId": 3 } }
```

Un viajero reserva:

```powershell
$lucia = (Invoke-RestMethod -Method Post -Uri http://localhost:3017/api/auth/login -ContentType "application/json" -Body '{"email":"lucia@viajes.com","password":"lucia123"}').data.token
```

```bash
curl.exe -X POST http://localhost:3017/api/reservas -H "Content-Type: application/json" -H "Authorization: Bearer $lucia" -d '{\"tourId\":2,\"personas\":3}'
```

```json
{ "ok": true, "data": { "id": 3, "tourId": 2, "viajeroId": 1, "personas": 3 } }
```

## Casos de error

| Caso                                         | Status | Mensaje                                                  |
| -------------------------------------------- | ------ | -------------------------------------------------------- |
| Reservas sin token                           | 401    | `Falta el token, manda Authorization: Bearer <token>`    |
| Viajero crea un tour                         | 403    | `Tu rol (viajero) no tiene permiso: tours:crear`         |
| Guia intenta reservar                        | 403    | `Tu rol (guia) no tiene permiso: reservas:crear`         |
| Guia edita un tour que no es suyo            | 403    | `Solo puedes editar los tours donde eres el guia`        |
| Guia intenta cambiar el guia del tour        | 403    | `Solo el admin puede cambiar el guia de un tour`         |
| Viajero cancela la reserva de otro           | 403    | `Solo puedes cancelar tus propias reservas`              |
| Reservar mas personas que cupos              | 409    | `Solo quedan 2 cupos para Tikal al amanecer`             |
| Admin asigna un guiaId que no es guia        | 400    | `Datos invalidos` + `guiaId tiene que ser de un usuario con rol guia` |
| Precio negativo                              | 400    | `Datos invalidos` + `precio debe ser mayor a 0`          |

Guia editando un tour ajeno:

```bash
curl.exe -X PATCH http://localhost:3017/api/tours/3 -H "Content-Type: application/json" -H "Authorization: Bearer $rosa" -d '{\"precio\":1}'
```

```json
{ "ok": false, "message": "Solo puedes editar los tours donde eres el guia" }
```

## Notas

Los datos viven en memoria, al reiniciar el servidor vuelven a los de
`src/data/db.js`.
