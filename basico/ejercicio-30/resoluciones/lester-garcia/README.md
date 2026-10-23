# API Taller de Motocicletas y Mecánica — Proyecto Integrador Básico

Este repositorio contiene la solución backend final correspondiente al **Proyecto Integrador Básico (Ejercicio 30)**. Combina todos los pilares del desarrollo profesional con **Node.js** y **Express** sobre la temática de gestión de talleres mecánicos y órdenes de servicio de motocicletas.

---

## Características Principales Implementadas

- **Arquitectura N-Capas Modular**: Separación estricta de rutas, controladores, servicios, middlewares y utilidades.
- **Configuración por Entorno (`.env`)**: Uso de variables de entorno mediante `--env-file=.env` para puertos, entornos y llaves secretas.
- **Middleware de Logging**: Registro en consola de cada solicitud HTTP y su tiempo de respuesta en milisegundos.
- **Manejo Centralizado de Errores**: Clases operacionales personalizadas (`BadRequestError`, `UnauthorizedError`, `NotFoundError`, `ConflictError`) y un interceptor global (`errorHandler`).
- **CRUD Completo y Respuestas HTTP Semánticas**: Operaciones `GET`, `POST`, `PUT`, `DELETE` con códigos estándar (`200`, `201`, `204`, `400`, `401`, `404`, `409`).
- **Persistencia Asíncrona en JSON**: Lectura y escritura de datos mediante `fs/promises`.

---

## Estructura de Directorios

```text
src/
├── app.js                          # Configuración global de Express, logger y rutas
├── server.js                       # Arranque del servidor HTTP con process.env.PORT
├── routes/
│   └── workshop.routes.js          # Enrutador modular del taller
├── controllers/
│   └── workshop.controller.js      # Controladores HTTP y validación de x-workshop-key
├── services/
│   └── workshop.service.js         # Lógica de negocio CRUD y persistencia asíncrona
├── middlewares/
│   ├── logger.middleware.js        # Registro de peticiones HTTP en consola
│   └── errorHandler.js             # Interceptor global de errores
├── utils/
│   ├── asyncHandler.js             # Envoltorio para control de promesas
│   └── customErrors.js             # Clases de error HTTP personalizadas
└── data/
    └── repairs.json                # Almacenamiento local en JSON
.env                                # Variables de entorno (excluido en Git)
.env.example                        # Plantilla de configuración
.gitignore                          # Archivos excluidos
package.json                        # Scripts y dependencias
```

---

## Configuración e Instalación

1. Copiar plantilla de entorno:
```bash
cp .env.example .env
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar el servidor en modo desarrollo:
```bash
npm run dev
```

El servidor estará activo en `http://localhost:3000`.

---

## Referencia de Endpoints

**Base URL**: `/api/v1`

| Método | Endpoint | Descripción | Header Requerido |
| :--- | :--- | :--- | :--- |
| `GET` | `/workshop/repairs` | Obtener todas las órdenes (soporta filtros) | Ninguno |
| `GET` | `/workshop/repairs/:id` | Obtener orden de servicio por ID | Ninguno |
| `POST` | `/workshop/repairs` | Crear nueva orden de reparación | `x-workshop-key` |
| `PUT` | `/workshop/repairs/:id` | Actualizar completamente una orden | `x-workshop-key` |
| `DELETE` | `/workshop/repairs/:id` | Eliminar una orden de reparación | `x-workshop-key` |

---

## Pruebas con cURL

Consultar todas las reparaciones:
```bash
curl -X GET http://localhost:3000/api/v1/workshop/repairs
```

Registrar nueva orden enviando la llave secreta por header:
```bash
curl -X POST http://localhost:3000/api/v1/workshop/repairs \
  -H "Content-Type: application/json" \
  -H "x-workshop-key: workshop_pro_master_2026" \
  -d '{
    "ticketCode": "REP-2026-004",
    "clientName": "Lucía Méndez",
    "motorcycleModel": "Honda CB500X",
    "serviceType": "Cambio de Balatas y Líquido de Frenos",
    "costUSD": 95.00,
    "status": "Pending"
  }'
```
