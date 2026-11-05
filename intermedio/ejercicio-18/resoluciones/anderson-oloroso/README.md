# Intermedio - Ejercicio 18: Hash de Passwords Conceptual
> **Autor:** Anderson Oloroso | **Temática:** Paracaidismo | **Tema:** Hash de passwords conceptual

## Descripción
Demuestra la protección segura de credenciales sin librerías externas mediante funciones criptográficas nativas de Node.js (`node:crypto` -> `scryptSync` y `randomBytes`).
- Genera un **Salt** criptográfico único de 16 bytes para cada usuario.
- Genera un **Hash** derivado de 64 bytes.
- Compara contraseñas usando `timingSafeEqual` para prevenir ataques de temporización (timing attacks).

## Instalación y ejecución
```bash
cd intermedio/ejercicio-18/resoluciones/anderson-oloroso
npm install
npm start
npm run dev
```

## Endpoints
- `GET /intermedio/ejercicio-18` -> Health check.
- `POST /api/skydive/register` -> Registrar instructor con hash seguro.
- `POST /api/skydive/login` -> Iniciar sesión verificando hash y salt.

### Ejemplo Registro
```bash
curl -X POST http://localhost:3000/api/skydive/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Valeria Vuelo","email":"valeria@skydive.com","password":"miSuperPasswordSeguro","saltosRealizados":120}'
```

## Estructura
```text
intermedio/ejercicio-18/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── controllers/
    │   └── auth.controller.js
    ├── routes/
    │   └── auth.routes.js
    └── services/
        └── auth.service.js
```
