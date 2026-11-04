# Intermedio 18 - Hash de passwords conceptual (Allison Vargas)

## Que hace este ejercicio

API de una escuela de paracaidismo que muestra, con codigo y respuestas reales, como se guardan las contrasenas de forma segura. Todo se hace con `node:crypto`, sin librerias extra.

Ideas que demuestra:

- Una contrasena nunca se guarda en texto plano: se guarda un hash, una huella de un solo sentido.
- Un hash rapido y sin sal (SHA-256 simple) no sirve para contrasenas: la misma contrasena da siempre el mismo hash, y se puede atacar con tablas precalculadas o fuerza bruta muy rapida.
- La sal es un valor aleatorio distinto por usuario. Con ella, dos personas con la misma contrasena tienen hashes distintos.
- scrypt es lento y consume memoria a proposito (parametros `N`, `r`, `p`), lo que encarece cada intento del atacante.
- El hash guardado es autodescriptivo: `scrypt$N$r$p$sal$clave`. Guarda los parametros con los que se creo, asi se puede verificar aunque la configuracion cambie despues.
- La comparacion se hace con `timingSafeEqual`, para no filtrar informacion por el tiempo de respuesta.
- Si el email no existe, igual se calcula un hash de relleno. Asi el login tarda parecido y no se puede saber que emails estan registrados. El mensaje de error es el mismo en ambos casos.
- Migracion transparente: si un usuario tiene un hash viejo (SHA-256 sin sal, o scrypt con costo bajo), al iniciar sesion correctamente se vuelve a hashear con los parametros actuales y la respuesta lo avisa con `hashActualizado: true`.
- La contrasena se normaliza (Unicode NFKC) antes de hashear, y las respuestas nunca devuelven el hash completo de un usuario, solo un resumen de sus parametros.

Parametros actuales: scrypt con `N=16384`, `r=8`, `p=1`, clave de 32 bytes y sal de 16 bytes. Los endpoints `/hash/*` son didacticos: no guardan nada.

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

- routes: auth, usuarios y hash.
- controllers: validan el body, llaman al service y arman la respuesta.
- services: registro, login con migracion de hash, cambio de contrasena, consulta de usuarios y demostraciones.
- repositories: usuarios en memoria.
- validators: esquemas del body y lector de parametros de consulta.
- middlewares: metodo no permitido, notFound y errorHandler.
- constants: parametros y limites de scrypt.
- utils: `hash.js` (hashear, leer, verificar y resumir), errores, paginacion y respuestas.
- data: 4 usuarios en JSON, uno con SHA-256 viejo y otro con scrypt de costo bajo.

## Como ejecutar

```bash
cd intermedio/ejercicio-18/resoluciones/allison-vargas
npm install
npm run dev
```

El servidor queda en http://localhost:3000. Los datos viven en memoria: al reiniciar vuelven a los del JSON.

## Respuesta esperada

```bash
curl http://localhost:3000/intermedio/ejercicio-18
```

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "hash de passwords conceptual"
}
```

## Usuarios de prueba

| Email | Contrasena | Hash guardado |
| --- | --- | --- |
| ana@paracaidismo.test | Salto1234 | scrypt actual |
| luis@paracaidismo.test | Viento1234 | SHA-256 sin sal (se migra al iniciar sesion) |
| marta@paracaidismo.test | Cielo1234 | scrypt con N=1024 (se migra al iniciar sesion) |
| omar@paracaidismo.test | Nube12345 | scrypt actual |

## Endpoints

Todas las rutas cuelgan de `/intermedio/ejercicio-18`.

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| POST | /auth/registro | Crea una cuenta guardando solo el hash |
| POST | /auth/login | Verifica la contrasena y migra el hash si esta desactualizado |
| POST | /auth/cambiar-password | Cambia la contrasena verificando la actual |
| GET | /usuarios | Lista con el resumen del hash de cada usuario |
| GET | /usuarios/:id | Detalle de un usuario |
| GET | /hash/parametros | Parametros actuales de scrypt y limites aceptados |
| POST | /hash/demo | Compara SHA-256 sin sal contra scrypt con sal |
| POST | /hash/verificar | Verifica una contrasena contra un hash dado |

## Campos del body

| Ruta | Campos |
| --- | --- |
| /auth/registro | `nombre` (2-60), `email`, `password` (8-72, con letra y numero), `licencia` (`A`, `B`, `C`, `D`; por defecto `A`) |
| /auth/login | `email`, `password` |
| /auth/cambiar-password | `email`, `passwordActual`, `passwordNueva` (8-72, con letra y numero, distinta a la actual) |
| /hash/demo | `password` (1-72) |
| /hash/verificar | `password` (1-72), `hash` (formato `scrypt$N$r$p$sal$clave` o `sha256$hex`) |

Los campos desconocidos se rechazan con 400. En `/hash/verificar` los parametros del hash deben estar en rango (`N` potencia de 2 entre 1024 y 65536, `r` 1-16, `p` 1-4), para que nadie pueda forzar un calculo enorme.

## Parametros de consulta

`/usuarios` acepta `pagina` (por defecto 1), `limite` (por defecto 10, maximo 50), `orden` (`id` por defecto, `nombre`) y los filtros `algoritmo` (`scrypt`, `sha256`) y `actualizado` (`true`, `false`).

## Ejemplos

```bash
curl -X POST http://localhost:3000/intermedio/ejercicio-18/hash/demo \
  -H "Content-Type: application/json" \
  -d '{"password":"Paracaidas123"}'

curl -X POST http://localhost:3000/intermedio/ejercicio-18/auth/registro \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Nuevo Saltador","email":"nuevo@paracaidismo.test","password":"Clave12345","licencia":"B"}'

curl "http://localhost:3000/intermedio/ejercicio-18/usuarios?actualizado=false"

curl -X POST http://localhost:3000/intermedio/ejercicio-18/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"luis@paracaidismo.test","password":"Viento1234"}'

curl -X POST http://localhost:3000/intermedio/ejercicio-18/auth/cambiar-password \
  -H "Content-Type: application/json" \
  -d '{"email":"omar@paracaidismo.test","passwordActual":"Nube12345","passwordNueva":"Otra12345"}'
```

Flujo sugerido para ver la migracion: consultar `/usuarios?actualizado=false`, iniciar sesion con luis y marta, y volver a consultar. La lista queda vacia.

En PowerShell, las comillas del JSON dan problemas con `curl`. Se puede usar Thunder Client, Postman o `Invoke-RestMethod`:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/intermedio/ejercicio-18/hash/demo -ContentType "application/json" -Body '{"password":"Paracaidas123"}'
Invoke-RestMethod -Method Post -Uri http://localhost:3000/intermedio/ejercicio-18/auth/login -ContentType "application/json" -Body '{"email":"luis@paracaidismo.test","password":"Viento1234"}'
```

## Formato de respuesta

Resumen del hash de un usuario (nunca el hash completo):

```json
{
  "ok": true,
  "data": {
    "id": 3,
    "nombre": "Marta Cielo",
    "email": "marta@paracaidismo.test",
    "licencia": "D",
    "creadoEn": "2026-03-03T08:00:00.000Z",
    "hash": { "algoritmo": "scrypt", "actualizado": false, "conSal": true, "N": 1024, "r": 8, "p": 1, "longitudSal": 16, "longitudClave": 32 }
  }
}
```

Los listados agregan `paginacion` y el header `X-Total-Count`.

## Errores

```json
{
  "ok": false,
  "message": "Email o contrasena incorrectos",
  "codigo": "CREDENCIALES_INVALIDAS"
}
```

| Status | Codigo | Cuando |
| --- | --- | --- |
| 400 | VALIDACION, JSON_INVALIDO, CONSULTA_INVALIDA, ID_INVALIDO | body, id o parametros invalidos |
| 400 | PASSWORD_IGUAL | la contrasena nueva es igual a la actual |
| 400 | HASH_INVALIDO, PARAMETROS_FUERA_DE_RANGO | el hash enviado a `/hash/verificar` no se puede leer o pide demasiado costo |
| 401 | CREDENCIALES_INVALIDAS | email o contrasena incorrectos (mismo mensaje en ambos casos) |
| 404 | USUARIO_NO_ENCONTRADO | usuario inexistente |
| 405 | METODO_NO_PERMITIDO | metodo no soportado (con header `Allow`) |
| 409 | EMAIL_DUPLICADO | ya existe una cuenta con ese email |
