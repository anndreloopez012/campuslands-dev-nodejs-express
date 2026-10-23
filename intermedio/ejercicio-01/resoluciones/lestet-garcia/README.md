# API Reino RPG — Arquitectura por Capas Estricta (Routes, Controllers, Services, Repositories)

Este ejercicio implementa una API REST con **Arquitectura por Capas Estricta** construida con **Node.js** y **Express** sobre la temática de **videojuegos RPG, gestión de clases de personajes y árboles de habilidades**.

---

## Separación de Responsabilidades por Capa

1. **Rutas (`src/routes/`)**: Define los endpoints y asocia los métodos HTTP con sus controladores correspondientes.
2. **Controladores (`src/controllers/`)**: Gestiona el protocolo HTTP (`req`, `res`), valida cabeceras de autorización (`x-realm-key`) y formatea las respuestas JSON.
3. **Servicios (`src/services/`)**: Concentra la lógica de negocio pura, reglas de dominio y validación de conflictos (ej. nombres duplicados).
4. **Repositorios (`src/repositories/`)**: Capa dedicada exclusivamente a la lectura y persistencia de datos físicos en almacenamiento JSON, desacoplando por completo el origen de los datos.

---

## Estructura de Directorios

```text
src/
├── app.js                          # Configuración de Express, logger y rutas
├── server.js                       # Arranque del servidor HTTP
├── routes/
│   └── rpgClass.routes.js          # Definición de rutas REST
├── controllers/
│   └── rpgClass.controller.js      # Manejadores de contratos HTTP y headers
├── services/
│   └── rpgClass.service.js         # Lógica de negocio y reglas del reino
├── repositories/
│   └── rpgClass.repository.js      # Interacción directa con el almacenamiento JSON
├── middlewares/
│   ├── logger.middleware.js        # Registro de solicitudes en consola
│   └── errorHandler.js             # Interceptor global de errores
├── utils/
│   ├── asyncHandler.js             # Envoltorio asíncrono
│   └── customErrors.js             # Clases de error HTTP personalizadas (400, 401, 404, 409)
└── data/
    └── rpgClasses.json             # Base de datos local en JSON
.env                                # Variables de entorno (excluidas en Git)
.env.example                        # Plantilla de entorno
.gitignore                          # Control de archivos excluidos
package.json                        # Dependencias y scripts
```

---

## Configuración e Instalación

1. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   ```
2. **Instalar dependencias:**
   ```bash
   npm install
   ```
3. **Iniciar en modo desarrollo:**
   ```bash
   npm run dev
   ```

---

## Referencia de Endpoints

* **Base URL:** `/api/v1`

| Método | Endpoint | Descripción | Header Requerido |
|---|---|---|---|
| **GET** | `/rpg/classes` | Obtener todas las clases (soporta filtros) | Ninguno |
| **GET** | `/rpg/classes/:id` | Obtener clase por ID | Ninguno |
| **POST** | `/rpg/classes` | Registrar nueva clase RPG | `x-realm-key` |
| **PUT** | `/rpg/classes/:id` | Actualizar clase RPG existente | `x-realm-key` |
| **DELETE** | `/rpg/classes/:id` | Eliminar clase RPG | `x-realm-key` |
