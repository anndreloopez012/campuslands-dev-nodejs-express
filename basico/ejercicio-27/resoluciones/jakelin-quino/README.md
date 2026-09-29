# Ejercicio 27 - logs simples

API de partidas MOBA con un middleware que registra metodo, ruta, estado HTTP y duracion de cada solicitud.

## Uso

```bash
npm install
npm start
```

El servidor usa el puerto `3027` por defecto. Los logs aparecen en la terminal donde se ejecuta.

## Probar

```bash
curl http://localhost:3027/matches
curl http://localhost:3027/ruta-inexistente
```

La segunda solicitud tambien genera un registro y devuelve `404`.