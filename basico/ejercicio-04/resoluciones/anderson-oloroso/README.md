# Ejercicio 04 - Módulos ES Modules 🎮

**Autor:** Anderson Oloroso

## Descripción

Simulador de zona/tormenta de Battle Royale usando **ES Modules**. Calcula el encogimiento de la zona segura, el daño por segundo fuera de ella y el tiempo de cierre.

## ¿Cómo ejecutar?

```bash
# Con radio por defecto (500m)
node src/app.js

# Con radio personalizado
node src/app.js 300
node src/app.js 50
```

## Casos de error

```bash
node src/app.js -10      # Radio negativo
node src/app.js abc       # No es un número
node src/app.js 600       # Supera el máximo
```

## Estructura

```
├── package.json
├── README.md
└── src/
    ├── app.js
    └── services/
        └── zone.service.js
```
