# Basico 30 - proyecto integrador basico

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
curl http://localhost:3000/basico/ejercicio-30
curl http://localhost:3000/basico/ejercicio-30/motos
curl "http://localhost:3000/basico/ejercicio-30/motos?marca=Honda"
curl http://localhost:3000/basico/ejercicio-30/motos/1
curl http://localhost:3000/basico/ejercicio-30/motos/99
curl -X POST http://localhost:3000/basico/ejercicio-30/motos -H "Content-Type: application/json" -d "{\"marca\":\"Kawasaki\",\"modelo\":\"Z650\",\"cilindrada\":649,\"anio\":2024}"
curl -X POST http://localhost:3000/basico/ejercicio-30/motos -H "Content-Type: application/json" -d "{\"marca\":\"\",\"cilindrada\":-5}"
curl -X PUT http://localhost:3000/basico/ejercicio-30/motos/2 -H "Content-Type: application/json" -d "{\"marca\":\"Honda\",\"modelo\":\"CB650R\",\"cilindrada\":649,\"anio\":2024}"
curl -X DELETE http://localhost:3000/basico/ejercicio-30/motos/3
curl http://localhost:3000/basico/ejercicio-30/motos/1/mantenimientos
curl -X POST http://localhost:3000/basico/ejercicio-30/motos/1/mantenimientos -H "Content-Type: application/json" -d "{\"descripcion\":\"Cambio de llantas\",\"costo\":150}"
curl -X POST http://localhost:3000/basico/ejercicio-30/motos/1/mantenimientos -H "Content-Type: application/json" -d "{\"descripcion\":\"\",\"costo\":-1}"
```

## Endpoints

| Metodo | Ruta | Codigos |
| --- | --- | --- |
| GET | /motos | 200 |
| GET | /motos/:id | 200, 400, 404 |
| POST | /motos | 201, 400 |
| PUT | /motos/:id | 200, 400, 404 |
| DELETE | /motos/:id | 200, 404 |
| GET | /motos/:id/mantenimientos | 200, 404 |
| POST | /motos/:id/mantenimientos | 201, 400, 404 |

Los datos se guardan en memoria.
