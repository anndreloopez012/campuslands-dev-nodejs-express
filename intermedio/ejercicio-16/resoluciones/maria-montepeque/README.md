# Ejercicio 16 - rutas protegidas

API de una tienda de sneakers hecha con Node.js y Express. Las rutas
estan separadas en tres grupos segun quien puede entrar: publicas, con
login y solo admin. El login usa JWT como en el ejercicio 15.

## Como funciona

En vez de poner el middleware ruta por ruta, cada grupo es un router y
el middleware se pone una sola vez con `router.use`:

```js
// carrito.routes.js
router.use(requireAuth);

// admin.routes.js
router.use(requireAuth, requireRol("admin"));
```

Asi si alguien agrega una ruta nueva en ese archivo ya queda protegida.

| Grupo        | Archivo               | Middleware                        |
| ------------ | --------------------- | --------------------------------- |
| Publicas     | `publicas.routes.js`  | Ninguno                           |
| Con login    | `carrito.routes.js`   | `requireAuth`                     |
| Solo admin   | `admin.routes.js`     | `requireAuth` + `requireRol("admin")` |

- **401** cuando no hay token o no sirve: no se quien eres.
- **403** cuando el token esta bien pero el rol no alcanza: se quien
  eres pero no tienes permiso.
- El carrito siempre se busca con el id del token (`req.usuario.sub`) y
  nunca con un id en la url, asi un cliente no puede ver el carrito de
  otro.

| Carpeta / archivo | Que hay dentro                                     |
| ----------------- | -------------------------------------------------- |
| `config.js`       | Lee `.env` con dotenv                              |
| `routes/`         | `index.js` y un router por grupo                   |
| `middlewares/`    | `requireAuth` y `requireRol`                       |
| `controllers/`    | Auth, sneakers y carrito                           |
| `services/`       | JWT, sneakers y carrito (stock y totales)          |
| `utils/`          | `app-error.js`                                     |
| `data/`           | `db.js` con usuarios, sneakers y carritos en memoria |

## Variables de entorno

Copia `.env.example` a `.env` y cambia el secreto:

```bash
copy .env.example .env
```

| Variable         | Uso                            | Por defecto                   |
| ---------------- | ------------------------------ | ----------------------------- |
| `PORT`           | Puerto del servidor            | `3016`                        |
| `JWT_SECRET`     | Secreto para firmar los tokens | Uno de desarrollo (con aviso) |
| `JWT_EXPIRES_IN` | Cuanto dura el token           | `1h`                          |

## Usuarios de prueba

| Email                | Password   | Rol     |
| -------------------- | ---------- | ------- |
| `diana@sneakers.com` | `diana123` | cliente |
| `marco@sneakers.com` | `marco123` | cliente |
| `admin@sneakers.com` | `admin123` | admin   |

## Requisitos

Node.js 20 o superior. Sin base de datos.

## Instalacion y ejecucion

```bash
npm install
npm start
```

| Script        | Descripcion                                        |
| ------------- | -------------------------------------------------- |
| `npm start`   | Levanta el servidor en http://localhost:3016       |
| `npm run dev` | Igual pero con recarga automatica (`node --watch`) |

## Endpoints

### Publicas

| Metodo | Ruta                | Descripcion             |
| ------ | ------------------- | ----------------------- |
| GET    | `/health`           | Comprueba el servidor   |
| POST   | `/api/auth/login`   | Devuelve un JWT         |
| GET    | `/api/sneakers`     | Catalogo                |
| GET    | `/api/sneakers/:id` | Un sneaker              |

### Con login (cualquier rol)

| Metodo | Ruta                            | Descripcion                 |
| ------ | ------------------------------- | --------------------------- |
| GET    | `/api/carrito`                  | Mi carrito con total        |
| POST   | `/api/carrito/items`            | Agrega `{ sneakerId, cantidad }` |
| DELETE | `/api/carrito/items/:sneakerId` | Quita un sneaker de mi carrito |

### Solo admin

| Metodo | Ruta                             | Descripcion              |
| ------ | -------------------------------- | ------------------------ |
| POST   | `/api/admin/sneakers`            | Crea un sneaker          |
| PATCH  | `/api/admin/sneakers/:id/stock`  | Cambia el stock          |
| GET    | `/api/admin/carritos`            | Ve todos los carritos    |

## Ejemplos (PowerShell)

Login y guardar el token:

```powershell
$token = (Invoke-RestMethod -Method Post -Uri http://localhost:3016/api/auth/login -ContentType "application/json" -Body '{"email":"diana@sneakers.com","password":"diana123"}').data.token
```

Agregar 2 Forum Low al carrito:

```bash
curl.exe -X POST http://localhost:3016/api/carrito/items -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{\"sneakerId\":2,\"cantidad\":2}'
```

```json
{
  "ok": true,
  "data": {
    "usuarioId": 1,
    "items": [{ "sneakerId": 2, "modelo": "Forum Low", "precio": 950, "cantidad": 2, "subtotal": 1900 }],
    "total": 1900
  }
}
```

Como admin, subir el stock de los Old Skool:

```powershell
$admin = (Invoke-RestMethod -Method Post -Uri http://localhost:3016/api/auth/login -ContentType "application/json" -Body '{"email":"admin@sneakers.com","password":"admin123"}').data.token
```

```bash
curl.exe -X PATCH http://localhost:3016/api/admin/sneakers/3/stock -H "Content-Type: application/json" -H "Authorization: Bearer $admin" -d '{\"stock\":10}'
```

## Casos de error

| Caso                                    | Status | Mensaje                                              |
| --------------------------------------- | ------ | ---------------------------------------------------- |
| Carrito o admin sin token               | 401    | `Falta el token, manda Authorization: Bearer <token>` |
| Token modificado                        | 401    | `Token invalido`                                     |
| Cliente entrando a `/api/admin/...`     | 403    | `Necesitas rol admin para entrar aqui`               |
| Pedir mas de lo que hay en stock        | 409    | `Solo hay 2 en stock de Forum Low`                   |
| Quitar algo que no esta en el carrito   | 404    | `El sneaker 1 no esta en tu carrito`                 |
| Body malo al agregar al carrito         | 400    | `sneakerId y cantidad deben ser enteros, ...`        |
| Admin crea sneaker con datos malos      | 400    | `Datos invalidos` + lista `errors`                   |

Cliente intentando ver todos los carritos:

```bash
curl.exe http://localhost:3016/api/admin/carritos -H "Authorization: Bearer $token"
```

```json
{ "ok": false, "message": "Necesitas rol admin para entrar aqui" }
```

## Notas

Los datos viven en memoria, al reiniciar el servidor vuelven a los de
`src/data/db.js`.
