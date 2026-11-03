# API Gremio de Aventureros RPG — Testing de Rutas HTTP (Route Integration Testing)

Este repositorio implementa una suite de **Pruebas de Integración de Rutas HTTP** utilizando **`node:test`, `node:assert/strict` y `fetch` nativo sobre un servidor Express efímero (`app.listen(0)`)**, ambientado en la temática de **videojuegos RPG, tablón de misiones del gremio y recompensas de oro**.

---

## Fundamentos de Testing de Rutas HTTP

A diferencia del testing unitario de servicios, el **Testing de Rutas** valida toda la tubería HTTP de principio a fin:

1. **Servidor Efímero en Puerto Dinámico (`app.listen(0)`)**:
   En el hook `before()`, el sistema operativo asigna un puerto libre aleatorio para evitar colisiones, y en `after()` cierra las conexiones limpiamente (`server.close()`).
2. **Verificación del Contrato HTTP Completo**:
   Se comprueban códigos de estado (`200`, `201`, `400`, `404`), cabeceras de trazabilidad (`X-Request-Id`), serialización JSON, middlewares de validación (`validate`) y formateo del `errorHandler`.

---

## Estructura de Directorios

```text
src/
├── app.js                                       # Instancia de Express exportada sin acoplar el listen()
├── server.js                                    # Arranque del servidor HTTP para producción/desarrollo
├── routes/
│   ├── index.routes.js                          # Montaje centralizado
│   └── quests.routes.js                         # Endpoints de misiones RPG
├── controllers/
│   └── quests.controller.js                     # Controladores HTTP limpios
├── services/
│   └── quests.service.js                        # Lógica de negocio del tablón de misiones
├── repositories/
│   └── quests.inMemory.repository.js            # Persistencia en memoria de misiones RPG
├── middlewares/
│   ├── requestId.middleware.js                  # Trazabilidad con UUID v4
│   ├── logger.middleware.js                     # Logger transversal
│   ├── errorHandler.middleware.js               # Captura centralizada de errores
│   └── validators/
│       ├── validate.middleware.js               # Envoltorio de validación
│       └── quest.validator.js                   # Validación de rangos (Bronce..Legendario), nivel y oro
└── utils/
    ├── asyncHandler.js                          # Envoltorio asíncrono
    └── customErrors.js                          # Clases de error operacionales
tests/
└── quests.routes.test.js                        # Pruebas de integración HTTP contra /api/v1/quests
.env                                             # Variables de entorno locales (excluido en Git)
.env.example                                     # Plantilla de variables de entorno
.gitignore                                       # Control de exclusiones
package.json                                     # Scripts (dev, start, test) y dependencias
```

---

## Configuración, Ejecución y Pruebas

### 1. Variables de entorno e instalación
```bash
cp .env.example .env
npm install
```

### 2. Ejecutar pruebas de integración de rutas
```bash
npm test
```

### 3. Iniciar servidor en modo desarrollo
```bash
npm run dev
```

---

## Referencia de Endpoints

**Base URL:** `/api/v1`

| Recurso | Método | Endpoint | Código Éxito | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| **Misiones** | **GET** | `/quests` | `200 OK` | Lista todas las misiones disponibles en el gremio |
| **Misiones** | **GET** | `/quests/:id` | `200 OK` | Obtiene los detalles de una misión por su ID |
| **Misiones** | **POST** | `/quests` | `201 Created` | Publica una nueva misión validando rango y recompensa |

---

## Pruebas Manuales con cURL

```bash
# 1. Listar todas las misiones del tablón RPG
curl -X GET http://localhost:3000/api/v1/quests

# 2. Publicar una nueva misión rango Oro
curl -X POST http://localhost:3000/api/v1/quests \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Purificar las Catacumbas del Rey Exánime",
    "region": "Valle Sombrío",
    "difficultyRank": "Oro",
    "recommendedLevel": 35,
    "goldReward": 1800
  }'

# 3. Probar validación 400 Bad Request
curl -X POST http://localhost:3000/api/v1/quests \
  -H "Content-Type: application/json" \
  -d '{
    "title": "No",
    "region": "X",
    "difficultyRank": "Invalido",
    "recommendedLevel": 999,
    "goldReward": 0
  }'
```
