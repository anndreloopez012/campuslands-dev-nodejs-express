# Avanzado 17 - refresh tokens conceptual

API de una agencia de viajes (ver mis reservas) hecha con Node.js y
Express. El login entrega **dos tokens** con trabajos distintos, y el
refresh token se **rota** en cada uso para poder detectar si alguien lo
robo.

## Por que dos tokens

Un solo JWT que dure 7 dias es comodo, pero si lo roban sirve 7 dias y
no se puede "apagar" (un JWT es valido hasta que vence). Un JWT de 15
minutos es mas seguro, pero obliga a hacer login a cada rato. La
solucion:

| Token         | Que es                         | Dura   | Donde viaja                         |
| ------------- | ------------------------------ | ------ | ----------------------------------- |
| Access token  | JWT firmado                    | 15 min | `Authorization: Bearer` en cada peticion |
| Refresh token | Texto al azar de 32 bytes      | 7 dias | Cookie `HttpOnly`, solo a `/api/auth` |

Cuando el access vence, la API responde 401 con `code: "ACCESS_VENCIDO"`
y el cliente llama `POST /api/auth/refresh` para pedir otro, sin que el
usuario vuelva a escribir la clave.

## Como esta hecho (`src/auth/tokens.js`)

- **El refresh se guarda hasheado** (sha256). Si se filtra la base de
  datos, los refresh guardados no sirven.
- **La cookie** (`src/http/cookies.js`):
  - `HttpOnly`: el JavaScript del navegador no la puede leer (si hay un
    XSS, no se la roban).
  - `SameSite=Strict`: no se manda desde otros sitios (CSRF).
  - `Path=/api/auth`: solo viaja a las rutas de auth.
  - `Secure` en produccion: solo por HTTPS.
  - El refresh **nunca** va en el body.
- **Rotacion:** cada vez que se usa un refresh, se marca como usado y se
  entrega uno nuevo. Todos los refresh de un mismo login forman una
  **familia**.
- **Deteccion de robo (reuso):** si llega un refresh que **ya se uso**,
  alguien tiene una copia. No se puede saber si es el dueno o el ladron,
  asi que se **revoca toda la familia**: el ladron pierde el acceso (y el
  dueno tiene que volver a hacer login). Queda registrado como
  `reuso_detectado`. Las otras sesiones del usuario (otro dispositivo)
  no se tocan.
- **El access tambien se apaga:** el JWT lleva el id de su familia
  (`fam`). Si la sesion se cierra, el access deja de servir aunque no
  haya vencido. Es el costo de revisar una tabla en cada peticion, a
  cambio de poder cerrar sesiones de verdad.
- **Cerrar sesiones:** `logout` cierra la sesion actual; `logout-todas`
  cierra todas (por ejemplo si se perdio el telefono). Tambien se puede
  ver la lista de sesiones activas con su dispositivo.

## Requisitos e instalacion

Node.js 20 o superior. Sin base de datos. Dependencia: `jsonwebtoken`.

```bash
npm install
npm start
```

| Script        | Descripcion                        |
| ------------- | ---------------------------------- |
| `npm start`   | Servidor en http://localhost:4017  |
| `npm run dev` | Servidor con recarga automatica    |
| `npm test`    | Tests                              |

Variable `JWT_SECRET` (si no esta usa uno de desarrollo con aviso).

Usuarios de prueba: `lucia@viajes.com` / `lucia12345` y
`pedro@viajes.com` / `pedro12345`.

## Endpoints

| Metodo | Ruta                       | Auth            | Descripcion                          |
| ------ | -------------------------- | --------------- | ------------------------------------ |
| POST   | `/api/auth/login`          | -               | `{ email, clave }` -> access + cookie |
| POST   | `/api/auth/refresh`        | cookie refresh  | Par nuevo (rota el refresh)          |
| POST   | `/api/auth/logout`         | cookie refresh  | Cierra esta sesion                   |
| POST   | `/api/auth/logout-todas`   | access          | Cierra todas las sesiones            |
| GET    | `/api/auth/sesiones`       | access          | Sesiones activas                     |
| GET    | `/api/reservas`            | access          | Mis reservas                         |

## Ejemplo (PowerShell)

curl guarda y manda las cookies con `-c` y `-b`:

```bash
curl.exe -c cookies.txt -X POST http://localhost:4017/api/auth/login -H "Content-Type: application/json" -d '{\"email\":\"lucia@viajes.com\",\"clave\":\"lucia12345\"}'
```

```json
{ "ok": true, "data": { "accessToken": "eyJhbGciOi...", "tipo": "Bearer" } }
```

```bash
curl.exe -b cookies.txt -c cookies.txt -X POST http://localhost:4017/api/auth/refresh
```

Si se vuelve a mandar un refresh viejo:

```json
{ "ok": false, "code": "REFRESH_REUSADO", "message": "Este refresh token ya se uso. Por seguridad se cerro la sesion" }
```

## Codes de error

| Code               | Cuando                                                  |
| ------------------ | ------------------------------------------------------- |
| `ACCESS_VENCIDO`   | El access paso los 15 min: usar `/api/auth/refresh`     |
| `ACCESS_INVALIDO`  | Access inventado o modificado                           |
| `SIN_TOKEN`        | Falta `Authorization`                                   |
| `REFRESH_INVALIDO` | Sin cookie o refresh que no existe                      |
| `REFRESH_VENCIDO`  | Pasaron 7 dias: hay que hacer login                     |
| `REFRESH_REUSADO`  | Se uso un refresh viejo: se cerro la familia            |
| `SESION_REVOCADA`  | La sesion se cerro (logout, logout-todas o reuso)       |
| `CREDENCIALES`     | Email o clave incorrectos                               |

Todos responden 401.

## Tests

`test/refresh.test.js` (15 tests): cookie con sus atributos y sin el
refresh en el body, `Secure` en produccion, refresh guardado hasheado,
access que vence a los 15 min (con `t.mock.timers`) y se renueva,
rotacion, **reuso que cierra la familia** (el refresh nuevo del dueno y
su access tambien dejan de servir), reuso que no toca otras sesiones,
refresh que vence a los 7 dias, logout, sesiones activas, logout-todas
sin tocar a otro usuario.

```text
ℹ tests 15
ℹ pass 15
ℹ fail 0
```

Para comprobar que sirven quite la deteccion de reuso y fallo
`REUSO: usar un refresh viejo cierra toda la familia (el ladron y el dueno)`.
