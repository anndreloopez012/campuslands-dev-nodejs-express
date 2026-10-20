# Ejercicio 004: Servicios Reutilizables

- **Camper:** Antonio Canux
- **Nivel:** Intermedio
- **Tema:** Servicios reutilizables y desacoplados

## Estructura de Carpetas

```text
intermedio/ejercicio-04/resoluciones/antonio-canux/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   ├── player.routes.js
    │   └── match.routes.js
    ├── controllers/
    │   ├── player.controller.js
    │   └── match.controller.js
    ├── services/
    │   └── rank-calculator.service.js   # Servicio compartido y reutilizable
    └── data/
        ├── players.data.js
        └── matches.data.js
```

## Comandos de Ejecución y Pruebas

### Ejecución

```bash
npm install
npm run dev
```

### Pruebas con cURL

#### 1. Validar endpoint del ejercicio
```bash
curl -X GET http://localhost:3000/intermedio/ejercicio-04
```

**Respuesta:**
```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "servicios reutilizables"
}
```

#### 2. Consultar perfil con estadísticas calculadas
```bash
curl -X GET http://localhost:3000/api/players/1
```

#### 3. Registrar una nueva partida y ver cálculo automático de puntos y tier
```bash
curl -X POST http://localhost:3000/api/matches \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": 1,
    "kills": 5,
    "placement": 1,
    "damage": 1200
  }'
```