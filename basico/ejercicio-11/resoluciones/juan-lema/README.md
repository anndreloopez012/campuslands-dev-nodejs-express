# Ejercicio 11 - promesas basicas (Juan Lema)

## Que hace

Tematica musica. `playlist.service.js` expone `playTrack(trackName)` que devuelve una `Promise` (resuelve tras un `setTimeout`, rechaza si falta el nombre). `app.js` la consume con `.then()/.catch()`.

## Como ejecutar

```bash
npm install
npm start
```

Opcional, pasar cancion:

```bash
node src/app.js "Imagine"
```

## Como probar el caso de error

```bash
node src/app.js ""
```

Debe imprimir `Error al reproducir: El nombre de la cancion es obligatorio`.

## Estructura

```text
src/
├── app.js
└── services/
    └── playlist.service.js
```
