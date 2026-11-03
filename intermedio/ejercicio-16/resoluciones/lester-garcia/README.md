# API Laboratorio Químico — Autorización Basada en Roles (RBAC)

Este repositorio implementa el estándar de Control de Acceso Basado en Roles (Role-Based Access Control - RBAC) utilizando Node.js, Express y JWT sobre la temática de fórmulas químicas, síntesis de compuestos y bioseguridad.

---

## Matriz de Control de Acceso (RBAC)

| Recurso / Acción | Método | Endpoint | Roles Autorizados |
| :--- | :--- | :--- | :--- |
| Consultar Fórmulas | GET | /chemicals | Investigador, Quimico_Senior, Director_Laboratorio |
| Detalle de Compuesto | GET | /chemicals/:id | Investigador, Quimico_Senior, Director_Laboratorio |
| Registrar Síntesis | POST | /chemicals | Quimico_Senior, Director_Laboratorio |
| Eliminar Compuesto | DELETE | /chemicals/:id | Director_Laboratorio |

---

## Credenciales de Prueba Disponibles

| Usuario | Correo Electrónico | Contraseña | Rol |
| :--- | :--- | :--- | :--- |
| Dra. Elena Vasquez | directora@labchem.org | director_master_pass_2026 | Director_Laboratorio |
| Dr. Walter Aris | senior@labchem.org | senior_synthesis_pass | Quimico_Senior |
| Lic. Mateo Gomez | investigador@labchem.org | junior_research_pass | Investigador |

---

## Estructura de Directorios

```text
src/
├── app.js                                       # Configuración global de Express y rutas
├── server.js                                    # Arranque del servidor HTTP
├── routes/
│   ├── index.routes.js                          # Montaje centralizado
│   ├── auth.routes.js                           # Endpoints de login y perfil (/auth/me)
│   └── chemicals.routes.js                      # Rutas protegidas por authorizeRoles(...)
├── controllers/
│   ├── auth.controller.js                       # Controladores de sesión
│   └── chemicals.controller.js                  # Controladores de fórmulas químicas
├── services/
│   ├── auth.service.js                          # Validación de credenciales y firma JWT
│   └── chemicals.service.js                     # Reglas de negocio del laboratorio
├── repositories/
│   ├── users.inMemory.repository.js             # Repositorio de usuarios con roles
│   └── chemicals.inMemory.repository.js         # Repositorio de compuestos químicos
├── middlewares/
│   ├── requestId.middleware.js                  # Trazabilidad con UUID v4
│   ├── logger.middleware.js                     # Logger transversal
│   ├── authJwt.middleware.js                    # Verificación del Bearer JWT
│   ├── rbac.middleware.js                       # Middleware authorizeRoles(...)
│   ├── errorHandler.middleware.js               # Captura de ForbiddenError (403) y otros
│   └── validators/
│       ├── validate.middleware.js               # Envoltorio de validación
│       ├── auth.validator.js                    # Validación de credenciales
│       └── chemical.validator.js                # Validación de fórmulas y peligrosidad
├── utils/
│   ├── asyncHandler.js                          # Envoltorio asíncrono
│   └── customErrors.js                          # Clases de error (ForbiddenError, etc.)
.env                                             # Variables de entorno
.env.example                                     # Plantilla de entorno
.gitignore                                       # Control de exclusiones
package.json                                     # Scripts y dependencias
```

---

## Configuración e Instalación

### 1. Variables de entorno

```bash
cp .env.example .env
```

### 2. Dependencias

```bash
npm install
```

### 3. Modo desarrollo

```bash
npm run dev
```

---

## Referencia de Endpoints

**Base URL:** `/api/v1`

| Recurso | Método | Endpoint | Roles Permitidos | Código Error si Rol No Coincide |
| :--- | :--- | :--- | :--- | :--- |
| Auth | POST | /auth/login | Público | - |
| Auth | GET | /auth/me | Cualquiera autenticado | 401 Unauthorized |
| Química | GET | /chemicals | Investigador, Quimico_Senior, Director_Laboratorio | 403 Forbidden |
| Química | GET | /chemicals/:id | Investigador, Quimico_Senior, Director_Laboratorio | 403 Forbidden |
| Química | POST | /chemicals | Quimico_Senior, Director_Laboratorio | 403 Forbidden |
| Química | DELETE | /chemicals/:id | Director_Laboratorio | 403 Forbidden |
