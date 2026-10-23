# BASICO 04 - ES Modules

## Descripción

Ejercicio básico para practicar ES Modules con Node.js y Express.

Se utilizan `import` y `export`.

## Instalación

```bash
npm install
```

## Ejecutar

```bash
npm run dev
```

El servidor funciona en:

```text
http://localhost:3000
```

## Probar

### GET /health

```text
http://localhost:3000/health
```

Respuesta:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "modulos ES Modules"
}
```

## Estructura

```text
src/
├── app.js
└── server.js
```

## ES Modules

En el proyecto se utiliza:

```js
import
export
```

También se agregó `"type": "module"` en `package.json`.
