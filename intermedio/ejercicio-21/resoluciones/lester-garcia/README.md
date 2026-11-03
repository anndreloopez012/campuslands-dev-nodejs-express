# API Granja de Renderizado y Animación 3D — Rate Limit Conceptual (Fixed Window Counter)

Este repositorio implementa el patrón de **Limitación de Tasa de Peticiones (Rate Limiting Conceptual)** utilizando **Node.js** y **Express** sobre la temática de **animación 3D, motores de renderizado (Cycles, Arnold, Redshift) y colas de procesamiento GPU**. La finalidad del ejercicio es proteger los nodos de cómputo frente a ráfagas abusivas de solicitudes o ataques de denegación de servicio (DoS).

---

## Fundamentos de Rate Limiting Conceptual

1. **Algoritmo de Ventana Fija en Memoria (`Map`)**:
   Cada cliente (identificado mediante `X-Client-Id` o dirección IP `req.ip`) posee un contador asociado a una ventana temporal (`RATE_LIMIT_WINDOW_MS`, por defecto `60000` ms = 1 minuto).
2. **Cabeceras Estándar de Cuota HTTP**:
   En cada respuesta el middleware inyecta:
   - `X-RateLimit-Limit`: Máximo de peticiones permitidas en la ventana (`5`).
   - `X-RateLimit-Remaining`: Peticiones restantes antes del bloqueo.
   - `X-RateLimit-Reset`: Marca de tiempo Unix (en segundos) en la que se reinicia la cuota.
3. **Bloqueo con Código `429 Too Many Requests`**:
   Cuando el contador supera `RATE_LIMIT_MAX_REQUESTS`, el servidor devuelve el estado HTTP `429`, adjunta la cabecera `Retry-After` y detiene el procesamiento antes de llegar a los controladores.

---

## Estructura de Directorios

```text
src/
├── app.js                                       # Configuración global y montaje de rateLimiterMiddleware
├── server.js                                    # Arranque del servidor HTTP
├── config/
│   └── rateLimit.config.js                      # Configuración de ventana (ms) y límite de solicitudes
├── routes/
│   ├── index.routes.js                          # Montaje centralizado
│   └── renderJobs.routes.js                     # Endpoints de trabajos de renderizado 3D
├── controllers/
│   └── renderJobs.controller.js                 # Controladores HTTP limpios
├── services/
│   └── renderJobs.service.js                    # Lógica de encolado de escenas 3D
├── repositories/
│   └── renderJobs.inMemory.repository.js        # Persistencia en memoria de escenas y renders
├── middlewares/
│   ├── requestId.middleware.js                  # Trazabilidad con UUID v4
│   ├── logger.middleware.js                     # Logger transversal
│   ├── rateLimiter.middleware.js                # Control de cuota por cliente y emisión de cabeceras X-RateLimit-*
│   ├── errorHandler.middleware.js               # Captura centralizada de errores (incluye 429)
│   └── validators/
│       ├── validate.middleware.js               # Envoltorio de validación
│       └── renderJob.validator.js               # Validación de motores 3D, fotogramas y muestras
└── utils/
    ├── asyncHandler.js                          # Envoltorio asíncrono
    └── customErrors.js                          # Clases de error (TooManyRequestsError 429, etc.)
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

| Recurso | Método | Endpoint | Cabeceras de Cuota | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| **Renders** | **GET** | `/renders` | `X-RateLimit-Limit`, `X-RateLimit-Remaining` | Lista todos los trabajos de la granja de render |
| **Renders** | **GET** | `/renders/:id` | `X-RateLimit-Limit`, `X-RateLimit-Remaining` | Consulta el estado de una escena 3D por ID |
| **Renders** | **POST** | `/renders` | `X-RateLimit-Limit`, `X-RateLimit-Remaining` | Encola una nueva escena validando motor y samples |

---

## Pruebas con cURL

```bash
# 1. Consultar cola de renderizado observando los headers X-RateLimit-*
curl -i -X GET http://localhost:3000/api/v1/renders \
  -H "X-Client-Id: estudio-blender-01"

# 2. Encolar una nueva escena de animación 3D
curl -X POST http://localhost:3000/api/v1/renders \
  -H "X-Client-Id: estudio-blender-01" \
  -H "Content-Type: application/json" \
  -d '{
    "sceneName": "Cyberpunk_Alley_Rain.blend",
    "animator": "Mateo Cárdenas",
    "renderEngine": "Cycles",
    "totalFrames": 360,
    "samplesPerPixel": 1024
  }'

# 3. Disparar 6 peticiones consecutivas para comprobar el bloqueo 429 Too Many Requests
for i in 1 2 3 4 5 6; do
  echo "=== Petición #$i ==="
  curl -i -s http://localhost:3000/api/v1/renders -H "X-Client-Id: nodo-prueba-rafaga" | head -n 12
done
```
