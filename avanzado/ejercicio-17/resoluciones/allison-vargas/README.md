# Avanzado 17 - Refresh tokens conceptual (viajes y turismo)

API en Node.js y Express para reservar viajes. El foco es entender **por que existen dos tokens** y como se manejan de forma segura: un access token corto y sin estado, y un refresh token largo, opaco y rotativo. Todo esta escrito a mano con `node:crypto` (sin `jsonwebtoken` ni `passport`) para ver cada pieza.

## Como ejecutarlo

```bash
npm install
JWT_SECRETO="una-clave-larga-de-al-menos-32-caracteres" npm start
npm test
```

Ruta base: `/avanzado/ejercicio-17`. Si no se define `JWT_SECRETO` se genera uno al azar en cada arranque (los tokens dejan de servir al reiniciar).

Cuentas de prueba (las contrasenas se guardan como hash scrypt en `src/data/usuarios.json`):

| Correo | Contrasena | Rol |
| --- | --- | --- |
| `valentina@viajes.test` | `Mochila2026!` | viajero |
| `tomas@viajes.test` | `Patagonia#45` | viajero |
| `admin@viajes.test` | `Admin$Seguro9` | admin |

## Probar rapido

```bash
BASE=http://localhost:3000/avanzado/ejercicio-17
curl -H "Content-Type: application/json" -d '{"email":"valentina@viajes.test","contrasena":"Mochila2026!"}' $BASE/auth/login
curl -H "Authorization: Bearer <accessToken>" $BASE/reservas
curl -H "Content-Type: application/json" -d '{"refreshToken":"<refreshToken>"}' $BASE/auth/refresh
```

## El concepto

| | Access token | Refresh token |
| --- | --- | --- |
| Para que | Llamar a la API | Pedir un access token nuevo |
| Duracion | 5 minutos | 7 dias sin uso, maximo 30 dias desde el login |
| Formato | JWT HS256 (`cabecera.cuerpo.firma`) con `sub`, `rol`, `sid`, `jti`, `iss`, `aud`, `iat`, `exp` | Opaco: `id.secreto` (32 bytes aleatorios) |
| Donde se guarda en el servidor | En ningun lado: se verifica la firma | Solo el **hash SHA-256** del secreto |
| Si lo roban | Sirve pocos minutos | Se detecta al reutilizarse (ver abajo) |

### Rotacion y deteccion de reutilizacion

Cada login crea una **familia** (una sesion). Cada `POST /auth/refresh`:

1. Busca el token por su id y compara el hash en tiempo constante.
2. Lo marca como usado y entrega uno nuevo de la misma familia.

Si alguien presenta un refresh token que **ya fue usado**, significa que hay dos copias circulando (la del usuario y la de un atacante). El servidor no puede saber cual es la legitima, asi que **revoca la familia completa**: el refresh nuevo y los access tokens de esa sesion dejan de servir y el usuario debe volver a iniciar sesion.

### Expiracion

- **Deslizante**: cada refresh extiende la sesion 7 dias desde el ultimo uso.
- **Absoluta**: nunca mas de 30 dias desde el login, aunque se use todos los dias.
- Maximo 5 sesiones abiertas por usuario; al abrir la sexta se cierra la mas antigua.

### Cerrar sesion

Un JWT no se puede "borrar". Para que `logout` tenga efecto inmediato, el access token lleva `sid` (id de la familia) y en cada peticion se revisa que la sesion siga activa. Es una consulta en memoria y permite cerrar una sesion robada sin esperar los 5 minutos.

### Otras decisiones de seguridad

- Solo se acepta `alg: HS256`; un token con `alg: none` o cualquier otro se rechaza aunque lo diga su cabecera.
- Las firmas y hashes se comparan con `timingSafeEqual`.
- Las contrasenas se guardan con **scrypt** y sal. Si el correo no existe se compara igual contra un hash falso, para que el tiempo de respuesta no revele que cuentas existen. El mensaje de error es el mismo en ambos casos.
- 5 intentos fallidos en 15 minutos bloquean ese correo por 15 minutos (`429` con `Retry-After`).
- Las respuestas de `/auth/*` llevan `Cache-Control: no-store`.
- Los `401` llevan `WWW-Authenticate: Bearer realm="viajes"` (y `error="invalid_token"` si el token fallo). El motivo exacto de un token invalido no se devuelve al cliente.

En un navegador el refresh token conviene guardarlo en una cookie `HttpOnly; Secure; SameSite=Strict` limitada a `/auth`. Aqui viaja en el body para que el ejercicio se pueda probar con curl.

## Rutas

| Metodo y ruta | Auth | Que hace |
| --- | --- | --- |
| `GET /` | no | Informacion del ejercicio |
| `POST /auth/login` | no | `{ email, contrasena }` -> tokens |
| `POST /auth/refresh` | no | `{ refreshToken }` -> tokens nuevos (rota el refresh) |
| `POST /auth/logout` | si | Cierra la sesion actual (`204`) |
| `POST /auth/logout-todas` | si | Cierra todas las sesiones del usuario |
| `GET /auth/yo` | si | Datos del usuario y su sesion |
| `GET /auth/sesiones` | si | Sesiones abiertas, marca la `actual` |
| `DELETE /auth/sesiones/:id` | si | Cierra otra sesion propia |
| `GET /destinos` | no | Destinos con cupos disponibles |
| `GET /reservas` | si | Reservas propias (el admin ve todas) |
| `POST /reservas` | si | `{ destinoId, fecha: "AAAA-MM-DD", personas }` |
| `DELETE /reservas/:id` | si | Cancela (solo el duenio o el admin) |

## Errores

| Codigo | Estado | Cuando |
| --- | --- | --- |
| `VALIDACION` | 400 | Datos invalidos |
| `JSON_INVALIDO` | 400 | Body que no es JSON |
| `NO_AUTENTICADO` | 401 | Falta `Authorization` |
| `TOKEN_INVALIDO` | 401 | Firma, formato, algoritmo, emisor o audiencia incorrectos |
| `TOKEN_EXPIRADO` | 401 | El access token vencio |
| `CREDENCIALES_INVALIDAS` | 401 | Correo o contrasena incorrectos |
| `REFRESH_INVALIDO` | 401 | Refresh token desconocido |
| `REFRESH_EXPIRADO` | 401 | Refresh token vencido |
| `REFRESH_REUTILIZADO` | 401 | Se uso un refresh ya rotado: se cierra la sesion |
| `SESION_REVOCADA` | 401 | La sesion fue cerrada |
| `PROHIBIDO` | 403 | Accion sobre algo ajeno |
| `DESTINO_NO_ENCONTRADO`, `RESERVA_NO_ENCONTRADA`, `SESION_NO_ENCONTRADA` | 404 | No existe |
| `RUTA_NO_ENCONTRADA` | 404 | Ruta desconocida |
| `METODO_NO_PERMITIDO` | 405 | Metodo no admitido |
| `CUPOS_INSUFICIENTES` | 409 | No quedan cupos |
| `PAYLOAD_GRANDE` | 413 | Body muy grande |
| `FORMATO_NO_SOPORTADO` | 415 | Falta `Content-Type: application/json` |
| `LOGIN_BLOQUEADO` | 429 | Demasiados intentos fallidos |
| `ERROR_INTERNO` | 500 | Error inesperado |

## Estructura

```
src/
  app.js, server.js
  auth/         jwt (HS256 a mano), contrasenas (scrypt), sesiones (familias y rotacion), intentos
  services/     auth y reservas
  routes/       auth, destinos y reservas
  validators/   validaciones escritas a mano
  middlewares/  errores (con WWW-Authenticate), notFound, metodoNoPermitido, exigirTipo
  errores/      catalogo de errores
test/           tokens, sesiones, intentos y pruebas de API con reloj controlado
```
