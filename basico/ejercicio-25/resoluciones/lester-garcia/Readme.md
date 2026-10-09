# API Videojuegos RPG — Respuestas HTTP Correctas (200, 201, 204, 400, 404, 409)

Este proyecto es una API REST profesional desarrollada con Node.js y Express sobre la temática de **videojuegos RPG, gestión de héroes y clases de personajes**. El objetivo de este ejercicio es dominar la **semántica y el uso preciso de los códigos de estado HTTP**.

---

## Códigos de Estado HTTP Utilizados

| Código | Estado | Uso en la API |
| :--- | :--- | :--- |
| **`200`** | `OK` | Lectura exitosa de listados, búsquedas por ID y actualizaciones (`PUT`). |
| **`201`** | `Created` | Registro exitoso de un nuevo personaje (`POST`). |
| **`204`** | `No Content` | Eliminación exitosa de un personaje (`DELETE`), sin cuerpo de respuesta. |
| **`400`** | `Bad Request` | Parámetros inválidos (ej. nivel fuera de 1-100, HP negativo, clase no permitida). |
| **`404`** | `Not Found` | Recurso no encontrado (ID inexistente o ruta no declarada). |
| **`409`** | `Conflict` | Intento de duplicar un nombre de personaje en la base de datos. |
| **`500`** | `Internal Error` | Excepciones no controladas manejadas por `errorHandler`. |

---

## Estructura del Proyecto

```text
src/
├── app.js                          # Configuración de Express y middlewares
├── server.js                       # Punto de arranque del servidor HTTP
├── routes/
│   └── rpg.routes.js               # Enrutamiento modular para /characters
├── controllers/
│   └── rpg.controller.js           # Asignación explícita de res.status() y validación
├── services/
│   └── rpg.service.js              # Lógica de negocio y persistencia en JSON
├── middlewares/
│   └── errorHandler.js             # Middleware global de procesamiento de errores
├── utils/
│   ├── asyncHandler.js             # Capturador asíncrono
│   └── customErrors.js             # Clases de error (400, 404, 409)
└── data/
    └── characters.json             # Almacenamiento local en JSON
.gitignore                          # Control de archivos ignorados
package.json                        # Scripts y dependencias
```

---

## Configuración e Instalación

1. Instalación de dependencias:
```bash
npm install
```

2. Iniciar el servidor en modo desarrollo:
```bash
npm run dev
```

Servidor listo en: `http://localhost:3000`.

---

## Documentación de Endpoints

Base URL: `/api/v1`

| Método | Endpoint | Parámetros Disponibles | Códigos de Estado Esperados |
| :--- | :--- | :--- | :--- |
| **GET** | `/characters` | **Query Params:** `characterClass`, `isAlive`, `minLevel` | `200 OK` |
| **GET** | `/characters/:id` | **Ruta:** `:id` del personaje | `200 OK`, `404 Not Found` |
| **POST** | `/characters` | **Body (JSON):** Estructura del nuevo héroe | `201 Created`, `400 Bad Request`, `409 Conflict` |
| **PUT** | `/characters/:id` | **Ruta:** `:id`<br>**Body (JSON):** Campos a actualizar | `200 OK`, `400 Bad Request`, `404 Not Found`, `409 Conflict` |
| **DELETE** | `/characters/:id` | **Ruta:** `:id` del personaje | `204 No Content`, `404 Not Found` |

---

## Pruebas con cURL

Ejecuta estos comandos en tu terminal para validar las respuestas HTTP correspondientes:

* **1. Obtener personajes (200 OK):**
```bash
curl -X GET http://localhost:3000/api/v1/characters
```

* **2. Crear personaje (201 Created):**
```bash
curl -X POST http://localhost:3000/api/v1/characters \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kaelen el Redentor",
    "characterClass": "Paladín",
    "level": 25,
    "healthPoints": 800,
    "manaPoints": 300,
    "isAlive": true
  }'
```

* **3. Probar nivel inválido (400 Bad Request):**
```bash
curl -X POST http://localhost:3000/api/v1/characters \
  -H "Content-Type: application/json" \
  -d '{"name": "Fail", "characterClass": "Mago", "level": 200, "healthPoints": 10, "manaPoints": 10}'
```

* **4. Eliminar personaje (204 No Content):**
```bash
curl -X DELETE http://localhost:3000/api/v1/characters/3
```
