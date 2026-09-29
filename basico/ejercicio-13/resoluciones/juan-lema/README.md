# Ejercicio 13 - manejo de errores (Juan Lema)

## Que hace

Tematica ciencia ficcion. `errors.js` define errores personalizados (`WarpError` base, `InvalidCoordinatesError`, `InsufficientFuelError`). `warp.service.js` los lanza segun el caso; `app.js` los distingue con `instanceof` para dar un mensaje especifico por tipo de error.

## Como ejecutar

```bash
npm install
npm start -- Andromeda 80
```

O directo:

```bash
node src/app.js Andromeda 80
```

## Como probar los casos de error

Coordenadas invalidas:

```bash
node src/app.js "" 80
```

Combustible insuficiente:

```bash
node src/app.js Andromeda 10
```

## Estructura

```text
src/
├── app.js
└── services/
    ├── errors.js
    └── warp.service.js
```
