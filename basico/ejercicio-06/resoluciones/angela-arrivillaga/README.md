# Basico 06 - path y rutas seguras

Tematica: motos y mecanica

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
curl http://localhost:3000/basico/ejercicio-06
curl http://localhost:3000/basico/ejercicio-06/archivos
curl http://localhost:3000/basico/ejercicio-06/archivos/motos.txt
curl http://localhost:3000/basico/ejercicio-06/archivos/noexiste.txt
curl "http://localhost:3000/basico/ejercicio-06/archivos/..%2fapp.js"
curl "http://localhost:3000/basico/ejercicio-06/info-ruta?ruta=/taller/motos/manual.pdf"
```
