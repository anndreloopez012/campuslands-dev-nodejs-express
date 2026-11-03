# Ejercicio 21: Rate limit conceptual

## Propósito

Limitar las solicitudes de un cliente para proteger un catálogo de recursos de animación 3D. Este ejemplo permite cuatro solicitudes por minuto por dirección IP y responde `429` al exceder el límite.

## Ejecución y prueba

Requiere Node.js 20 o superior. Ejecuta `npm install` y `npm run dev`, luego consulta varias veces `GET /api/assets`. El contador reside en memoria y se reinicia al reiniciar el servidor; para producción se recomienda un almacén compartido.
