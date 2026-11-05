# Ejercicio 12 – Async/Await

**Autor:** Anderson Oloroso  
**Tema:** Películas de Miedo 🎬

## Descripción

Busca películas de terror y sus calificaciones usando `async/await` con `try/catch`. Encadena dos operaciones asíncronas secuenciales.

## Ejecución

```bash
npm start                        # Busca "Exorcista" por defecto
node src/app.js "Resplandor"     # Buscar película específica
node src/app.js "Hereditary"     # Otra película
```

## Casos de error

```bash
node src/app.js ""               # Título vacío
node src/app.js "Crepúsculo"     # Película no encontrada
```

## Estructura

```
├── package.json
├── README.md
└── src/
    ├── app.js
    └── services/
        └── movies.service.js
```
