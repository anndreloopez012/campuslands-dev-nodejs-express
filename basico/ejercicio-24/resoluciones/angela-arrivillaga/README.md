# Basico 24 - CRUD basico

Tematica: formulas quimicas

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
curl http://localhost:3000/basico/ejercicio-24
curl http://localhost:3000/basico/ejercicio-24/formulas
curl http://localhost:3000/basico/ejercicio-24/formulas/1
curl http://localhost:3000/basico/ejercicio-24/formulas/99
curl -X POST http://localhost:3000/basico/ejercicio-24/formulas -H "Content-Type: application/json" -d "{\"nombre\":\"Cloruro de sodio\",\"formula\":\"NaCl\",\"tipo\":\"sal\"}"
curl -X PUT http://localhost:3000/basico/ejercicio-24/formulas/1 -H "Content-Type: application/json" -d "{\"nombre\":\"Agua pura\",\"formula\":\"H2O\",\"tipo\":\"otro\"}"
curl -X DELETE http://localhost:3000/basico/ejercicio-24/formulas/3
curl -X POST http://localhost:3000/basico/ejercicio-24/formulas -H "Content-Type: application/json" -d "{\"nombre\":\"\",\"tipo\":\"gas\"}"
```
