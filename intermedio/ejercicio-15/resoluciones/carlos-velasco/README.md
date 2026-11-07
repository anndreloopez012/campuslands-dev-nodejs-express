# INTERMEDIO 15 - JWT basico (HS256 implementado a mano)

## Objetivo

Crear una API Node.js con Express que emita y verifique tokens JWT sin dependencias externas: `header.payload.signature` firmado con HMAC-SHA256 usando `node:crypto`.

## Concepto principal

Un JWT tiene tres partes en base64url:

```text
header:    { "alg": "HS256", "typ": "JWT" }
payload:   { sub, rol, cocina, iat, exp }   <- iat: emitido, exp: expira
signature: HMAC_SHA256(header + "." + payload, SECRETO)
```

El servidor no guarda nada: solo necesita el **secreto** para firmar. La verificacion recalcula la firma y la compara con `timingSafeEqual` (comparacion en tiempo constante). El `exp` se compara con la hora actual; un token caducado responde 401 con el mensaje "Token expirado".

Errores diferenciados que puede devolver el middleware:

| Situacion | Mensaje |
| --------- | ------- |
| Header faltante o mal esquema | "Header Authorization requerido con esquema Bearer" |
| Token malformado ( != 3 partes ) | "Token malformado" |
| Firma no coincide | "Firma invalida" (el payload no se confia) |
| exp pasado | "Token expirado" |

## Estructura del proyecto

```text
resoluciones/carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── auth/
    │   └── jwt.js                (firmar/verificar, sin dependencias)
    ├── errors/
    │   └── app.error.js
    ├── middlewares/
    │   └── error.handler.js
    ├── routes/
    │   └── urban.routes.js
    └── services/
        └── urban.service.js      (login, autenticarJwt, ordenes)
```

## Como ejecutar

```bash
npm install
npm run start   # produccion
npm run dev     # desarrollo con recarga automatica
```

Credenciales de prueba: `usuario: conductor` / `contrasena: calle2026`. El secreto se puede configurar con `JWT_SECRET=...` (no se sube a repos).

## Ejemplos de peticiones

```bash
# Login -> token firmado que expira en 60 minutos
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario": "conductor", "contrasena": "calle2026", "cocina": "ramen"}'

TOKEN="<pega-el-token>"

# Listar food trucks (publico)
curl http://localhost:3000/foodtrucks

# Ruta protegida con token vigente -> 200
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/ordenes

# Ruta protegida sin token -> 401
curl http://localhost:3000/ordenes

# Crear orden: el cliente se saca del token ("sub"), no del cuerpo
curl -X POST http://localhost:3000/ordenes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"truckId": 3, "detalle": "2 bowls especiales y agua", "items": ["ramen clasico", "ramen miso"]}'
```

## Experimento clave

Decodifica el payload del token en base64url desde una pestaña — veras `sub`, `cocina`, `iat` y `exp` en claro. Esto demuestra el rasgo de seguridad clave: el JWT **solo firma**, no cifra. Nunca pongas datos sensibles en el payload.
