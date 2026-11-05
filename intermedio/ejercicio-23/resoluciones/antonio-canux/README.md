# Ejercicio 023: Testing con Node Test

- **Camper:** Antonio Canux
- **Nivel:** Intermedio
- **Tema:** Testing con Node Test (soldadura)

## Estructura de Carpetas

```text
intermedio/ejercicio-23/resoluciones/antonio-canux/
├── README.md
├── package.json
├── src/app.js
├── src/controllers/welds.controller.js
├── src/data/welds.data.js
├── src/routes/welds.routes.js
├── src/server.js
├── src/utils/weld.js
└── test/weld.test.js
```

## Cómo funciona

- La lógica a probar es la función pura `recommendedAmperage` en `src/utils/weld.js`.
- Las pruebas usan el runner nativo `node:test` y `node:assert` (sin dependencias). Se ejecutan con `npm test`.

## Ejecución

```bash
npm install
npm run dev
```

```bash
npm test
```

## Pruebas con cURL

```bash
# Endpoint del ejercicio
curl http://localhost:3000/intermedio/ejercicio-23

# Amperaje recomendado
curl "http://localhost:3000/api/welds/amperage?thicknessMm=3"

# Espesor inválido (400)
curl "http://localhost:3000/api/welds/amperage?thicknessMm=abc"
```
