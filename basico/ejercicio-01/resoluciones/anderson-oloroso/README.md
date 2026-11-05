# Básico - Ejercicio 01: Node Runtime y Consola
> **Autor:** Anderson Oloroso  
> **Temática:** Videojuegos RPG  
> **Tema:** Node Runtime y Consola  

---

## Descripción del ejercicio

Solución backend construida con **Node.js** y **Express** que demuestra el funcionamiento del runtime de Node.js, inspección de procesos (`process.version`, `process.platform`, `process.pid`, `process.memoryUsage()`) y el uso de herramientas de consola como `console.table` y `console.log` para estructurar diagnósticos de personajes en un juego RPG.

Se implementa una arquitectura modular con separación de responsabilidades:
- **Rutas (`routes/`):** Definición de endpoints HTTP.
- **Controladores (`controllers/`):** Recepción de peticiones, extracción de datos y respuestas HTTP.
- **Servicios (`services/`):** Lógica de negocio (evaluación del estado del héroe y captura de métricas del runtime).

---

## Requisitos técnicos

- Node.js versión 20.x o superior.
- Gestor de paquetes `npm`.

---

## Instalación y ejecución

1. Ingresar al directorio del ejercicio:
   ```bash
   cd basico/ejercicio-01/resoluciones/anderson-oloroso
   ```

2. Instalar dependencias necesarias (`express`):
   ```bash
   npm install
   ```

3. Iniciar el servidor en producción:
   ```bash
   npm start
   ```

4. Iniciar en modo desarrollo con recarga automática:
   ```bash
   npm run dev
   ```

---

## Endpoints disponibles

### 1. Obtener estado del servicio e información del runtime
- **Método:** `GET`
- **Ruta:** `http://localhost:3000/basico/ejercicio-01` (o `http://localhost:3000/api/rpg`)
- **Descripción:** Retorna el mensaje esperado según el README base junto con métricas del runtime de Node.js.
- **Ejemplo con cURL:**
  ```bash
  curl -X GET http://localhost:3000/basico/ejercicio-01
  ```
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "message": "Ejercicio ejecutado correctamente",
    "topic": "Node runtime y consola",
    "runtime": {
      "nodeVersion": "v20.x.x",
      "platform": "win32",
      "architecture": "x64",
      "pid": 12345,
      "uptimeSeconds": 14,
      "memoryUsageMB": {
        "rss": "32.10",
        "heapTotal": "7.40",
        "heapUsed": "4.85"
      }
    }
  }
  ```

### 2. Evaluar estado de un héroe RPG
- **Método:** `POST`
- **Ruta:** `http://localhost:3000/basico/ejercicio-01` (o `http://localhost:3000/api/rpg`)
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "nombre": "Aragorn",
    "rol": "Guerrero",
    "hp": 25
  }
  ```
- **Ejemplo con cURL:**
  ```bash
  curl -X POST http://localhost:3000/basico/ejercicio-01 \
    -H "Content-Type: application/json" \
    -d "{\"nombre\":\"Aragorn\",\"rol\":\"Guerrero\",\"hp\":25}"
  ```
- **Respuesta Exitosa (200 OK):**
  ```json
  {
    "ok": true,
    "message": "Héroe evaluado satisfactoriamente",
    "data": {
      "nombre": "Aragorn",
      "rol": "Guerrero",
      "hp": 25,
      "estado": "Estado crítico"
    }
  }
  ```
  *Nota: En la terminal del servidor se imprime una tabla formateada con `console.table` mostrando el estado del personaje.*

---

## Casos de error y validación

### Error: Datos incompletos o tipo incorrecto
- **Petición con payload inválido:**
  ```bash
  curl -X POST http://localhost:3000/basico/ejercicio-01 \
    -H "Content-Type: application/json" \
    -d "{\"nombre\":\"Legolas\"}"
  ```
- **Respuesta de Error (400 Bad Request):**
  ```json
  {
    "ok": false,
    "message": "El rol o clase del héroe es requerido (Guerrero, Mago, Arquero, etc.)."
  }
  ```

---

## Estructura del proyecto

```text
basico/ejercicio-01/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── controllers/
    │   └── heroController.js
    ├── routes/
    │   └── heroRoute.js
    └── services/
        └── heroService.js
```
