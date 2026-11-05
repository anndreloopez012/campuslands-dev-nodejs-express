# Intermedio - Ejercicio 08: Middleware de Request ID
> **Autor:** Anderson Oloroso  
> **Temática:** Hiperdeportivos  
> **Tema:** Middleware de Request ID  

---

## 1. Descripción del ejercicio

Este ejercicio implementa un **Middleware de Request ID y Trazabilidad** (Correlation ID) utilizando el módulo criptográfico nativo de Node.js (`node:crypto` -> `randomUUID()`).

### Objetivos y funcionamiento:
1. **Generación / Propagación de ID Único:** Cada solicitud que llega al servidor recibe un UUID v4 único (o reutiliza la cabecera `X-Request-Id` si fue originada por un gateway).
2. **Inyección en Contexto:** El identificador se adjunta al objeto de solicitud (`req.id`), haciéndolo accesible para cualquier controlador o servicio.
3. **Cabecera HTTP de Respuesta:** Se envía automáticamente en `X-Request-Id` para que los clientes o herramientas de monitoreo puedan correlacionar incidentes.
4. **Logs Correlacionados:** La terminal registra la entrada y salida de cada petición asociándola a su respectivo `requestId` junto con la duración en milisegundos.

---

## 2. Requisitos técnicos

- Node.js 20 o superior.
- Express 4.19+ (`"type": "module"`).

---

## 3. Instalación y ejecución

1. Ingresar a la carpeta:
   ```bash
   cd intermedio/ejercicio-08/resoluciones/anderson-oloroso
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar la aplicación:
   ```bash
   npm start
   ```

4. Iniciar en modo desarrollo:
   ```bash
   npm run dev
   ```

---

## 4. Endpoints y ejemplos de uso

### 4.1. Endpoint de verificación del tema
- **Método:** `GET`
- **Ruta:** `http://localhost:3000/intermedio/ejercicio-08`
- **cURL:**
  ```bash
  curl -i -X GET http://localhost:3000/intermedio/ejercicio-08
  ```
- **Cabeceras recibidas:**
  ```text
  HTTP/1.1 200 OK
  X-Request-Id: 550e8400-e29b-41d4-a716-446655440000
  Content-Type: application/json; charset=utf-8
  ```
- **Respuesta JSON:**
  ```json
  {
    "ok": true,
    "message": "Ejercicio ejecutado correctamente",
    "topic": "middleware de request id",
    "requestId": "550e8400-e29b-41d4-a716-446655440000"
  }
  ```

### 4.2. Consultar telemetría de hiperdeportivos
- **Método:** `GET`
- **Ruta:** `http://localhost:3000/api/hypercars/telemetry`
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "requestId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "total": 3,
    "data": [
      {
        "id": 1,
        "modelo": "Koenigsegg Jesko Attack",
        "motor": "5.0L V8 Twin Turbo",
        "potenciaCV": 1600,
        "velocidadPuntaRegistradaKmH": 485.5,
        "ceroACienSegundos": 2.5,
        "circuito": "Nürburgring Nordschleife"
      }
    ]
  }
  ```

### 4.3. Registrar nueva telemetría
- **Método:** `POST`
- **Ruta:** `http://localhost:3000/api/hypercars/telemetry`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "modelo": "Hennessey Venom F5",
    "motor": "6.6L V8 Fury Twin-Turbo",
    "potenciaCV": 1817,
    "velocidadPuntaRegistradaKmH": 500.1,
    "ceroACienSegundos": 2.6,
    "circuito": "Kennedy Space Center Shuttle Runway"
  }
  ```
- **Respuesta (201 Created):**
  ```json
  {
    "ok": true,
    "requestId": "3a74ef12-9c12-4f3a-9657-3a1ef90c9182",
    "message": "Telemetría de hiperdeportivo registrada con éxito",
    "data": {
      "id": 4,
      "modelo": "Hennessey Venom F5",
      "potenciaCV": 1817,
      "velocidadPuntaRegistradaKmH": 500.1,
      "timestamp": "2026-10-28T16:15:00.000Z"
    }
  }
  ```

---

## 5. Estructura de la entrega

```text
intermedio/ejercicio-08/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── server.js
    ├── controllers/
    │   └── telemetry.controller.js
    ├── middlewares/
    │   └── requestId.middleware.js
    ├── routes/
    │   └── telemetry.routes.js
    └── services/
        └── telemetry.service.js
```
