# Intermedio - Ejercicio 04: Servicios Reutilizables
> **Autor:** Anderson Oloroso  
> **Temática:** Battle Royale  
> **Tema:** Servicios reutilizables  

---

## 1. Descripción del ejercicio

Este ejercicio demuestra la creación y desacoplamiento de **Servicios Reutilizables** en el backend. 

### Principios aplicados:
- **Agnósticos del Framework:** Los servicios (`storm.service.js` y `airdrop.service.js`) no dependen de `express`, ni conocen la existencia de `req` o `res`.
- **Funciones puras y testeables:** Reciben parámetros primitivos o estructuras sencillas y retornan resultados predecibles o lanzan excepciones controladas.
- **Portabilidad:** Pueden reutilizarse fácilmente en scripts de consola (CLI), workers de fondo o microservicios sin reescribir la lógica del dominio.

---

## 2. Requisitos técnicos

- Node.js 20 o superior.
- Express 4.19+ (`"type": "module"`).

---

## 3. Instalación y ejecución

1. Ingresar al directorio:
   ```bash
   cd intermedio/ejercicio-04/resoluciones/anderson-oloroso
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
- **Ruta:** `http://localhost:3000/intermedio/ejercicio-04`
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "message": "Ejercicio ejecutado correctamente",
    "topic": "servicios reutilizables"
  }
  ```

### 4.2. Consultar fases de la tormenta
- **Método:** `GET`
- **Ruta:** `http://localhost:3000/api/br/storm-phases`
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "total": 6,
    "data": [
      { "fase": 1, "danoPorSegundo": 1, "radioMetros": 2000, "tiempoCierreSegundos": 180 },
      { "fase": 2, "danoPorSegundo": 2, "radioMetros": 1400, "tiempoCierreSegundos": 150 }
    ]
  }
  ```

### 4.3. Calcular daño y supervivencia en la tormenta
- **Método:** `POST`
- **Ruta:** `http://localhost:3000/api/br/calculate-damage`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "fase": 4,
    "tiempoSegundos": 8,
    "hpActual": 100
  }
  ```
- **cURL:**
  ```bash
  curl -X POST http://localhost:3000/api/br/calculate-damage \
    -H "Content-Type: application/json" \
    -d "{\"fase\":4,\"tiempoSegundos\":8,\"hpActual\":100}"
  ```
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "message": "Cálculo de daño de tormenta realizado con éxito",
    "data": {
      "fase": 4,
      "danoPorSegundo": 7,
      "tiempoExpuestoSegundos": 8,
      "danoRecibido": 56,
      "hpInicial": 100,
      "hpRestante": 44,
      "sobrevive": true,
      "estado": "Superviviente"
    }
  }
  ```

### 4.4. Solicitar Airdrop en coordenadas
- **Método:** `POST`
- **Ruta:** `http://localhost:3000/api/br/airdrop`
- **Body:**
  ```json
  {
    "x": 1420.5,
    "y": 890.3
  }
  ```
- **Respuesta (201 Created):**
  ```json
  {
    "ok": true,
    "message": "Suministro aéreo lanzado en coordenadas solicitadas",
    "data": {
      "idCaja": "DROP-5821",
      "ubicacion": { "x": 1420.5, "y": 890.3 },
      "humo": "Rojo bengala activo",
      "botin": {
        "armaMitica": "AWM Sniper .300 Magnum",
        "armadura": "Casco Nivel 3 (Spetsnaz)",
        "suministroMedico": "Kit de Primeros Auxilios"
      }
    }
  }
  ```

---

## 5. Casos de error

- **400 Bad Request:** Fase inválida o daño fuera de rango:
  ```json
  {
    "ok": false,
    "message": "La fase de la tormenta debe estar entre 1 y 6."
  }
  ```

---

## 6. Estructura de la entrega

```text
intermedio/ejercicio-04/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── server.js
    ├── controllers/
    │   └── battleroyale.controller.js
    ├── routes/
    │   └── battleroyale.routes.js
    └── services/
        ├── airdrop.service.js
        └── storm.service.js
```
