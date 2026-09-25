# Ejercicio 02 - routers modulares (Juan Lema)

## Que hace

Tematica shooters competitivos. Routers modulares: `routes/index.js` es el router central y monta por separado `players.routes.js` (bajo `/players`) y `weapons.routes.js` (bajo `/weapons`), cada uno con su propio controller y service independientes. Ningun router conoce la logica interna del otro, solo se agrupan en `index.js`.

## Como ejecutar

```bash
npm install
npm start
```

## Como probar

```bash
curl http://localhost:4002/players
curl http://localhost:4002/players/1
curl -X POST http://localhost:4002/players -H "Content-Type: application/json" -d "{\"nickname\":\"Nova\",\"team\":\"Halcones Rojos\",\"kills\":12}"

curl http://localhost:4002/weapons
curl http://localhost:4002/weapons/1
curl -X POST http://localhost:4002/weapons -H "Content-Type: application/json" -d "{\"name\":\"Raptor-9\",\"category\":\"pistola\",\"damage\":22}"
```

## Como probar los casos de error

```bash
curl http://localhost:4002/players/99
curl http://localhost:4002/weapons/abc
```

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/
│   ├── index.js
│   ├── players.routes.js
│   └── weapons.routes.js
├── controllers/
│   ├── players.controller.js
│   └── weapons.controller.js
└── services/
    ├── players.service.js
    └── weapons.service.js
```
