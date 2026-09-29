# Ejercicio 08 - variables de entorno (Juan Lema)

## Que hace

Tematica hiperdeportivos. Usa el flag nativo `node --env-file` (Node 20+) para cargar `.env.example` (sin secretos reales) y `config.service.js` valida `TRACK_NAME` y `MAX_SPEED` desde `process.env`.

## Como ejecutar

```bash
npm install
npm start
```

## Como probar el caso de error

Una variable de entorno del shell tiene prioridad sobre `.env.example`:

```bash
MAX_SPEED=abc npm start
```

Debe imprimir `Error de configuracion: MAX_SPEED debe ser un numero mayor a 0`.

## Estructura

```text
src/
├── app.js
└── services/
    └── config.service.js
.env.example
```
