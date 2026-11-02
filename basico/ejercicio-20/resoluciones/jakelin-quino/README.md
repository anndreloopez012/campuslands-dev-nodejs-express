# Ejercicio 20 - parseo del cuerpo JSON

API para registrar pinceles de dibujo digital. El servidor lee el flujo HTTP nativo y convierte el cuerpo JSON antes de validarlo, sin dependencias externas.

## Uso

```bash
npm install
npm start
```

El servidor usa el puerto `3020` por defecto.

## Probar

```bash
curl -X POST http://localhost:3020/brushes -H "Content-Type: application/json" -d "{\"name\":\"Lapiz suave\",\"type\":\"pencil\"}"
curl http://localhost:3020/brushes
```

El nombre y el tipo son obligatorios. Un registro valido responde `201`; si falta un campo, responde `400`.