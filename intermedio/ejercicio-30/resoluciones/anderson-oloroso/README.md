# Intermedio - Ejercicio 30: Proyecto Integrador Intermedio
> **Autor:** Anderson Oloroso  
> **Temática:** Motos y mecánica  
> **Tema:** Proyecto integrador intermedio  

---

## 1. Descripción del ejercicio

Este proyecto es el **Cierre Integrador del Nivel Intermedio**, combinando en una sola API REST de producción todos los patrones y técnicas aprendidas a lo largo de los 30 ejercicios:

1. **Arquitectura Modular por Capas:** Separación limpia de `routes`, `controllers`, `services` y `repositories`.
2. **Patrón Repositorio en Memoria:** Encapsulación de datos mediante `Map` (`workshop.repository.js`).
3. **Middleware de Trazabilidad (`Request ID`):** Asignación y propagación de UUID (`X-Request-Id`).
4. **Validación Centralizada:** Middleware que valida esquemas de datos y parámetros obligatorios antes de delegar a controladores.
5. **Manejo Global de Excepciones:** Middleware unificado de 4 parámetros `(err, req, res, next)` para códigos de error enriquecidos.
6. **Paginación y Filtrado:** Soporte de `page`, `limit` y filtrado por `tipo` de mantenimiento.
7. **Pruebas Automatizadas:** Suite completa con el runner nativo `node:test` verificando casos de éxito y fallo.

---

## 2. Requisitos técnicos

- Node.js 20 o superior.
- Express 4.19+ (`"type": "module"`).
- Test runner nativo de Node.js (`node --test`).

---

## 3. Instalación y ejecución

```bash
cd intermedio/ejercicio-30/resoluciones/anderson-oloroso
npm install
npm start      # Servidor en producción
npm test       # Suite de pruebas automatizadas
npm run dev    # Modo observador con recarga automática
```

---

## 4. Endpoints y ejemplos de uso

### 4.1. Endpoint de verificación del tema
- **Método:** `GET`
- **Ruta:** `http://localhost:3000/intermedio/ejercicio-30`
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "requestId": "6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b",
    "message": "Ejercicio ejecutado correctamente",
    "topic": "proyecto integrador intermedio"
  }
  ```

### 4.2. Listar órdenes de mantenimiento con paginación
- **Método:** `GET`
- **Ruta:** `http://localhost:3000/api/workshop/records?page=1&limit=5&tipo=preventivo`
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "requestId": "7d9b...",
    "total": 1,
    "page": 1,
    "limit": 5,
    "totalPages": 1,
    "data": [
      {
        "id": 1,
        "placa": "HON-750",
        "cliente": "Mateo Gómez",
        "marca": "Honda",
        "modelo": "CB650R",
        "cilindrada": 649,
        "tipoMantenimiento": "preventivo",
        "costoUSD": 110,
        "estado": "Completado"
      }
    ]
  }
  ```

### 4.3. Registrar nueva orden de servicio
- **Método:** `POST`
- **Ruta:** `http://localhost:3000/api/workshop/records`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "placa": "SUZ-600",
    "cliente": "Andrés Morales",
    "marca": "Suzuki",
    "modelo": "GSX-R600",
    "cilindrada": 599,
    "tipoMantenimiento": "preventivo",
    "costoUSD": 140
  }
  ```
- **Respuesta (201 Created):**
  ```json
  {
    "ok": true,
    "requestId": "f8a2...",
    "message": "Orden de servicio de motocicleta registrada con éxito",
    "data": {
      "id": 3,
      "placa": "SUZ-600",
      "cliente": "Andrés Morales",
      "marca": "Suzuki",
      "modelo": "GSX-R600",
      "cilindrada": 599,
      "tipoMantenimiento": "preventivo",
      "costoUSD": 140,
      "estado": "Registrado en Taller"
    }
  }
  ```

---

## 5. Estructura de la entrega

```text
intermedio/ejercicio-30/resoluciones/anderson-oloroso/
├── package.json
├── README.md
├── src/
│   ├── app.js
│   ├── controllers/
│   │   └── workshop.controller.js
│   ├── middlewares/
│   │   ├── errorHandler.middleware.js
│   │   ├── requestId.middleware.js
│   │   └── validator.middleware.js
│   ├── repositories/
│   │   └── workshop.repository.js
│   ├── routes/
│   │   └── workshop.routes.js
│   └── services/
│       └── workshop.service.js
└── tests/
    └── workshop.test.js
```
