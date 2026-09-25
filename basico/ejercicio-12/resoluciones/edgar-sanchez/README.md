# Ejercicio 12: async await

CLI mínima que consulta una película de terror mediante una función `async` y `await`. Usa una espera de `25` ms para representar una consulta asíncrona, sin Express ni dependencias externas.

## Ejecutar

```bash
npm install
npm start
npm start -- "El ultimo sótano"
```

Sin argumentos usa `La casa muda`.

## Estructura

- `src/app.js`: función `main` con `await` y manejo de errores.
- `src/services/movie.service.js`: operación asíncrona y validación.

## Errores

Un título vacío termina con código `1` y un mensaje explicativo.
