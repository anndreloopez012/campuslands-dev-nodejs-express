# Intermedio - Ejercicio 05: Repositorios en Memoria
> **Autor:** Anderson Oloroso  
> **Temática:** Fútbol y fútbol sala  
> **Tema:** Repositorios en memoria  

---

## 1. Descripción del ejercicio

Este ejercicio introduce el **Patrón Repositorio (Repository Pattern)** con persistencia en memoria estructurada mediante `Map`. 

### Beneficios arquitectónicos del patrón:
- **Aislamiento de Persistencia:** Los servicios no interactúan directamente con estructuras globales sin orden, sino que invocan una interfaz limpia (`findAll`, `findById`, `create`, `update`, `delete`).
- **Facilidad de migración:** Si en el futuro se sustituye la memoria volátil por bases de datos relacionales (PostgreSQL) o NoSQL (MongoDB), la capa de servicio y los controladores permanecen intactos.
- **Operaciones atómicas y encapsulación:** Los identificadores autoincrementales y búsquedas se gestionan de manera centralizada.

---

## 2. Requisitos técnicos

- Node.js 20 o superior.
- Express 4.19+ (`"type": "module"`).

---

## 3. Instalación y ejecución

1. Ingresar a la carpeta:
   ```bash
   cd intermedio/ejercicio-05/resoluciones/anderson-oloroso
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar la aplicación:
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
- **Ruta:** `http://localhost:3000/intermedio/ejercicio-05`
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "message": "Ejercicio ejecutado correctamente",
    "topic": "repositorios en memoria"
  }
  ```

### 4.2. Listar equipos (con filtro opcional por modalidad)
- **Método:** `GET`
- **Ruta:** `http://localhost:3000/api/football/teams?modality=Futsal`
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "total": 2,
    "filtroModalidad": "Futsal",
    "data": [
      {
        "id": 2,
        "nombre": "Movistar Inter FS",
        "modalidad": "Futsal",
        "estadio": "Pabellón Jorge Garbajosa",
        "titulosLiga": 14,
        "jugadoresRegistrados": 14
      }
    ]
  }
  ```

### 4.3. Crear nuevo equipo en el repositorio
- **Método:** `POST`
- **Ruta:** `http://localhost:3000/api/football/teams`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "nombre": "ElPozo Murcia FS",
    "modalidad": "Futsal",
    "estadio": "Palacio de los Deportes de Murcia",
    "titulosLiga": 5,
    "jugadoresRegistrados": 14
  }
  ```
- **cURL:**
  ```bash
  curl -X POST http://localhost:3000/api/football/teams \
    -H "Content-Type: application/json" \
    -d "{\"nombre\":\"ElPozo Murcia FS\",\"modalidad\":\"Futsal\",\"estadio\":\"Palacio de los Deportes de Murcia\",\"titulosLiga\":5,\"jugadoresRegistrados\":14}"
  ```
- **Respuesta (201 Created):**
  ```json
  {
    "ok": true,
    "message": "Club registrado en el repositorio con éxito",
    "data": {
      "id": 4,
      "nombre": "ElPozo Murcia FS",
      "modalidad": "Futsal",
      "estadio": "Palacio de los Deportes de Murcia",
      "titulosLiga": 5,
      "jugadoresRegistrados": 14
    }
  }
  ```

### 4.4. Eliminar equipo por ID
- **Método:** `DELETE`
- **Ruta:** `http://localhost:3000/api/football/teams/4`
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "message": "Equipo con ID 4 eliminado del repositorio en memoria"
  }
  ```

---

## 5. Casos de error

- **400 Bad Request:** Modalidad no permitida (solo Fútbol 11 o Futsal):
  ```json
  {
    "ok": false,
    "message": "Modalidad inválida. Debe ser \"Fútbol 11\" o \"Futsal\"."
  }
  ```
- **404 Not Found:** ID inexistente al buscar o modificar:
  ```json
  {
    "ok": false,
    "message": "Equipo con ID 99 no encontrado en la federación."
  }
  ```

---

## 6. Estructura de la entrega

```text
intermedio/ejercicio-05/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── server.js
    ├── controllers/
    │   └── team.controller.js
    ├── repositories/
    │   └── team.repository.js
    ├── routes/
    │   └── team.routes.js
    └── services/
        └── team.service.js
```
