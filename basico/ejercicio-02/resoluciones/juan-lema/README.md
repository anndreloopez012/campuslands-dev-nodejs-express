# Ejercicio 02 - npm scripts y package.json (Juan Lema)

## Que hace

Tematica shooters competitivos. `package.json` define tres scripts (`start`, `dev`, `info`). El script principal arma un loadout aleatorio para un jugador; `info` lee el propio `package.json` y muestra nombre, version y scripts disponibles.

## Como ejecutar

```bash
npm install
npm start
npm run dev
npm run info
```

Opcional, pasar nombre de jugador:

```bash
node src/app.js Viper
```

## Como probar el caso de error

```bash
node -e "import('./src/services/loadout.service.js').then(m => m.createLoadout(''))"
```

Debe lanzar `Error: El nombre del jugador es obligatorio`.

## Estructura

```text
src/
├── app.js
├── info.js
└── services/
    └── loadout.service.js
```
