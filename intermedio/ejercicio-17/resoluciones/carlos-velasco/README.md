# INTERMEDIO 17 - Roles y permisos

## Objetivo

Crear una API Node.js con Express donde la autorizacion se resuelva con una **matriz de permisos por accion**, no con roles quemados en el codigo: agregar un rol nuevo no exige tocar rutas ni controladores.

## Concepto principal

El 16 protegía con `requireRole('inventario', 'admin')`. Aqui el paso siguiente: la ruta declara la **accion** y la matriz de permisos decide que roles pueden:

```js
const permisos = {
  turista: ['paquetes:listar', 'reservas:crear-propia', 'reservas:cancelar-propia', ...],
  agente:  [...turista, 'paquetes:crear', 'reservas:ver-todas', 'reservas:cancelar-cualquiera'],
  admin:   ['*']
};
```

Ventajas de este diseno:

1. **La ruta declara la accion**: `requirePermiso('reservas:ver-todas')`. Si mañana se crea el rol "supervisor", se agrega a la matriz y ninguna ruta cambia.
2. **Permisos jerarquicos**: `ver-todas` implica `ver-propia` (la funcion `puede` resuelve equivalentes).
3. **Accion con dueño**: `cancelar-propia` vs `cancelar-cualquiera` cambia el alcance de la operacion adentro del servicio, pero es exactamente la misma ruta.

## Estructura del proyecto

```text
resoluciones/carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── auth/
    │   └── permisos.js           (matriz + puede(rol, accion))
    ├── errors/
    │   └── app.error.js
    ├── middlewares/
    │   ├── auth.guard.js         (requireAuth + requirePermiso)
    │   └── error.handler.js
    ├── routes/
    │   └── travel.routes.js
    ├── controllers/
    │   ├── auth.controller.js
    │   └── travel.controller.js
    └── services/
        └── travel.service.js
```

## Como ejecutar

```bash
npm install
npm run start   # produccion
npm run dev     # desarrollo con recarga automatica
```

## Usuarios de prueba

| usuario     | contrasena | rol     |
| ----------- | ---------- | ------- |
| turista.mia | viajo1     | turista |
| agente.sol  | agente9    | agente  |
| admin.tur   | raiz24     | admin   |

## Ejemplos de peticiones

```bash
# Catalogo publico
curl http://localhost:3000/paquetes

# Login como turista -> token
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario": "turista.mia", "contrasena": "viajo1"}' | sed -n 's/.*"token": "\([^"]*\)".*/\1/p')

# Turista ve SOLO sus reservas
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/reservas

# Reservar el paquete 1 -> 201 (el cupo baja)
curl -X POST http://localhost:3000/reservas \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"paqueteId": 1}'

# Caso de error: paquete sin cupos -> 409
curl -X POST http://localhost:3000/reservas \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"paqueteId": 3}'

# Turista cancela SU reserva 3 -> 200; luego intenta la 1 (de otro) -> 403
curl -X DELETE -H "Authorization: Bearer $TOKEN" http://localhost:3000/reservas/3
curl -X DELETE -H "Authorization: Bearer $TOKEN" http://localhost:3000/reservas/1

# Con token de agente: ve todas y puede cancelar la de otro
TOKEN_AGENTE=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario": "agente.sol", "contrasena": "agente9"}' | sed -n 's/.*"token": "\([^"]*\)".*/\1/p')
curl -H "Authorization: Bearer $TOKEN_AGENTE" http://localhost:3000/reservas
curl -X DELETE -H "Authorization: Bearer $TOKEN_AGENTE" http://localhost:3000/reservas/1
```

## Punto clave

El permiso es la unidad de autorizacion, no el rol: la misma ruta `/reservas` devuelve distintas vistas segun el alcance del permiso resuelto.
