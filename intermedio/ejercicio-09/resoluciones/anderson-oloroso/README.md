# Intermedio - Ejercicio 09: Paginación y Filtros
> **Autor:** Anderson Oloroso  
> **Temática:** Kickboxing  
> **Tema:** Paginación y filtros  

---

## 1. Descripción del ejercicio

Este ejercicio implementa un patrón robusto de **Paginación y Filtrado Dinámico** a través de Query Parameters (`req.query`) en una API REST de Express.

### Características implementadas:
1. **Control de Paginación (`page`, `limit`):**
   - Validación de límites (máximo 20 elementos por página para prevenir agotamiento de memoria).
   - Cálculo automático de `totalPages`, `hasNextPage` y `hasPrevPage`.
   - Manejo de índices con corte dinámico `slice(startIndex, startIndex + limit)`.
2. **Filtros Combinados:**
   - `division`: Filtro exacto o insensible a mayúsculas por categoría de peso (`Peso Pesado`, `Peso Welter`, `Peso Ligero`, `Peso Pluma`).
   - `minKos`: Filtro numérico que selecciona luchadores con igual o mayor número de nocauts.
   - `status`: Filtro por estado competitivo (`Activo`, `Retirado`).

---

## 2. Requisitos técnicos

- Node.js 20 o superior.
- Express 4.19+ (`"type": "module"`).

---

## 3. Instalación y ejecución

1. Ingresar al directorio:
   ```bash
   cd intermedio/ejercicio-09/resoluciones/anderson-oloroso
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar el servidor:
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
- **Ruta:** `http://localhost:3000/intermedio/ejercicio-09`
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "message": "Ejercicio ejecutado correctamente",
    "topic": "paginacion y filtros"
  }
  ```

### 4.2. Paginación estándar (Página 1, Límite 3)
- **Método:** `GET`
- **Ruta:** `http://localhost:3000/api/kickboxing/fighters?page=1&limit=3`
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "pagination": {
      "totalRecords": 8,
      "page": 1,
      "limit": 3,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "appliedFilters": {
      "division": null,
      "minKos": null,
      "status": null
    },
    "data": [
      { "id": 1, "nombre": "Rico Verhoeven", "division": "Peso Pesado", "victorias": 64, "kos": 20, "status": "Activo" },
      { "id": 2, "nombre": "Badr Hari", "division": "Peso Pesado", "victorias": 106, "kos": 92, "status": "Retirado" },
      { "id": 3, "nombre": "Giorgio Petrosyan", "division": "Peso Welter", "victorias": 105, "kos": 42, "status": "Activo" }
    ]
  }
  ```

### 4.3. Filtro por División y Mínimo de KOs
- **Petición:** `GET http://localhost:3000/api/kickboxing/fighters?division=Peso%20Pesado&minKos=15`
- **cURL:**
  ```bash
  curl -X GET "http://localhost:3000/api/kickboxing/fighters?division=Peso%20Pesado&minKos=15"
  ```
- **Respuesta:**
  ```json
  {
    "ok": true,
    "pagination": {
      "totalRecords": 2,
      "page": 1,
      "limit": 3,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    },
    "appliedFilters": {
      "division": "Peso Pesado",
      "minKos": 15,
      "status": null
    },
    "data": [
      { "id": 1, "nombre": "Rico Verhoeven", "kos": 20 },
      { "id": 2, "nombre": "Badr Hari", "kos": 92 }
    ]
  }
  ```

---

## 5. Casos de error y validación de parámetros

- **400 Bad Request:** Parámetro `page` inválido (ej: `?page=cero` o `?page=-2`):
  ```json
  {
    "ok": false,
    "message": "El parámetro page debe ser un número entero mayor o igual a 1."
  }
  ```

---

## 6. Estructura de la entrega

```text
intermedio/ejercicio-09/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── server.js
    ├── controllers/
    │   └── fighters.controller.js
    ├── routes/
    │   └── fighters.routes.js
    └── services/
        └── fighters.service.js
```
