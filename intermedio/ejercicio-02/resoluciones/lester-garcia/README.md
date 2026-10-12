# API Shooters Competitivos — Routers Modulares (express.Router())

Este repositorio implementa una solución backend profesional con **Routers Modulares** construida con **Node.js** y **Express** sobre la temática de **esports, torneos de shooters tácticos (Valorant, CS2) y gestión de perfiles de jugadores**.

---

## Concepto de Routers Modulares

Para evitar sobrecargar un único archivo `app.js` con decenas de rutas, Express permite dividir el enrutamiento en módulos independientes mediante `express.Router()`:

* **matches.routes.js**: Agrupa todas las rutas relativas a partidas (`/matches`, `/matches/:id`).
* **players.routes.js**: Agrupa todas las rutas relativas a jugadores profesionales (`/players`, `/players/:id`).
* **index.routes.js**: Actúa como enrutador centralizador que monta los sub-routers bajo los prefijos correspondientes.

---

## Estructura de Directorios

```text
src/
├── app.js                          # Configuración global y montaje del router central (/api/v1)
├── server.js                       # Arranque del servidor HTTP
├── routes/
│   ├── index.routes.js             # Enrutador centralizador de sub-routers
│   ├── matches.routes.js           # Sub-router modular para partidas
│   └── players.routes.js           # Sub-router modular para jugadores
├── controllers/
│   ├── matches.controller.js       # Controladores de partidas
│   └── players.controller.js       # Controladores de jugadores
├── services/
│   ├── matches.service.js          # Lógica de negocio de partidas
│   └── players.service.js          # Lógica de negocio de jugadores
├── repositories/
│   ├── matches.repository.js       # Persistencia JSON de partidas
│   └── players.repository.js       # Persistencia JSON de jugadores
├── middlewares/
│   ├── logger.middleware.js        # Log de solicitudes HTTP
│   └── errorHandler.js             # Interceptor global de errores
├── utils/
│   ├── asyncHandler.js             # Envoltorio asíncrono
│   └── customErrors.js             # Clases de error personalizadas (400, 401, 404, 409)
└── data/
    ├── matches.json                # Datos de partidas
    └── players.json                # Datos de jugadores
.env                                # Variables de entorno (excluido en Git)
.env.example                        # Plantilla de entorno
.gitignore                          # Control de archivos excluidos
package.json                        # Dependencias y scripts
```

---

## Configuración e Instalación

Sigue estos pasos para configurar el entorno local:

### 1. Configurar variables de entorno
Crea una copia del archivo de plantilla para configurar tus variables personalizadas:
```bash
cp .env.example .env
```

### 2. Instalar dependencias
Descarga e instala los paquetes necesarios definidos en el archivo package.json:
```bash
npm install
```

### 3. Iniciar en modo desarrollo
Ejecuta el servidor local con recarga automática:
```bash
npm run dev
```

---

## Referencia de Endpoints

* **Base URL:** `/api/v1`

### Recurso: Partidas

* **Listar todas las partidas**
  * Método: GET
  * Endpoint: `/matches`
  * Header Requerido: Ninguno

* **Consultar partida por ID**
  * Método: GET
  * Endpoint: `/matches/:id`
  * Header Requerido: Ninguno

* **Registrar nueva partida**
  * Método: POST
  * Endpoint: `/matches`
  * Header Requerido: `x-tournament-key`

### Recurso: Jugadores

* **Listar todos los jugadores**
  * Método: GET
  * Endpoint: `/players`
  * Header Requerido: Ninguno

* **Consultar jugador por ID**
  * Método: GET
  * Endpoint: `/players/:id`
  * Header Requerido: Ninguno

* **Registrar nuevo jugador**
  * Método: POST
  * Endpoint: `/players`
  * Header Requerido: Ninguno
