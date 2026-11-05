# Intermedio - Ejercicio 17: Roles y Permisos
> **Autor:** Anderson Oloroso | **Temática:** Viajes y turismo | **Tema:** Roles y permisos

## Descripción
Implementa control de acceso basado en roles (**RBAC**) mediante un middleware de fábrica (`authorizeRoles(...roles)`). Permite definir granularmente qué niveles de usuario (`cliente`, `agente`, `admin`) tienen permiso para acceder a cada ruta del sistema de turismo.

## Instalación y ejecución
```bash
cd intermedio/ejercicio-17/resoluciones/anderson-oloroso
npm install
npm start
npm run dev
```

## Endpoints
- `GET /intermedio/ejercicio-17` -> Health check.
- `GET /api/tourism/packages` -> Acceso público.
- `GET /api/tourism/discounts` -> Acceso para roles `agente` y `admin` (`x-user-role: agente`).
- `GET /api/tourism/audit-logs` -> Acceso exclusivo para rol `admin` (`x-user-role: admin`).

### Ejemplo con rol autorizado
```bash
curl http://localhost:3000/api/tourism/discounts \
  -H "x-user-role: agente"
```

## Estructura
```text
intermedio/ejercicio-17/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── controllers/
    │   └── tourism.controller.js
    ├── middlewares/
    │   └── rbac.middleware.js
    └── routes/
        └── tourism.routes.js
```
