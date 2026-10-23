# Basico 15 - mini API HTTP nativa

Tematica: comida urbana

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
curl http://localhost:3000/basico/ejercicio-15
curl http://localhost:3000/basico/ejercicio-15/platos
curl http://localhost:3000/basico/ejercicio-15/platos/2
curl http://localhost:3000/basico/ejercicio-15/platos/99
curl -X POST http://localhost:3000/basico/ejercicio-15/platos -H "Content-Type: application/json" -d "{\"nombre\":\"Pizza\",\"precio\":30}"
curl -X POST http://localhost:3000/basico/ejercicio-15/platos -H "Content-Type: application/json" -d "{\"precio\":-1}"
```

Este ejercicio no usa Express, solo el modulo `http` de Node.
