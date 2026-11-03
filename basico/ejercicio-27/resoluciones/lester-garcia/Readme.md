# API MOBA Esports — Logs Simples y Monitoreo de Peticiones

Este proyecto es una API REST modular desarrollada con Node.js y Express sobre la temática de **torneos de deportes electrónicos MOBA (League of Legends, Dota 2) y estadísticas de partidas**. El objetivo principal de este ejercicio es implementar un **middleware de logging personalizado** para registrar en consola cada solicitud HTTP y su tiempo de respuesta.

---

## Conceptos y Arquitectura

* **Node.js & Express**: Entorno de ejecución y framework backend.
* **Middleware de Logging (`requestLogger`)**:
  * Intercepta cada solicitud de manera transversal antes de que llegue a las rutas.
  * Calcula la duración de la petición y captura el código de estado (`res.statusCode`) al finalizar el ciclo de respuesta mediante el evento `res.on('finish')`.
* **Arquitectura N-Capas**:
  * `routes/`: Enrutamiento modular.
  * `controllers/`: Manejo de interfaz HTTP y validación superficial.
  * `services/`: Lógica de negocio y persistencia en archivo JSON local.
  * `middlewares/`: Registro de peticiones y control global de errores.

---

## Estructura del Proyecto

```text
src/
├── app.js                          # Configuración de Express, logger middleware y rutas
├── server.js                       # Arranque del servidor HTTP
├── routes/
│   └── moba.routes.js              # Declaración de endpoints MOBA
├── controllers/
│   └── moba.controller.js          # Controladores HTTP
├── services/
│   └── moba.service.js             # Lógica de negocio y persistencia JSON
├── middlewares/
│   ├── logger.middleware.js        # Middleware personalizado de logs simples
│   └── errorHandler.js             # Manejador global de excepciones
├── utils/
│   ├── asyncHandler.js             # Envoltorio asíncrono
│   └── customErrors.js             # Clases de error HTTP (400, 404, 409)
└── data/
    └── mobaMatches.json            # Base de datos local en JSON
.gitignore                          # Control de archivos excluidos
package.json                        # Configuración de dependencias y scripts
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

**Base URL:** `/api/v1`

### 1. Obtener listado de partidas

* **Método:** `GET`
* **Ruta:** `/api/v1/moba/matches`
* **Query Params Opcionales:** `tournamentName`, `patch`, `winner`.

### 2. Obtener partida por ID

* **Método:** `GET`
* **Ruta:** `/api/v1/moba/matches/:id`

### 3. Registrar nueva partida

* **Método:** `POST`
* **Ruta:** `/api/v1/moba/matches`
* **Headers:** `Content-Type: application/json`

**Cuerpo de Petición Válido (JSON):**
```json
{
  "tournamentName": "Mid-Season Invitational 2026",
  "teamA": "Bilibili Gaming",
  "teamB": "T1",
  "patch": "14.8",
  "durationMinutes": 32,
  "winner": "Bilibili Gaming",
  "totalKills": 35
}
```

---

## Pruebas con cURL y Observación de Logs

```bash
# 1. Consultar partidas (Revisa tu terminal para ver el log impreso)
curl -X GET http://localhost:3000/api/v1/moba/matches

# 2. Registrar nueva partida
curl -X POST http://localhost:3000/api/v1/moba/matches \
  -H "Content-Type: application/json" \
  -d '{
    "tournamentName": "Mid-Season Invitational 2026",
    "teamA": "Bilibili Gaming",
    "teamB": "T1",
    "patch": "14.8",
    "durationMinutes": 32,
    "winner": "Bilibili Gaming",
    "totalKills": 35
  }'
```
