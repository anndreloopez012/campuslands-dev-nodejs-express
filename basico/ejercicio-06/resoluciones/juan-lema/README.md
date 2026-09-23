# Ejercicio 06 - path y rutas seguras (Juan Lema)

## Que hace

Tematica motos y mecanica. `manuals.service.js` arma la ruta de un manual con `path.basename` (evita `../`) y `path.resolve`, y valida con `startsWith` que el resultado siga dentro de `data/manuals/` antes de leerlo.

## Como ejecutar

```bash
npm install
npm start
```

Opcional, pasar pieza:

```bash
node src/app.js carburador
```

## Como probar el caso de error

Intento de path traversal:

```bash
node src/app.js "../../package"
```

Debe imprimir `Error al leer manual: Manual de "package" no encontrado` (el `../` se elimina, nunca sale de `data/manuals/`).

## Estructura

```text
src/
├── app.js
├── data/
│   └── manuals/
│       ├── carburador.txt
│       └── frenos.txt
└── services/
    └── manuals.service.js
```
