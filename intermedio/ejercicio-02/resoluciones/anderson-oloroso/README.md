# Intermedio - Ejercicio 02: Routers Modulares
> **Autor:** Anderson Oloroso  
> **Temática:** Shooters competitivos  
> **Tema:** Routers modulares  

---

## 1. Descripción del ejercicio

Este ejercicio demuestra la organización y escalabilidad de una API REST en **Express** mediante **Routers Modulares**. 

En aplicaciones medianas y grandes, mantener todas las definiciones de rutas en un solo archivo genera acoplamiento y dificulta el mantenimiento. Mediante el uso de `express.Router()`, se separan las responsabilidades en módulos independientes y autocontenidos según el dominio o recurso:
- **`agents.routes.js`:** Enrutador dedicado a la gestión de agentes/operadores y sus roles competitivos.
- **`weapons.routes.js`:** Enrutador dedicado al catálogo y precios del arsenal de armas.
- **`matches.routes.js`:** Enrutador para el registro y consulta de partidas competitivas y K/D ratios.
- **`index.js`:** Enrutador principal que agrupa y monta todos los sub-routers bajo sus respectivos prefijos semánticos.

---

## 2. Requisitos técnicos

- Node.js 20 o superior.
- Express 4.19+ con soporte ESM (`"type": "module"`).

---

## 3. Instalación y ejecución

1. Ingresar a la carpeta del ejercicio:
   ```bash
   cd intermedio/ejercicio-02/resoluciones/anderson-oloroso
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar la aplicación:
   ```bash
   npm start
   ```

4. Iniciar en modo observador (desarrollo):
   ```bash
   npm run dev
   ```

---

## 4. Endpoints y ejemplos de uso

### 4.1. Endpoint de verificación del tema
- **Método:** `GET`
- **Ruta:** `http://localhost:3000/intermedio/ejercicio-02`
- **cURL:**
  ```bash
  curl -X GET http://localhost:3000/intermedio/ejercicio-02
  ```
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "message": "Ejercicio ejecutado correctamente",
    "topic": "routers modulares"
  }
  ```

### 4.2. Módulo de Agentes
- **Listar agentes (`GET /api/shooters/agents`):**
  ```json
  {
    "ok": true,
    "module": "Agentes / Operadores",
    "total": 4,
    "data": [
      { "id": 1, "name": "Jett", "role": "Duelist", "origin": "Corea del Sur", "difficulty": "Alta" }
    ]
  }
  ```
- **Crear agente (`POST /api/shooters/agents`):**
  ```bash
  curl -X POST http://localhost:3000/api/shooters/agents \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Reyna\",\"role\":\"Duelist\",\"origin\":\"México\",\"difficulty\":\"Media\"}"
  ```

### 4.3. Módulo de Armamento
- **Listar armas (`GET /api/shooters/weapons`):**
  ```json
  {
    "ok": true,
    "module": "Arsenal / Armamento",
    "total": 4,
    "data": [
      { "id": 1, "name": "Vandal", "category": "Rifle", "price": 2900, "headshotDamage": 160 }
    ]
  }
  ```

### 4.4. Módulo de Partidas Competitivas
- **Registrar partida (`POST /api/shooters/matches`):**
  ```bash
  curl -X POST http://localhost:3000/api/shooters/matches \
    -H "Content-Type: application/json" \
    -d "{\"map\":\"Bind\",\"agent\":\"Jett\",\"weapon\":\"Vandal\",\"kills\":26,\"deaths\":11}"
  ```
- **Respuesta (201 Created):**
  ```json
  {
    "ok": true,
    "message": "Partida registrada correctamente",
    "data": {
      "id": 2,
      "map": "Bind",
      "agent": "Jett",
      "weapon": "Vandal",
      "kills": 26,
      "deaths": 11,
      "kdRatio": 2.36,
      "result": "Victoria"
    }
  }
  ```

---

## 5. Estructura de la entrega

```text
intermedio/ejercicio-02/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── server.js
    ├── controllers/
    │   ├── agents.controller.js
    │   ├── matches.controller.js
    │   └── weapons.controller.js
    ├── routes/
    │   ├── index.js
    │   ├── agents.routes.js
    │   ├── matches.routes.js
    │   └── weapons.routes.js
    └── services/
        └── shooters.service.js
```
