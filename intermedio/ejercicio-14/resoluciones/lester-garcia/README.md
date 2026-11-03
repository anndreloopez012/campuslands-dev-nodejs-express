# API Literaria — Autenticación Simulada (Simulated Token Auth Pattern)

Este repositorio implementa el estándar de **Autenticación Basada en Tokens Bearer Simulados** utilizando **Node.js** y **Express** sobre la temática de **libros, autores y gestión editorial**.

---

## ¿Cómo funciona la Autenticación Simulada?

1. **Login y Emisión (`POST /auth/login`)**:
   - El cliente envía correo y contraseña.
   - El servicio valida las credenciales y genera un token firmado:
     `base64Url(payload + expiration) + "." + hmacSha256(payload, secretSalt)`.
2. **Esquema Bearer Estándar**:
   - En peticiones protegidas, el cliente envía el encabezado:
     `Authorization: Bearer <token>`.
3. **Middleware `authenticate`**:
   - Extrae el token, verifica la firma criptográfica y la expiración.
   - Inyecta `req.user = { id, name, email, role }` antes de pasar el control al siguiente middleware o controlador.
4. **Protección Granular**:
   - Endpoints de consulta (`GET /books`) son públicos para lectores anónimos.
   - Endpoints de mutación (`POST /books`, `DELETE /books/:id`) exigen `authenticate`.

---

## Credenciales de Prueba Disponibles

| Usuario | Correo Electrónico | Contraseña | Rol |
| :--- | :--- | :--- | :--- |
| Gabriel García | `editor@macondo.org` | `literary_pass_123` | Editor |
| Sor Juana Inés | `lectora@barroco.lit` | `poesia_secreta_456` | Lector |

---

## Estructura de Directorios

```text
src/
├── app.js                                       # Configuración global de Express y rutas
├── server.js                                    # Arranque del servidor HTTP
├── routes/
│   ├── index.routes.js                          # Montaje centralizado de rutas
│   ├── auth.routes.js                           # Rutas de login y perfil (/auth/me)
│   └── books.routes.js                          # Rutas públicas y protegidas de libros
├── controllers/
│   ├── auth.controller.js                       # Controladores de sesión
│   └── books.controller.js                      # Controladores del catálogo de libros
├── services/
│   ├── auth.service.js                          # Validación de credenciales y generación de tokens
│   └── books.service.js                         # Reglas de negocio y auditoría con req.user
├── repositories/
│   ├── users.inMemory.repository.js             # Repositorio de usuarios
│   └── books.inMemory.repository.js             # Repositorio de libros con createdById
├── middlewares/
│   ├── requestId.middleware.js                  # Trazabilidad con UUID v4
│   ├── logger.middleware.js                     # Logger transversal
│   ├── authenticate.middleware.js               # Verificación de Bearer Token e inyección de req.user
│   ├── errorHandler.middleware.js               # Captura centralizada de errores
│   └── validators/
│       ├── validate.middleware.js               # Envoltorio de validación
│       ├── auth.validator.js                    # Validación de email y password
│       └── book.validator.js                    # Validación de ISBN y datos literarios
└── utils/
    ├── asyncHandler.js                          # Envoltorio asíncrono
    ├── tokenSimulator.js                        # Firma HMAC y verificación de tokens en base64
    └── customErrors.js                          # Clases de error (UnauthorizedError, etc.)
.env                                             # Variables de entorno
.env.example                                     # Plantilla de variables
.gitignore                                       # Control de exclusiones
package.json                                     # Scripts y dependencias
```

---

## Configuración e Instalación

1. **Variables de entorno**:
   ```bash
   cp .env.example .env
   ```

2. **Dependencias**:
   ```bash
   npm install
   ```

3. **Modo desarrollo**:
   ```bash
   npm run dev
   ```

---

## Referencia de Endpoints

**Base URL:** `/api/v1`

| Recurso | Método | Endpoint | Protegido | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| Auth | POST | `/auth/login` | No | Iniciar sesión y obtener token Bearer |
| Auth | GET | `/auth/me` | Sí | Consultar datos del perfil de la sesión actual |
| Libros | GET | `/books` | No | Listar catálogo (filtro opcional: `genre`) |
| Libros | GET | `/books/:id` | No | Consultar libro por ID |
| Libros | POST | `/books` | Sí | Catalogar nuevo libro (asigna autoría a `req.user`) |
| Libros | DELETE | `/books/:id` | Sí | Eliminar libro (solo creador o rol Editor) |
