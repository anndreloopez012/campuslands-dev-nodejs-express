# Ejercicio 025: Testing de Rutas

- **Camper:** Antonio Canux
- **Nivel:** Intermedio
- **Tema:** Testing de Rutas (videojuegos RPG)

## Estructura de Carpetas

```text
intermedio/ejercicio-25/resoluciones/antonio-canux/
├── README.md
├── package.json
├── src/app.js
├── src/controllers/characters.controller.js
├── src/data/characters.data.js
├── src/routes/characters.routes.js
├── src/server.js
└── test/characters.routes.test.js
```

## Cómo funciona

- `src/app.js` exporta la app sin `listen`, así las pruebas la levantan en un puerto libre (`listen(0)`).
- Se prueban rutas reales con `fetch` y `node:test`: 200, 201, 400 y 404. Se ejecutan con `npm test`.

## Ejecución

```bash
npm install
npm run dev
```

```bash
npm test
```

## Pruebas con cURL

```bash
# Endpoint del ejercicio
curl http://localhost:3000/intermedio/ejercicio-25

# Listar personajes
curl http://localhost:3000/api/characters

# Crear
curl -X POST http://localhost:3000/api/characters -H "Content-Type: application/json" -d '{"name":"Legolas","class":"Arquero","level":30}'
```
