# Intermedio - Ejercicio 29: Refactor de API
> **Autor:** Anderson Oloroso  
> **Temática:** Fútbol y fútbol sala  
> **Tema:** Refactor de API  

---

## 1. Descripción del ejercicio

Este ejercicio presenta la **Refactorización Integral de una API**, eliminando el antipatrón de "Controladores Monolíticos" (Smart Controllers) y migrando hacia un diseño guiado por el principio de **Responsabilidad Única (SRP)**.

### Mejoras aplicadas en el refactor:
1. **Extracción de Lógica de Dominio:** La validación de clubes idénticos y cálculo de modalidad se extrajo del controlador y se centralizó en `transfers.service.js`.
2. **Controlador Delgado (Thin Controller):** El controlador solo extrae parámetros, invoca al servicio y delega el código HTTP adecuado (`200 OK`, `201 Created`, `400 Bad Request`).
3. **Manejo Centralizado de Códigos de Estado:** Propagación de códigos de error enriquecidos (`err.statusCode`).

---

## 2. Requisitos técnicos

- Node.js 20 o superior.
- Express 4.19+ (`"type": "module"`).

---

## 3. Instalación y ejecución

```bash
cd intermedio/ejercicio-29/resoluciones/anderson-oloroso
npm install
npm start      # Modo producción
npm run dev    # Modo observador
```

---

## 4. Endpoints y ejemplos de uso

### 4.1. Endpoint de verificación del tema
- **Método:** `GET`
- **Ruta:** `http://localhost:3000/intermedio/ejercicio-29`
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "message": "Ejercicio ejecutado correctamente",
    "topic": "refactor de API"
  }
  ```

### 4.2. Listar fichajes y traspasos
- **Método:** `GET`
- **Ruta:** `http://localhost:3000/api/football/transfers`
- **Filtro opcional:** `?tipo=Futsal`
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "total": 3,
    "filtroTipo": "todos",
    "data": [
      {
        "id": 1,
        "jugador": "Kylian Mbappé",
        "origen": "PSG",
        "destino": "Real Madrid",
        "montoMillonesEUR": 0,
        "tipo": "Libre",
        "anio": 2024
      }
    ]
  }
  ```

### 4.3. Procesar nuevo fichaje
- **Método:** `POST`
- **Ruta:** `http://localhost:3000/api/football/transfers`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "jugador": "Pito",
    "origen": "FC Barcelona Futsal",
    "destino": "Sporting de Portugal",
    "montoMillonesEUR": 0.8,
    "modalidad": "futsal"
  }
  ```
- **Respuesta (201 Created):**
  ```json
  {
    "ok": true,
    "message": "Fichaje procesado y registrado por la federación",
    "data": {
      "id": 4,
      "jugador": "Pito",
      "origen": "FC Barcelona Futsal",
      "destino": "Sporting de Portugal",
      "montoMillonesEUR": 0.8,
      "tipo": "Traspaso Futsal"
    }
  }
  ```

---

## 5. Casos de error refactorizados

- **400 Bad Request:** Origen y destino idénticos:
  ```json
  {
    "ok": false,
    "message": "El club de origen y destino no pueden ser el mismo."
  }
  ```

---

## 6. Estructura de la entrega

```text
intermedio/ejercicio-29/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── controllers/
    │   └── transfers.controller.js
    ├── routes/
    │   └── transfers.routes.js
    └── services/
        └── transfers.service.js
```
