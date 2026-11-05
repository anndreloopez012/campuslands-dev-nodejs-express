# Básico - Ejercicio 30: Proyecto Integrador Básico
> **Autor:** Anderson Oloroso | **Temática:** Motos y mecánica | **Tema:** Proyecto integrador basico

---

## 1. Descripción del proyecto
Proyecto integrador final del nivel básico que sintetiza todos los conceptos abordados a lo largo de los 30 ejercicios:
- Servidor HTTP con **Express** en estándar **ES Modules** (`type: module`).
- Arquitectura desacoplada en capas: `middlewares/`, `routes/`, `controllers/`, `services/`.
- Middleware de logging personalizado en consola.
- Middleware de validación de esquemas de datos antes del controlador.
- Persistencia CRUD completa en memoria (Create, Read, Update, Delete).
- Códigos de estado HTTP rigurosos (`200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `404 Not Found`).

---

## 2. Instalación y ejecución
```bash
cd basico/ejercicio-30/resoluciones/anderson-oloroso
npm install
npm start      # producción
npm run dev    # desarrollo con recarga automática
```

---

## 3. Endpoints disponibles

| Método | Ruta | Código | Descripción |
|---|---|---|---|
| `GET` | `/basico/ejercicio-30` | `200 OK` | Verificación de salud del integrador |
| `GET` | `/api/workshop/bikes` | `200 OK` | Listar todas las motocicletas en taller |
| `GET` | `/api/workshop/bikes/:id` | `200 OK` / `404 Not Found` | Consultar motocicleta por ID |
| `POST` | `/api/workshop/bikes` | `201 Created` / `400 Bad Request` | Registrar nueva moto (con validación previa) |
| `PUT` | `/api/workshop/bikes/:id` | `200 OK` / `404 Not Found` | Actualizar estado o datos de moto |
| `DELETE` | `/api/workshop/bikes/:id` | `204 No Content` / `404 Not Found` | Dar salida del taller a la moto |

### Ejemplo POST /api/workshop/bikes
```bash
curl -X POST http://localhost:3000/api/workshop/bikes \
  -H "Content-Type: application/json" \
  -d '{"placa":"SUZ-789","marca":"Suzuki","modelo":"GSX-8S","cilindrada":776,"cliente":"Valeria Soto"}'
```

---

## 4. Estructura de la entrega
```text
basico/ejercicio-30/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── controllers/
    │   └── workshop.controller.js
    ├── middlewares/
    │   ├── logger.middleware.js
    │   └── validator.middleware.js
    ├── routes/
    │   └── workshop.routes.js
    └── services/
        └── workshop.service.js
```
