# Ejercicio 27: manejo de configuración avanzada

## Propósito
Leer y comprobar la configuración del servidor MOBA antes de iniciarlo.

## Ejecución y resultado
Ejecuta `npm install` y `npm start`. Consulta `GET /config`:
```json
{ "environment": "development", "port": 3000 }
```
Puedes definir `NODE_ENV` y `PORT` en el entorno. Un puerto inválido detiene el inicio con un mensaje claro.
