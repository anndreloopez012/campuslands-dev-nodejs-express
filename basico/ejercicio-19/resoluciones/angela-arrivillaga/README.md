# Basico 19 - req.params y req.query

Tematica: tatuajes

## Instalar

```bash
npm install
```

## Ejecutar

```bash
npm run dev
```

El servidor corre en http://localhost:3000

## Probar

```bash
curl http://localhost:3000/basico/ejercicio-19
curl http://localhost:3000/basico/ejercicio-19/tatuajes
curl "http://localhost:3000/basico/ejercicio-19/tatuajes?estilo=realista"
curl "http://localhost:3000/basico/ejercicio-19/tatuajes?estilo=realista&precioMax=200"
curl "http://localhost:3000/basico/ejercicio-19/tatuajes?precioMax=abc"
curl http://localhost:3000/basico/ejercicio-19/tatuajes/3
curl http://localhost:3000/basico/ejercicio-19/artistas/1/tatuajes
curl http://localhost:3000/basico/ejercicio-19/artistas/9/tatuajes
```
