# Ejercicio 23: Testing con `node:test`

## Propósito

Comprobar con el runner integrado de Node.js el cálculo de material para una pieza de soldadura. Las pruebas verifican un caso normal y rechazan medidas no válidas, sin instalar un framework de pruebas adicional.

## Ejecución

Requiere Node.js 20 o superior. Ejecuta `npm install` y luego `npm test`. Para iniciar la API de ejemplo usa `npm run dev`.

## Endpoint

`GET /api/weld-estimate?length=20&thickness=3` devuelve el material estimado en gramos.
