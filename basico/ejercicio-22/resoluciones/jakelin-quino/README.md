# Ejercicio 22 - servicios simples

Calculadora de presupuesto para renders de arquitectura 3D. El calculo vive en `services/` y la ruta solo maneja la solicitud y la respuesta.

## Uso

```bash
npm install
npm start
```

El servidor usa el puerto `3022` por defecto.

## Probar

```bash
curl -X POST http://localhost:3022/budgets -H "Content-Type: application/json" -d "{\"width\":1920,\"height\":1080,\"quality\":\"high\"}"
```

La calidad puede ser `draft`, `standard` o `high`. Las dimensiones deben ser enteros positivos.