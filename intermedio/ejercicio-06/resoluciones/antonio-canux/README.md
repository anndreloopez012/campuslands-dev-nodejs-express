# Ejercicio 006: Validación Centralizada

- **Camper:** Antonio Canux
- **Nivel:** Intermedio
- **Tema:** Validación centralizada mediante Middlewares

## Estructura de Carpetas

```text
intermedio/ejercicio-06/resoluciones/antonio-canux/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   └── motorcycle.routes.js
    ├── controllers/
    │   └── motorcycle.controller.js
    ├── middlewares/
    │   └── validator.middleware.js   # Middleware genérico de validación
    ├── schemas/
    │   └── motorcycle.schema.js       # Reglas de validación declarativas
    └── data/
        └── motorcycle.data.js
```

## 6. Comandos de Ejecución y Pruebas

### Ejecución

```bash
npm install
npm run dev
```

### Pruebas con cURL

#### 1. Validar endpoint del ejercicio
```bash
curl -X GET http://localhost:3000/intermedio/ejercicio-06
```

**Respuesta:**
```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "validacion centralizada"
}
```

#### 2. Registro exitoso de motocicleta
```bash
curl -X POST http://localhost:3000/api/motorcycles \
  -H "Content-Type: application/json" \
  -d '{
    "brand": "Ducati",
    "model": "Monster 821",
    "displacementCc": 821,
    "mileageKm": 12000,
    "status": "En Taller"
  }'
```

#### 3. Probar rechazo centralizado por datos inválidos
```bash
curl -X POST http://localhost:3000/api/motorcycles \
  -H "Content-Type: application/json" \
  -d '{
    "brand": "D",
    "displacementCc": "ochocientos",
    "status": "Invalido"
  }'
```

**Respuesta esperada (400 Bad Request con detalle):**
```json
{
  "ok": false,
  "message": "Errores de validación en los datos enviados",
  "errors": [
    { "field": "brand", "message": "La marca debe ser un texto de al menos 2 caracteres." },
    { "field": "model", "message": "El campo 'model' es obligatorio." },
    { "field": "displacementCc", "message": "El cilindraje (displacementCc) debe ser un número entre 50 y 2500 cc." },
    { "field": "mileageKm", "message": "El campo 'mileageKm' es obligatorio." },
    { "field": "status", "message": "El estado debe ser: 'En Taller', 'En Espera', 'Listo' o 'Entregado'." }
  ]
}
```