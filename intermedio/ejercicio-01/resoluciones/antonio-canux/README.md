# Ejercicio 001: Arquitectura por Capas

- **Camper:** Antonio Canux
- **Nivel:** Intermedio inicial
- **Temática de dominio:** Videojuegos RPG (personajes, clases, inventario)

## Estructura de carpetas

```text
intermedio/ejercicio-01/resoluciones/antonio-canux/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   └── character.routes.js
    ├── controllers/
    │   └── character.controller.js
    ├── services/
    │   └── character.service.js
    └── data/
        └── character.data.js
```

## Comandos de Ejecución y Pruebas

### Instalación y arranque

```bash
# Dentro de tu carpeta de resolución:
npm install
npm run dev
```

### Pruebas con cURL

#### 1. Validar endpoint requerido por el ejercicio
```bash
curl -X GET http://localhost:3000/intermedio/ejercicio-01
```

**Respuesta esperada:**
```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "arquitectura por capas"
}
```

#### 2. Listar personajes RPG
```bash
curl -X GET http://localhost:3000/api/characters
```

#### 3. Crear nuevo personaje RPG (caso exitoso)
```bash
curl -X POST http://localhost:3000/api/characters \
  -H "Content-Type: application/json" \
  -d '{"name": "Eldrin", "role": "Clérigo", "level": 5}'
```

#### 4. Probar validación de error (rol no permitido)
```bash
curl -X POST http://localhost:3000/api/characters \
  -H "Content-Type: application/json" \
  -d '{"name": "Sombra", "role": "Ninja"}'
```