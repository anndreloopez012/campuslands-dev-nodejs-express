# Ejercicio 02 — npm scripts y package.json

**Temática:** shooters competitivos · **Nivel:** Básico inicial

## Objetivo

Entender cómo `package.json` describe un proyecto Node.js y cómo se definen y ejecutan **npm scripts**. La API expone los propios scripts del proyecto para poder inspeccionarlos por HTTP.

## Requisitos

- Node.js 20 o superior
- npm

## Instalación y ejecución

```bash
npm install
npm start          # corre "prestart" (check) y luego el servidor
npm run dev        # modo desarrollo con recarga automática (node --watch)
npm test           # pruebas con node:test
```

El servidor escucha en `http://localhost:3000` (puerto configurable con `PORT`).

## Scripts

| Script | Comando | Para qué sirve |
| --- | --- | --- |
| `check` | `node --check src/app.js && node --check src/server.js` | Revisa la sintaxis sin ejecutar el código |
| `prestart` | `npm run check` | Hook automático: npm lo ejecuta **antes** de `start` |
| `start` | `node src/server.js` | Arranca el servidor |
| `dev` | `node --watch src/server.js` | Reinicia al guardar cambios |
| `test` | `node --test` | Ejecuta las pruebas de `test/` |

## Estructura

```text
ejercicio-02/
├── package.json
├── README.md
├── src/
│   ├── app.js
│   ├── server.js
│   ├── routes/index.js
│   ├── controllers/scripts.controller.js
│   └── services/package.service.js
└── test/app.test.js
```

## Endpoints

| Método | Ruta | Descripción | Códigos |
| --- | --- | --- | --- |
| GET | `/health` | Estado del servicio | 200 |
| GET | `/basico/ejercicio-02` | Endpoint principal del ejercicio | 200 |
| GET | `/scripts` | Lista todos los scripts de `package.json` | 200 |
| GET | `/scripts/:name` | Detalle de un script | 200, 404 |

## Ejemplos

```bash
curl http://localhost:3000/basico/ejercicio-02
```

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "npm scripts y package.json",
  "project": {
    "name": "ejercicio-02-npm-scripts",
    "version": "1.0.0",
    "description": "API de shooters competitivos para practicar npm scripts y package.json",
    "node": ">=20"
  }
}
```

```bash
curl http://localhost:3000/scripts/start
curl -i http://localhost:3000/scripts/inexistente   # 404
```

## Errores manejados

- `GET /scripts/:name` con un nombre que no existe responde `404` con un mensaje claro.
- Cualquier ruta desconocida responde `404` en formato JSON.

## Pruebas

```bash
npm test
```

## Conceptos aplicados

- Campos de `package.json`: `name`, `version`, `scripts`, `engines`, `dependencies`.
- Hooks `pre` y `post` de npm (`prestart`).
- Separación en rutas, controlador y servicio.
