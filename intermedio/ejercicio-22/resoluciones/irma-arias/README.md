# Ejercicio 22: Subida simulada de archivos

## Propósito

Registrar metadatos de un archivo de plano 3D sin transferir ni guardar su contenido. El endpoint valida el nombre, el tipo MIME y el tamaño, y devuelve un identificador simulado.

## Ejecución y prueba

Requiere Node.js 20 o superior. Ejecuta `npm install` y `npm run dev`. Envía `POST /api/models` con JSON `{"fileName":"casa.obj","mimeType":"model/obj","size":2048}`. Se acepta hasta 5 MB; este ejercicio no realiza una carga real.
