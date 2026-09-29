# Ejercicio 26 - codigos de estado

API nativa de Node.js para partidas de un shooter competitivo, con respuestas HTTP segun cada resultado.

## Uso

```bash
npm install
npm start
```

El servidor usa el puerto `3026` por defecto.

## Rutas

```bash
curl http://localhost:3026/matches/1
curl http://localhost:3026/matches/99
curl -X POST http://localhost:3026/matches -H "Content-Type: application/json" -d "{\"map\":\"Ascent\",\"players\":10}"
```

La consulta exitosa responde `200`, una partida creada `201`, un id mal formado `400` y una partida inexistente `404`.