# Ejercicio 14 - validacion de entrada (Juan Lema)

## Que hace

Tematica libros. `book-validator.service.js` valida `title`, `author`, `pages` y `year`, acumulando **todos** los errores encontrados (no solo el primero) en un arreglo.

## Como ejecutar

```bash
npm install
npm start -- "Cien anios de soledad" "Gabriel Garcia Marquez" 471 1967
```

O directo:

```bash
node src/app.js "Cien anios de soledad" "Gabriel Garcia Marquez" 471 1967
```

## Como probar el caso de error

```bash
node src/app.js "" "" -5 3000
```

Debe listar los 4 errores: `title`, `author`, `pages` y `year` invalidos.

## Estructura

```text
src/
├── app.js
└── services/
    └── book-validator.service.js
```
