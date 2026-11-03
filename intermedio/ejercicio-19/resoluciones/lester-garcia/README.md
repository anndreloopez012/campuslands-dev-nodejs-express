# API Estudio de Tatuajes — Variables de Entorno y Configuración Centralizada (dotenv y config)

Este repositorio implementa el estándar de **Gestión de Variables de Entorno y Configuración Centralizada (`dotenv` y `config`)** utilizando **Node.js**, **Express** y `dotenv` sobre la temática de **un estudio profesional de tatuajes, cotización dinámica de sesiones y catálogo de diseños**. La finalidad del ejercicio es desacoplar los parámetros sensibles y operativos del código fuente, centralizándolos en una capa única, tipada e inmutable.

---

## Fundamentos de `dotenv` y `config`

En una arquitectura backend profesional basada en la metodología **The Twelve-Factor App (Factor III: Config)**:

1. **Desacoplamiento del Entorno (`.env`)**:
   Los valores que cambian según el ambiente de despliegue (`development`, `staging`, `production`) o las reglas operativas del estudio (tarifa por hora, porcentaje de anticipo, edad mínima legal, horas máximas por sesión) se extraen hacia variables de entorno y nunca se escriben de forma fija (*hardcoded*) dentro de controladores o servicios.
2. **Punto Único de Verdad (`src/config/env.config.js`)**:
   Ninguna capa de negocio (`controllers`, `services`, `middlewares`, `validators`) lee `process.env` directamente. Todo el sistema importa el objeto `config` desde `src/config/env.config.js`.
3. **Parseo, Sanitización y Valores por Defecto (*Fallbacks*)**:
   Dado que `process.env` almacena todas las variables como cadenas de texto (`string`), el módulo de configuración convierte explícitamente las variables numéricas (`Number`), valida que sean finitas y positivas (`parseNumber`), limpia espacios residuales (`.trim()`) y asigna valores por defecto seguros en caso de ausencia.
4. **Inmutabilidad en Tiempo de Ejecución (`Object.freeze`)**:
   El objeto `config` y sus sub-niveles (`server`, `studio`) se congelan mediante `Object.freeze()` para garantizar que ningún módulo altere accidentalmente los parámetros del servidor en tiempo de ejecución.
5. **Respuesta Enriquecida Dinámicamente desde `config`**:
   ```json
   {
     "status": "success",
     "requestId": "9c2e8a40-41fd-4b2b-9f1a-08d7e12a34bc",
     "data": {
       "id": "TAT-01",
       "clientName": "Camila Restrepo",
       "clientAge": 26,
       "tattooStyle": "Blackwork",
       "bodyPlacement": "Antebrazo derecho",
       "artistName": "Valeria Ink",
       "estimatedHours": 4,
       "createdAt": "2026-10-15T14:00:00.000Z",
       "studioName": "Black Ink Tattoo Studio",
       "pricing": {
         "hourlyRateUsd": 120,
         "depositPercentage": 30,
         "totalCostUsd": 480,
         "requiredDepositUsd": 144
       }
     }
   }
   ```

---

## Variables de Entorno Soportadas

| Variable | Tipo | Valor por Defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `PORT` | `Number` | `3000` | Puerto de escucha del servidor HTTP |
| `NODE_ENV` | `String` | `development` | Entorno de ejecución (`development`, `production`) |
| `API_VERSION` | `String` | `v1` | Prefijo de versión para el enrutador principal |
| `STUDIO_NAME` | `String` | `Black Ink Tattoo Studio` | Nombre comercial del estudio de tatuajes |
| `HOURLY_RATE_USD` | `Number` | `120` | Tarifa base por hora de sesión en dólares (USD) |
| `DEPOSIT_PERCENTAGE` | `Number` | `30` | Porcentaje de anticipo requerido para reservar cita |
| `MIN_AGE_REQUIRED` | `Number` | `18` | Edad mínima legal exigida para agendar un tatuaje |
| `MAX_SESSION_HOURS` | `Number` | `8` | Duración máxima permitida por sesión en horas |

---

## Estructura de Directorios

```text
src/
├── app.js                                       # Configuración global de Express y montaje de rutas
├── server.js                                    # Arranque del servidor HTTP consumiendo config.server
├── config/
│   └── env.config.js                            # Carga con dotenv, conversión de tipos y Object.freeze
├── routes/
│   ├── index.routes.js                          # Enrutador centralizador
│   └── tattoos.routes.js                        # Endpoints de configuración activa y sesiones de tatuaje
├── controllers/
│   └── tattoos.controller.js                    # Controladores HTTP limpios con asyncHandler
├── services/
│   └── tattoos.service.js                       # Cálculo dinámico de costos y anticipos según config
├── repositories/
│   └── tattoos.inMemory.repository.js           # Persistencia en memoria de sesiones de tatuaje
├── middlewares/
│   ├── requestId.middleware.js                  # Trazabilidad de peticiones con UUID v4 (X-Request-Id)
│   ├── logger.middleware.js                     # Logger transversal con marca de tiempo y duración
│   ├── errorHandler.middleware.js               # Captura centralizada de errores (stack condicional por NODE_ENV)
│   └── validators/
│       ├── validate.middleware.js               # Envoltorio de ejecución de validadores
│       └── tattoo.validator.js                  # Validación dinámica contra MIN_AGE_REQUIRED y MAX_SESSION_HOURS
└── utils/
    ├── asyncHandler.js                          # Capturador de errores en promesas asíncronas
    └── customErrors.js                          # Jerarquía de errores operacionales (400, 404, 409)
.env                                             # Variables de entorno locales (excluido en Git)
.env.example                                     # Plantilla pública de variables de entorno
.gitignore                                       # Control de exclusiones de Git
package.json                                     # Definición de scripts y dependencias
```

---

## Configuración e Instalación

### 1. Variables de entorno
Crea una copia de la plantilla para definir las variables locales del estudio:
```bash
cp .env.example .env
```

### 2. Instalar dependencias
Descarga e instala los paquetes requeridos (`express` y `dotenv`):
```bash
npm install
```

### 3. Modo desarrollo
Inicia el servidor local con recarga automática:
```bash
npm run dev
```

Servidor corriendo en: `http://localhost:3000`.

---

## Referencia de Endpoints

**Base URL:** `/api/v1`

| Recurso | Método | Endpoint | Validación | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| **Config** | **GET** | `/tattoos/config` | Ninguna | Devuelve los parámetros activos del estudio leídos desde `env.config.js` |
| **Tatuajes** | **GET** | `/tattoos` | Ninguna | Lista todas las sesiones con su cotización y anticipo calculados |
| **Tatuajes** | **GET** | `/tattoos/:id` | Ninguna | Obtiene el detalle y desglose financiero de una sesión por ID |
| **Tatuajes** | **POST** | `/tattoos` | `validate(createTattooValidator)` | Agenda una nueva sesión validando edad, estilo y horas contra `config` |

---

## Documentación Detallada de Endpoints

### 1. Consultar configuración activa del estudio
- **Método:** `GET`
- **Ruta:** `/api/v1/tattoos/config`
- **Descripción:** Permite verificar cómo `env.config.js` interpreta y tipa las variables cargadas desde `.env`.

### 2. Listar sesiones de tatuaje
- **Método:** `GET`
- **Ruta:** `/api/v1/tattoos`
- **Descripción:** Retorna las sesiones registradas enriquecidas en tiempo real con `totalCostUsd` y `requiredDepositUsd` según `HOURLY_RATE_USD` y `DEPOSIT_PERCENTAGE`.

### 3. Consultar sesión por ID
- **Método:** `GET`
- **Ruta:** `/api/v1/tattoos/:id`
- **Parámetro de ruta:** `id` (ej. `TAT-01`).

### 4. Agendar y cotizar nueva sesión
- **Método:** `POST`
- **Ruta:** `/api/v1/tattoos`
- **Reglas validadas desde `config`:**
  - `clientAge` >= `MIN_AGE_REQUIRED` (por defecto `18`).
  - `estimatedHours` entre `1` y `MAX_SESSION_HOURS` (por defecto `8`).
  - `tattooStyle` dentro de la lista autorizada (`Tradicional`, `Neotradicional`, `Realismo Sombras`, `Blackwork`, `Fine Line`, `Japones Irezumi`).

---

## Pruebas con cURL

```bash
# 1. Consultar los parámetros activos cargados desde .env y env.config.js
curl -X GET http://localhost:3000/api/v1/tattoos/config

# 2. Listar todas las sesiones con cálculo dinámico de tarifa y anticipo
curl -X GET http://localhost:3000/api/v1/tattoos

# 3. Consultar el detalle de una sesión específica por ID
curl -X GET http://localhost:3000/api/v1/tattoos/TAT-01

# 4. Registrar una nueva sesión válida (calcula costo y anticipo automáticamente)
curl -X POST http://localhost:3000/api/v1/tattoos \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "Mateo Valencia",
    "clientAge": 24,
    "tattooStyle": "Realismo Sombras",
    "bodyPlacement": "Brazo completo",
    "artistName": "Valeria Ink",
    "estimatedHours": 5
  }'

# 5. Probar error 400 cuando el cliente no cumple MIN_AGE_REQUIRED o supera MAX_SESSION_HOURS
curl -X POST http://localhost:3000/api/v1/tattoos \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "Lucas Menor",
    "clientAge": 16,
    "tattooStyle": "Fine Line",
    "bodyPlacement": "Muñeca",
    "artistName": "Valeria Ink",
    "estimatedHours": 12
  }'

# 6. Probar error 404 buscando una sesión inexistente
curl -X GET http://localhost:3000/api/v1/tattoos/TAT-99
```
