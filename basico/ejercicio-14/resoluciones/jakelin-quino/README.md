# Ejercicio 14 - validacion de entrada

Practica de validacion de datos de entrada usando solo Node.JS.

## Uso

Ubicarse en:
```bash
basico/ejercicio-14/resoluciones/jakelin-quino/
```

El programa valida titulo, autor y numero de paginas de un libro. Probar:
```bash
npm start -- "El principito" "Antoine" 96
```
Resultado:
```json
{
  "ok": true,
  "book": {
    "title": "El principito",
    "author": "Antoine",
    "pages": 96
  }
}
```

Para probar la validacion:
```bash
npm start -- Hi A 0
```
Resultado:
```json
{
  "ok": false,
  "errors": [
    "El titulo debe tener al menos 3 caracteres.",
    "El autor debe tener al menos 3 caracteres.",
    "Las paginas deben ser un numero entero positivo."
  ]
}
```