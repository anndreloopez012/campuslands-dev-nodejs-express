# AVANZADO 09 - Streams basicos

## Objetivo

Crear una pequeña aplicación Node.js con Express para practicar el uso de streams básicos.

La aplicación representa sesiones de entrenamiento de kickboxing y utiliza un `Readable Stream` de Node.js para procesar las sesiones.

## Concepto principal

Un stream permite trabajar con datos de forma progresiva en lugar de tratar necesariamente todo el contenido como un único bloque.

Node.js proporciona diferentes tipos de streams.

En este ejercicio se utiliza un `Readable Stream`, que representa una fuente desde la cual se pueden leer datos.

La implementación principal utiliza:

```js
const { Readable } = require('node:stream');