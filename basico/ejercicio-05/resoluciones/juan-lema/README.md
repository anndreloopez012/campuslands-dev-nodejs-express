# Ejercicio 05 - fs para leer archivos (Juan Lema)

## Que hace

Tematica futbol y futbol sala. `players.service.js` usa `fs/promises` (`readFile`) para leer `data/players.json`, parsearlo y buscar un jugador por id. Valida que el id sea un entero positivo y lanza error si no existe.

## Como ejecutar

```bash
npm install
npm start
```

Opcional, pasar id de jugador:

```bash
node src/app.js 2
```

## Como probar el caso de error

```bash
node src/app.js 99
```

Debe imprimir `Error al leer jugador: Jugador con id 99 no encontrado`.

## Estructura

```text
src/
├── app.js
├── data/
│   └── players.json
└── services/
    └── players.service.js
```
