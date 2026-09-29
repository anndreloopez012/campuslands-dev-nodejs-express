# Ejercicio 23 - datos en memoria

API de registros de soldadura almacenados en un arreglo mientras el servidor esta activo.

## Uso

```bash
npm install
npm start
```

El servidor usa el puerto `3023` por defecto.

## Probar

```bash
curl -X POST http://localhost:3023/welds -H "Content-Type: application/json" -d "{\"operator\":\"Sara\",\"material\":\"steel\",\"minutes\":35}"
curl http://localhost:3023/welds
```

Los datos se reinician al detener el proceso. El operador, material y tiempo positivo son obligatorios.