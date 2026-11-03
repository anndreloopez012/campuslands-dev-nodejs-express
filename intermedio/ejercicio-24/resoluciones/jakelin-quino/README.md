# Ejercicio 24: testing de servicios

## Propósito
Estimar la masa de fórmulas químicas simples usando los elementos admitidos por el ejercicio. Las pruebas revisan el cálculo del agua y el rechazo de fórmulas inválidas.

## Ejecución y resultado esperado
Ejecuta `npm install` y `npm test`; las dos pruebas deben aprobarse. Después, con `npm start`, consulta `GET /formulas/H2O`:
```json
{ "formula": "H2O", "molarMass": 18.015 }
```
