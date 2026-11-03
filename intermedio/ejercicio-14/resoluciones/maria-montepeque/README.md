# Ejercicio 14 - autenticacion simulada

API de libros hecha con Node.js y Express con un login simulado. No usa
JWT ni base de datos: el token es un uuid que se guarda en memoria, pero
el flujo es el mismo que en una API real (login, token en el header,
rutas protegidas y roles).

## Como funciona

1. `POST /api/auth/login` revisa email y password y devuelve un `token`.
2. El cliente manda ese token en cada peticion protegida:
   `Authorization: Bearer <token>`.
3. `middlewares/auth.middleware.js` tiene dos middlewares:
   - `requireAuth`: si falta el token o no es valido responde 401. Si
     esta bien deja el usuario en `req.usuario`.
   - `requireRol("admin")`: si el usuario no tiene ese rol responde 403.
4. `POST /api/auth/logout` borra el token, despues ya no sirve.

| Ruta                   | Quien puede             |
| ---------------------- | ----------------------- |
| `GET /api/libros`      | Cualquiera              |
| `POST /api/libros`     | Usuario con login       |
| `DELETE /api/libros/:id` | Solo usuario admin    |

| Carpeta        | Que hay dentro                                    |
| -------------- | ------------------------------------------------- |
| `routes/`      | `index.js`, `auth.routes.js`, `libros.routes.js`  |
| `middlewares/` | `auth.middleware.js` con `requireAuth` y `requireRol` |
| `controllers/` | Auth y libros                                     |
| `services/`    | Login, sesiones y logica de libros                |
| `utils/`       | `app-error.js`                                    |
| `data/`        | `db.js` con usuarios, libros y sesiones en memoria |

## Usuarios de prueba

| Email              | Password   | Rol    |
| ------------------ | ---------- | ------ |
| `ana@libros.com`   | `ana123`   | lector |
| `admin@libros.com` | `admin123` | admin  |

Las claves estan en texto plano solo porque es una simulacion, en un
proyecto real se guardaria un hash.

## Requisitos

Node.js 20 o superior. Sin base de datos.

## Instalacion y ejecucion

```bash
npm install
npm start
```

| Script        | Descripcion                                        |
| ------------- | -------------------------------------------------- |
| `npm start`   | Levanta el servidor en http://localhost:3014       |
| `npm run dev` | Igual pero con recarga automatica (`node --watch`) |

El puerto se puede cambiar con la variable `PORT`.

## Endpoints

| Metodo | Ruta                | Auth        | Descripcion                    |
| ------ | ------------------- | ----------- | ------------------------------ |
| GET    | `/health`           | No          | Comprueba que el servidor vive |
| POST   | `/api/auth/login`   | No          | Devuelve un token              |
| GET    | `/api/auth/me`      | Si          | Datos del usuario del token    |
| POST   | `/api/auth/logout`  | Si          | Cierra la sesion               |
| GET    | `/api/libros`       | No          | Lista los libros               |
| GET    | `/api/libros/:id`   | No          | Busca un libro por id          |
| POST   | `/api/libros`       | Si          | Crea un libro                  |
| DELETE | `/api/libros/:id`   | Si, admin   | Borra un libro                 |

## Ejemplos (PowerShell)

Login:

```bash
curl.exe -X POST http://localhost:3014/api/auth/login -H "Content-Type: application/json" -d '{\"email\":\"ana@libros.com\",\"password\":\"ana123\"}'
```

```json
{
  "ok": true,
  "data": {
    "token": "d1a778a6-bddb-4e00-9d7a-b6b50ffc39dc",
    "usuario": { "id": 1, "nombre": "Ana Lectora", "email": "ana@libros.com", "rol": "lector" }
  }
}
```

Guardar el token en una variable para no copiarlo a mano:

```powershell
$token = (Invoke-RestMethod -Method Post -Uri http://localhost:3014/api/auth/login -ContentType "application/json" -Body '{"email":"ana@libros.com","password":"ana123"}').data.token
```

Ver mi usuario:

```bash
curl.exe http://localhost:3014/api/auth/me -H "Authorization: Bearer $token"
```

Crear un libro (el `creadoPor` sale del token):

```bash
curl.exe -X POST http://localhost:3014/api/libros -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{\"titulo\":\"Rayuela\",\"autor\":\"Julio Cortazar\",\"anio\":1963}'
```

```json
{
  "ok": true,
  "data": { "id": 4, "titulo": "Rayuela", "autor": "Julio Cortazar", "anio": 1963, "creadoPor": 1 }
}
```

Cerrar sesion:

```bash
curl.exe -X POST http://localhost:3014/api/auth/logout -H "Authorization: Bearer $token"
```

## Casos de error

Password incorrecta (401):

```json
{ "ok": false, "message": "Credenciales incorrectas" }
```

Login sin password (400):

```json
{ "ok": false, "message": "email y password son obligatorios" }
```

Crear un libro sin token (401):

```bash
curl.exe -X POST http://localhost:3014/api/libros -H "Content-Type: application/json" -d '{\"titulo\":\"Rayuela\",\"autor\":\"Julio Cortazar\"}'
```

```json
{ "ok": false, "message": "Falta el token, manda Authorization: Bearer <token>" }
```

Token inventado o de una sesion cerrada (401):

```json
{ "ok": false, "message": "Token invalido o sesion cerrada" }
```

Lector intentando borrar un libro (403):

```bash
curl.exe -X DELETE http://localhost:3014/api/libros/1 -H "Authorization: Bearer $token"
```

```json
{ "ok": false, "message": "Solo un usuario admin puede hacer esto" }
```

## Notas

Usuarios, libros y sesiones viven en memoria. Al reiniciar el servidor
se pierden los tokens y hay que hacer login otra vez.
