# Ejercicio 06: path y rutas seguras

Solución de consola para leer un servicio usando `node:path`. Valida el nombre de la ruta y comprueba que el archivo resuelto permanezca dentro de `src/data`, sin Express ni dependencias externas.

## Ejecutar

```bash
npm install
npm start
npm start -- service-01
```

Sin argumentos lee `service-01.json`. El resultado incluye `ok`, el tema y los datos del servicio.

## Estructura

- `src/app.js`: entrada de consola y manejo de errores.
- `src/services/service.service.js`: resolución y validación segura de rutas.
- `src/data/service-01.json`: datos de ejemplo.

## Seguridad

Los nombres con `/`, `\\`, `.` o `..` se rechazan antes de leer cualquier archivo. Una ruta fuera del directorio de datos también se bloquea.
