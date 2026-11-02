# Ejercicio 028: Colección de Ejemplos HTTP

- **Camper:** Antonio Canux
- **Nivel:** Intermedio
- **Tema:** Colección de Ejemplos HTTP (battle royale)

## Estructura de Carpetas

```text
intermedio/ejercicio-28/resoluciones/antonio-canux/
├── README.md
├── package.json
├── requests.http
├── src/app.js
├── src/controllers/matches.controller.js
├── src/data/matches.data.js
├── src/routes/matches.routes.js
└── src/server.js
```

## Cómo funciona

- `requests.http` agrupa todas las peticiones de ejemplo (casos felices y de error) para ejecutarlas desde VS Code con la extensión REST Client.
- Sirve también como documentación viva de la API.

## Ejecución

```bash
npm install
npm run dev
```

## Pruebas con cURL

```bash
# Endpoint del ejercicio
curl http://localhost:3000/intermedio/ejercicio-28

# Listar partidas
curl http://localhost:3000/api/matches

# Más ejemplos
Abrir `requests.http` en VS Code y pulsar "Send Request"
```
