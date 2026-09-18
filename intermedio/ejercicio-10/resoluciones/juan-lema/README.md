# Ejercicio 10 - ordenamiento de resultados (Juan Lema)

## Que hace

Tematica pingpong. `GET /players` soporta `sortBy` (`name`, `ranking`, `wins`) y `order` (`asc`, `desc`). `players.service.js` ordena una copia del arreglo segun esos parametros sin mutar los datos originales.

## Como ejecutar

```bash
npm install
npm start
```

## Como probar

```bash
curl "http://localhost:4010/players"
curl "http://localhost:4010/players?sortBy=wins&order=desc"
curl "http://localhost:4010/players?sortBy=name&order=asc"
curl http://localhost:4010/players/1
curl -X POST http://localhost:4010/players -H "Content-Type: application/json" -d "{\"name\":\"Theo Marsh\",\"ranking\":6,\"wins\":3}"
```

## Como probar los casos de error

```bash
curl "http://localhost:4010/players?sortBy=invalido"
curl "http://localhost:4010/players?order=invalido"
curl http://localhost:4010/players/99
```

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/players.routes.js
├── controllers/players.controller.js
└── services/players.service.js
```
