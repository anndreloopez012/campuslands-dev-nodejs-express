# AVANZADO 08 - EventEmitter

## Objetivo

Crear una pequeña aplicación Node.js con Express para practicar el uso de `EventEmitter`.

La aplicación simula el registro de hiperdeportivos y emite un evento cada vez que se registra uno.

## Concepto principal

`EventEmitter` es una funcionalidad nativa de Node.js que permite implementar un modelo basado en eventos.

Un componente puede emitir un evento:

```js
hypercarEmitter.emit('hypercar.created', hypercar);