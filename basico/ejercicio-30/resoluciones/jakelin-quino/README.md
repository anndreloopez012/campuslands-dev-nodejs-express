# Ejercicio 30 - proyecto integrador basico

API en memoria para un taller de motos. Permite consultar motocicletas, registrar una moto y abrir ordenes de trabajo.

## Uso

```bash
npm install
npm start
```

El servidor usa el puerto `3030` por defecto; se puede cambiar con `PORT`.

## Rutas

```bash
curl http://localhost:3030/motorcycles
curl http://localhost:3030/motorcycles/1
curl -X POST http://localhost:3030/motorcycles -H "Content-Type: application/json" -d "{\"brand\":\"Yamaha\",\"model\":\"FZ\",\"year\":2024}"
curl -X POST http://localhost:3030/work-orders -H "Content-Type: application/json" -d "{\"motorcycleId\":1,\"issue\":\"Cambio de aceite\"}"
```

Las motos y ordenes se guardan en memoria y se reinician al detener el servidor. Los datos invalidos devuelven `400`; recursos no encontrados `404`; registros nuevos `201`.