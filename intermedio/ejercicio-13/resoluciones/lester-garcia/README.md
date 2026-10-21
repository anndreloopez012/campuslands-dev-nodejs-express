# API Flota Estelar — Relaciones Simples (Entity Associations Pattern)

Este repositorio implementa el estándar de **Relaciones Referenciales Simples (1:N)** utilizando **Node.js** y **Express** sobre la temática de **ciencia ficción espacial, sistemas planetarios y naves de la flota estelar**.

---

## Principios de Relaciones Simples

A diferencia de los subrecursos jerárquicos (donde las rutas dependen estrictamente del padre, como `/movies/:id/reviews`):

1. **Recursos de Primer Nivel**: `/planets` y `/starships` existen de forma independiente.
2. **Clave Foránea Explícita (`homePlanetId`)**:
   - Cada nave almacena la referencia del planeta al que pertenece.
   - En peticiones `POST`, el backend valida que `homePlanetId` apunte a una entidad real antes de permitir la persistencia.
3. **Expansión Condicional (Embedding / Eager Loading)**:
   - Por defecto: `homePlanetId: "PLN-01"` (ahorra ancho de banda).
   - Con parámetro `?embed=planet`: el backend fusiona la información del planeta de forma transparente:
     ```json
     {
       "id": "1",
       "registryCode": "NCC-1701-D",
       "name": "USS Enterprise",
       "homePlanetId": "PLN-01",
       "homePlanet": {
         "id": "PLN-01",
         "name": "Tierra Prima",
         "sector": "Sector 001 - Solar"
       }
     }
     ```
4. **Restricción de Integridad Referencial**:
   - No se permite borrar un planeta si existen naves que dependen de él (`409 Conflict`), previniendo registros huérfanos.

---

## Estructura de Directorios

```text
src/
├── app.js                                       # Configuración global de Express y rutas
├── server.js                                    # Arranque del servidor HTTP
├── routes/
│   ├── index.routes.js                          # Montaje centralizado de rutas
│   ├── planets.routes.js                        # Endpoints de planetas
│   └── starships.routes.js                      # Endpoints de naves estelares
├── controllers/
│   ├── planets.controller.js                    # Controladores de planetas
│   └── starships.controller.js                  # Controladores de naves
├── services/
│   ├── planets.service.js                       # Reglas de negocio e integridad en cascada
│   └── starships.service.js                     # Validación foránea y embedding
├── repositories/
│   ├── planets.inMemory.repository.js           # Almacén de planetas
│   └── starships.inMemory.repository.js         # Almacén de naves
├── middlewares/
│   ├── requestId.middleware.js                  # Trazabilidad con UUID v4
│   ├── logger.middleware.js                     # Logger transversal
│   ├── errorHandler.middleware.js               # Captura centralizada de errores
│   └── validators/
│       ├── validate.middleware.js               # Envoltorio de validación
│       └── starship.validator.js                # Validación de campos y FK
└── utils/
    ├── asyncHandler.js                          # Envoltorio asíncrono
    └── customErrors.js                          # Clases de error (ConflictError, etc.)
.env                                             # Variables de entorno
.env.example                                     # Plantilla de variables
.gitignore                                       # Control de exclusiones
package.json                                     # Scripts y dependencias
```

---

## Configuración e Instalación

1. **Variables de entorno**:
   ```bash
   cp .env.example .env
   ```

2. **Dependencias**:
   ```bash
   npm install
   ```

3. **Modo desarrollo**:
   ```bash
   npm run dev
   ```

---

## Referencia de Endpoints

**Base URL:** `/api/v1`

| Recurso | Método | Endpoint | Parámetros Query | Descripción | Header Requerido |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Planetas | GET | `/planets` | Ninguno | Listar planetas descubiertos | Ninguno |
| Planetas | GET | `/planets/:id` | Ninguno | Consultar planeta por ID | Ninguno |
| Planetas | DELETE | `/planets/:id` | Ninguno | Eliminar planeta (protegido por FK) | `x-fleet-key` |
| Naves | GET | `/starships` | `planetId`, `shipClass`, `embed=planet` | Listar naves con opción de incrustar planeta | Ninguno |
| Naves | GET | `/starships/:id` | `embed=planet` | Consultar nave individual | Ninguno |
| Naves | POST | `/starships` | Ninguno | Construir nave validando existencia del planeta | `x-fleet-key` |
| Naves | DELETE | `/starships/:id` | Ninguno | Dar de baja una nave de la flota | Ninguno |
