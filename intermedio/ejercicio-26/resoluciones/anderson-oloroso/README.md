# Intermedio - Ejercicio 26: Mock de Dependencias
> **Autor:** Anderson Oloroso  
> **Temática:** Shooters competitivos  
> **Tema:** Mock de dependencias  

---

## 1. Descripción del ejercicio

Este ejercicio demuestra la técnica de **Mock de Dependencias** mediante **Inyección de Dependencias (Dependency Injection)**.

### Caso de Negocio:
En un shooter competitivo, el emparejamiento de partidas (`MatchmakingService`) depende de un servicio externo de verificación `AntiCheatClient`. Para evitar depender de servicios externos en entornos de pruebas unitarias o de integración:
1. El servicio `MatchmakingService` recibe el cliente `AntiCheatClient` mediante su constructor.
2. En producción se utiliza la implementación por defecto.
3. En la suite de tests (`tests/matchmaking.mock.test.js`), se suministran objetos simulados (**Mocks**) que emulan respuestas controladas (jugador limpio con 99 de confianza, o jugador sancionado con `isClean: false`).

---

## 2. Requisitos técnicos

- Node.js 20 o superior.
- Express 4.19+ (`"type": "module"`).
- Test runner nativo de Node.js (`node --test`).

---

## 3. Instalación y ejecución

```bash
cd intermedio/ejercicio-26/resoluciones/anderson-oloroso
npm install
npm start      # Iniciar API
npm test       # Ejecutar tests con mocks
```

---

## 4. Endpoints y ejemplos de uso

### 4.1. Endpoint de verificación del tema
- **Método:** `GET`
- **Ruta:** `http://localhost:3000/intermedio/ejercicio-26`
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "message": "Ejercicio ejecutado correctamente",
    "topic": "mock de dependencias"
  }
  ```

### 4.2. Ingresar a cola competitiva
- **Método:** `POST`
- **Ruta:** `http://localhost:3000/api/shooters/matchmaking/queue`
- **Body:**
  ```json
  {
    "playerId": "p-101",
    "playerName": "OlorosoSniper",
    "mmr": 2150
  }
  ```
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "message": "Jugador validado e ingresado a la cola",
    "data": {
      "playerId": "p-101",
      "playerName": "OlorosoSniper",
      "mmr": 2150,
      "tier": "Radiante / Inmortal",
      "queueStatus": "En cola competitiva",
      "antiCheatValidation": {
        "verified": true,
        "trustScore": 98
      }
    }
  }
  ```

---

## 5. Estructura de la entrega

```text
intermedio/ejercicio-26/resoluciones/anderson-oloroso/
├── package.json
├── README.md
├── src/
│   ├── app.js
│   ├── controllers/
│   │   └── matchmaking.controller.js
│   ├── routes/
│   │   └── matchmaking.routes.js
│   └── services/
│       ├── anticheat.client.js
│       └── matchmaking.service.js
└── tests/
    └── matchmaking.mock.test.js
```
