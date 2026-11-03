# Ejercicio 20: CORS controlado

## Propósito
Permitir que una página web específica consulte la API de dibujos y rechazar otros orígenes.

## Ejecución y resultado esperado
Ejecuta `npm install` y `npm start`. Una consulta `GET /drawings` desde `http://localhost:5173` responde:
```json
["Paisaje digital"]
```
La respuesta incluye la cabecera que autoriza ese origen. Una petición desde otro origen recibe `403`.
