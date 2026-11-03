# Ejercicio 24: Testing de servicios

## Propósito

Probar la lógica del servicio químico de forma aislada. El servicio calcula masas molares para un conjunto pequeño de fórmulas conocidas y rechaza las que no están en el catálogo.

## Ejecución

Requiere Node.js 20 o superior. Ejecuta `npm install` y luego `npm test`. Para iniciar la API de consulta, usa `npm run dev`.

## Endpoint

`GET /api/chemistry/mass?formula=H2O` devuelve la masa molar registrada para la fórmula.
