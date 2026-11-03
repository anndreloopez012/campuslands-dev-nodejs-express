# Ejercicio 17 - rutas GET

API de destinos turisticos con consultas de solo lectura.

## Uso

```bash
npm install
npm start
```

El servidor usa el puerto `3017` por defecto.

## Rutas

```bash
curl http://localhost:3017/destinations
curl http://localhost:3017/destinations/2
curl http://localhost:3017/destinations?country=Colombia
```

Se pueden listar destinos, consultar uno por identificador y filtrar por pais. Un identificador inexistente responde `404`.