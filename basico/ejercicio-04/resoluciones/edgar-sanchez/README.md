# Ejercicio 04: módulos ES Modules

Solución de consola para reducir la zona de una partida battle royale. Usa `import` y `export` nativos de Node.js, sin dependencias externas.

## Ejecutar

```bash
npm install
npm start
npm start -- 500
```

El radio por defecto es `1000`. El servicio reduce el radio a un 60 % y entrega un número entero.

## Estructura

- `src/app.js`: punto de entrada y salida JSON.
- `src/zone.service.js`: lógica y validaciones.

## Entrada inválida

```bash
node src/app.js 0
```

Termina con código `1` y explica que el radio debe estar entre `1` y `1000`.