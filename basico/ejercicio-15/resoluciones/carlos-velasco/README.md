# BASICO 15 - Mini API HTTP nativa

## 1. Nombre

Mini API HTTP nativa sobre comida urbana.

## 2. Objetivo

Crear una pequeña API utilizando el modulo `node:http` de Node.js para comprender como funciona un servidor HTTP sin depender de Express.

La API permite consultar y crear comidas urbanas utilizando rutas HTTP.

## 3. Concepto principal

Este ejercicio practica la construccion de una API HTTP utilizando las herramientas nativas de Node.js.

En lugar de utilizar Express, el servidor se crea mediante:

```js
const http = require('node:http');