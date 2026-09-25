# Ejercicio 15 - mini API HTTP nativa

Practica de un servidor HTTP usando `node:http`, sin Express ni dependencias externas.

## Uso

Ubicarse en:
```bash
basico/ejercicio-15/resoluciones/jakelin-quino/
```

Iniciar el servidor:
```bash
npm start
```
Resultado:
```bash
API de comida urbana escuchando en http://localhost:3000
```

En otra terminal probar las rutas:
```bash
curl http://localhost:3000/health
curl http://localhost:3000/foods
curl http://localhost:3000/foods/1
```

La ruta `/foods` lista las comidas, `/foods/1` muestra una comida y una identificacion inexistente responde con error 404. Cualquier otra ruta tambien responde con error 404.