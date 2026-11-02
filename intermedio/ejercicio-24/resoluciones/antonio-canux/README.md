# Ejercicio 024: Testing de Servicios

- **Camper:** Antonio Canux
- **Nivel:** Intermedio
- **Tema:** Testing de Servicios (formulas quimicas)

## Estructura de Carpetas

```text
intermedio/ejercicio-24/resoluciones/antonio-canux/
├── README.md
├── package.json
├── src/app.js
├── src/controllers/formulas.controller.js
├── src/data/formulas.data.js
├── src/routes/formulas.routes.js
├── src/server.js
├── src/services/formulas.service.js
└── test/formulas.service.test.js
```

## Cómo funciona

- `formulas.service.js` contiene la lógica pura (`parseFormula`, `molarMass`), separada del controlador.
- Las pruebas del servicio cubren casos válidos y errores con `node:test`. Se ejecutan con `npm test`.

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
curl http://localhost:3000/intermedio/ejercicio-24

# Masa molar del agua
curl http://localhost:3000/api/formulas/H2O/mass

# Glucosa
curl http://localhost:3000/api/formulas/C6H12O6/mass

# Fórmula inválida (400)
curl http://localhost:3000/api/formulas/abc/mass
```
