# Ejercicio 003: Controladores Limpios

- **Camper:** Antonio Canux
- **Nivel:** Intermedio
- **Tema:** Controladores limpios 

## Estructura de Carpetas

```text
intermedio/ejercicio-03/resoluciones/antonio-canux/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   └── hero.routes.js
    ├── controllers/
    │   └── hero.controller.js
    ├── services/
    │   └── hero.service.js
    └── data/
        └── hero.data.js
```

## Comandos de Ejecución y Pruebas

### Ejecución

```bash
npm install
npm run dev
```

### Peticiones de prueba con cURL

#### 1. Validar endpoint del ejercicio
```bash
curl -X GET http://localhost:3000/intermedio/ejercicio-03
```

**Respuesta esperada:**
```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "controladores limpios"
}
```

#### 2. Listar héroes filtrando por carril y winrate
```bash
curl -X GET "http://localhost:3000/api/heroes?lane=Mid&minWinRate=50"
```

#### 3. Consultar héroe existente
```bash
curl -X GET http://localhost:3000/api/heroes/1
```

#### 4. Crear nuevo héroe (caso exitoso)
```bash
curl -X POST http://localhost:3000/api/heroes \
  -H "Content-Type: application/json" \
  -d '{"name": "Shadow Fiend", "lane": "Mid", "winRate": 48.9, "difficulty": "Alta"}'
```

#### 5. Probar error de duplicado (conflicto 409)
```bash
curl -X POST http://localhost:3000/api/heroes \
  -H "Content-Type: application/json" \
  -d '{"name": "Invoker", "lane": "Mid"}'
```