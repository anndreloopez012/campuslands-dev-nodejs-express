# API Battle Royale Loadouts — Colección de Ejemplos HTTP (`.http` & Request Catalog)

Este repositorio implementa una solución backend acompañada de una **Colección Ejecutable de Ejemplos HTTP (`requests/battleRoyale.http` y endpoint `/api/v1/loadouts/examples`)** utilizando **Node.js** y **Express** sobre la temática de **Battle Royale, zonas de caída (`dropZone`) y suministros de equipamiento (`loadouts`)**.

---

## Fundamentos de Colecciones de Ejemplos HTTP

Para facilitar las pruebas manuales y la integración entre equipos frontend/QA:

1. **Archivo Estándar `.http` (`requests/battleRoyale.http`)**:
   Compatible directamente con extensiones como *REST Client* (VS Code), *JetBrains HTTP Client* o *Thunder Client*. Permite versionar las peticiones junto al código en Git usando variables (`@baseUrl`).
2. **Cobertura de Casos Felices y Casos de Error**:
   La colección incluye solicitudes para consultas exitosas (`200`), creaciones válidas (`201`), errores de validación (`400`) y recursos no encontrados (`404`).
3. **Catálogo Autodescubrible (`GET /api/v1/loadouts/examples`)**:
   Expone programáticamente los ejemplos listos para importar o probar desde cualquier cliente HTTP.

---

## Estructura de Directorios

```text
src/
├── app.js                                       # Configuración global de Express y rutas
├── server.js                                    # Arranque del servidor HTTP
├── routes/
│   ├── index.routes.js                          # Montaje centralizado
│   └── loadouts.routes.js                       # Endpoints de loadouts y colección de ejemplos
├── controllers/
│   └── loadouts.controller.js                   # Controladores HTTP limpios
├── services/
│   └── loadouts.service.js                      # Lógica de negocio y catálogo de ejemplos HTTP
├── repositories/
│   └── loadouts.inMemory.repository.js          # Persistencia en memoria de loadouts
├── middlewares/
│   ├── requestId.middleware.js                  # Trazabilidad con UUID v4
│   ├── logger.middleware.js                     # Logger transversal
│   ├── errorHandler.middleware.js               # Captura centralizada de errores
│   └── validators/
│       ├── validate.middleware.js               # Envoltorio de validación
│       └── loadout.validator.js                 # Validación de rarezas, escudos y armas
└── utils/
    ├── asyncHandler.js                          # Envoltorio asíncrono
    └── customErrors.js                          # Clases de error operacionales
requests/
└── battleRoyale.http                            # Colección ejecutable de peticiones HTTP
.env                                             # Variables de entorno locales (excluido en Git)
.env.example                                     # Plantilla de variables de entorno
.gitignore                                       # Control de exclusiones
package.json                                     # Scripts y dependencias
```

---

## Configuración e Instalación

### 1. Variables de entorno
```bash
cp .env.example .env
```

### 2. Instalar dependencias
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

| Recurso | Método | Endpoint | Descripción |
| :--- | :--- | :--- | :--- |
| **Ejemplos** | **GET** | `/loadouts/examples` | Retorna la colección de peticiones HTTP de ejemplo en JSON |
| **Loadouts** | **GET** | `/loadouts` | Lista todos los equipamientos desplegados en la partida |
| **Loadouts** | **GET** | `/loadouts/:id` | Obtiene el detalle de un equipamiento por su ID |
| **Loadouts** | **POST** | `/loadouts` | Registra un nuevo equipamiento validando rareza y escudo |

---

## Pruebas con cURL

```bash
# 1. Consultar la colección de ejemplos HTTP desde la propia API
curl -X GET http://localhost:3000/api/v1/loadouts/examples

# 2. Listar todos los loadouts
curl -X GET http://localhost:3000/api/v1/loadouts

# 3. Crear un nuevo loadout de rareza Épico
curl -X POST http://localhost:3000/api/v1/loadouts \
  -H "Content-Type: application/json" \
  -d '{
    "squadName": "Valkyrie Squad",
    "dropZone": "Military Base",
    "primaryWeapon": "Subfusil Vector Táctico",
    "rarityTier": "Epico",
    "shieldCapacity": 150
  }'
```
