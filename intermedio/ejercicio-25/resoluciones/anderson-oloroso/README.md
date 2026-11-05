# Intermedio - Ejercicio 25: Testing de Rutas
> **Autor:** Anderson Oloroso  
> **Temática:** Videojuegos RPG  
> **Tema:** Testing de rutas  

---

## 1. Descripción del ejercicio

Este ejercicio demuestra la realización de **pruebas de integración sobre rutas HTTP de Express** utilizando el test runner nativo de Node.js (`node:test`) y aserciones estrictas (`node:assert/strict`).

Se levanta un servidor temporal sobre un puerto dinámico (`app.listen(0)`) durante la fase `test.before` y se cierra en `test.after`, probando endpoints reales mediante la API global `fetch`:
- Prueba del endpoint base de verificación de ejercicio.
- Prueba del caso exitoso de listado de recursos (`GET /api/rpg/dungeons`).
- Prueba de creación de recurso (`POST /api/rpg/dungeons`).
- Prueba del caso de error por payload incompleto (`400 Bad Request`).

---

## 2. Requisitos técnicos

- Node.js 20 o superior.
- Express 4.19+ (`"type": "module"`).
- Test runner nativo de Node.js (`node --test`).

---

## 3. Instalación y ejecución

1. Ingresar a la carpeta:
   ```bash
   cd intermedio/ejercicio-25/resoluciones/anderson-oloroso
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar el servidor:
   ```bash
   npm start
   ```

4. Ejecutar la suite de tests automatizados de rutas:
   ```bash
   npm test
   ```

---

## 4. Endpoints y ejemplos de uso

### 4.1. Endpoint de verificación del tema
- **Método:** `GET`
- **Ruta:** `http://localhost:3000/intermedio/ejercicio-25`
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "message": "Ejercicio ejecutado correctamente",
    "topic": "testing de rutas"
  }
  ```

### 4.2. Listar mazmorras RPG
- **Método:** `GET`
- **Ruta:** `http://localhost:3000/api/rpg/dungeons`
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "total": 2,
    "data": [
      { "id": 1, "nombre": "Cueva de los Trasgos", "nivelRecomendado": 5, "dificultad": "Baja" },
      { "id": 2, "nombre": "Fortaleza del Dragón Negro", "nivelRecomendado": 45, "dificultad": "Legendaria" }
    ]
  }
  ```

### 4.3. Crear mazmorra
- **Método:** `POST`
- **Ruta:** `http://localhost:3000/api/rpg/dungeons`
- **Body:**
  ```json
  {
    "nombre": "Torre de las Sombras",
    "nivelRecomendado": 30
  }
  ```
- **Respuesta (201 Created):**
  ```json
  {
    "ok": true,
    "message": "Mazmorra creada exitosamente",
    "data": {
      "id": 3,
      "nombre": "Torre de las Sombras",
      "nivelRecomendado": 30
    }
  }
  ```

---

## 5. Estructura de la entrega

```text
intermedio/ejercicio-25/resoluciones/anderson-oloroso/
├── package.json
├── README.md
├── src/
│   └── app.js
└── tests/
    └── routes.test.js
```
