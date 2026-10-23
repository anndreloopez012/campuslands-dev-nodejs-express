# API Battle Royale — Configuración por Entorno (Environment Variables)

Este proyecto es una API REST modular construida con Node.js y Express sobre la temática de **servidores de videojuegos Battle Royale, gestión de lobbies y salas multijugador**. El objetivo principal de este ejercicio es dominar el desacoplamiento de configuraciones sensibles y puertos mediante el uso de variables de entorno (`process.env` y archivo `.env`).

---

## Conceptos y Variables de Entorno

* **Node.js `--env-file=.env`**: Carga nativa de variables de entorno sin necesidad de dependencias externas como `dotenv`.
* **Variables Clave Utilizadas**:
  * `PORT`: Puerto dinámico en el que escucha el servidor HTTP.
  * `NODE_ENV`: Entorno de ejecución (`development` o `production`), útil para ajustar el nivel de detalle en los errores.
  * `API_VERSION`: Prefijo dinámico para las rutas de la API (ej. `/api/v1`).
  * `SECRET_MATCH_KEY`: Llave secreta validada mediante headers para autorizar la creación de lobbies.
* **Arquitectura N-Capas**:
  * `routes/`: Enrutamiento modular.
  * `controllers/`: Validación de variables de entorno en headers y respuestas.
  * `services/`: Lógica de negocio y persistencia JSON.
  * `middlewares/`: Manejo dinámico de errores según el entorno.

---

## Estructura del Proyecto

```text
src/
├── app.js                          # Configuración de Express, prefijo API dinámico y rutas
├── server.js                       # Arranque del servidor usando process.env.PORT
├── routes/
│   └── battleRoyale.routes.js      # Declaración de endpoints de Battle Royale
├── controllers/
│   └── battleRoyale.controller.js  # Controladores y validación de x-server-secret
├── services/
│   └── battleRoyale.service.js     # Lógica de negocio y lectura/escritura JSON
├── middlewares/
│   └── errorHandler.js             # Gestor de errores condicional según NODE_ENV
├── utils/
│   ├── asyncHandler.js             # Envoltorio asíncrono
│   └── customErrors.js             # Clases de error HTTP (400, 401, 404, 409)
└── data/
    └── lobbies.json                # Almacenamiento local en JSON
.env                                # Archivo de entorno local (excluido en Git)
.env.example                        # Plantilla de variables de entorno
.gitignore                          # Control de archivos excluidos
package.json                        # Scripts con --env-file=.env
```

---

## Configuración e Instalación

1. Duplicar la plantilla `.env.example` como `.env`:
```bash
cp .env.example .env
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar el servidor en modo desarrollo:
```bash
npm run dev
```

Servidor listo en el puerto configurado (por defecto `http://localhost:4000`).

---

## Documentación de Endpoints

**Base URL:** `/api/v1`

### 1. Obtener listado de lobbies

* **Método:** `GET`
* **Ruta:** `/api/v1/lobbies`
* **Query Params Opcionales:** `gameMode`, `isServerActive`, `mapName`.

### 2. Obtener un lobby por ID

* **Método:** `GET`
* **Ruta:** `/api/v1/lobbies/:id`

### 3. Crear un nuevo lobby (Protegido por Secret Key)

* **Método:** `POST`
* **Ruta:** `/api/v1/lobbies`
* **Headers Requeridos:**
  * `Content-Type: application/json`
  * `x-server-secret`: Debe coincidir con la `SECRET_MATCH_KEY` definida en tu archivo `.env`.

**Cuerpo de Petición Válido (JSON):**
```json
{
  "lobbyCode": "BR-SQUAD-99",
  "mapName": "Snow Peak",
  "maxPlayers": 100,
  "gameMode": "Squad",
  "isServerActive": true
}
```

---

## Pruebas con cURL

```bash
# 1. Obtener todos los lobbies
curl -X GET http://localhost:4000/api/v1/lobbies

# 2. Registrar lobby enviando la clave secreta por header
curl -X POST http://localhost:4000/api/v1/lobbies \
  -H "Content-Type: application/json" \
  -H "x-server-secret: battle_royale_secret_secure_2026" \
  -d '{
    "lobbyCode": "BR-SQUAD-99",
    "mapName": "Snow Peak",
    "maxPlayers": 100,
    "gameMode": "Squad",
    "isServerActive": true
  }'
```
