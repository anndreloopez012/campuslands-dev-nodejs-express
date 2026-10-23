# API Fórmulas Químicas — CRUD Básico (POST, GET, PUT, DELETE)

Este proyecto es una API REST profesional desarrollada con Node.js y Express sobre la temática de **fórmulas químicas, sustancias y compuestos de laboratorio**. El objetivo principal de este ejercicio integrador es dominar la implementación de las cuatro operaciones del ciclo **CRUD (Create, Read, Update, Delete)**.

---

## Conceptos y Mapeo REST

* **Node.js & Express:** Entorno de ejecución y framework backend.
* **Operaciones CRUD:**
  * `GET /api/v1/compounds`: Obtención de lista completa o filtrada por query parameters.
  * `GET /api/v1/compounds/:id`: Consulta de un único compuesto por parámetro de ruta.
  * `POST /api/v1/compounds`: Creación de un nuevo compuesto (`201 Created`).
  * `PUT /api/v1/compounds/:id`: Reemplazo/actualización completa de un recurso existente (`200 OK`).
  * `DELETE /api/v1/compounds/:id`: Eliminación física del compuesto en el almacenamiento (`204 No Content`).
* **Arquitectura N-Capas Profesional:**
  * `routes/`: Mapeo de verbos HTTP a controladores.
  * `controllers/`: Manejo de interfaz HTTP y validación superficial de tipos.
  * `services/`: Reglas de negocio, verificación de duplicados de fórmulas y persistencia JSON.
  * `middlewares/`: Intercepción global de errores.

---

## Estructura del Proyecto

```text
src/
├── app.js                          # Configuración de Express, middlewares y rutas
├── server.js                       # Inicio del servidor HTTP
├── routes/
│   └── chemistry.routes.js         # Mapeo de endpoints CRUD (GET, POST, PUT, DELETE)
├── controllers/
│   └── chemistry.controller.js     # Controladores HTTP
├── services/
│   └── chemistry.service.js        # Lógica de negocio CRUD y persistencia en JSON
├── middlewares/
│   └── errorHandler.js             # Formateador global de errores
├── utils/
│   ├── asyncHandler.js             # Envoltorio asíncrono
│   └── customErrors.js             # Clases de error HTTP (400, 404, 409)
└── data/
    └── compounds.json              # Almacenamiento JSON
.gitignore                          # Control de archivos excluidos
package.json                        # Configuración de dependencias y scripts
```

---

## Configuración e Instalación

1. Instalación de dependencias:
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

| Método | Endpoint | Descripción | Estado Exitoso |
| :--- | :--- | :--- | :--- |
| **GET** | `/compounds` | Obtener todos los compuestos (soporta filtros) | 200 OK |
| **GET** | `/compounds/:id` | Obtener compuesto por ID | 200 OK |
| **POST** | `/compounds` | Crear un nuevo compuesto químico | 201 Created |
| **PUT** | `/compounds/:id` | Actualizar completamente un compuesto existente | 200 OK |
| **DELETE** | `/compounds/:id` | Eliminar un compuesto por ID | 204 No Content |

---

## Pruebas con cURL

Ejecuta los siguientes comandos en tu terminal para interactuar con la API:

* **1. Consultar todos los compuestos:**
```bash
curl -X GET http://localhost:3000/api/v1/compounds
```

* **2. Crear compuesto (CO2):**
```bash
curl -X POST http://localhost:3000/api/v1/compounds \
  -H "Content-Type: application/json" \
  -d '{
    "formula": "CO2",
    "commonName": "Dióxido de Carbono",
    "iupacName": "Dióxido de Carbono",
    "molarMassGmol": 44.01,
    "hazardLevel": "Bajo",
    "stateOfMatter": "Gaseoso",
    "isHazardous": false
  }'
```

* **3. Actualizar compuesto ID 3:**
```bash
curl -X PUT http://localhost:3000/api/v1/compounds/3 \
  -H "Content-Type: application/json" \
  -d '{
    "formula": "NaCl",
    "commonName": "Sal Común Refinada",
    "iupacName": "Cloruro de Sodio",
    "molarMassGmol": 58.44,
    "hazardLevel": "Ninguno",
    "stateOfMatter": "Sólido",
    "isHazardous": false
  }'
```

* **4. Eliminar compuesto ID 2:**
```bash
curl -X DELETE http://localhost:3000/api/v1/compounds/2
```
