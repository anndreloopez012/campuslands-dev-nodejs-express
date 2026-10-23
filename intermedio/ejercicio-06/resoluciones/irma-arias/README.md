# Ejercicio 06: Validación centralizada

## Propósito

Validar los datos de una motocicleta en un middleware reutilizable antes de que lleguen al controlador. Se exige marca no vacía y cilindrada numérica positiva.

## Ejecución y prueba

Requiere Node.js 20 o superior. Ejecuta `npm install` y `npm run dev`. Envía `POST /api/motorcycles` con JSON `{"brand":"Honda","cc":250}`. La solicitud válida devuelve `201`; datos incorrectos devuelven `400` con un mensaje claro.
