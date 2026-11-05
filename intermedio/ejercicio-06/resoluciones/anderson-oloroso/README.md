# Intermedio - Ejercicio 06: Validación Centralizada
> **Autor:** Anderson Oloroso  
> **Temática:** Motos y mecánica  
> **Tema:** Validación centralizada  

---

## 1. Descripción del ejercicio

Este ejercicio demuestra cómo implementar **Validación Centralizada** mediante middlewares dedicados en Express. 

En lugar de contaminar los controladores con múltiples condiciones `if (!campo) return res.status(400)...`, se delega la verificación al middleware `validateOrderPayload`. Este middleware intercepta la petición, valida la presencia, tipo, rango y formato de cada campo según las reglas de negocio, y solo permite que la ejecución continúe (`next()`) si la información es 100% válida.

### Validación de Órdenes de Taller Mecánico:
- **`cliente`:** Texto de al menos 3 caracteres.
- **`placa`:** Alfanumérico de 3 a 7 caracteres (ej: `HON-45X`).
- **`marca` y `modelo`:** Cadenas obligatorias.
- **`cilindrada`:** Valor numérico entre 50 y 2500 cc.
- **`kilometraje`:** Valor numérico mayor o igual a 0.
- **`tipoServicio`:** Enum de servicios permitidos (`preventivo`, `correctivo`, `afinacion`, `frenos`, `suspension`).

---

## 2. Requisitos técnicos

- Node.js 20 o superior.
- Express 4.19+ (`"type": "module"`).

---

## 3. Instalación y ejecución

1. Ir a la carpeta:
   ```bash
   cd intermedio/ejercicio-06/resoluciones/anderson-oloroso
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar servidor:
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
- **Ruta:** `http://localhost:3000/intermedio/ejercicio-06`
- **Respuesta (200 OK):**
  ```json
  {
    "ok": true,
    "message": "Ejercicio ejecutado correctamente",
    "topic": "validacion centralizada"
  }
  ```

### 4.2. Listar órdenes de taller
- **Método:** `GET`
- **Ruta:** `http://localhost:3000/api/mechanic/orders`

### 4.3. Crear orden con payload válido
- **Método:** `POST`
- **Ruta:** `http://localhost:3000/api/mechanic/orders`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "cliente": "Laura Sánchez",
    "placa": "KAW-400",
    "marca": "Kawasaki",
    "modelo": "Ninja 400",
    "cilindrada": 399,
    "kilometraje": 8200,
    "tipoServicio": "preventivo"
  }
  ```
- **cURL:**
  ```bash
  curl -X POST http://localhost:3000/api/mechanic/orders \
    -H "Content-Type: application/json" \
    -d "{\"cliente\":\"Laura Sánchez\",\"placa\":\"KAW-400\",\"marca\":\"Kawasaki\",\"modelo\":\"Ninja 400\",\"cilindrada\":399,\"kilometraje\":8200,\"tipoServicio\":\"preventivo\"}"
  ```
- **Respuesta (201 Created):**
  ```json
  {
    "ok": true,
    "message": "Orden de servicio mecánico validada y creada satisfactoriamente",
    "data": {
      "idOrden": "ORD-102",
      "cliente": "Laura Sánchez",
      "placa": "KAW-400",
      "marca": "Kawasaki",
      "modelo": "Ninja 400",
      "cilindrada": 399,
      "kilometraje": 8200,
      "tipoServicio": "preventivo",
      "costoEstimadoUSD": 80,
      "estado": "Ingresado al Taller"
    }
  }
  ```

---

## 5. Caso de Error de Validación Centralizada (400 Bad Request)

- **Petición con múltiples campos erróneos:**
  ```json
  {
    "cliente": "L",
    "placa": "INVALID_TOO_LONG_123456",
    "cilindrada": 10,
    "tipoServicio": "magia"
  }
  ```
- **Respuesta del Middleware:**
  ```json
  {
    "ok": false,
    "message": "Fallo de validación en la orden de servicio mecánico",
    "errorsCount": 5,
    "errors": [
      { "field": "cliente", "message": "El nombre del cliente es obligatorio y debe tener al menos 3 caracteres." },
      { "field": "placa", "message": "La placa es obligatoria y debe ser alfanumérica de 3 a 7 caracteres." },
      { "field": "marca", "message": "La marca de la moto es obligatoria (ej: Yamaha, Honda, Kawasaki)." },
      { "field": "modelo", "message": "El modelo de la motocicleta es obligatorio." },
      { "field": "cilindrada", "message": "La cilindrada (cc) debe ser un número entre 50 y 2500." },
      { "field": "tipoServicio", "message": "Tipo de servicio inválido. Tipos aceptados: preventivo, correctivo, afinacion, frenos, suspension" }
    ]
  }
  ```

---

## 6. Estructura de la entrega

```text
intermedio/ejercicio-06/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── server.js
    ├── controllers/
    │   └── mechanic.controller.js
    ├── middlewares/
    │   └── validateOrder.middleware.js
    ├── routes/
    │   └── mechanic.routes.js
    └── services/
        └── mechanic.service.js
```
