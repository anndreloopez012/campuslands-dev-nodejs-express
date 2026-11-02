# Ejercicio 029: Refactor de API

- **Camper:** Antonio Canux
- **Nivel:** Intermedio
- **Tema:** Refactor de API (futbol y futbol sala)

## Estructura de Carpetas

```text
intermedio/ejercicio-29/resoluciones/antonio-canux/
├── README.md
├── package.json
├── src/app.js
├── src/controllers/teams.controller.js
├── src/data/teams.data.js
├── src/repositories/teams.repository.js
├── src/routes/teams.routes.js
├── src/server.js
├── src/services/teams.service.js
└── src/utils/app-error.js
```

## Cómo funciona

- **Antes:** lógica, datos y respuesta mezclados en el controlador.
- **Después:** `routes → controllers → services → repositories → data`, cada capa con una sola responsabilidad.
- Los errores de negocio usan `AppError` y llegan al manejador de errores global con `next(err)`; el comportamiento externo de la API no cambia.

## Ejecución

```bash
npm install
npm run dev
```

## Pruebas con cURL

```bash
# Endpoint del ejercicio
curl http://localhost:3000/intermedio/ejercicio-29

# Listar por deporte
curl "http://localhost:3000/api/teams?sport=Futsal"

# Equipo inexistente (404)
curl http://localhost:3000/api/teams/99

# Crear inválido (400)
curl -X POST http://localhost:3000/api/teams -H "Content-Type: application/json" -d '{"name":"X"}'
```
