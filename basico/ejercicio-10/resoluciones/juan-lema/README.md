# Ejercicio 10 - funciones asincronas (Juan Lema)

## Que hace

Tematica pingpong. `rally.service.js` expone `playRally(playerName, callback)`: una funcion asincrona con `setTimeout` que no bloquea el hilo principal. `app.js` demuestra que el codigo despues de la llamada se ejecuta antes de que llegue el resultado.

## Como ejecutar

```bash
npm install
npm start
```

Opcional, pasar nombre de jugador:

```bash
node src/app.js Marco
```

## Como probar el caso de error

```bash
node src/app.js ""
```

Debe imprimir `Error en el rally: El nombre del jugador es obligatorio`.

## Estructura

```text
src/
├── app.js
└── services/
    └── rally.service.js
```
