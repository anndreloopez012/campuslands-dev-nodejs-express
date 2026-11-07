# INTERMEDIO 18 - Hash de passwords conceptual

## Objetivo

Crear una API Node.js con Express que nunca guarde contrasenas planas: se registran saltadores con hash `scrypt` (nativo de `node:crypto`, sin bcrypt ni dependencias), salt unico por usuario y comparacion en tiempo constante.

## Concepto principal

Guardar `contrasena` en claro es el error clasico. El hash correcto cumple tres reglas:

1. **Salt unico por usuario** (16 bytes aleatorios con `randomBytes`): dos usuarios con la misma contrasena tienen hashes distintos, y la tabla de hashes no revela hashes iguales.
2. **KDF lento** (`scryptSync` con parametros N/r/p): fuerza el coste CPU/memoria, asi un volcado de tabla no es crackeable rapido.
3. **Comparacion en tiempo constante** (`timingSafeEqual`): evita filtrar informacion por el tiempo de respuesta.

El hash se almacena **auto-descriptivo** para permitir migraciones:

```text
scrypt:16384:8:1:<saltHex>:<hashHex>
```

Si mañana se sube el coste (N), `verificar` lee los parametros de cada hash y los hashes viejos siguen validando.

## Estructura del proyecto

```text
resoluciones/carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── auth/
    │   └── password.hash.js      (hash, verificar, robustez)
    ├── errors/
    │   └── app.error.js
    ├── middlewares/
    │   └── error.handler.js
    ├── routes/
    │   └── dive.routes.js
    └── services/
        └── dive.service.js
```

## Como ejecutar

```bash
npm install
npm run start   # produccion
npm run dev     # desarrollo con recarga automatica
```

## Endpoints

| Metodo | Ruta | Descripcion | Codigo |
| ------ | ---- | ----------- | ------ |
| GET | /health | Estado del servidor | 200 |
| GET | /saltadores | Lista sin datos sensibles (sin hash ni contrasena) | 200 |
| POST | /saltadores/registro | Registra saltador: guarda hash, nivel de robustez en respuesta | 201 / 400 |
| POST | /auth/login | Login: scrypt + timingSafeEqual | 200 / 401 |

## Usuarios de prueba

`nombre: "Alura Diaz", contrasena: "salto2026"` (pre-registrado).

## Ejemplos de peticiones

```bash
# Registrar saltador nuevo: nivel de contrasena evaluado
curl -X POST http://localhost:3000/saltadores/registro \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Bruno Casal", "licencia": "AFF", "contrasena": "Cielo_Abierto#9"}'
# -> contrasena_nivel: "fuerte"

# Caso de error: contrasena corta -> 400
curl -X POST http://localhost:3000/saltadores/registro \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Ana Breve", "licencia": "tandem", "contrasena": "corta1"}'

# Login correcto -> 200
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Alura Diaz", "contrasena": "salto2026"}'

# Login con contrasena equivocada -> 401 "Credenciales invalidas" (mensaje unico para ambos casos)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Alura Diaz", "contrasena": "no-es-mi-clave"}'

# Lista visible: el hash nunca viaja
curl http://localhost:3000/saltadores
```

## Punto clave

El mismo login falla con 401 tanto si el nombre no existe como si la contrasena es incorrecta: no se revela que cuentas existen (evita enumeracion de usuarios).
