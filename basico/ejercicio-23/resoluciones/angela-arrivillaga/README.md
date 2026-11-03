# Basico 23 - datos en memoria

Tematica: soldadura

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
curl http://localhost:3000/basico/ejercicio-23
curl http://localhost:3000/basico/ejercicio-23/trabajos
curl "http://localhost:3000/basico/ejercicio-23/trabajos?estado=pendiente"
curl http://localhost:3000/basico/ejercicio-23/trabajos/estadisticas
curl http://localhost:3000/basico/ejercicio-23/trabajos/2
curl http://localhost:3000/basico/ejercicio-23/trabajos/99
curl -X POST http://localhost:3000/basico/ejercicio-23/trabajos -H "Content-Type: application/json" -d "{\"cliente\":\"Metalurgica Norte\",\"tipo\":\"MIG\",\"horas\":5}"
curl -X POST http://localhost:3000/basico/ejercicio-23/trabajos -H "Content-Type: application/json" -d "{\"cliente\":\"\",\"tipo\":\"laser\",\"horas\":0}"
```

Los datos viven en memoria: al reiniciar el servidor se vuelven a cargar los datos iniciales.
