# Ejercicio 03 - modulos CommonJS (Lucas Pajarito)

## Que hace

Tematica **MOBA esports**. Implementa modularizacion con CommonJS: `hero.service.js` exporta `pickHero` mediante `module.exports` y `app.js` lo importa con `require()`. Genera la seleccion de heroe, linea y estadisticas para un equipo de esports.

## Como ejecutar

```bash
npm install
npm start
```

Opcional, pasar el nombre del equipo:

```bash
node src/app.js "T1 Gaming"
```

## Como probar el caso de error

```bash
node -e "require('./src/services/hero.service').pickHero('')"
```

Debe lanzar `Error: El nombre del equipo es obligatorio`.

## Estructura

```text
src/
├── app.js
└── services/
    └── hero.service.js
```
