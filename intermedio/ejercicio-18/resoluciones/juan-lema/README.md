# Ejercicio 18 - hash de passwords conceptual (Juan Lema)

## Que hace

Tematica paracaidismo. Ninguna password se guarda ni se devuelve en texto plano. `services/password.service.js` implementa el concepto con `node:crypto` (sin dependencias):

- **Salt aleatorio** de 16 bytes por password: dos usuarios con la misma password generan hashes distintos.
- **scrypt** como funcion de derivacion de clave (lenta a proposito y con costo de memoria, resistente a fuerza bruta).
- Se guarda `salt:hash` en hexadecimal; el salt no es secreto, solo evita tablas precalculadas.
- **`timingSafeEqual`** para comparar sin filtrar informacion por tiempo de respuesta.
- Si el usuario no existe en el login, igual se verifica contra un hash de relleno, asi el tiempo de respuesta no revela si el usuario existe.

`POST /auth/hash-demo` no toca a los usuarios: hashea la misma password dos veces para mostrar que los hashes difieren pero ambos verifican.

Usuario semilla: `skydiver / paracaidas123`. Politica de registro: username de 3-20 caracteres (`a-z`, `0-9`, `_`) y password de minimo 8 caracteres.

## Como ejecutar

```bash
npm install
npm start
```

## Como probar

```bash
curl -X POST http://localhost:4018/auth/register -H "Content-Type: application/json" -d "{\"username\":\"halcon_22\",\"password\":\"caida-libre-9\",\"name\":\"Hugo Halcon\"}"
curl -X POST http://localhost:4018/auth/login -H "Content-Type: application/json" -d "{\"username\":\"halcon_22\",\"password\":\"caida-libre-9\"}"
curl -X POST http://localhost:4018/auth/hash-demo -H "Content-Type: application/json" -d "{\"password\":\"paracaidas123\"}"
```

## Como probar los casos de error

```bash
curl -X POST http://localhost:4018/auth/login -H "Content-Type: application/json" -d "{\"username\":\"skydiver\",\"password\":\"incorrecta\"}"
curl -X POST http://localhost:4018/auth/login -H "Content-Type: application/json" -d "{\"username\":\"nadie\",\"password\":\"paracaidas123\"}"
curl -X POST http://localhost:4018/auth/register -H "Content-Type: application/json" -d "{\"username\":\"skydiver\",\"password\":\"otra-clave-1\",\"name\":\"Copia\"}"
curl -X POST http://localhost:4018/auth/register -H "Content-Type: application/json" -d "{\"username\":\"ab\",\"password\":\"corta\",\"name\":\"X\"}"
```

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/auth.routes.js
├── controllers/auth.controller.js
└── services/
    ├── password.service.js
    └── users.service.js
```
