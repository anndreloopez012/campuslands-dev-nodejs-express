# Ejercicio 07: process.argv y CLI

CLI mínima para consultar un auto de lujo. Usa `parseArgs` de Node.js, valida los argumentos y muestra el resultado en JSON. No usa Express ni dependencias externas.

## Ejecutar

```bash
npm install
npm start
npm start -- --model "Ferrari 488" --year 2022
```

También funcionan las opciones cortas: `-m` para el modelo y `-y` para el año. Sin opciones se usa `Aurora GT` y `2024`.

## Estructura

- `src/app.js`: lectura de `process.argv`, validación y salida.

## Errores

Un modelo vacío, un año no entero o fuera de `1900-2100`, y una opción desconocida terminan con código `1` y un mensaje explicativo.
