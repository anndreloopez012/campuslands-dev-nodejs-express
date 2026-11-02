# Ejercicio 05: leer archivos con `fs`

Solución de consola que lee un archivo JSON usando `node:fs/promises`, busca un jugador por id y muestra el resultado. No usa Express ni dependencias externas.

## Ejecutar

```bash
npm install
npm start
npm start -- 2
```

Sin argumentos busca al jugador `1`. El resultado incluye `ok`, el tema y el jugador encontrado.

## Estructura

- `src/app.js`: entrada de consola y manejo de errores.
- `src/services/players.service.js`: lectura del JSON y búsqueda.
- `src/data/players.json`: datos de jugadores.

## Errores

Un id no entero, menor o igual a cero, inexistente o un archivo inválido terminan con código `1` y un mensaje explicativo.