# API Dibujo Digital e Ilustración — Middleware express.json()

Este proyecto es una API REST construida con Node.js y Express sobre la temática de dibujo digital, herramientas de lienzo y comercialización de ilustraciones. El propósito principal de este ejercicio es dominar el funcionamiento, configuración y captura de excepciones del middleware nativo `express.json()`.

---

## Tecnologías y Conceptos

- **Node.js**: Entorno de ejecución en el servidor.
- **Express.js**: Framework para desarrollo de APIs REST.
- **Middleware `express.json()`**:
  - Parsea automáticamente el cuerpo (*body*) de peticiones HTTP en formato JSON a objetos de JavaScript (`req.body`).
  - Requiere que el cliente envíe el encabezado `Content-Type: application/json`.
  - Genera excepciones de tipo `SyntaxError` si la cadena JSON recibida es inválida o corrupta.
- **Captura de Errores de Sintaxis JSON**:
  - Intercepción centralizada en el middleware global de errores (`errorHandler`) de fallos por JSON malformado, retornando un mensaje claro con código HTTP `400 Bad Request`.
- **Arquitectura N-Capas**:
  - `routes`: Enrutamiento modular.
  - `controllers`: Validación del cuerpo parseado `req.body` y respuestas HTTP.
  - `services`: Lógica de negocio y persistencia en JSON local.

---

## Estructura del Proyecto

```text
src/
├── app.js                          # Configuración de Express, express.json() y middleware 404
├── server.js                       # Punto de arranque del servidor HTTP
├── routes/
│   └── artworks.routes.js          # Definición de rutas GET y POST
├── controllers/
│   └── artworks.controller.js      # Validación de req.body y respuestas
├── services/
│   └── artworks.service.js         # Lógica de negocio y lectura/escritura JSON
├── middlewares/
│   └── errorHandler.js             # Captura global de errores e intercepción de JSON SyntaxError
├── utils/
│   ├── asyncHandler.js             # Envoltorio para promesas asíncronas
│   └── customErrors.js             # Clases de error personalizadas (400, 404, 409)
└── data/
    └── artworks.json               # Persistencia de datos local
.gitignore                          # Control de archivos excluidos de Git
package.json                        # Scripts y dependencias
```

---

## Configuración e Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Iniciar servidor en modo desarrollo:
```bash
npm run dev
```

Servidor corriendo en: `http://localhost:3000`.

---

## Documentación de Endpoints

**Base URL:** `/api/v1`

### 1. Obtener todas las obras

- **Método:** GET
- **Ruta:** `/api/v1/artworks`

### 2. Obtener una obra por ID

- **Método:** GET
- **Ruta:** `/api/v1/artworks/:id`

### 3. Registrar nueva ilustración

- **Método:** POST
- **Ruta:** `/api/v1/artworks`
- **Headers Requeridos:** `Content-Type: application/json`

**Cuerpo de la Petición Válido (JSON):**
```json
{
  "title": "Atardecer Mecha 2099",
  "artist": "Kenji Sato",
  "software": "Clip Studio Paint",
  "canvasWidth": 5120,
  "canvasHeight": 2880,
  "layersCount": 65,
  "priceUSD": 210.00,
  "isCommercialUse": true
}
```

**Respuesta Exitosa (201 Created):**
```json
{
  "status": "success",
  "data": {
    "id": "1728163800000",
    "title": "Atardecer Mecha 2099",
    "artist": "Kenji Sato",
    "software": "Clip Studio Paint",
    "canvasWidth": 5120,
    "canvasHeight": 2880,
    "layersCount": 65,
    "priceUSD": 210,
    "isCommercialUse": true
  }
}
```

**Respuesta por JSON Malformado (400 Bad Request):**
```json
{
  "status": "fail",
  "message": "El cuerpo de la petición contiene una sintaxis JSON inválida. Revisa comillas o comas finales."
}
```

---

## Pruebas con cURL

```bash
# 1. Obtener todas las obras
curl -X GET http://localhost:3000/api/v1/artworks

# 2. Registrar obra correctamente
curl -X POST http://localhost:3000/api/v1/artworks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Atardecer Mecha 2099",
    "artist": "Kenji Sato",
    "software": "Clip Studio Paint",
    "canvasWidth": 5120,
    "canvasHeight": 2880,
    "layersCount": 65,
    "priceUSD": 210.00,
    "isCommercialUse": true
  }'

# 3. Probar captura de error por JSON corrupto
curl -X POST http://localhost:3000/api/v1/artworks \
  -H "Content-Type: application/json" \
  -d '{"title": "Obra Malformada", "artist": "Error",}'
```
