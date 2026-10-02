# Basico 09 - JSON y persistencia simple

Tematica: kickboxing

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
curl http://localhost:3000/basico/ejercicio-09
curl http://localhost:3000/basico/ejercicio-09/peleadores
curl http://localhost:3000/basico/ejercicio-09/peleadores/1
curl http://localhost:3000/basico/ejercicio-09/peleadores/99
curl -X POST http://localhost:3000/basico/ejercicio-09/peleadores -H "Content-Type: application/json" -d "{\"nombre\":\"Giorgio\",\"peso\":95,\"victorias\":30}"
curl -X POST http://localhost:3000/basico/ejercicio-09/peleadores -H "Content-Type: application/json" -d "{\"peso\":95}"
```
