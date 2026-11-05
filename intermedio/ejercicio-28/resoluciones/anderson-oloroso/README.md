# Intermedio - Ejercicio 28: Colección de Ejemplos HTTP
> **Autor:** Anderson Oloroso  
> **Temática:** Battle Royale  
> **Tema:** Colección de ejemplos HTTP  

---

## 1. Descripción del ejercicio

Este ejercicio demuestra la documentación viva y reproducible de una API REST mediante un archivo de colección HTTP estándar (`requests.http`), compatible de forma nativa con extensiones como **REST Client** de VS Code, **Thunder Client** y herramientas basadas en texto.

### Ventajas del formato `.http`:
- Permite a los desarrolladores y evaluadores disparar peticiones con un solo clic.
- Versionable en Git sin binarios propietarios.
- Define variables de entorno dinámicas (`@baseUrl = http://localhost:3000`).
- Cubre casos exitosos y casos de fallo (400, 404).

---

## 2. Requisitos técnicos

- Node.js 20 o superior.
- Express 4.19+ (`"type": "module"`).
- Opcional: Extensión REST Client en VS Code.

---

## 3. Instalación y ejecución

```bash
cd intermedio/ejercicio-28/resoluciones/anderson-oloroso
npm install
npm start      # Iniciar API
```

Para probar: abrir `requests.http` y ejecutar las peticiones con el botón "Send Request" o mediante cURL.

---

## 4. Endpoints y ejemplos de uso

### 4.1. Endpoint de verificación del tema
- **Método:** `GET`
- **Ruta:** `http://localhost:3000/intermedio/ejercicio-28`
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "message": "Ejercicio ejecutado correctamente",
    "topic": "coleccion de ejemplos HTTP",
    "collectionFile": "requests.http"
  }
  ```

### 4.2. Listar zonas de botín
- **Método:** `GET`
- **Ruta:** `http://localhost:3000/api/br/loot-zones`
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "total": 3,
    "data": [
      { "id": 1, "nombre": "Base Militar Sosnovka", "nivelPeligro": "Extremo", "calidadLoot": "Nivel Militar 3" }
    ]
  }
  ```

### 4.3. Registrar equipamiento de jugador
- **Método:** `POST`
- **Ruta:** `http://localhost:3000/api/br/loadout`
- **Body:**
  ```json
  {
    "playerName": "OlorosoSniper",
    "armaPrincipal": "M416",
    "armaSecundaria": "Kar98k",
    "nivelCasco": 3,
    "nivelChaleco": 2
  }
  ```

---

## 5. Estructura de la entrega

```text
intermedio/ejercicio-28/resoluciones/anderson-oloroso/
├── package.json
├── requests.http
├── README.md
└── src/
    ├── app.js
    ├── controllers/
    │   └── brCollection.controller.js
    └── routes/
        └── brCollection.routes.js
```
