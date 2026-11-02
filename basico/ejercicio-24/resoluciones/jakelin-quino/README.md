# Ejercicio 24 - CRUD basico

CRUD en memoria para formulas quimicas. Cada formula incluye nombre, expresion y descripcion.

## Uso

```bash
npm install
npm start
```

El servidor usa el puerto `3024` por defecto.

## Rutas

```bash
curl http://localhost:3024/formulas
curl -X POST http://localhost:3024/formulas -H "Content-Type: application/json" -d "{\"name\":\"Agua\",\"formula\":\"H2O\",\"description\":\"Molecula de agua\"}"
curl -X PUT http://localhost:3024/formulas/1 -H "Content-Type: application/json" -d "{\"name\":\"Agua pura\",\"formula\":\"H2O\",\"description\":\"Dos atomos de hidrogeno y uno de oxigeno\"}"
curl -X DELETE http://localhost:3024/formulas/1
```

Operaciones disponibles: listar, consultar por id, crear (`201`), actualizar y eliminar. Los datos se pierden al reiniciar el servidor.