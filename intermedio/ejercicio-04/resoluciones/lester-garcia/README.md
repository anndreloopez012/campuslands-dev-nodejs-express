# API Battle Royale — Servicios Reutilizables (Reusable Business Services Pattern)

Este repositorio implementa el patrón de **Servicios de Dominio Reutilizables** con **Node.js** y **Express** sobre la temática de **matchmaking en servidores de Battle Royale y validación de rangos MMR**.

---

## Principio de Servicios Reutilizables

Para evitar lógica duplicada en distintos endpoints se divide el comportamiento en dos capas:

* **matchmaking.service.js (Servicios Atómicos)**: Encapsula reglas aisladas y reutilizables:
  * `validateAndGetActivePlayer(id)`: Comprueba la existencia y el estado de suspensión de los jugadores.
  * `validateAndGetAvailableLobby(id)`: Valida el estado del lobby y el aforo disponible.
  * `checkMMREligibility(mmr, min, max)`: Valida la compatibilidad competitiva entre rangos.
* **battleRoyale.service.js (Servicio Orquestador)**: Conecta y compone los servicios atómicos para ejecutar operaciones complejas como `joinLobbyService` de forma declarativa y mantenible.

---

## Estructura de Directorios

```text
src/
├── app.js                          # Configuración global de Express y rutas
├── server.js                       # Arranque del servidor HTTP
├── routes/
│   └── battleRoyale.routes.js      # Declaración de endpoints REST
├── controllers/
│   └── battleRoyale.controller.js  # Controladores delgados
├── services/
│   ├── matchmaking.service.js      # Servicios de validación atómicos y reutilizables
│   └── battleRoyale.service.js     # Orquestación de lógica de negocio de alto nivel
├── repositories/
│   ├── lobbies.repository.js       # Persistencia de salas en JSON
│   └── players.repository.js       # Persistencia de jugadores en JSON
├── middlewares/
│   ├── logger.middleware.js        # Logging transversal
│   └── errorHandler.js             # Manejador centralizado de errores
├── utils/
│   ├── asyncHandler.js             # Capturador asíncrono
│   └── customErrors.js             # Clases de error (400, 401, 404, 409)
└── data/
    ├── lobbies.json                # Almacenamiento local de lobbies
    └── players.json                # Almacenamiento local de jugadores
.env                                # Variables de entorno
.env.example                        # Plantilla de entorno
.gitignore                          # Control de exclusiones
package.json                        # Scripts y dependencias
```

---

## Configuración e Instalación

Sigue estos pasos para configurar el entorno de desarrollo local:

### 1. Variables de entorno
Crea una copia de la plantilla de entorno para configurar tus valores locales:
```bash
cp .env.example .env
```

### 2. Dependencias
Instala los módulos requeridos por la aplicación utilizando npm:
```bash
npm install
```

### 3. Modo desarrollo
Inicia el servidor local con soporte para recarga automática ante cambios de código:
```bash
npm run dev
```

---

## Referencia de Endpoints

* **Base URL:** `/api/v1`

### Endpoints Disponibles

* **Listar salas disponibles (filtros: mode, status)**
  * Método: GET
  * Endpoint: `/lobbies`
  * Header Requerido: Ninguno

* **Obtener sala por ID**
  * Método: GET
  * Endpoint: `/lobbies/:id`
  * Header Requerido: Ninguno

* **Registrar nuevo lobby de emparejamiento**
  * Método: POST
  * Endpoint: `/lobbies`
  * Header Requerido: `x-br-key`

* **Unir jugador a la sala con validación MMR**
  * Método: POST
  * Endpoint: `/lobbies/:id/join`
  * Header Requerido: Ninguno
