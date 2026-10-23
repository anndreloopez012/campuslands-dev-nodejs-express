# Ejercicio 10: funciones asincronas

CLI mínima que simula un punto de ping-pong después de una espera asíncrona. Usa `async`, `await` y `Promise`, sin Express ni dependencias externas.

## Ejecutar

```bash
npm install
npm start
npm start -- "Ana Torres"
```

Sin argumentos usa `Invitado`. La función `playRally` espera `25` ms antes de devolver el resultado.

## Estructura

- `src/app.js`: entrada de consola y espera del resultado.
- `src/services/rally.service.js`: función asíncrona y validación.

## Errores

Un nombre vacío termina con código `1` y un mensaje explicativo.
