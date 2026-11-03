# Ejercicio 21 - estructura src, routes y controllers

API de producciones de animacion 3D organizada en rutas y controladores.

## Uso

```bash
npm install
npm start
```

El servidor usa el puerto `3021` por defecto.

## Rutas

```bash
curl http://localhost:3021/scenes
curl http://localhost:3021/scenes/1
```

La ruta `/scenes` lista producciones y `/scenes/:id` busca una por identificador.