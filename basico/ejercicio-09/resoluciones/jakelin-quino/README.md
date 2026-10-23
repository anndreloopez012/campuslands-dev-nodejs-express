# Ejercicio 09 - JSON y persistencia simple

Practica de lectura, escritura y persistencia local con JSON usando solo Node.JS.

## Uso

Ubicarse en:
```bash
basico/ejercicio-09/resoluciones/jakelin-quino/
```

Para listar los luchadores guardados en `data/fighters.json`:
```bash
npm start -- list
```
Resultado:
```json
[
  {
    "name": "Valentina Cruz",
    "category": "peso ligero",
    "wins": 8
  }
]
```

Para agregar un luchador y guardarlo en el archivo:
```bash
npm start -- add "Diego Rojas" "peso medio"
```
Resultado:
```bash
Luchador agregado: Diego Rojas
```