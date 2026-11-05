# Básico - Ejercicio 22: Servicios Simples
> **Autor:** Anderson Oloroso  
> **Temática:** Arquitectura 3D  
> **Tema:** Servicios simples  

---

## 1. Descripción del ejercicio

Este ejercicio demuestra la separación de la lógica de cálculo y presupuesto en un servicio dedicado (`materiales.service.js`) desacoplado de las capas HTTP de Express.

El servicio calcula presupuestos volumétricos para proyectos de arquitectura 3D según las dimensiones ingresadas (largo, ancho, alto) y el material de construcción seleccionado (`concreto`, `acero`, `madera`, `vidrio`, `aluminio`).

---

## 2. Instalación y ejecución

```bash
cd basico/ejercicio-22/resoluciones/anderson-oloroso
npm install
npm start      # Modo producción
npm run dev    # Modo desarrollo con recarga automática
```

---

## 3. Endpoints disponibles

### 3.1. Endpoint de verificación del tema
- **Método:** `GET`
- **Ruta:** `http://localhost:3000/basico/ejercicio-22`
- **Respuesta:**
  ```json
  {
    "ok": true,
    "message": "Ejercicio ejecutado correctamente",
    "topic": "servicios simples"
  }
  ```

### 3.2. Listar catálogo de materiales
- **Método:** `GET`
- **Ruta:** `http://localhost:3000/api/arq3d/materials`
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "data": [
      { "material": "concreto", "precioPorM3": 85 },
      { "material": "acero", "precioPorM3": 320 },
      { "material": "vidrio", "precioPorM3": 120 }
    ]
  }
  ```

### 3.3. Calcular presupuesto volumétrico
- **Método:** `POST`
- **Ruta:** `http://localhost:3000/api/arq3d/budget`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "largo": 10,
    "ancho": 5,
    "alto": 3,
    "material": "concreto"
  }
  ```
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "data": {
      "largo": 10,
      "ancho": 5,
      "alto": 3,
      "material": "concreto",
      "volumenM3": 150,
      "precioPorM3": 85,
      "costoTotalUSD": 12750
    }
  }
  ```

---

## 4. Estructura de la entrega

```text
basico/ejercicio-22/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── controllers/
    │   └── arq.controller.js
    ├── routes/
    │   └── arq.routes.js
    └── services/
        └── materiales.service.js
```
