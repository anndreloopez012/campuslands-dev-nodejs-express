# Ejercicio 25 - respuestas HTTP correctas

API de heroes RPG que distingue creacion, validacion y recursos inexistentes con sus codigos HTTP.

## Uso

```bash
npm install
npm start
```

El servidor usa el puerto `3025` por defecto.

## Probar

```bash
curl http://localhost:3025/heroes/1
curl -X POST http://localhost:3025/heroes -H "Content-Type: application/json" -d "{\"name\":\"Aria\",\"class\":\"ranger\",\"level\":5}"
curl http://localhost:3025/heroes/99
```

Un heroe existente responde `200`, uno creado responde `201`, una entrada invalida `400` y un id valido sin recurso `404`.