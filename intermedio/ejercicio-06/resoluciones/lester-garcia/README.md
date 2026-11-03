# API Taller de Motocicletas — Validación Centralizada (Validation Middlewares Pattern)

Este repositorio implementa el patrón de **Validación Centralizada con Middlewares** utilizando **Node.js** y **Express** sobre la temática de **mantenimiento mecánico, diagnóstico y reparación de motocicletas**.

---

## Principio de Validación Centralizada

* **Middlewares Desacoplados (`src/middlewares/validators/`)**: Cada regla de validación de sintaxis, formato o rangos se aísla en funciones puras reutilizables.
* **`validate(validatorFn)`**: Middleware que intercepta la solicitud; si se detectan errores, interrumpe el ciclo HTTP lanzando un `ValidationError` con la colección completa de inconsistencias.
* **Controladores Libres de Boilerplate**: El controlador ya no contiene sentencias `if (!field) ...`, garantizando que solo ejecuta operaciones con datos previamente validados.
* **Respuesta Estructurada**:
  ```json
  {
    "status": "fail",
    "message": "Errores en la validación de los datos enviados.",
    "validationErrors": [
      { "field": "vin", "message": "El VIN es obligatorio y debe tener exactamente 17 caracteres." },
      { "field": "cylinderCapacityCc", "message": "La cilindrada debe ser un valor numérico entre 50cc y 2500cc." }
    ]
  }
  ```

---

## Estructura de Directorios

```plaintext
src/
├── app.js                                          # Configuración de Express y rutas
├── server.js                                       # Punto de entrada HTTP
├── routes/
│   └── motorcycles.routes.js                       # Rutas con inyección de validate(...)
├── controllers/
│   └── motorcycles.controller.js                   # Controladores delgados
├── services/
│   └── motorcycles.service.js                      # Lógica de dominio y reglas de negocio
├── repositories/
│   └── motorcycles.inMemory.repository.js          # Persistencia en memoria
├── middlewares/
│   ├── validators/
│   │   ├── validate.middleware.js                  # Manejador de ejecución de esquemas
│   │   └── motorcycle.validator.js                 # Reglas de validación para motocicletas
│   ├── logger.middleware.js                        # Logging de peticiones
│   └── errorHandler.js                             # Captura de ValidationError
├── utils/
│   ├── asyncHandler.js                             # Envoltorio asíncrono
│   └── customErrors.js                             # Clases de error (ValidationError, etc.)
.env                                                # Variables de entorno (excluido en Git)
.env.example                                        # Plantilla de entorno
.gitignore                                          # Control de exclusiones
package.json                                        # Scripts y dependencias
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

**Base URL:** `/api/v1/workshop`

| Método | Endpoint | Middleware de Validación | Descripción | Header Requerido |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/motorcycles` | Ninguno | Listar motocicletas registradas | Ninguno |
| GET | `/motorcycles/:id` | Ninguno | Consultar motocicleta por ID | Ninguno |
| POST | `/motorcycles` | `validate(createMotorcycleValidator)` | Registrar nueva orden/moto | `x-workshop-key` |
| PATCH | `/motorcycles/:id/status` | `validate(updateMotorcycleStatusValidator)` | Actualizar estado de reparación | `x-workshop-key` |
| DELETE | `/motorcycles/:id` | Ninguno | Dar de baja una orden | `x-workshop-key` |
