# Ejercicio 25 - respuestas HTTP correctas (Juan Lema)

## Que hace

Tematica videojuegos RPG. `utils/respond.js` centraliza un envelope de respuesta consistente (`{ ok, data }` / `{ ok, message }`). El recurso `/quests` demuestra respuestas HTTP correctas: `POST` responde 201 con header `Location` apuntando al recurso creado, `DELETE` responde 204 sin body, `Content-Type: application/json` siempre presente via `res.json`.

## Como ejecutar

```bash
npm install
npm start
```

## Como probar

```bash
curl http://localhost:3025/quests
curl -i -X POST http://localhost:3025/quests -H "Content-Type: application/json" -d "{\"title\":\"Explorar la mazmorra\",\"reward\":250}"
curl -i -X DELETE http://localhost:3025/quests/1
```

Revisa el header `Location` en la respuesta del POST y el body vacio del DELETE (204).

## Como probar los casos de error

```bash
curl http://localhost:3025/quests/99
curl http://localhost:3025/quests/abc
```

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/
│   └── quests.routes.js
├── controllers/
│   └── quests.controller.js
├── services/
│   └── quests.service.js
└── utils/
    └── respond.js
```
