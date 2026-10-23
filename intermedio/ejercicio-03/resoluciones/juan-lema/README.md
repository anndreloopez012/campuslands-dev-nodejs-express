# Ejercicio 03 - controladores limpios (Juan Lema)

## Que hace

Tematica MOBA esports. Controladores limpios: `champions.controller.js` solo traduce `req`/`res`, sin reglas de negocio. Toda la validacion y los datos viven en `champions.service.js`.

## Como ejecutar

```bash
npm install
npm start
```

## Como probar

```bash
curl http://localhost:4003/champions
curl http://localhost:4003/champions/1
curl -X POST http://localhost:4003/champions -H "Content-Type: application/json" -d "{\"name\":\"Vexira\",\"role\":\"mago\",\"winRate\":51.4}"
```

## Como probar los casos de error

```bash
curl http://localhost:4003/champions/99
curl http://localhost:4003/champions/abc
curl -X POST http://localhost:4003/champions -H "Content-Type: application/json" -d "{\"name\":\"Sin rol\"}"
```

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/champions.routes.js
├── controllers/champions.controller.js
└── services/champions.service.js
```
