# Ejercicio 009: Paginación y Filtros

- **Camper:** Antonio Canux
- **Nivel:** Intermedio
- **Tema:** Paginación y Filtros (kickboxing)

## Estructura de Carpetas

```text
intermedio/ejercicio-09/resoluciones/antonio-canux/
├── README.md
├── package.json
├── src/app.js
├── src/controllers/fighters.controller.js
├── src/data/fighters.data.js
├── src/routes/fighters.routes.js
└── src/server.js
```

## Cómo funciona

- `page` y `limit` se validan (limit máximo 50) y se calcula el corte con `slice`.
- Filtros opcionales por `country` y `weightClass`; `meta` informa total y total de páginas.

## Ejecución

```bash
npm install
npm run dev
```

## Pruebas con cURL

```bash
# Endpoint del ejercicio
curl http://localhost:3000/intermedio/ejercicio-09

# Primera página
curl "http://localhost:3000/api/fighters?page=1&limit=3"

# Filtrar por país
curl "http://localhost:3000/api/fighters?country=Tailandia"

# Parámetros inválidos (400)
curl "http://localhost:3000/api/fighters?page=0"
```
