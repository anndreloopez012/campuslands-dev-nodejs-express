# Ejercicio 002: Routers Modulares

- **Camper:** Antonio Canux
- **Nivel:** Intermedio inicial
- **Temática de dominio:** Shooters competitivos (armas, agentes/operadores, mapas)

## Estructura de Carpetas

```text
intermedio/ejercicio-02/resoluciones/antonio-canux/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   ├── index.js             # Enrutador central que agrupa los módulos
    │   ├── weapons.routes.js    # Rutas para armas (rifles, snipers, pistolas)
    │   └── maps.routes.js       # Rutas para mapas competitivos
    ├── controllers/
    │   ├── weapons.controller.js
    │   └── maps.controller.js
    └── data/
        ├── weapons.data.js
        └── maps.data.js
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
curl -X GET http://localhost:3000/intermedio/ejercicio-02
```

**Respuesta:**
```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "routers modulares"
}
```

#### 2. Listar todas las armas
```bash
curl -X GET http://localhost:3000/api/weapons
```

#### 3. Filtrar armas por categoría mediante query params
```bash
curl -X GET "http://localhost:3000/api/weapons?category=Rifle"
```

#### 4. Obtener un mapa por ID
```bash
curl -X GET http://localhost:3000/api/maps/1
```
