# INTERMEDIO 14 - Autenticacion simulada (sin JWT ni hash)

## Objetivo

Crear una API Node.js con Express que implemente el flujo completo de autenticacion por sesion con tokens generados en memoria: login, logout, rutas protegidas con `Authorization: Bearer` y una regla de rol.

## Concepto principal

En este nivel no se usa JWT ni bcrypt: lo importante es entender el **flujo**:

```
1. POST /auth/login   -> valida credenciales, emite token de sesion en memoria
2. POST /auth/logout  -> invalida el token
3. GET  /libros       -> exige token valido en el header Authorization
4. POST /libros       -> exige sesion valida + rol "bibliotecario"
```

Detalles del diseno:

- Los tokens solo viven mientras el proceso exista (sesiones en memoria); al reiniciar el servidor hay que hacer login de nuevo, exactamente como en una sesion de servidor tradicional.
- El header se parsea con el esquema `Bearer <token>`; cualquier otro esquema se trata como "sin token".
- Credenciales invalidas responden 401 con mensaje generico (`No autenticado`), sin revelar si fallo el usuario o la contrasena.
- El rol no se verifica en la ruta: el servicio lanza `ForbiddenError` (403) si el rol no es `bibliotecario`. Los permisos son negocio.
- El login responde 201 cuando crea la sesion; cada endpoint protegido declara en su respuesta quien esta autenticado.

## Estructura del proyecto

```text
resoluciones/carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── auth/
    │   └── extraer.token.js
    ├── errors/
    │   └── app.error.js
    ├── middlewares/
    │   └── error.handler.js
    ├── routes/
    │   └── library.routes.js
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── books.controller.js
    │   └── admin.controller.js
    └── services/
        └── library.service.js
```

## Como ejecutar

```bash
npm install
npm run start   # produccion
npm run dev     # desarrollo con recarga automatica
```

## Usuarios de prueba (memoria)

| usuario       | contrasena | rol           |
| ------------- | ---------- | ------------- |
| lectora.ana   | secreta123 | lector        |
| bibliotecario | biblio2026 | bibliotecario |

## Ejemplos de peticiones

```bash
# Login correcto -> 201 con el token de sesion
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario": "bibliotecario", "contrasena": "biblio2026"}'

# Caso de error: credenciales invalidas -> 401 generico
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario": "bibliotecario", "contrasena": "equivocada"}'

TOKEN="<pega-el-token-del-login>"

# Acceso a la lista protegida con token -> 200
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/libros

# Acceso sin token -> 401 "Token no enviado"
curl http://localhost:3000/libros

# Registrar libro con rol bibliotecario -> 201
curl -X POST http://localhost:3000/libros \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"titulo": "Relato Breve", "autor": "M. Torte", "anio": 2023}'

# Misma peticion con el rol lector -> 403 ForbiddenError
curl -X POST http://localhost:3000/libros \
  -H "Authorization: Bearer <token-de-lectora-ana>" \
  -H "Content-Type: application/json" \
  -d '{"titulo": "Otro Libro", "autor": "A. Un", "anio": 1999}'

# Cerrar sesion: el token deja de funcionar de inmediato
curl -X POST -H "Authorization: Bearer $TOKEN" http://localhost:3000/auth/logout
```

## Siguiente paso

Lo que reemplazaras despues: el token de sesion mutante -> JWT sin estado, y la comparacion de contrasenas planas -> hash con bcrypt. El flujo HTTP (login -> bearer -> rol) es exactamente el mismo.
