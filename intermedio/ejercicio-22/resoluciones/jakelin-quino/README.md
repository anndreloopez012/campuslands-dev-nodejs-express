# Ejercicio 22: subida simulada de archivos

## Propósito
Simular la recepción de un archivo para un proyecto de arquitectura 3D. El ejemplo valida los datos, pero no guarda archivos.

## Ejecución y resultado esperado
Ejecuta `npm install` y `npm start`. Envía `POST /uploads` con `{"name":"plano.png","size":1200}`:
```json
{
  "message": "Archivo simulado",
  "file": { "name": "plano.png", "size": 1200 }
}
```
Los datos incompletos o inválidos responden `400`.
