# Básico - Ejercicio 29: README Técnico
> **Autor:** Anderson Oloroso | **Temática:** Fútbol y fútbol sala | **Tema:** README técnico

---

## 1. Visión general del servicio
Microservicio backend diseñado con **Express** para la gestión en tiempo real de la tabla de posiciones y registro de clubes en torneos de **Fútbol 11** y **Fútbol Sala (Futsal)**.

## 2. Requisitos de entorno
- **Node.js**: v20.x o superior.
- **npm**: v10.x o superior.
- **Protocolo**: HTTP/1.1 REST JSON.

## 3. Instalación rápida
```bash
cd basico/ejercicio-29/resoluciones/anderson-oloroso
npm install
```

## 4. Scripts de ejecución
- `npm start`: Inicia el servidor en modo producción en el puerto `3000`.
- `npm run dev`: Inicia el servidor con reinicio automático ante cambios en el código (`node --watch`).

## 5. Especificación de Endpoints

### 5.1. Verificación del Tema
- **Ruta:** `GET /basico/ejercicio-29`
- **Código:** `200 OK`
- **Respuesta:**
  ```json
  {
    "ok": true,
    "message": "Ejercicio ejecutado correctamente",
    "topic": "README tecnico"
  }
  ```

### 5.2. Tabla de posiciones
- **Ruta:** `GET /api/football/standings`
- **Código:** `200 OK`
- **Respuesta:**
  ```json
  {
    "ok": true,
    "total": 3,
    "data": [
      { "id": 1, "club": "Campus F.C.", "modalidad": "Fútbol 11", "pj": 10, "pts": 25 }
    ]
  }
  ```

### 5.3. Registrar club en el torneo
- **Ruta:** `POST /api/football/standings`
- **Headers:** `Content-Type: application/json`
- **Cuerpo esperado:**
  ```json
  {
    "club": "Inter Bucaramanga FS",
    "modalidad": "Futsal"
  }
  ```
- **Código:** `201 Created`

## 6. Arquitectura del proyecto
```text
basico/ejercicio-29/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── controllers/
    │   └── league.controller.js
    ├── routes/
    │   └── league.routes.js
    └── services/
        └── league.service.js
```
