# Ejercicio 12 - async/await

Practica de funciones `async`, `await` y manejo de errores usando solo Node.JS.

## Uso

Ubicarse en:
```bash
basico/ejercicio-12/resoluciones/jakelin-quino/
```

El programa busca una pelicula de miedo en `data/movies.json`. Probar:
```bash
npm start -- "La casa oscura"
```
Resultado:
```bash
La casa oscura - 2024 - terror psicologico
```

Para probar el manejo de errores:
```bash
npm start -- Desconocida
```
Resultado:
```bash
Error: No se encontro la pelicula Desconocida.
```