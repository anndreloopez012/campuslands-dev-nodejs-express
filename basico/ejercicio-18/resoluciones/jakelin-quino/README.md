# Ejercicio 18 - rutas POST

API nativa de Node.js para registrar saltos de paracaidismo en memoria.

## Uso

```bash
npm install
npm start
```

El servidor usa el puerto `3018` por defecto.

## Probar

```bash
curl -X POST http://localhost:3018/jumps -H "Content-Type: application/json" -d "{\"jumper\":\"Alex\",\"altitude\":3000}"
curl http://localhost:3018/jumps
```

El registro requiere el nombre del saltador y una altura entre 500 y 6000 metros. Las solicitudes invalidas responden `400`; un salto creado responde `201`.