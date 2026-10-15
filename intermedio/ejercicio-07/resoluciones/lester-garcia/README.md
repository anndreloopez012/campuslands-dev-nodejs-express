# API Autos de Lujo — Middleware Centralizado de Errores (errorHandler)

Este repositorio implementa un **Middleware Global de Manejo de Errores de Nivel Producción** construido con **Node.js** y **Express** sobre la temática de **superdeportivos, hiperautos y concesionarios de lujo**.

---

## Principios del Middleware de Errores

1. **Distinción Operacional vs. Programación**:
   - **Errores Operacionales (isOperational: true)**: Errores previstos del negocio (400, 401, 403, 404, 409). Transmiten mensajes claros y seguros al cliente.
   - **Errores de Programación (Bugs/500)**: Fallos imprevistos de código. Se registra el error internamente y se envía un mensaje genérico sin filtrar rutas ni detalles de infraestructura.
2. **Estrategia por Entorno (NODE_ENV)**:
   - `development`: Expone `stack`, `error` original y todos los campos para acelerar el debugging.
   - `production`: Oculta el stack trace y solo entrega `{ status, message }`.
3. **Manejo de Sintaxis JSON**:
   - Captura excepciones `SyntaxError` producidas por el middleware `express.json()` ante cargas corruptas.

---

## Estructura de Directorios

```text
src/
├── app.js                                       # Configuración global y montaje del errorHandler al final
├── server.js                                    # Arranque del servidor HTTP
├── routes/
│   └── cars.routes.js                           # Declaración de rutas de autos
├── controllers/
│   └── cars.controller.js                       # Controladores delgados
├── services/
│   └── cars.service.js                          # Lógica de inventario de lujo
├── repositories/
│   └── cars.inMemory.repository.js              # Almacén en memoria
├── middlewares/
│   ├── validators/
│   │   ├── validate.middleware.js               # Ejecutor de validaciones
│   │   └── car.validator.js                     # Esquema para superdeportivos
│   ├── logger.middleware.js                     # Registro de peticiones
│   └── errorHandler.middleware.js               # Middleware centralizado con control dev/prod
├── utils/
│   ├── asyncHandler.js                          # Envoltorio asíncrono
│   └── customErrors.js                          # AppError, ValidationError, etc.
.env                                             # Variables de entorno
.env.example                                     # Plantilla de variables
.gitignore                                       # Exclusiones de control de versiones
package.json                                     # Scripts y dependencias
```

---

## Configuración e Instalación

### 1. Variables de entorno:
```bash
cp .env.example .env
```

### 2. Dependencias:
```bash
npm install
```

### 3. Modo desarrollo:
```bash
npm run dev
```

---

## Referencia de Endpoints

**Base URL:** `/api/v1/dealership`

| Método | Endpoint | Descripción | Header Requerido |
| :--- | :--- | :--- | :--- |
| **GET** | `/cars` | Listar catálogo (filtros: category, brand, isAvailable) | Ninguno |
| **GET** | `/cars/:id` | Consultar superdeportivo por ID | Ninguno |
| **GET** | `/cars/trigger-crash` | Simular error no controlado (Prueba 500) | Ninguno |
| **POST** | `/cars` | Registrar nuevo vehículo en inventario | `x-dealer-key` |
| **DELETE** | `/cars/:id` | Dar de baja un auto del showroom | `x-dealer-key` |