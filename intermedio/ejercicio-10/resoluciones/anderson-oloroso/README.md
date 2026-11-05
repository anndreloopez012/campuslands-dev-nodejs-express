# Intermedio - Ejercicio 10: Ordenamiento de Resultados
> **Autor:** Anderson Oloroso  
> **Temática:** Pingpong / Tenis de mesa  
> **Tema:** Ordenamiento de resultados  

---

## 1. Descripción del ejercicio

Este ejercicio demuestra cómo implementar **Ordenamiento Dinámico y Seguro (Sorting)** en colecciones expuestas vía API REST mediante parámetros de consulta (`sortBy`, `order`).

### Buenas prácticas de ordenamiento aplicadas:
1. **Lista Blanca de Campos (Whitelist Validation):** Para evitar fallos o vulnerabilidades, solo se permite ordenar por campos explícitamente autorizados (`ranking`, `puntosElo`, `victorias`, `derrotas`, `nombre`, `pais`). Cualquier otro valor dispara un error `400 Bad Request`.
2. **Dirección Controlada (`asc` o `desc`):** Permite orden ascendente o descendente según la necesidad del cliente.
3. **Comparación Sensible al Tipo:** Utiliza comparación numérica para estadísticas (`puntosElo`, `victorias`, `ranking`) y `localeCompare` con soporte UTF-8 en español para cadenas alfabéticas (`nombre`, `pais`).

---

## 2. Requisitos técnicos

- Node.js 20 o superior.
- Express 4.19+ (`"type": "module"`).

---

## 3. Instalación y ejecución

1. Ingresar al directorio:
   ```bash
   cd intermedio/ejercicio-10/resoluciones/anderson-oloroso
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
- **Ruta:** `http://localhost:3000/intermedio/ejercicio-10`
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "message": "Ejercicio ejecutado correctamente",
    "topic": "ordenamiento de resultados"
  }
  ```

### 4.2. Ordenar por Puntos ELO descendente (Top Players)
- **Método:** `GET`
- **Ruta:** `http://localhost:3000/api/pingpong/players?sortBy=puntosElo&order=desc`
- **cURL:**
  ```bash
  curl -X GET "http://localhost:3000/api/pingpong/players?sortBy=puntosElo&order=desc"
  ```
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "ordenamiento": {
      "campo": "puntosElo",
      "direccion": "desc",
      "camposPermitidos": ["ranking", "puntosElo", "victorias", "derrotas", "nombre", "pais"]
    },
    "total": 6,
    "data": [
      {
        "id": 1,
        "ranking": 1,
        "nombre": "Wang Chuqin",
        "pais": "China",
        "puntosElo": 7925,
        "victorias": 142
      },
      {
        "id": 2,
        "ranking": 2,
        "nombre": "Fan Zhendong",
        "pais": "China",
        "puntosElo": 7450,
        "victorias": 185
      }
    ]
  }
  ```

### 4.3. Ordenar alfabéticamente por Nombre (Ascendente)
- **Método:** `GET`
- **Ruta:** `http://localhost:3000/api/pingpong/players?sortBy=nombre&order=asc`

---

## 5. Casos de error

- **400 Bad Request:** Campo de ordenamiento no permitido en la whitelist:
  ```json
  {
    "ok": false,
    "message": "Campo de ordenamiento 'colorFavorito' no permitido. Campos válidos: ranking, puntosElo, victorias, derrotas, nombre, pais"
  }
  ```
- **400 Bad Request:** Dirección de orden inválida:
  ```json
  {
    "ok": false,
    "message": "El parámetro order debe ser exclusivamente \"asc\" o \"desc\"."
  }
  ```

---

## 6. Estructura de la entrega

```text
intermedio/ejercicio-10/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── server.js
    ├── controllers/
    │   └── pingpong.controller.js
    ├── routes/
    │   └── pingpong.routes.js
    └── services/
        └── pingpong.service.js
```
