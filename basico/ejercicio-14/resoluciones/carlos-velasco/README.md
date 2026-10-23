# BASICO 14 - Validacion de entrada

## 1. Nombre

Validacion de entrada para una API de libros.

## 2. Objetivo

Crear una pequena API con Node.js y Express que permita registrar libros y validar los datos recibidos mediante `req.body`.

El ejercicio busca practicar:

- Recepcion de datos JSON.
- Validacion de entrada.
- Separacion entre rutas, controladores y servicios.
- Respuestas HTTP.
- Manejo de errores.
- Pruebas manuales con curl.

## 3. Concepto principal

La validacion de entrada consiste en comprobar que los datos recibidos por una aplicacion cumplen las reglas esperadas antes de utilizarlos.

En este ejercicio se valida:

- `title`: debe ser texto y no estar vacio.
- `author`: debe ser texto y no estar vacio.
- `year`: debe ser un numero entero positivo.

Si los datos no cumplen las reglas, la API responde con:

```text
400 Bad Request