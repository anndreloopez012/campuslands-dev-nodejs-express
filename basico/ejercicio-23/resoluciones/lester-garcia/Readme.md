# API Soldadura Industrial — Datos en Memoria (In-Memory State)

Este proyecto es una API REST modular desarrollada con Node.js y Express sobre la temática de **soldadura industrial, procesos metalmecánicos e inspección de juntas**. El objetivo principal de este ejercicio es implementar y comprender el almacenamiento de **datos en memoria RAM** dentro de la capa de servicio, prescindiendo temporalmente de archivos físicos o bases de datos.

---

## Conceptos y Objetivos

* **Node.js & Express:** Plataforma y servidor web para la construcción de la API REST.
* **Datos en Memoria (In-Memory State):**
  * Los datos residen directamente en las estructuras de datos de JavaScript (`Arrays`/`Objects`) inicializadas en el módulo `src/services/welding.service.js`.
  * Ventajas: Acceso de lectura y escritura ultrarrápido sin sobrecarga de E/S de disco (I/O).
  * Volatilidad: Si el servidor se reinicia o detiene, la memoria se restablece al estado inicial.
* **Arquitectura N-Capas Profesional:**
  * `routes/`: Enrutamiento modular HTTP.
  * `controllers/`: Manejador de entrada HTTP, validación y respuesta.
  * `services/`: Encapsula el estado en memoria y la lógica de filtrado/mutación.
  * `middlewares/`: Manejador global de excepciones.

---

## Estructura del Proyecto

```text
src/
├── app.js                          # Configuración de Express y middlewares
├── server.js                       # Inicio del servidor HTTP
├── routes/
│   └── welding.routes.js           # Definición de endpoints
├── controllers/
│   └── welding.controller.js       # Controladores HTTP
├── services/
│   └── welding.service.js          # Estado privado en memoria RAM y reglas de negocio
├── middlewares/
│   └── errorHandler.js             # Formateador global de errores
└── utils/
    ├── asyncHandler.js             # Capturador asíncrono
    └── customErrors.js             # Clases de error personalizadas (400, 404, 409)
.gitignore                          # Ignorado de node_modules
package.json                        # Configuración de scripts y dependencias
```

---

## Configuración e Instalación

1. Instalar las dependencias del proyecto:
```bash
npm install
```

2. Iniciar el servidor en modo desarrollo:
```bash
npm run dev
```

El servidor estará corriendo en: `http://localhost:3000`.

---

## Documentación de Endpoints

Base URL: `/api/v1`

| Método | Ruta | Parámetros / Cuerpo | Descripción |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/welding` | **Query Parameters (Opcionales):**<br>- `process` (string): SMAW, GMAW (MIG/MAG), GTAW (TIG), FCAW, SAW.<br>- `material` (string): Material base.<br>- `inspectionPassed` (boolean): true / false. | Obtiene los registros de soldadura filtrados o completos. |
| **GET** | `/api/v1/welding/:id` | **Parámetros de ruta:**<br>- `id` (string/number): Identificador único. | Obtiene un registro específico por su ID. |
| **POST** | `/api/v1/welding` | **Headers:** `Content-Type: application/json`<br>**JSON Body:** Estructura de la soldadura. | Registra una nueva soldadura en la memoria RAM. |
| **POST** | `/api/v1/welding/reset` | Ninguno. | Vacía el estado de la memoria y lo restablece. |

### Cuerpo de Petición Válido para Creación (JSON)

```json
{
  "jobCode": "WELD-004",
  "process": "GTAW (TIG)",
  "material": "Inconel 625",
  "welderName": "Carlos H. M.",
  "voltageVolts": 16,
  "amperageAmps": 110,
  "inspectionPassed": true
}
```

---

## Pruebas con cURL

Ejecuta los siguientes comandos en tu terminal para interactuar con la API:

* **Obtener listado actual en memoria:**
```bash
curl -X GET http://localhost:3000/api/v1/welding
```

* **Registrar nueva soldadura:**
```bash
curl -X POST http://localhost:3000/api/v1/welding \
  -H "Content-Type: application/json" \
  -d '{
    "jobCode": "WELD-004",
    "process": "GTAW (TIG)",
    "material": "Inconel 625",
    "welderName": "Carlos H. M.",
    "voltageVolts": 16,
    "amperageAmps": 110,
    "inspectionPassed": true
  }'
```

* **Limpiar memoria RAM:**
```bash
curl -X POST http://localhost:3000/api/v1/welding/reset
```
