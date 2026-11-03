# API Galería de Dibujo Digital — Control de Acceso entre Orígenes (CORS Controlado)

Este repositorio implementa el estándar de **CORS Controlado con Lista Blanca (Cross-Origin Resource Sharing Whitelist)** utilizando **Node.js** y **Express** sobre la temática de **dibujo digital, lienzos de alta resolución y portafolios de ilustración (Procreate, Clip Studio Paint, Wacom)**. La finalidad del ejercicio es proteger la API frente a orígenes web no autorizados y gestionar peticiones preflight (`OPTIONS`) de manera explícita.

---

## Fundamentos de CORS Controlado

1. **Lista Blanca de Orígenes (`ALLOWED_ORIGINS`)**:
   En lugar de utilizar el comodín inseguro `Access-Control-Allow-Origin: *`, el middleware valida dinámicamente el encabezado `Origin` de la petición contra los dominios confiables configurados en `.env`.
2. **Respuesta Dinámica y Encabezado `Vary: Origin`**:
   Si el origen está autorizado, el servidor refleja exactamente ese dominio en `Access-Control-Allow-Origin` e incluye `Vary: Origin` para evitar envenenamiento de caché en CDNs o proxies intermedios.
3. **Gestión de Peticiones Preflight (`OPTIONS`)**:
   Cuando un navegador ejecuta una petición compleja (`POST`, `DELETE` o con cabeceras personalizadas), envía antes una solicitud `OPTIONS`. El middleware responde con `204 No Content` e informa los métodos (`Access-Control-Allow-Methods`), cabeceras (`Access-Control-Allow-Headers`) y tiempo de caché (`Access-Control-Max-Age`).
4. **Rechazo Explícito (`403 Forbidden`)**:
   Si la solicitud proviene de un origen externo desconocido (ej. `https://sitio-malicioso.com`), el middleware interrumpe la ejecución lanzando un `ForbiddenError` (`403`).

---

## Orígenes Autorizados por Defecto

| Origen | Propósito | Estado CORS |
| :--- | :--- | :--- |
| `http://localhost:5173` | Frontend local de desarrollo (Vite) | Permitido |
| `https://procreate-gallery.art` | Portal web oficial de exposición | Permitido |
| `https://wacom-studio.dev` | Aplicación de sincronización de tabletas | Permitido |
| Cualquier otro `Origin` | Dominios externos no registrados | Bloqueado (`403 Forbidden`) |

---

## Estructura de Directorios

```text
src/
├── app.js                                       # Configuración global y montaje de controlledCorsMiddleware
├── server.js                                    # Arranque del servidor HTTP
├── config/
│   └── cors.config.js                           # Parseo de ALLOWED_ORIGINS, métodos y credenciales
├── routes/
│   ├── index.routes.js                          # Montaje centralizado
│   └── illustrations.routes.js                  # Endpoints de ilustraciones y política CORS
├── controllers/
│   └── illustrations.controller.js              # Controladores HTTP limpios
├── services/
│   └── illustrations.service.js                 # Lógica de negocio del catálogo de arte digital
├── repositories/
│   └── illustrations.inMemory.repository.js     # Persistencia en memoria de obras digitales
├── middlewares/
│   ├── requestId.middleware.js                  # Trazabilidad con UUID v4
│   ├── logger.middleware.js                     # Logger transversal
│   ├── cors.middleware.js                       # Validación de Origin contra lista blanca y preflight 204
│   ├── errorHandler.middleware.js               # Captura centralizada de errores
│   └── validators/
│       ├── validate.middleware.js               # Envoltorio de validación
│       └── illustration.validator.js            # Validación de software, resolución y perfiles de color
└── utils/
    ├── asyncHandler.js                          # Envoltorio asíncrono
    └── customErrors.js                          # Clases de error (ForbiddenError, ValidationError, etc.)
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
| **CORS** | **GET** | `/illustrations/cors-policy` | Muestra la política CORS activa y los orígenes permitidos |
| **CORS** | **OPTIONS** | `/illustrations` | Petición preflight respondida con `204 No Content` |
| **Ilustraciones** | **GET** | `/illustrations` | Lista todas las obras digitales del portafolio |
| **Ilustraciones** | **GET** | `/illustrations/:id` | Obtiene los metadatos técnicos de un lienzo por ID |
| **Ilustraciones** | **POST** | `/illustrations` | Publica una nueva ilustración validando resolución y capas |

---

## Pruebas con cURL

```bash
# 1. Petición desde un origen autorizado (Recibe 200 OK y header Access-Control-Allow-Origin)
curl -i -X GET http://localhost:3000/api/v1/illustrations \
  -H "Origin: https://procreate-gallery.art"

# 2. Simular petición Preflight OPTIONS desde un origen permitido (Recibe 204 No Content)
curl -i -X OPTIONS http://localhost:3000/api/v1/illustrations \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST"

# 3. Petición desde un origen NO autorizado (Recibe 403 Forbidden)
curl -i -X GET http://localhost:3000/api/v1/illustrations \
  -H "Origin: https://scraper-no-autorizado.org"

# 4. Publicar una nueva ilustración digital desde un origen autorizado
curl -X POST http://localhost:3000/api/v1/illustrations \
  -H "Origin: https://wacom-studio.dev" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Dragón Astral en Tinta Digital",
    "artist": "Sofía Kurosawa",
    "software": "Procreate",
    "canvasResolution": "4096x3072",
    "layersCount": 115,
    "colorProfile": "Display P3"
  }'

# 5. Consultar la política de CORS activa
curl -X GET http://localhost:3000/api/v1/illustrations/cors-policy
```
