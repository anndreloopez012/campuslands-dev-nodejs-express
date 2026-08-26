# Ejercicio 04 - modulos ES Modules (Juan Lema)

## Que hace

Tematica battle royale. Demuestra ES Modules: `zone.service.js` exporta `shrinkZone` como default y `MAX_RADIUS` como named export; `app.js` los importa con `import shrinkZone, { MAX_RADIUS }`. `package.json` con `"type": "module"`.

## Como ejecutar

```bash
npm install
npm start
```

Opcional, pasar radio actual del mapa:

```bash
node src/app.js 500
```

## Como probar el caso de error

```bash
node -e "import('./src/services/zone.service.js').then(m => m.shrinkZone(-10))"
```

Debe lanzar `Error: El radio actual debe ser mayor a 0`.

## Estructura

```text
src/
├── app.js
└── services/
    └── zone.service.js
```
