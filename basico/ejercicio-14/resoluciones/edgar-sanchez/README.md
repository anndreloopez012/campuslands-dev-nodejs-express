# Ejercicio 14: validacion de entrada

CLI mínima para validar los datos de un libro: título no vacío y número de páginas dentro de un rango válido. No usa Express ni dependencias externas.

## Ejecutar

```bash
npm install
npm start
npm start -- "El principito" 96
```

Sin argumentos usa `Cien años de soledad` y `300` páginas.

## Estructura

- `src/app.js`: lectura de argumentos y manejo de errores.
- `src/services/book.service.js`: validación de entrada.

## Errores

Un título vacío o páginas no enteras fuera de `1-5000` terminan con código `1` y un mensaje explicativo.
