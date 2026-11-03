# BASICO 03 - Módulos CommonJS

## Descripción

Solución del ejercicio sobre módulos CommonJS utilizando Node.js y Express.

El objetivo es practicar la importación y exportación de módulos mediante `require()` y `module.exports`.

## Instalación

```bash
npm install
```

## Ejecutar

Modo desarrollo:

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

## Endpoints

### GET /health

Comprueba que la aplicación está funcionando.

```text
http://localhost:3000/health
```

### GET /game

Utiliza un módulo CommonJS para obtener información del escenario MOBA.

```text
http://localhost:3000/game
```

## CommonJS utilizado

En `game.js` se exporta la función:

```js
module.exports = { getGame };
```

Y en `app.js` se importa mediante:

```js
const { getGame } = require('./game');
```

## Estructura

```text
src/
├── app.js
├── server.js
└── game.js
```
