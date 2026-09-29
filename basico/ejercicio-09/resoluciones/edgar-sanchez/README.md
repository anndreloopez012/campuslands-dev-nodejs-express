# Ejercicio 09: JSON y persistencia simple

CLI mínima para listar peleadores y guardar nuevos registros en un archivo JSON. Usa `node:fs/promises`, no usa Express ni dependencias externas.

## Ejecutar

```bash
npm install
npm start
npm start -- "Ana Torres" 63
```

Sin argumentos lista los peleadores. Con nombre y peso agrega un registro, lo persiste en `src/data/fighters.json` y muestra la lista actualizada.

## Estructura

- `src/app.js`: argumentos de CLI y salida JSON.
- `src/services/fighters.service.js`: lectura, validación y escritura.
- `src/data/fighters.json`: persistencia local.

## Errores

Un nombre vacío o un peso no numérico/menor o igual a cero terminan con código `1` sin modificar el archivo.
