# Ejercicio 19 - req.params y req.query

API de disenos de tatuajes para practicar parametros de ruta y filtros de consulta.

## Uso

```bash
npm install
npm start
```

El servidor usa el puerto `3019` por defecto.

## Rutas

```bash
curl http://localhost:3019/designs/1
curl "http://localhost:3019/designs?style=traditional"
curl "http://localhost:3019/designs?artist=Lucia"
```

El identificador viaja en `req.params`; los filtros opcionales `style` y `artist` viajan en `req.query`.