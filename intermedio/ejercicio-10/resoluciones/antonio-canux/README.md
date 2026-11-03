# Ejercicio 010: Ordenamiento de Resultados

- **Camper:** Antonio Canux
- **Nivel:** Intermedio
- **Tema:** Ordenamiento de Resultados (pingpong)

## Estructura de Carpetas

```text
intermedio/ejercicio-10/resoluciones/antonio-canux/
├── README.md
├── package.json
├── src/app.js
├── src/controllers/players.controller.js
├── src/data/players.data.js
├── src/routes/players.routes.js
└── src/server.js
```

## Cómo funciona

- Solo se permite ordenar por campos de una lista blanca (`name`, `ranking`, `wins`).
- Se ordena una copia del arreglo para no mutar los datos originales.

## Ejecución

```bash
npm install
npm run dev
```

## Pruebas con cURL

```bash
# Endpoint del ejercicio
curl http://localhost:3000/intermedio/ejercicio-10

# Por ranking (por defecto)
curl http://localhost:3000/api/players

# Más victorias primero
curl "http://localhost:3000/api/players?sortBy=wins&order=desc"

# Campo no permitido (400)
curl "http://localhost:3000/api/players?sortBy=password"
```
