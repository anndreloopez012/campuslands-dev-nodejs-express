# Ejercicio 11: promesas basicas

CLI mínima que crea y consume una promesa para simular la carga de una canción. Usa `Promise`, `resolve`, `reject`, `.then` y `.catch`, sin Express ni dependencias externas.

## Ejecutar

```bash
npm install
npm start
npm start -- "Noche de plata"
```

Sin argumentos usa `Noche de plata`. La promesa se resuelve después de `25` ms.

## Estructura

- `src/app.js`: consumo de la promesa con `.then` y `.catch`.
- `src/services/track.service.js`: creación de la promesa y validación.

## Errores

Un título vacío termina con código `1` y un mensaje explicativo.
