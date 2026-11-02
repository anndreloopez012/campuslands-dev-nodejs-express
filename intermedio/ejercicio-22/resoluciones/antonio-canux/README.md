# Ejercicio 022: Subida Simulada de Archivos

- **Camper:** Antonio Canux
- **Nivel:** Intermedio
- **Tema:** Subida Simulada de Archivos (arquitectura 3D)

## Estructura de Carpetas

```text
intermedio/ejercicio-22/resoluciones/antonio-canux/
├── README.md
├── package.json
├── src/app.js
├── src/controllers/models.controller.js
├── src/data/models.data.js
├── src/routes/models.routes.js
└── src/server.js
```

## Cómo funciona

- Se simula la subida recibiendo solo metadatos (`fileName`, `sizeKb`, `project`).
- Valida extensión (`.obj`, `.fbx`, `.glb`) con 415 y tamaño máximo con 413.

## Ejecución

```bash
npm install
npm run dev
```

## Pruebas con cURL

```bash
# Endpoint del ejercicio
curl http://localhost:3000/intermedio/ejercicio-22

# Subida válida
curl -X POST http://localhost:3000/api/models -H "Content-Type: application/json" -d '{"fileName":"casa.glb","sizeKb":2048,"project":"Casa Moderna"}'

# Extensión inválida (415)
curl -X POST http://localhost:3000/api/models -H "Content-Type: application/json" -d '{"fileName":"virus.exe","sizeKb":10,"project":"X"}'

# Archivo muy grande (413)
curl -X POST http://localhost:3000/api/models -H "Content-Type: application/json" -d '{"fileName":"torre.obj","sizeKb":99999,"project":"Torre"}'
```
