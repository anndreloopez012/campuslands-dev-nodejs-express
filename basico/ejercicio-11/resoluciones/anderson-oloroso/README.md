# Ejercicio 11 – Promesas Básicas

**Autor:** Anderson Oloroso  
**Tema:** Música 🎵

## Descripción

Simula la reproducción de tracks usando Promesas. Busca canciones en una playlist predefinida con `.then()` y `.catch()`.

## Ejecución

```bash
npm start                        # Busca "Bohemian" por defecto
node src/app.js "Hotel"          # Buscar track por nombre
node src/app.js "Billie Jean"    # Buscar track exacto
```

## Casos de error

```bash
node src/app.js ""               # Nombre vacío
node src/app.js "Despacito"      # Track no encontrado
```

## Estructura

```
├── package.json
├── README.md
└── src/
    ├── app.js
    └── services/
        └── playlist.service.js
```
