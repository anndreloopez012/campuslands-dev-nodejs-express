# Intermedio - Ejercicio 15: JWT Básico
> **Autor:** Anderson Oloroso | **Temática:** Comida urbana | **Tema:** JWT basico

## Descripción
Implementación de autenticación basada en **JSON Web Tokens (JWT)** con HMAC-SHA256 nativo de Node.js (`node:crypto`). Permite iniciar sesión, generar un token firmado con expiración y validar la firma al consultar rutas protegidas.

## Instalación y ejecución
```bash
cd intermedio/ejercicio-15/resoluciones/anderson-oloroso
npm install
npm start
npm run dev
```

## Flujo de autenticación

1. **Login:** `POST /api/streetfood/auth/login` con:
   ```json
   { "username": "anderson", "password": "comida123" }
   ```
   Retorna `{ "ok": true, "token": "eyJhbGciOiJIUz..." }`.

2. **Acceso protegido:** `GET /api/streetfood/profile` con cabecera:
   ```text
   Authorization: Bearer <token>
   ```

## Estructura
```text
intermedio/ejercicio-15/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── controllers/
    │   └── food.controller.js
    ├── routes/
    │   └── food.routes.js
    └── services/
        └── jwt.service.js
```
