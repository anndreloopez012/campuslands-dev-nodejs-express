# Ejercicio 18: hash de passwords

## Propósito
Crear una representación protegida de una contraseña y comprobarla sin guardar el texto original. Es un ejemplo educativo.

## Ejecución y prueba
Ejecuta `npm install` y `npm start`. Envía `POST /hash` con `{"password":"demo"}`.

## Resultado esperado
La API devuelve una sal y un hash; ambos cambian en cada generación:
```json
{ "salt": "<valor hexadecimal>", "hash": "<valor hexadecimal>" }
```
Envía la contraseña, la sal y el hash a `POST /verify`. La respuesta será `{"valid":true}` si coinciden y `{"valid":false}` si no.
