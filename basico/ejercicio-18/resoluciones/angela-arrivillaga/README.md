# Basico 18 - rutas POST

Tematica: paracaidismo

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
curl http://localhost:3000/basico/ejercicio-18
curl http://localhost:3000/basico/ejercicio-18/saltos
curl -X POST http://localhost:3000/basico/ejercicio-18/saltos -H "Content-Type: application/json" -d "{\"saltador\":\"Ana Lopez\",\"altura\":4000,\"tipo\":\"tandem\"}"
curl -X POST http://localhost:3000/basico/ejercicio-18/saltos -H "Content-Type: application/json" -d "{\"saltador\":\"Ana Lopez\",\"altura\":100,\"tipo\":\"volando\"}"
```
