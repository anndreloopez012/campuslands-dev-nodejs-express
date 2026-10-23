# Ejercicio 16 - primer servidor HTTP con Node.js

API inicial para una tienda de ropa y sneakers, creada con el modulo nativo `node:http` y sin dependencias externas.

## Uso

Desde esta carpeta:

```bash
npm install
npm start
```

El servidor usa el puerto `3016` por defecto. Se puede cambiar con `PORT`.

## Rutas

```bash
curl http://localhost:3016/
curl http://localhost:3016/health
curl http://localhost:3016/ruta-inexistente
```

La ruta raiz presenta la tienda, `/health` confirma que esta activa y las rutas desconocidas responden `404`.