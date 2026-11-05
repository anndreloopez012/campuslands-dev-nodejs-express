# Intermedio - Ejercicio 03: Controladores Limpios
> **Autor:** Anderson Oloroso  
> **Temática:** MOBA esports  
> **Tema:** Controladores limpios  

---

## 1. Descripción del ejercicio

Este ejercicio aborda las mejores prácticas para mantener **Controladores Limpios** (Clean Controllers) dentro de Express. 

### Principios de Controladores Limpios aplicados:
1. **Responsabilidad Única:** El controlador solo atiende el protocolo HTTP (extraer headers, query, params, body y emitir la respuesta adecuada).
2. **Cero Lógica de Negocio:** No se realizan cálculos matemáticos, transformaciones complejas ni validaciones de dominio complejas dentro del controlador; toda esa lógica se delega al servicio correspondiente.
3. **Manejo uniforme de errores:** Respeta los códigos de estado semánticos (`200 OK`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`).

---

## 2. Requisitos técnicos

- Node.js 20 o superior.
- Express 4.19+ (ECMAScript Modules `"type": "module"`).

---

## 3. Instalación y ejecución

1. Ir a la carpeta:
   ```bash
   cd intermedio/ejercicio-03/resoluciones/anderson-oloroso
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar servidor:
   ```bash
   npm start
   ```

4. Modo desarrollo:
   ```bash
   npm run dev
   ```

---

## 4. Endpoints y ejemplos de uso

### 4.1. Endpoint de verificación del tema
- **Método:** `GET`
- **Ruta:** `http://localhost:3000/intermedio/ejercicio-03`
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "message": "Ejercicio ejecutado correctamente",
    "topic": "controladores limpios"
  }
  ```

### 4.2. Listar equipos profesionales
- **Método:** `GET`
- **Ruta:** `http://localhost:3000/api/moba/teams`
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "total": 4,
    "data": [
      { "id": 1, "name": "T1", "region": "LCK", "titles": 4, "coach": "KkOma" }
    ]
  }
  ```

### 4.3. Listar catálogo de campeones
- **Método:** `GET`
- **Ruta:** `http://localhost:3000/api/moba/champions`

### 4.4. Evaluar sinergia y balance de un Draft
- **Método:** `POST`
- **Ruta:** `http://localhost:3000/api/moba/drafts`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "teamName": "T1 Esports",
    "picks": ["Aatrox", "Sejuani", "Orianna", "Jinx", "Thresh"]
  }
  ```
- **cURL:**
  ```bash
  curl -X POST http://localhost:3000/api/moba/drafts \
    -H "Content-Type: application/json" \
    -d "{\"teamName\":\"T1 Esports\",\"picks\":[\"Aatrox\",\"Sejuani\",\"Orianna\",\"Jinx\",\"Thresh\"]}"
  ```
- **Respuesta Exitosa (200 OK):**
  ```json
  {
    "ok": true,
    "message": "Draft analizado exitosamente por el motor táctico",
    "data": {
      "equipo": "T1 Esports",
      "sinergia": "100/100",
      "rolesCompletos": true,
      "balanceDano": "Equilibrado",
      "recomendacionTactico": "Composición balanceada lista para torneo"
    }
  }
  ```

---

## 5. Casos de error

- **400 Bad Request:** Menos o más de 5 picks:
  ```json
  {
    "ok": false,
    "message": "Un draft competitivo debe contener exactamente 5 campeones seleccionados."
  }
  ```
- **404 Not Found:** Campeón inexistente en el roster:
  ```json
  {
    "ok": false,
    "message": "El campeón 'HeroInexistente' no existe en el metagame actual."
  }
  ```

---

## 6. Estructura de la entrega

```text
intermedio/ejercicio-03/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── server.js
    ├── controllers/
    │   └── moba.controller.js
    ├── routes/
    │   └── moba.routes.js
    └── services/
        └── moba.service.js
```
