# Ejercicio 027: Documentación de Endpoints

- **Camper:** Antonio Canux
- **Nivel:** Intermedio
- **Tema:** Documentación de Endpoints (MOBA esports)

## Estructura de Carpetas

```text
intermedio/ejercicio-27/resoluciones/antonio-canux/
├── README.md
├── package.json
├── src/app.js
├── src/controllers/champions.controller.js
├── src/controllers/docs.controller.js
├── src/data/champions.data.js
├── src/docs/endpoints.docs.js
├── src/routes/champions.routes.js
├── src/routes/docs.routes.js
└── src/server.js
```

## Cómo funciona

- `src/docs/endpoints.docs.js` describe cada endpoint (método, ruta, descripción y códigos de respuesta).
- La API se autodocumenta en `GET /api/docs`.

## Ejecución

```bash
npm install
npm run dev
```

## Pruebas con cURL

```bash
# Endpoint del ejercicio
curl http://localhost:3000/intermedio/ejercicio-27

# Documentación en JSON
curl http://localhost:3000/api/docs

# Filtrar por rol
curl "http://localhost:3000/api/champions?role=Mid"

# Crear
curl -X POST http://localhost:3000/api/champions -H "Content-Type: application/json" -d '{"name":"Jinx","role":"ADC","difficulty":"Media"}'
```

## Documentación de Endpoints

| Método | Ruta | Descripción | Respuestas |
|--------|------|-------------|------------|
| GET | `/api/champions` | Lista campeones (filtro `?role=`) | 200 |
| GET | `/api/champions/:id` | Obtiene un campeón | 200, 404 |
| POST | `/api/champions` | Crea un campeón (`name`, `role`, `difficulty`) | 201, 400 |
| GET | `/api/docs` | Documentación en JSON | 200 |
