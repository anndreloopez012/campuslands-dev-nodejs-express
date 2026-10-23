# Basico 20 - middleware express.json

Tematica: dibujo digital

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
curl http://localhost:3000/basico/ejercicio-20
curl http://localhost:3000/basico/ejercicio-20/obras
curl -X POST http://localhost:3000/basico/ejercicio-20/obras -H "Content-Type: application/json" -d "{\"titulo\":\"Paisaje neon\",\"tecnica\":\"Digital painting\",\"ancho\":1920,\"alto\":1080}"
curl -X POST http://localhost:3000/basico/ejercicio-20/eco -H "Content-Type: application/json" -d "{\"mensaje\":\"hola\"}"
curl -X POST http://localhost:3000/basico/ejercicio-20/eco -H "Content-Type: application/json" -d "{mal json"
```
