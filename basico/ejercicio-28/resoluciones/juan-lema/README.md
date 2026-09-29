# Ejercicio 28 - configuracion por entorno (Juan Lema)

## Que hace

Tematica battle royale. `config/index.js` define perfiles por `NODE_ENV` (`development`, `production`, `test`): tamano maximo de lobby, nivel de log y si se exponen rutas de debug. Sin `NODE_ENV`, usa `development` por defecto. Un `NODE_ENV` no soportado lanza error al iniciar.

## Como ejecutar

```bash
npm install
npm start
```

Cambiar de entorno (portable entre shells):

En Bash:

```bash
NODE_ENV=production npm start
```

En PowerShell:

```powershell
$env:NODE_ENV="production"; npm start
```

## Como probar

```bash
curl http://localhost:3028/health
curl http://localhost:3028/lobby/limit
curl http://localhost:3028/lobby/debug/config
```

`/lobby/debug/config` responde 200 en `development` y 404 en `production` (no se expone).

## Estructura

```text
src/
├── app.js
├── server.js
├── config/
│   └── index.js
├── routes/
│   └── lobby.routes.js
└── controllers/
    └── lobby.controller.js
```
