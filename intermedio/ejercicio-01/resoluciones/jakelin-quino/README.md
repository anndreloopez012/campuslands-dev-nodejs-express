# Ejercicio 01: arquitectura por capas

## Propósito
Consultar personajes RPG mediante una API cuya ruta, controlador y servicio tienen responsabilidades separadas.

## Ejecución y prueba
Ejecuta `npm install` y `npm start`. Abre `GET http://localhost:3000/characters`.

## Resultado esperado
La respuesta es una lista JSON con el nombre, la clase y el nivel de cada personaje:
```json
[
  { "name": "Aria", "class": "maga", "level": 5 },
  { "name": "Leo", "class": "guerrero", "level": 3 }
]
```
