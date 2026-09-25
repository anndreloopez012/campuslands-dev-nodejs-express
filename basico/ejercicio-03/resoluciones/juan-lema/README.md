# Ejercicio 03 - modulos CommonJS (Juan Lema)

## Que hace

Tematica MOBA esports. Demuestra modulos CommonJS: `hero.service.js` expone `pickHero` con `module.exports`, `app.js` lo consume con `require`. `package.json` sin `"type": "module"` para que Node use CommonJS por defecto.

## Como ejecutar

```bash
npm install
npm start
```

Opcional, pasar nombre de equipo:

```bash
node src/app.js Dire
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
