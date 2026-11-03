# Club de Paracaidismo — Hash de Passwords Conceptual (Salt, Hash & Scrypt)

Este repositorio implementa el estándar de **Seguridad de Contraseñas (Password Hashing con Salt Criptográfico)** utilizando **Node.js nativo (node:crypto)** y **Express** sobre la temática de **paracaidismo, bitácoras de salto y licencias de vuelo**.

---

## Fundamentos del Password Hashing Conceptual

1. **Nunca almacenar texto plano**:
   Las contraseñas jamás deben persistirse legibles.
2. **Sal Criptográfica Única (Salt)**:
   Generada mediante `randomBytes(16)`. Evita ataques con tablas arcoíris (Rainbow Tables). Dos usuarios con la misma contraseña tendrán hashes completamente distintos.
3. **Función de Derivación Robusta (scrypt)**:
   Algoritmo computacional y espacialmente costoso (memory-hard), diseñado para mitigar ataques de fuerza bruta basados en hardware dedicado (GPU/ASIC).
4. **Comparación en Tiempo Constante (timingSafeEqual)**:
   Evita fugas de información por canales laterales de temporización (Timing Attacks) al verificar credenciales en el inicio de sesión.
5. **Estructura Almacenada**: `<salt_hex>:<derived_key_hex>`.

---

## Credencial Precargada de Prueba

| Paracaidista | Correo Electrónico | Contraseña en Texto Plano | Licencia |
| :--- | :--- | :--- | :--- |
| Felix Baumgartner | felix@stratos.dropzone | sky_jump_secret_2026 | Instructor_Tandem |

---

## Estructura de Directorios

```text
src/
├── app.js                                       # Configuración global y montaje de rutas
├── server.js                                    # Arranque del servidor HTTP
├── routes/
│   ├── index.routes.js                          # Montaje centralizado
│   ├── auth.routes.js                           # Endpoints de register, login y perfil
│   └── jumps.routes.js                          # Endpoints protegidos de saltos
├── controllers/
│   ├── auth.controller.js                       # Controladores de registro y login
│   └── jumps.controller.js                      # Controladores de bitácora de saltos
├── services/
│   ├── auth.service.js                          # Lógica de hashing y verificación con scrypt
│   └── jumps.service.js                         # Reglas de negocio de saltos
├── repositories/
│   ├── users.inMemory.repository.js             # Repositorio de paracaidistas (guarda passwordHash)
│   └── jumps.inMemory.repository.js             # Repositorio de saltos
├── middlewares/
│   ├── requestId.middleware.js                  # Trazabilidad con UUID v4
│   ├── logger.middleware.js                     # Logger transversal
│   ├── authJwt.middleware.js                    # Verificación del Bearer JWT
│   ├── errorHandler.middleware.js               # Captura centralizada de errores
│   └── validators/
│       ├── validate.middleware.js               # Envoltorio de validación
│       ├── auth.validator.js                    # Validación de contraseñas (mínimo 8 caracteres)
│       └── jump.validator.js                    # Validación de altitudes y tiempos de caída libre
├── utils/
│   ├── asyncHandler.js                          # Envoltorio asíncrono
│   ├── passwordHasher.js                        # hashPassword y verifyPassword con scrypt
│   └── customErrors.js                          # Clases de error (UnauthorizedError, etc.)
.env                                             # Variables de entorno
.env.example                                     # Plantilla de entorno
.gitignore                                       # Control de exclusiones
package.json                                     # Scripts y dependencias
```

---

## Configuración e Instalación

1. **Variables de entorno**:
   ```bash
   cp .env.example .env
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Modo desarrollo**:
   ```bash
   npm run dev
   ```

---

## Referencia de Endpoints

Base URL: `/api/v1`

| Recurso | Método | Endpoint | Protegido | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| Auth | POST | `/auth/register` | No | Hashea la contraseña con sal única y registra al paracaidista |
| Auth | POST | `/auth/login` | No | Verifica el hash con scrypt y retorna JWT Bearer |
| Auth | GET | `/auth/me` | Sí (JWT) | Retorna perfil del paracaidista sin exponer el hash |
| Saltos | GET | `/jumps` | Sí (JWT) | Bitácora de saltos del paracaidista autenticado |
| Saltos | POST | `/jumps` | Sí (JWT) | Registra un nuevo salto en la bitácora del usuario autenticado |
