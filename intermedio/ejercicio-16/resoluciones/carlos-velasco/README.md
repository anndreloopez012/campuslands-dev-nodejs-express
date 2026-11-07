# INTERMEDIO 16 - Rutas protegidas

## Objetivo

Crear una API Node.js con Express que combine niveles de proteccion por ruta con middlewares encadenados: un endpoint publico, uno protegido por sesion y uno protegido por sesion + rol.

## Concepto principal

En Express la proteccion es **encadenar middlewares antes del handler final**:

```js
router.get('/inventario', requireAuth, handler);                      // solo requiere sesion
router.post('/inventario/:id/stock',
  requireAuth,                      // 1) anade req.sesion o corta con 401
  requireRole('inventario', 'admin'), // 2) corta con 403 si el rol no coincide
  handler);                          // 3) solo ejecuta si ambos pasaron
```

Orden de lectura: primero devuelve el codigo "izquierda a derecha" — 401 sin sesion, 403 sin rol el nivel anterior — asi el cliente sabe exactamente en que punto de acceso fallo la peticion.

| Ruta | Proteccion | Falta de acceso |
| ---- | ---------- | --------------- |
| `/catalogo` | publica | - |
| `/inventario` | requireAuth | 401 UnauthorizedError |
| `/inventario/:id/stock` | requireAuth + requireRole | 401 o 403 ForbiddenError |

## Estructura del proyecto

```text
resoluciones/carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── errors/
    │   └── app.error.js
    ├── middlewares/
    │   ├── auth.guard.js        (requireAuth + requireRole, reutilizables)
    │   └── error.handler.js
    ├── routes/
    │   └── store.routes.js
    ├── controllers/
    │   └── sneakers.controller.js
    └── services/
        ├── session.service.js
        └── sneakers.service.js
```

## Como ejecutar

```bash
npm install
npm run start   # produccion
npm run dev     # desarrollo con recarga automatica
```

## Usuarios de prueba

| usuario     | contrasena | rol        |
| ----------- | ---------- | ---------- |
| clienta.lu  | tienda1    | cliente    |
| stock.dana  | bodega9    | inventario |
| admin.max   | root2026   | admin      |

## Ejemplos de peticiones

```bash
# Catalogo publico: nadie necesita token
curl http://localhost:3000/catalogo

# Inventario sin sesion -> 401
curl http://localhost:3000/inventario

# Login como cliente
TOKEN_CLIENTE=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario": "clienta.lu", "contrasena": "tienda1"}' | sed -n 's/.*"token": "\([^"]*\)".*/\1/p')

# Inventario con sesion de cliente -> 200
curl -H "Authorization: Bearer $TOKEN_CLIENTE" http://localhost:3000/inventario

# Ajuste de stock con rol cliente -> 403 ForbiddenError (paso el requireAuth, no el rol)
curl -X POST http://localhost:3000/inventario/1/stock \
  -H "Authorization: Bearer $TOKEN_CLIENTE" \
  -H "Content-Type: application/json" \
  -d '{"operacion": "entrada", "cantidad": 5}'

# Login como inventario y ajuste correcto -> 200
TOKEN_STOCK=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario": "stock.dana", "contrasena": "bodega9"}' | sed -n 's/.*"token": "\([^"]*\)".*/\1/p')

curl -X POST http://localhost:3000/inventario/1/stock \
  -H "Authorization: Bearer $TOKEN_STOCK" \
  -H "Content-Type: application/json" \
  -d '{"operacion": "salida", "cantidad": 2}'

# Cerrar sesion: el token se invalida al instante
curl -X POST -H "Authorization: Bearer $TOKEN_CLIENTE" http://localhost:3000/auth/logout
```

## Diferencia con ejercicios anteriores

En el 14 la proteccion era codigo embebido en el flujo; aqui la proteccion es **componible**: los mismos dos middlewares protegen cualquier ruta nueva que se agregue en el router.
