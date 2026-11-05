# Ejercicio 13 – Manejo de Errores

**Autor:** Anderson Oloroso  
**Tema:** Ciencia Ficción 🚀

## Descripción

Calcula saltos warp intergalácticos con clases de error personalizadas (`InvalidCoordinatesError`, `InsufficientFuelError`). Usa `instanceof` para distinguir tipos de error.

## Ejecución

```bash
node src/app.js "Andrómeda" 80       # Salto exitoso
node src/app.js "Titán" 100          # Otro salto exitoso
```

## Casos de error

```bash
node src/app.js "Marte" 80          # Destino inválido → InvalidCoordinatesError
node src/app.js "Andrómeda" 20      # Combustible bajo → InsufficientFuelError
node src/app.js                      # Sin argumentos
```

## Estructura

```
├── package.json
├── README.md
└── src/
    ├── app.js
    └── services/
        ├── errors.js
        └── warp.service.js
```
