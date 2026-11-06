# Ejercicio 15 - mini API HTTP nativa (Juan Lema)

## Que hace

Tematica comida urbana. Servidor construido solo con el modulo nativo `http` (sin Express): `GET /health`, `GET /menu` (lee `data/menu.json`) y 404 para cualquier otra ruta.

## Como ejecutar

```bash
npm install
npm start
```

## Como probar

```bash
curl http://localhost:3015/health
curl http://localhost:3015/menu
curl http://localhost:3015/no-existe
```

## Estructura

```text
src/
├── server.js
└── data/
    └── menu.json
```
