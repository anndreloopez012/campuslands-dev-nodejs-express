# BASICO 07 - process.argv y CLI

## Objetivo

Crear una pequeña aplicación Node.js con Express para practicar el uso de `process.argv` y la ejecución de parámetros mediante la línea de comandos.

La aplicación representa un servidor para un catálogo de autos de lujo y permite definir dinámicamente el puerto del servidor mediante un argumento en la terminal (CLI).

## Concepto Principal

`process.argv` es un arreglo global proporcionado por Node.js que contiene los argumentos utilizados para iniciar el proceso.

### Estructura de `process.argv`:

- **`process.argv[0]`**: Ruta absoluta al ejecutable de Node.js.
- **`process.argv[1]`**: Ruta absoluta al archivo `.js` que se está ejecutando.
- **`process.argv[2]` en adelante**: Argumentos personalizados pasados desde la terminal.

### Ejemplo de paso de parámetros:

```bash
node src/app.js 4000
```