# Ejercicio 15 - JWT basico

API de un puesto de comida urbana hecha con Node.js y Express. El login
devuelve un JWT firmado con `jsonwebtoken` y ese token se usa para ver y
hacer pedidos.

## Como funciona

1. `POST /api/auth/login` revisa email y password y firma un token con
   `jwt.sign(payload, JWT_SECRET, { expiresIn })`.
2. El payload lleva `sub` (id del usuario), `nombre` y `email`. Nada de
   passwords, porque un JWT se puede leer (solo esta firmado, no cifrado).
3. `middlewares/auth.middleware.js` lee `Authorization: Bearer <token>` y
   lo valida con `jwt.verify`. Si sale bien deja el payload en
   `req.usuario`.
4. Si el token fue modificado responde 401 "Token invalido", y si ya
   vencio responde 401 "El token expiro".
5. Los pedidos se filtran con `req.usuario.sub`, asi cada usuario solo ve
   los suyos. El total del pedido lo calcula el servidor.

A diferencia del ejercicio 14, aqui el servidor no guarda los tokens: con
la firma y el secreto basta para saber si un token es valido.

| Carpeta / archivo | Que hay dentro                                  |
| ----------------- | ----------------------------------------------- |
| `config.js`       | Lee `.env` con dotenv (puerto, secreto, expiracion) |
| `routes/`         | `index.js` con rutas publicas y protegidas      |
| `middlewares/`    | `auth.middleware.js` que verifica el JWT        |
| `controllers/`    | Auth y pedidos                                  |
| `services/`       | Firma/verificacion del token y logica de pedidos |
| `utils/`          | `app-error.js`                                  |
| `data/`           | `db.js` con usuarios, platos y pedidos en memoria |

## Variables de entorno

Copia `.env.example` a `.env` y cambia el secreto:

```bash
copy .env.example .env
```

| Variable         | Uso                                  | Por defecto                    |
| ---------------- | ------------------------------------ | ------------------------------ |
| `PORT`           | Puerto del servidor                  | `3015`                         |
| `JWT_SECRET`     | Secreto para firmar los tokens       | Uno de desarrollo (con aviso)  |
| `JWT_EXPIRES_IN` | Cuanto dura el token                 | `1h`                           |

Si no hay `.env` el servidor igual arranca, pero muestra un aviso en
consola. El `.env` no se sube al repo.

## Usuarios de prueba

| Email                | Password     |
| -------------------- | ------------ |
| `carlos@comida.com`  | `carlos123`  |
| `valeria@comida.com` | `valeria123` |

## Requisitos

Node.js 20 o superior. Sin base de datos.

## Instalacion y ejecucion

```bash
npm install
npm start
```

| Script        | Descripcion                                        |
| ------------- | -------------------------------------------------- |
| `npm start`   | Levanta el servidor en http://localhost:3015       |
| `npm run dev` | Igual pero con recarga automatica (`node --watch`) |

## Endpoints

| Metodo | Ruta               | Auth | Descripcion                         |
| ------ | ------------------ | ---- | ----------------------------------- |
| GET    | `/health`          | No   | Comprueba que el servidor vive      |
| POST   | `/api/auth/login`  | No   | Devuelve un JWT                     |
| GET    | `/api/platos`      | No   | Menu del puesto                     |
| GET    | `/api/auth/perfil` | Si   | Lo que trae el token ya verificado  |
| GET    | `/api/pedidos`     | Si   | Mis pedidos                         |
| POST   | `/api/pedidos`     | Si   | Hacer un pedido                     |

### Body para hacer un pedido

| Campo      | Tipo   | Regla                  |
| ---------- | ------ | ---------------------- |
| `platoId`  | numero | Obligatorio, debe existir |
| `cantidad` | numero | Entero mayor a 0       |

## Ejemplos (PowerShell)

Login y guardar el token:

```powershell
$token = (Invoke-RestMethod -Method Post -Uri http://localhost:3015/api/auth/login -ContentType "application/json" -Body '{"email":"carlos@comida.com","password":"carlos123"}').data.token
```

La respuesta del login se ve asi:

```json
{ "ok": true, "data": { "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", "expiresIn": "1h" } }
```

Ver el perfil:

```bash
curl.exe http://localhost:3015/api/auth/perfil -H "Authorization: Bearer $token"
```

```json
{ "ok": true, "data": { "sub": 1, "nombre": "Carlos Puesto", "email": "carlos@comida.com", "iat": 1793650490, "exp": 1793654090 } }
```

Pedir 2 shucos:

```bash
curl.exe -X POST http://localhost:3015/api/pedidos -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{\"platoId\":1,\"cantidad\":2}'
```

```json
{ "ok": true, "data": { "id": 2, "usuarioId": 1, "platoId": 1, "cantidad": 2, "total": 30 } }
```

Ver mis pedidos (Carlos no ve el pedido de Valeria):

```bash
curl.exe http://localhost:3015/api/pedidos -H "Authorization: Bearer $token"
```

## Casos de error

| Caso                                | Status | Mensaje                                              |
| ----------------------------------- | ------ | ---------------------------------------------------- |
| Password incorrecta                 | 401    | `Credenciales incorrectas`                           |
| Login sin email o password          | 400    | `email y password son obligatorios`                  |
| Ruta protegida sin token            | 401    | `Falta el token, manda Authorization: Bearer <token>` |
| Token modificado o inventado        | 401    | `Token invalido`                                     |
| Token vencido                       | 401    | `El token expiro, vuelve a hacer login`              |
| Pedido con datos malos              | 400    | `Datos invalidos` + lista `errors`                   |
| Pedido de un plato que no existe    | 404    | `No existe el plato con id 9`                        |

Ejemplo sin token:

```bash
curl.exe http://localhost:3015/api/pedidos
```

```json
{ "ok": false, "message": "Falta el token, manda Authorization: Bearer <token>" }
```

Para probar el vencimiento rapido se puede poner `JWT_EXPIRES_IN=10s`
en el `.env`, hacer login y esperar unos segundos.

## Notas

Los datos viven en memoria. Los tokens siguen sirviendo despues de
reiniciar el servidor mientras no venzan y el secreto sea el mismo.
