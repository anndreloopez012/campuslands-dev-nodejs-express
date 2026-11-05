# Intermedio - Ejercicio 27: Documentación de Endpoints
> **Autor:** Anderson Oloroso  
> **Temática:** MOBA esports  
> **Tema:** Documentación de endpoints  

---

## 1. Descripción del ejercicio

Este ejercicio aborda la **Documentación Estandarizada de Endpoints** mediante especificación **OpenAPI 3.0** servida directamente a través de la API en el endpoint `/api/docs`.

### Aspectos clave:
- Contrato estandarizado OpenAPI v3 en `src/docs/openapi.json`.
- Endpoint dedicado `GET /api/docs` que expone esquemas, rutas, códigos de estado HTTP y ejemplos de payloads.
- Integración con herramientas como Swagger UI, Postman o Insomnia mediante importación directa de la especificación.

---

## 2. Requisitos técnicos

- Node.js 20 o superior.
- Express 4.19+ (`"type": "module"`).

---

## 3. Instalación y ejecución

```bash
cd intermedio/ejercicio-27/resoluciones/anderson-oloroso
npm install
npm start      # Iniciar API
npm run dev    # Modo observador
```

---

## 4. Endpoints y ejemplos de uso

### 4.1. Endpoint de verificación del tema
- **Método:** `GET`
- **Ruta:** `http://localhost:3000/intermedio/ejercicio-27`
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "message": "Ejercicio ejecutado correctamente",
    "topic": "documentacion de endpoints",
    "docsEndpoint": "/api/docs"
  }
  ```

### 4.2. Consultar especificación OpenAPI
- **Método:** `GET`
- **Ruta:** `http://localhost:3000/api/docs`
- **Respuesta (200 OK):** JSON completo OpenAPI v3 con todas las definiciones de endpoints.

### 4.3. Listar torneos MOBA
- **Método:** `GET`
- **Ruta:** `http://localhost:3000/api/moba/tournaments`
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "total": 3,
    "data": [
      { "id": 1, "nombre": "Worlds Championship 2026", "region": "Internacional", "premioUSD": 2225000 }
    ]
  }
  ```

---

## 5. Estructura de la entrega

```text
intermedio/ejercicio-27/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── controllers/
    │   └── mobaDocs.controller.js
    ├── docs/
    │   └── openapi.json
    └── routes/
        └── mobaDocs.routes.js
```
