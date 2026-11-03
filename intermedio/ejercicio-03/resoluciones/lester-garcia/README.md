# API Campeones MOBA — Controladores Limpios (Clean Controllers Pattern)

Este repositorio implementa el patrón de **Controladores Limpios (Skinny Controllers)** construido con **Node.js** y **Express** sobre la temática de **videojuegos MOBA (League of Legends, Dota 2), balance de campeones y draft competitivo**.

---

## Principio de Controladores Delgados (Skinny Controllers)

En una arquitectura profesional se aplican las siguientes responsabilidades:

* **El Controlador (src/controllers/)**: Solo extrae entradas (`req.body`, `req.params`, `req.query`, `req.headers`), delega la operación a la capa de servicio y emite la respuesta HTTP correspondiente. No implementa lógica condicional de negocio ni interactúa con la persistencia.
* **El Servicio (src/services/)**: Centraliza todas las reglas de negocio, validaciones complejas de tipos/rangos y control de duplicados.
* **El Repositorio (src/repositories/)**: Encapsula exclusivamente las operaciones sobre los datos físicos (JSON).
* **asyncHandler**: Elimina por completo los bloques redundantes try/catch dentro de los métodos del controlador.

---

## Estructura de Directorios

```text
src/
├── app.js                          # Montaje de middlewares y rutas con prefijo de versión
├── server.js                       # Arranque del servidor HTTP
├── routes/
│   └── champions.routes.js         # Mapeo de verbos HTTP a controladores limpios
├── controllers/
│   └── champions.controller.js     # Controladores delgados (extracción + delegación + respuesta)
├── services/
│   └── champions.service.js        # Lógica de dominio, reglas de balance y validaciones
├── repositories/
│   └── champions.repository.js     # Capa exclusiva de persistencia JSON
├── middlewares/
│   ├── logger.middleware.js        # Logging transversal de peticiones
│   └── errorHandler.js             # Formateador global de respuestas de error
├── utils/
│   ├── asyncHandler.js             # Capturador asíncrono
│   └── customErrors.js             # Clases de error HTTP personalizadas (400, 401, 404, 409)
└── data/
    └── champions.json              # Catálogo de datos en formato JSON
.env                                # Configuración de variables de entorno (excluido en Git)
.env.example                        # Plantilla de entorno
.gitignore                          # Control de exclusiones
package.json                        # Dependencias y scripts
```

---

## Configuración e Instalación

Sigue estos pasos para configurar el entorno de desarrollo local:

### 1. Configurar variables de entorno
Crea una copia de la plantilla del entorno para definir tus configuraciones personalizadas:
```bash
cp .env.example .env
```

### 2. Instalar dependencias
Descarga e instala los módulos requeridos utilizando el gestor de paquetes de Node:
```bash
npm install
```

### 3. Iniciar el servidor en modo desarrollo
Ejecuta el script de desarrollo para inicializar el servidor con recarga automática:
```bash
npm run dev
```

El servidor estará escuchando en la dirección: `http://localhost:3000`.

---

## Referencia de Endpoints

* **Base URL:** `/api/v1`

### Endpoints Disponibles

* **Listar campeones (filtros: role, difficulty, isMeta)**
  * Método: GET
  * Endpoint: `/champions`
  * Header Requerido: Ninguno

* **Obtener campeón por ID**
  * Método: GET
  * Endpoint: `/champions/:id`
  * Header Requerido: Ninguno

* **Registrar nuevo campeón en el roster**
  * Método: POST
  * Endpoint: `/champions`
  * Header Requerido: `x-moba-key`

* **Actualizar estadísticas de balance de un campeón**
  * Método: PUT
  * Endpoint: `/champions/:id`
  * Header Requerido: `x-moba-key`

* **Eliminar campeón del roster**
  * Método: DELETE
  * Endpoint: `/champions/:id`
  * Header Requerido: `x-moba-key`
