# BASICO 05 - fs para leer archivos

## Descripción

Ejercicio básico para aprender a leer archivos con `fs` en Node.js.

Se utiliza un archivo JSON con información de equipos de fútbol y fútbol sala.

## Instalación

```bash
npm install
```

## Ejecutar

```bash
npm run dev
```

Servidor:

```text
http://localhost:3000
```

## Rutas

### GET /health

Comprueba que el servidor funciona.

### GET /equipos

Lee el archivo `data/equipos.json` usando `fs` y muestra los equipos.

## Estructura

```text
src/
├── app.js
└── server.js

data/
└── equipos.json
```

## Concepto utilizado

Se utiliza `fs/promises` para leer el archivo JSON:

```js
fs.readFile()
```
