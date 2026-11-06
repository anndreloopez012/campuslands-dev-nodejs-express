# Ejercicio 12 - async await (Juan Lema)

## Que hace

Tematica peliculas de miedo. `movies.service.js` expone `fetchMovie` y `fetchRating` (ambas Promises). `app.js` las encadena con `async/await` dentro de un `try/catch`: primero busca la pelicula, luego su rating usando el id obtenido.

## Como ejecutar

```bash
npm install
npm start
```

Opcional, pasar titulo:

```bash
node src/app.js "It"
```

## Como probar el caso de error

```bash
node src/app.js ""
```

Debe imprimir `Error al buscar pelicula: El titulo de la pelicula es obligatorio`.

## Estructura

```text
src/
├── app.js
└── services/
    └── movies.service.js
```
