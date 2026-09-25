# Ejercicio 11 - promesas basicas

Practica de creacion, resolucion y rechazo de promesas usando solo Node.JS.

## Uso

Ubicarse en:
```bash
basico/ejercicio-11/resoluciones/jakelin-quino/
```

El programa busca canciones por genero mediante una promesa. Probar:
```bash
npm start -- rock
```
Resultado:
```json
[
  {
    "title": "Ruta nocturna",
    "genre": "rock"
  }
]
```

Para probar el rechazo de la promesa:
```bash
npm start -- salsa
```
Resultado:
```bash
Error: No hay canciones del genero salsa.
```