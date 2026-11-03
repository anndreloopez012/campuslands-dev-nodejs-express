# Ejercicio 011: Búsqueda Textual

- **Camper:** Antonio Canux
- **Nivel:** Intermedio
- **Tema:** Búsqueda Textual (musica)

## Estructura de Carpetas

```text
intermedio/ejercicio-11/resoluciones/antonio-canux/
├── README.md
├── package.json
├── src/app.js
├── src/controllers/songs.controller.js
├── src/data/songs.data.js
├── src/routes/songs.routes.js
└── src/server.js
```

## Cómo funciona

- `q` busca en título, artista y género.
- La comparación ignora mayúsculas y acentos con `normalize("NFD")`.

## Ejecución

```bash
npm install
npm run dev
```

## Pruebas con cURL

```bash
# Endpoint del ejercicio
curl http://localhost:3000/intermedio/ejercicio-11

# Buscar por artista
curl "http://localhost:3000/api/songs?q=queen"

# Sin acentos
curl "http://localhost:3000/api/songs?q=cancion"

# Sin término (400)
curl http://localhost:3000/api/songs
```
