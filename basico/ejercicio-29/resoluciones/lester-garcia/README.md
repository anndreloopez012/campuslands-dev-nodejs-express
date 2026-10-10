# API Ligas de Futsal y Fútbol — Documentación Técnica

Este repositorio contiene una API REST modular construida con Node.js y Express, diseñada para gestionar encuentros, marcadores y estadísticas de torneos de fútbol sala y ligas profesionales.

---

## Stack Tecnológico y Arquitectura

- **Runtime**: Node.js (con soporte nativo para `--env-file`).
- **Framework**: Express.js.
- **Patrón Arquitectónico**: Arquitectura N-Capas Modular (`src/routes`, `src/controllers`, `src/services`, `src/middlewares`, `src/utils`).
- **Persistencia**: Almacenamiento local basado en archivos JSON asíncronos (`fs/promises`).

---

## Estructura de Directorios

```text
src/
├── app.js                          # Ensamblado de Express, middlewares y prefijos de ruta
├── server.js                       # Arranque HTTP utilizando process.env.PORT
├── routes/
│   └── futsal.routes.js            # Enrutador modular de partidos de futsal
├── controllers/
│   └── futsal.controller.js        # Manejadores de contratos HTTP y validación de x-league-key
├── services/
│   └── futsal.service.js           # Lógica de negocio y lectura/escritura de datos JSON
├── middlewares/
│   └── errorHandler.js             # Manejador global de excepciones operacionales y de sintaxis
├── utils/
│   ├── asyncHandler.js             # Envoltorio para control de promesas asíncronas
│   └── customErrors.js             # Clases de error HTTP personalizadas (400, 401, 404, 409)
└── data/
    └── futsalMatches.json          # Base de datos local en formato JSON
.env                                # Variables de entorno locales (excluidas en Git)
.env.example                        # Plantilla de configuración de entorno
.gitignore                          # Archivos excluidos del control de versiones
package.json                        # Definición de dependencias y scripts de ejecución
```

---

## Configuración e Instalación

1. Clonar el repositorio y configurar variables de entorno:
```bash
cp .env.example .env
```

2. Instalar dependencias:
```bash
npm install
```

3. Ejecutar el servidor en modo desarrollo (con recarga automática):
```bash
npm run dev
```

El servidor estará escuchando en `http://localhost:3000` (o el puerto definido en tu archivo `.env`).

---

## Referencia de Endpoints

**Base URL**: `/api/v1`

### 1. Obtener todos los partidos

- **Método**: `GET`
- **Ruta**: `/api/v1/futsal/matches`
- **Query Parameters Opcionales**:
  - `matchStatus`: Estado del partido (Scheduled, Live, Finished, Postponed).
  - `surfaceType`: Tipo de superficie (Parquet, Sintético, Interior (Pista), Cemento).
  - `team`: Búsqueda parcial por nombre de equipo local o visitante.

### 2. Obtener un partido por ID

- **Método**: `GET`
- **Ruta**: `/api/v1/futsal/matches/:id`

### 3. Registrar un nuevo partido (Protegido)

- **Método**: `POST`
- **Ruta**: `/api/v1/futsal/matches`
- **Headers Requeridos**:
  - `Content-Type`: `application/json`
  - `x-league-key`: Clave secreta definida en `LEAGUE_SECRET_KEY` dentro del archivo `.env`.

**Ejemplo de Cuerpo de Petición (JSON)**:
```json
{
  "matchCode": "FUT-2026-04",
  "homeTeam": "Futsal United",
  "awayTeam": "Real Deportivo",
  "homeGoals": 1,
  "awayGoals": 2,
  "surfaceType": "Parquet",
  "matchStatus": "Live"
}
```

---

## Pruebas con cURL

Consultar partidos en curso:
```bash
curl -X GET "http://localhost:3000/api/v1/futsal/matches?matchStatus=Live"
```

Registrar nuevo partido oficial:
```bash
curl -X POST http://localhost:3000/api/v1/futsal/matches \
  -H "Content-Type: application/json" \
  -H "x-league-key: futsal_pro_league_2026" \
  -d '{
    "matchCode": "FUT-2026-04",
    "homeTeam": "Futsal United",
    "awayTeam": "Real Deportivo",
    "homeGoals": 1,
    "awayGoals": 2,
    "surfaceType": "Parquet",
    "matchStatus": "Live"
  }'
```
