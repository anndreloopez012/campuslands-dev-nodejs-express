# API Comida Urbana & Food Trucks — Autenticación con JWT Básico (RFC 7519)

Este repositorio implementa el estándar de **JSON Web Tokens (JWT)** utilizando **Node.js**, **Express** y `jsonwebtoken` sobre la temática de **food trucks, puestos callejeros y guías gastronómicas urbanas**.

---

## Anatomía de un JSON Web Token (JWT)

Un JWT consta de 3 secciones codificadas en Base64URL separadas por puntos (`.`):
1. **Header**: Especifica el algoritmo (`HS256`) y el tipo de token (`JWT`).
2. **Payload**: Contiene los *claims* del usuario (`id`, `name`, `email`, `role`, `exp`, `iat`).
3. **Signature**: Generada con la clave secreta `JWT_SECRET` para asegurar que el contenido no fue alterado por terceros.

### Ventajas del Enfoque Stateless
- **Sin almacenamiento de sesión en servidor**: El servidor no necesita consultar la base de datos para saber quién hace la petición; la validez y los datos están contenidos de forma criptográfica en el propio token.
- **Manejo Centralizado de Excepciones**:
  - `TokenExpiredError` -> `401 Unauthorized` ("El token JWT ha expirado").
  - `JsonWebTokenError` -> `401 Unauthorized` ("Firma digital corrupta").

---

## Credenciales de Prueba Disponibles

| Usuario | Correo Electrónico | Contraseña | Rol |
| :--- | :--- | :--- | :--- |
| Mario Rossi | `chef@streetfood.com` | `tacos_secret_pass` | `Chef_Owner` |
| Camila Torres | `foodie@urbanroutes.com` | `urban_burger_123` | `Foodie` |

---

## Estructura de Directorios

```text
src/
├── app.js                                       # Configuración global y montaje de rutas
├── server.js                                    # Arranque del servidor HTTP
├── routes/
│   ├── index.routes.js                          # Montaje centralizado
│   ├── auth.routes.js                           # Endpoints de login y perfil (/auth/me)
│   └── foodTrucks.routes.js                     # Rutas públicas y protegidas con verifyJwt
├── controllers/
│   ├── auth.controller.js                       # Controladores de autenticación
│   └── foodTrucks.controller.js                 # Controladores de puestos gastronómicos
├── services/
│   ├── auth.service.js                          # Firma de tokens con jwt.sign()
│   └── foodTrucks.service.js                    # Reglas de negocio y autoría
├── repositories/
│   ├── users.inMemory.repository.js             # Repositorio de usuarios
│   └── foodTrucks.inMemory.repository.js        # Repositorio de food trucks
├── middlewares/
│   ├── requestId.middleware.js                  # Trazabilidad con UUID v4
│   ├── logger.middleware.js                     # Logger transversal
│   ├── authJwt.middleware.js                    # Middleware verifyJwt con jwt.verify()
│   ├── errorHandler.middleware.js               # Captura de errores JWT y operacionales
│   └── validators/
│       ├── validate.middleware.js               # Envoltorio de validación
│       ├── auth.validator.js                    # Validación de credenciales
│       └── foodTruck.validator.js               # Validación de especialidades y precios
└── utils/
    ├── asyncHandler.js                          # Envoltorio asíncrono
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
| Auth | POST | `/auth/login` | No | Iniciar sesión y obtener JWT Bearer |
| Auth | GET | `/auth/me` | Sí (JWT) | Consultar perfil decodificado del token |
| Food Trucks | GET | `/food-trucks` | No | Listar catálogo (filtro opcional: `specialty`) |
| Food Trucks | GET | `/food-trucks/:id` | No | Consultar puesto callejero por ID |
| Food Trucks | POST | `/food-trucks` | Sí (JWT) | Registrar nuevo puesto (asigna `ownerId`) |
| Food Trucks | DELETE | `/food-trucks/:id` | Sí (JWT) | Eliminar puesto (solo dueño o `Chef_Owner`) |
