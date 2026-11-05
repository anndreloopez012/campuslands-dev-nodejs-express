# Intermedio - Ejercicio 07: Middleware de Errores
> **Autor:** Anderson Oloroso  
> **Temática:** Autos de lujo  
> **Tema:** Middleware de errores  

---

## 1. Descripción del ejercicio

Este ejercicio enseña cómo gestionar fallos y excepciones en **Express** de manera profesional y unificada utilizando un **Middleware Global de Errores** (`(err, req, res, next)`).

### Patrón implementado:
1. **Jerarquía de Errores Personalizados (`AppError`):**
   - `BadRequestError` (400)
   - `NotFoundError` (404)
   - `ConflictError` (409)
2. **Propagación Asíncrona Limpia:** Los controladores capturan cualquier error y lo derivan a la cadena de Express mediante `next(error)` sin detener el proceso.
3. **Formato JSON Estandarizado:** Todas las respuestas de error en la API tienen la misma estructura coherente (`ok: false`, `status`, `error`, `message`, `path`, `timestamp`), protegiendo detalles internos y trazando el fallo en consola.

---

## 2. Requisitos técnicos

- Node.js 20 o superior.
- Express 4.19+ (`"type": "module"`).

---

## 3. Instalación y ejecución

1. Ingresar al directorio:
   ```bash
   cd intermedio/ejercicio-07/resoluciones/anderson-oloroso
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar en producción:
   ```bash
   npm start
   ```

4. Iniciar en desarrollo:
   ```bash
   npm run dev
   ```

---

## 4. Endpoints y ejemplos de uso

### 4.1. Endpoint de verificación del tema
- **Método:** `GET`
- **Ruta:** `http://localhost:3000/intermedio/ejercicio-07`
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "message": "Ejercicio ejecutado correctamente",
    "topic": "middleware de errores"
  }
  ```

### 4.2. Listar catálogo de autos de lujo
- **Método:** `GET`
- **Ruta:** `http://localhost:3000/api/luxury-cars`
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "total": 4,
    "data": [
      {
        "id": 1,
        "marca": "Ferrari",
        "modelo": "SF90 Stradale",
        "potenciaHP": 1000,
        "precioUSD": 625000,
        "disponibleTestDrive": true
      }
    ]
  }
  ```

### 4.3. Agendar Test Drive con éxito
- **Método:** `POST`
- **Ruta:** `http://localhost:3000/api/luxury-cars/test-drive`
- **Body:**
  ```json
  {
    "carId": 1,
    "cliente": "Roberto Valdivia",
    "fecha": "2026-11-15"
  }
  ```
- **Respuesta (201 Created):**
  ```json
  {
    "ok": true,
    "message": "Reserva de Test Drive procesada exitosamente",
    "data": {
      "idReserva": "VIP-172900000",
      "car": "Ferrari SF90 Stradale",
      "carId": 1,
      "cliente": "Roberto Valdivia",
      "fecha": "2026-11-15",
      "estado": "Confirmada con Concierge VIP"
    }
  }
  ```

---

## 5. Respuestas manejadas por el Middleware de Errores

### 5.1. Error 404 (Auto no encontrado)
- **Petición:** `GET http://localhost:3000/api/luxury-cars/999`
- **Respuesta:**
  ```json
  {
    "ok": false,
    "status": 404,
    "error": "NotFoundError",
    "message": "El auto de lujo con ID 999 no existe en nuestro inventario.",
    "path": "/api/luxury-cars/999",
    "timestamp": "2026-10-28T16:00:00.000Z"
  }
  ```

### 5.2. Error 409 (Conflicto de disponibilidad)
- **Petición:** Intentar reservar un auto exclusivo no disponible para pruebas (`carId: 3` Lamborghini Revuelto):
- **Respuesta:**
  ```json
  {
    "ok": false,
    "status": 409,
    "error": "ConflictError",
    "message": "El vehículo Lamborghini Revuelto es una pieza exclusiva de exhibición y no está disponible para test drive.",
    "path": "/api/luxury-cars/test-drive",
    "timestamp": "2026-10-28T16:00:00.000Z"
  }
  ```

---

## 6. Estructura de la entrega

```text
intermedio/ejercicio-07/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── server.js
    ├── controllers/
    │   └── cars.controller.js
    ├── errors/
    │   └── app.error.js
    ├── middlewares/
    │   └── errorHandler.middleware.js
    ├── routes/
    │   └── cars.routes.js
    └── services/
        └── cars.service.js
```
