# Intermedio - Ejercicio 01: Arquitectura por Capas
> **Autor:** Anderson Oloroso  
> **Temática:** Videojuegos RPG  
> **Tema:** Arquitectura por capas  

---

## 1. Descripción del ejercicio

Este ejercicio implementa una API REST modular en **Node.js** con **Express** aplicando el patrón de **Arquitectura por Capas** (Layered Architecture). La solución desacopla de forma estricta las responsabilidades de cada componente del sistema:

- **Capa de Enrutamiento (`routes/`):** Define los endpoints, métodos HTTP y asocia cada ruta a su controlador correspondiente.
- **Capa de Controladores (`controllers/`):** Gestiona la capa HTTP: procesa la petición (`req`), valida de forma preliminar las entradas, invoca la lógica de negocio y envía la respuesta HTTP (`res`) con los códigos de estado apropiados.
- **Capa de Servicios (`services/`):** Contiene las reglas del dominio y la lógica de negocio (cálculo de atributos, fórmulas de poder de combate según la clase del personaje y validación de reglas RPG).
- **Capa de Datos (`data/`):** Representa el modelo y almacén de datos en memoria para la persistencia transaccional del servicio.

---

## 2. Requisitos técnicos

- Node.js 20 o superior.
- Express 4.19+ (estándar ECMAScript Modules `type: module`).

---

## 3. Instalación y ejecución

1. Dirígete a la carpeta de la entrega:
   ```bash
   cd intermedio/ejercicio-01/resoluciones/anderson-oloroso
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia la aplicación en producción:
   ```bash
   npm start
   ```

4. Inicia en modo desarrollo con recarga en caliente:
   ```bash
   npm run dev
   ```

---

## 4. Endpoints y ejemplos de uso

### 4.1. Endpoint de verificación (Requerido por el README base)
- **Método:** `GET`
- **Ruta:** `http://localhost:3000/intermedio/ejercicio-01`
- **cURL:**
  ```bash
  curl -X GET http://localhost:3000/intermedio/ejercicio-01
  ```
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "message": "Ejercicio ejecutado correctamente",
    "topic": "arquitectura por capas"
  }
  ```

### 4.2. Listar personajes RPG
- **Método:** `GET`
- **Ruta:** `http://localhost:3000/api/rpg/characters`
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "total": 3,
    "data": [
      {
        "id": 1,
        "nombre": "Aric Sombracerada",
        "clase": "Guerrero",
        "nivel": 12,
        "hp": 450,
        "mp": 80,
        "fuerza": 45,
        "agilidad": 20,
        "inteligencia": 10,
        "poderCombate": 185
      }
    ]
  }
  ```

### 4.3. Obtener personaje por ID
- **Método:** `GET`
- **Ruta:** `http://localhost:3000/api/rpg/characters/1`
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "data": {
      "id": 1,
      "nombre": "Aric Sombracerada",
      "clase": "Guerrero",
      "nivel": 12,
      "hp": 450,
      "mp": 80,
      "fuerza": 45,
      "agilidad": 20,
      "inteligencia": 10,
      "poderCombate": 185
    }
  }
  ```

### 4.4. Crear nuevo personaje RPG
- **Método:** `POST`
- **Ruta:** `http://localhost:3000/api/rpg/characters`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "nombre": "Sylas Cazador",
    "clase": "Arquero",
    "nivel": 5,
    "fuerza": 15,
    "agilidad": 35,
    "inteligencia": 12
  }
  ```
- **cURL:**
  ```bash
  curl -X POST http://localhost:3000/api/rpg/characters \
    -H "Content-Type: application/json" \
    -d "{\"nombre\":\"Sylas Cazador\",\"clase\":\"Arquero\",\"nivel\":5,\"fuerza\":15,\"agilidad\":35,\"inteligencia\":12}"
  ```
- **Respuesta (201 Created):**
  ```json
  {
    "ok": true,
    "message": "Personaje RPG creado exitosamente",
    "data": {
      "id": 4,
      "nombre": "Sylas Cazador",
      "clase": "Arquero",
      "nivel": 5,
      "hp": 375,
      "mp": 271,
      "fuerza": 15,
      "agilidad": 35,
      "inteligencia": 12,
      "poderCombate": 141
    }
  }
  ```

---

## 5. Casos de error controlados

- **400 Bad Request:** Clase inválida o campos requeridos faltantes:
  ```json
  {
    "ok": false,
    "message": "Clase inválida. Las clases permitidas son: Guerrero, Mago, Arquero, Clerigo."
  }
  ```
- **404 Not Found:** ID de personaje inexistente:
  ```json
  {
    "ok": false,
    "message": "Personaje con ID 999 no encontrado en el reino."
  }
  ```

---

## 6. Estructura de carpetas

```text
intermedio/ejercicio-01/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── server.js
    ├── controllers/
    │   └── character.controller.js
    ├── data/
    │   └── character.data.js
    ├── routes/
    │   └── character.routes.js
    └── services/
        └── character.service.js
```
